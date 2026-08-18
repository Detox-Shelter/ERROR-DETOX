import React, { useState } from 'react';

interface RemedyMarkdownProps {
  text: string;
  /** full: 처방전 본문, compact: 광장 카드나 목록의 미리보기 */
  variant?: 'full' | 'compact';
  /** 미리보기에서 앞쪽 블록만 보여줄 때 쓴다. 줄이 아니라 블록 단위로 잘라야 렌더가 깨지지 않는다. */
  maxBlocks?: number;
}

/**
 * 처방전 마크다운 렌더러.
 *
 * 정원 광장 글은 로그인 없이도 쓸 수 있어 본문이 외부 입력이다. innerHTML을 쓰지 않고
 * React 노드로만 조립해 스크립트 주입 여지를 없앤다.
 *
 * 본문 서체와 크기는 이 컴포넌트가 직접 정한다. 호출부에 맡기면 같은 처방전이
 * 화면마다 다른 크기로 떠서 위계가 무너진다.
 */

// 인라인 문법. 코드 스팬을 가장 먼저 소비해야 코드 안의 별표가 강조로 새지 않는다.
// renderInline 이 재귀하므로 호출마다 새 인스턴스를 만든다. 전역 정규식을 공유하면
// 안쪽 호출이 lastIndex 를 덮어써 바깥 루프가 끝나지 않는다.
// 모델이 마크다운 안에 HTML 을 섞어 보낸다. 아래 태그만 노드로 바꾸고 나머지는 글자로 둔다.
// 처방전은 <tr> <div> 같은 태그를 본문에서 자주 언급하므로, 닫는 태그가 있는 짝만 변환해야
// 설명하려던 태그 이름이 사라지지 않는다.
const INLINE_SOURCE =
  '(`[^`\\n]+?`)|(\\*\\*(?=\\S)(?:[^*]|\\*(?!\\*))+?\\*\\*)|(~~(?=\\S)[^~\\n]+?~~)|(\\[[^\\]\\n]+\\]\\([^)\\s]+\\))|(\\*(?=\\S)[^*\\n]*[^\\s*]\\*)|(_(?=\\S)[^_\\n]*[^\\s_]_)' +
  '|(<br\\s*/?>)|(<(b|strong|i|em|u|s|del|mark|code)\\s*>([\\s\\S]*?)</\\9\\s*>)';

// 줄 전체가 <br> 뿐이면 빈 줄과 같게 다룬다.
const BR_ONLY_LINE = /^(?:<br\s*\/?>\s*)+$/i;

// 홑겹 강조 앞에 이런 글자가 오면 강조가 아니다. glob 패턴이나 2*3 같은 로그 조각을 걸러낸다.
const NOT_EMPHASIS_BEFORE = /[\w*_/\\.~-]/;

const LINK_RE = /^\[([^\]\n]+)\]\(([^)\s]+)\)$/;

// http/https 가 아닌 스킴(javascript: 등)은 링크로 만들지 않는다.
const safeHref = (url: string): string | null => {
  const cleaned = url.trim();
  return /^https?:\/\//i.test(cleaned) ? cleaned : null;
};

const LINK_CLASS =
  'text-emerald-700 underline underline-offset-2 decoration-emerald-300 hover:decoration-emerald-600 break-words';

// 모델이 &nbsp; 같은 엔티티를 섞어 보낸다. 평문 조각에만 풀어 주고 코드 스팬은 건드리지 않는다.
// 한 번만 치환하므로 &amp;nbsp; 는 &nbsp; 라는 글자로 남는다.
const ENTITIES: Record<string, string> = {
  nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  hellip: '…', mdash: '—', ndash: '–', middot: '·', times: '×', deg: '°',
  rarr: '→', larr: '←', copy: '©', reg: '®', trade: '™',
  laquo: '«', raquo: '»', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’'
};

const ENTITY_RE = /&(#\d{1,7}|#[xX][0-9a-fA-F]{1,6}|[a-zA-Z]{2,8});/g;

const decodeEntities = (text: string): string => {
  if (!text.includes('&')) return text;
  return text.replace(ENTITY_RE, (whole, name: string) => {
    if (name.startsWith('#')) {
      const code = name[1] === 'x' || name[1] === 'X'
        ? parseInt(name.slice(2), 16)
        : parseInt(name.slice(1), 10);
      // 범위를 벗어난 코드포인트는 원문 그대로 둔다.
      if (!Number.isFinite(code) || code < 0x20 || code > 0x10ffff) return whole;
      try {
        return String.fromCodePoint(code);
      } catch {
        return whole;
      }
    }
    return ENTITIES[name.toLowerCase()] ?? whole;
  });
};

const CODE_CHIP_CLASS =
  'font-mono text-[0.9em] bg-emerald-50 text-emerald-900 border border-emerald-100 rounded px-1 py-0.5 break-words';

// 허용한 HTML 짝 태그를 마크다운 대응물과 같은 모양으로 그린다.
const renderHtmlTag = (tag: string, inner: string, key: string, depth: number): React.ReactNode => {
  switch (tag) {
    case 'b':
    case 'strong':
      return (
        <strong key={key} className="font-bold text-emerald-950">
          {renderInline(inner, key, depth + 1)}
        </strong>
      );
    case 'i':
    case 'em':
      return (
        <em key={key} className="italic">
          {renderInline(inner, key, depth + 1)}
        </em>
      );
    case 'u':
      return (
        <span key={key} className="underline underline-offset-2">
          {renderInline(inner, key, depth + 1)}
        </span>
      );
    case 's':
    case 'del':
      return (
        <del key={key} className="line-through opacity-60">
          {renderInline(inner, key, depth + 1)}
        </del>
      );
    case 'mark':
      return (
        <mark key={key} className="bg-amber-100 text-emerald-950 rounded px-0.5">
          {renderInline(inner, key, depth + 1)}
        </mark>
      );
    default:
      // code: 안쪽은 다시 해석하지 않고 글자 그대로 둔다.
      return (
        <code key={key} className={CODE_CHIP_CLASS}>
          {inner}
        </code>
      );
  }
};

const renderInline = (text: string, keyPrefix: string, depth = 0): React.ReactNode[] => {
  if (depth > 3) return [text];

  const nodes: React.ReactNode[] = [];
  const re = new RegExp(INLINE_SOURCE, 'gi');
  let cursor = 0;
  let n = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    // 홑겹 별표와 밑줄은 앞 글자를 보고 강조인지 판단한다.
    if ((m[5] || m[6]) && NOT_EMPHASIS_BEFORE.test(text.charAt(m.index - 1))) {
      re.lastIndex = m.index + 1;
      continue;
    }

    if (m.index > cursor) {
      nodes.push(<React.Fragment key={`${keyPrefix}-t${n++}`}>{decodeEntities(text.slice(cursor, m.index))}</React.Fragment>);
    }
    cursor = m.index + m[0].length;
    const key = `${keyPrefix}-i${n++}`;

    if (m[1]) {
      nodes.push(
        <code
          key={key}
          className={CODE_CHIP_CLASS}
        >
          {m[1].slice(1, -1)}
        </code>
      );
    } else if (m[2]) {
      nodes.push(
        <strong key={key} className="font-bold text-emerald-950">
          {renderInline(m[2].slice(2, -2), key, depth + 1)}
        </strong>
      );
    } else if (m[3]) {
      nodes.push(
        <del key={key} className="line-through opacity-60">
          {renderInline(m[3].slice(2, -2), key, depth + 1)}
        </del>
      );
    } else if (m[4]) {
      const link = m[4].match(LINK_RE);
      const href = link ? safeHref(link[2]) : null;
      if (link && href) {
        nodes.push(
          <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            {renderInline(link[1], key, depth + 1)}
          </a>
        );
      } else {
        // 안전하지 않은 스킴은 링크를 만들지 않고 글자만 남긴다.
        nodes.push(<React.Fragment key={key}>{link ? link[1] : m[4]}</React.Fragment>);
      }
    } else if (m[5] || m[6]) {
      const raw = (m[5] || m[6]) as string;
      nodes.push(
        <em key={key} className="italic">
          {renderInline(raw.slice(1, -1), key, depth + 1)}
        </em>
      );
    } else if (m[7]) {
      nodes.push(<br key={key} />);
    } else if (m[8]) {
      nodes.push(renderHtmlTag(m[9].toLowerCase(), m[10], key, depth));
    }
  }

  if (cursor < text.length) {
    nodes.push(<React.Fragment key={`${keyPrefix}-t${n++}`}>{decodeEntities(text.slice(cursor))}</React.Fragment>);
  }
  return nodes;
};

type Align = 'left' | 'center' | 'right';

type ListItemNode = { text: string; checked: boolean | null; child: ListBlock | null };
type ListBlock = { kind: 'list'; ordered: boolean; items: ListItemNode[] };

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'quote'; lines: string[] }
  | ListBlock
  | { kind: 'code'; lang: string; lines: string[] }
  | { kind: 'table'; head: string[]; align: Align[]; rows: string[][] }
  | { kind: 'rule' }
  | { kind: 'p'; text: string };

const LIST_RE = /^(\s*)(?:([-*+])|(\d+)[.)])\s+(.*)$/;
const CHECKBOX_RE = /^\[([ xX])\]\s+(.*)$/;

const splitRow = (line: string): string[] =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());

// 표 구분행인지 본다. 이 줄이 있어야 표로 취급한다.
const isTableDivider = (line: string): boolean => {
  const t = line.trim();
  return t.startsWith('|') && /^[|\s:-]+$/.test(t) && t.includes('-');
};

const parseAlign = (line: string): Align[] =>
  splitRow(line).map(cell => {
    const left = cell.startsWith(':');
    const right = cell.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    return 'left';
  });

// 줄 단위 마크다운을 블록으로 묶는다. 빈 줄이 문단과 목록의 경계다.
const parseBlocks = (source: string): Block[] => {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n?/g, '\n').split('\n');

  let para: string[] = [];
  let stack: { indent: number; list: ListBlock }[] = [];
  let blankSeen = false;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ kind: 'p', text: para.join(' ') });
      para = [];
    }
  };
  const endList = () => {
    stack = [];
  };
  const lastBlock = () => blocks[blocks.length - 1];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // 코드 펜스. 언어 표시를 살려 둔다.
    const fence = trimmed.match(/^```+\s*(\S*)\s*$/);
    if (fence) {
      flushPara();
      endList();
      const body: string[] = [];
      i++;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      while (body.length && !body[body.length - 1].trim()) body.pop();
      blocks.push({ kind: 'code', lang: fence[1] || '', lines: body });
      blankSeen = false;
      continue;
    }

    // 줄 전체가 <br> 뿐이면 문단을 띄우려는 뜻이므로 빈 줄과 같게 다룬다.
    if (!trimmed || BR_ONLY_LINE.test(trimmed)) {
      flushPara();
      blankSeen = true;
      continue;
    }

    // 구분선이 목록으로 새지 않도록 먼저 걸러낸다.
    if (/^([-*_])\1{2,}$/.test(trimmed.replace(/\s/g, ''))) {
      flushPara();
      endList();
      blocks.push({ kind: 'rule' });
      blankSeen = false;
      continue;
    }

    // 표는 다음 줄의 구분행까지 봐야 판별된다.
    if (trimmed.startsWith('|') && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      flushPara();
      endList();
      const head = splitRow(trimmed);
      const align = parseAlign(lines[i + 1]);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i++;
      }
      i--;
      blocks.push({ kind: 'table', head, align, rows });
      blankSeen = false;
      continue;
    }

    // 정규식으로 한 번에 잡아야 #### 가 ### 로 잘리지 않는다.
    const heading = trimmed.match(/^(#{1,6})\s*(.*)$/);
    if (heading) {
      flushPara();
      endList();
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2].trim() });
      blankSeen = false;
      continue;
    }

    if (trimmed.startsWith('>')) {
      flushPara();
      endList();
      const content = trimmed.replace(/^>+\s?/, '');
      const prev = lastBlock();
      // 붙어 있는 인용 줄만 한 장의 카드로 묶는다. 빈 줄로 떨어져 있으면 별개의 카드다.
      if (prev && prev.kind === 'quote' && !blankSeen) prev.lines.push(content);
      else blocks.push({ kind: 'quote', lines: [content] });
      blankSeen = false;
      continue;
    }

    // 목록은 들여쓰기를 보고 중첩 깊이를 정한다.
    const li = raw.match(LIST_RE);
    if (li) {
      flushPara();
      const indent = li[1].replace(/\t/g, '  ').length;
      const ordered = !li[2];
      let body = li[4];
      let checked: boolean | null = null;
      const box = body.match(CHECKBOX_RE);
      if (box) {
        checked = box[1].toLowerCase() === 'x';
        body = box[2];
      }

      while (stack.length && stack[stack.length - 1].indent > indent) stack.pop();

      const openList = () => {
        const list: ListBlock = { kind: 'list', ordered, items: [] };
        const parent = stack[stack.length - 1];
        if (parent) {
          // 부모 항목 없이 들여쓴 목록이 먼저 오면 빈 항목을 두어 트리를 잇는다.
          if (!parent.list.items.length) parent.list.items.push({ text: '', checked: null, child: null });
          parent.list.items[parent.list.items.length - 1].child = list;
        } else {
          blocks.push(list);
        }
        stack.push({ indent, list });
      };

      const top = stack[stack.length - 1];
      if (!top || top.indent < indent) {
        openList();
      } else if (top.list.ordered !== ordered) {
        // 같은 깊이에서 글머리 종류가 바뀌면 형제 목록으로 새로 연다.
        stack.pop();
        openList();
      }

      stack[stack.length - 1].list.items.push({ text: body, checked, child: null });
      blankSeen = false;
      continue;
    }

    // 목록 항목이 다음 줄로 이어지는 경우
    if (stack.length && !blankSeen) {
      const items = stack[stack.length - 1].list.items;
      if (items.length) {
        items[items.length - 1].text += ' ' + trimmed;
        continue;
      }
    }

    endList();
    para.push(trimmed);
    blankSeen = false;
  }

  flushPara();
  return blocks;
};

interface CodeBlockProps {
  block: { lang: string; lines: string[] };
  compact: boolean;
}

function CodeBlock({ block, compact }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const body = block.lines.join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(body);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // 클립보드를 쓸 수 없는 환경에서는 조용히 넘어간다.
    }
  };

  return (
    <div className="relative">
      {(block.lang || !compact) && (
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          {block.lang && (
            <span
              className={`font-mono uppercase tracking-wider text-emerald-300/70 ${compact ? 'text-[8px]' : 'text-[10px]'}`}
            >
              {block.lang}
            </span>
          )}
          {!compact && (
            <button
              type="button"
              onClick={copy}
              className="text-[10px] font-bold text-emerald-200/80 hover:text-emerald-50 bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-700/50 rounded px-1.5 py-0.5 transition-colors cursor-pointer"
            >
              {copied ? '복사됨' : '복사'}
            </button>
          )}
        </div>
      )}
      <pre
        className={
          compact
            ? 'bg-emerald-950/90 text-emerald-50 rounded-lg p-2.5 overflow-x-auto text-[11px] font-mono leading-[1.7]'
            : 'bg-emerald-950/95 text-emerald-50 rounded-xl p-4 pt-3 overflow-x-auto text-[13px] font-mono leading-[1.7] shadow-2xs'
        }
      >
        <code>{body}</code>
      </pre>
    </div>
  );
}

const renderList = (list: ListBlock, key: string, compact: boolean, depth: number): React.ReactNode => {
  const Tag = list.ordered ? 'ol' : 'ul';
  const base = list.ordered
    ? compact
      ? 'list-decimal pl-4 space-y-1 marker:text-emerald-500 marker:font-bold'
      : 'list-decimal pl-5 space-y-2.5 marker:text-emerald-600 marker:font-bold'
    : compact
      ? 'list-disc pl-4 space-y-1 marker:text-emerald-400'
      : 'list-disc pl-5 space-y-2.5 marker:text-emerald-400';

  return (
    <Tag key={key} className={depth > 0 ? `${base} ${compact ? 'mt-1' : 'mt-2.5'}` : base}>
      {list.items.map((item, li) => {
        const itemKey = `${key}-l${li}`;
        return (
          <li key={itemKey} className={item.checked === null ? undefined : 'list-none -ml-4'}>
            {item.checked !== null && (
              <span className={item.checked ? 'mr-1.5 text-emerald-600' : 'mr-1.5 text-emerald-300'}>
                {item.checked ? '☑' : '☐'}
              </span>
            )}
            <span className={item.checked ? 'line-through opacity-60' : undefined}>
              {renderInline(item.text, itemKey)}
            </span>
            {item.child && renderList(item.child, `${itemKey}-c`, compact, depth + 1)}
          </li>
        );
      })}
    </Tag>
  );
};

const ALIGN_CLASS: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right'
};

/** 미리보기에서 "더 있음" 안내를 띄울지 판단할 때 쓴다. 줄 수가 아니라 블록 수로 세야 맞다. */
export const countRemedyBlocks = (text: string): number => (text?.trim() ? parseBlocks(text).length : 0);

export default function RemedyMarkdown({ text, variant = 'full', maxBlocks }: RemedyMarkdownProps) {
  if (!text?.trim()) return null;

  const compact = variant === 'compact';
  const parsed = parseBlocks(text);
  const blocks = maxBlocks && maxBlocks > 0 ? parsed.slice(0, maxBlocks) : parsed;

  return (
    <div
      className={
        compact
          ? 'font-sans text-[12.5px] leading-[1.7] text-emerald-900 space-y-2'
          : 'font-sans text-[15px] leading-[1.85] text-emerald-950 space-y-4'
      }
    >
      {blocks.map((block, index) => {
        const key = `b${index}`;

        switch (block.kind) {
          case 'heading': {
            // # / ## 는 처방전의 큰 마디, ### 는 그 아래 절, #### 부터는 항목 제목이다.
            if (block.level <= 2) {
              return (
                <h2
                  key={key}
                  className={
                    compact
                      ? 'font-serif font-bold text-emerald-900 text-[15px] mt-3 first:mt-0'
                      : 'font-serif font-bold text-emerald-950 text-[20px] leading-[1.5] mt-8 first:mt-0'
                  }
                >
                  {renderInline(block.text, key)}
                </h2>
              );
            }
            if (block.level === 3) {
              return (
                <h3
                  key={key}
                  className={
                    compact
                      ? 'font-serif font-bold text-emerald-900 text-[13.5px] border-l-2 border-emerald-500 pl-2 mt-2.5 first:mt-0'
                      : 'font-serif font-bold text-emerald-950 text-[17px] leading-[1.5] border-l-[3px] border-emerald-500 pl-3 mt-7 first:mt-0'
                  }
                >
                  {renderInline(block.text, key)}
                </h3>
              );
            }
            return (
              <h4
                key={key}
                className={
                  compact
                    ? 'font-sans font-semibold text-emerald-800 text-[12.5px] mt-2'
                    : 'font-sans font-semibold text-emerald-800 text-[14.5px] mt-5'
                }
              >
                {renderInline(block.text, key)}
              </h4>
            );
          }

          case 'quote':
            // 연속한 인용 줄을 한 장의 카드로 묶어 요약 블록이 갈라지지 않게 한다.
            // 배경을 단색 bg-emerald-50 으로 둬야 야간 테마 오버라이드가 걸린다.
            return (
              <div
                key={key}
                className={
                  compact
                    ? 'border-l-2 border-emerald-200 bg-emerald-50 rounded-r-lg pl-2.5 pr-2 py-1.5 space-y-1'
                    : 'border-l-[3px] border-emerald-400 bg-emerald-50 rounded-r-xl pl-4 pr-3.5 py-3 space-y-1.5'
                }
              >
                {block.lines.map((line, li) => (
                  <p key={`${key}-q${li}`} className="text-emerald-900 break-words">
                    {renderInline(line, `${key}-q${li}`)}
                  </p>
                ))}
              </div>
            );

          case 'list':
            return renderList(block, key, compact, 0);

          case 'code':
            // @types/react 가 없어 사용자 컴포넌트에 key 를 직접 넘기면 타입 검사에 걸린다.
            return (
              <React.Fragment key={key}>
                <CodeBlock block={block} compact={compact} />
              </React.Fragment>
            );

          case 'table':
            return (
              <div key={key} className="overflow-x-auto">
                <table className={compact ? 'w-full border-collapse text-[12px]' : 'w-full border-collapse text-[14px]'}>
                  <thead>
                    <tr>
                      {block.head.map((cell, ci) => (
                        <th
                          key={`${key}-h${ci}`}
                          className={`border-b-2 border-emerald-200 bg-emerald-50 font-bold text-emerald-900 whitespace-nowrap ${
                            compact ? 'px-2 py-1' : 'px-3 py-2'
                          } ${ALIGN_CLASS[block.align[ci] || 'left']}`}
                        >
                          {renderInline(cell, `${key}-h${ci}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, ri) => (
                      <tr key={`${key}-r${ri}`}>
                        {row.map((cell, ci) => (
                          <td
                            key={`${key}-r${ri}c${ci}`}
                            className={`border-b border-emerald-100 align-top ${compact ? 'px-2 py-1' : 'px-3 py-2'} ${
                              ALIGN_CLASS[block.align[ci] || 'left']
                            }`}
                          >
                            {renderInline(cell, `${key}-r${ri}c${ci}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );

          case 'rule':
            return (
              <div
                key={key}
                className={
                  compact
                    ? 'h-px bg-emerald-100 my-2'
                    : 'h-px bg-gradient-to-r from-emerald-200 via-emerald-100 to-transparent my-6'
                }
              />
            );

          default:
            return (
              <p key={key} className="break-words">
                {renderInline(block.text, key)}
              </p>
            );
        }
      })}
    </div>
  );
}
