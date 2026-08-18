import React from 'react';

interface RemedyMarkdownProps {
  text: string;
  /** full: 처방전 본문, compact: 광장 카드나 목록의 미리보기 */
  variant?: 'full' | 'compact';
}

/**
 * 처방전 마크다운 렌더러.
 *
 * 정원 광장 글은 로그인 없이도 쓸 수 있어 본문이 외부 입력이다. innerHTML을 쓰지 않고
 * React 노드로만 조립해 스크립트 주입 여지를 없앤다.
 */

const INLINE_PATTERN = /(\*\*[^*]+?\*\*|`[^`]+?`|\*[^*\s][^*]*?\*)/g;

// **굵게**, *기울임*, `코드` 를 노드로 바꾼다.
const renderInline = (text: string, keyPrefix: string): React.ReactNode[] => {
  return text
    .split(INLINE_PATTERN)
    .filter(part => part !== '' && part !== undefined)
    .map((part, i) => {
      const key = `${keyPrefix}-i${i}`;
      if (part.length > 4 && part.startsWith('**') && part.endsWith('**')) {
        return <strong key={key} className="font-bold text-emerald-950">{part.slice(2, -2)}</strong>;
      }
      if (part.length > 2 && part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={key} className="font-mono text-[0.92em] bg-emerald-50 text-emerald-900 border border-emerald-100 rounded px-1 py-0.5 mx-0.5 break-words">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) {
        return <em key={key} className="italic">{part.slice(1, -1)}</em>;
      }
      return <React.Fragment key={key}>{part}</React.Fragment>;
    });
};

type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'quote'; lines: string[] }
  | { kind: 'ul'; items: string[] }
  | { kind: 'ol'; items: string[] }
  | { kind: 'code'; lines: string[] }
  | { kind: 'rule' }
  | { kind: 'p'; text: string };

// 줄 단위 마크다운을 블록으로 묶는다. 연속한 인용과 목록은 하나로 합친다.
const parseBlocks = (source: string): Block[] => {
  const blocks: Block[] = [];
  const lines = source.split('\n');
  let inCode = false;
  let codeLines: string[] = [];

  const lastBlock = () => blocks[blocks.length - 1];

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();

    if (trimmed.startsWith('```')) {
      if (inCode) {
        blocks.push({ kind: 'code', lines: codeLines });
        codeLines = [];
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      codeLines.push(rawLine);
      continue;
    }

    if (!trimmed) continue;

    // 구분선이 목록으로 새지 않도록 먼저 걸러낸다.
    if (/^([-*_])\1{2,}$/.test(trimmed.replace(/\s/g, ''))) {
      blocks.push({ kind: 'rule' });
      continue;
    }

    // 정규식으로 한 번에 잡아야 #### 가 ### 로 잘리지 않는다.
    const heading = trimmed.match(/^(#{1,6})\s*(.*)$/);
    if (heading) {
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2].trim() });
      continue;
    }

    if (trimmed.startsWith('>')) {
      const content = trimmed.replace(/^>+\s?/, '');
      const prev = lastBlock();
      if (prev && prev.kind === 'quote') prev.lines.push(content);
      else blocks.push({ kind: 'quote', lines: [content] });
      continue;
    }

    const ordered = trimmed.match(/^(\d+)[.)]\s+(.*)$/);
    if (ordered) {
      const prev = lastBlock();
      if (prev && prev.kind === 'ol') prev.items.push(ordered[2]);
      else blocks.push({ kind: 'ol', items: [ordered[2]] });
      continue;
    }

    const bullet = trimmed.match(/^[-*+]\s+(.*)$/);
    if (bullet) {
      const prev = lastBlock();
      if (prev && prev.kind === 'ul') prev.items.push(bullet[1]);
      else blocks.push({ kind: 'ul', items: [bullet[1]] });
      continue;
    }

    blocks.push({ kind: 'p', text: trimmed });
  }

  if (inCode && codeLines.length) blocks.push({ kind: 'code', lines: codeLines });
  return blocks;
};

export default function RemedyMarkdown({ text, variant = 'full' }: RemedyMarkdownProps) {
  if (!text?.trim()) return null;

  const compact = variant === 'compact';
  const blocks = parseBlocks(text);

  return (
    <div className={compact ? 'space-y-1.5' : 'space-y-3.5'}>
      {blocks.map((block, index) => {
        const key = `b${index}`;

        switch (block.kind) {
          case 'heading': {
            // ### 는 처방전의 큰 마디, #### 는 그 아래 항목 제목으로 쓰인다.
            if (block.level <= 3) {
              return (
                <h4
                  key={key}
                  className={
                    compact
                      ? 'font-extrabold text-emerald-900 text-[10px] border-l-2 border-emerald-500 pl-1.5 mt-1'
                      : 'font-bold text-emerald-950 text-[13px] border-l-2 border-emerald-500 pl-2.5 mt-5 first:mt-0 tracking-tight'
                  }
                >
                  {renderInline(block.text, key)}
                </h4>
              );
            }
            return (
              <h5
                key={key}
                className={
                  compact
                    ? 'font-bold text-emerald-800 text-[9px] mt-1'
                    : 'font-bold text-emerald-900 text-[11.5px] mt-4'
                }
              >
                {renderInline(block.text, key)}
              </h5>
            );
          }

          case 'quote':
            // 연속한 인용 줄을 한 장의 카드로 묶어 요약 블록이 갈라지지 않게 한다.
            return (
              <div
                key={key}
                className={
                  compact
                    ? 'border-l-2 border-emerald-200 bg-emerald-50/40 rounded-r-lg pl-2 py-1 space-y-0.5'
                    : 'border-l-[3px] border-emerald-400 bg-gradient-to-r from-emerald-50/80 to-emerald-50/20 rounded-r-xl pl-3.5 pr-3 py-2.5 space-y-1.5'
                }
              >
                {block.lines.map((line, li) => (
                  <p key={`${key}-q${li}`} className={compact ? 'text-emerald-800' : 'text-emerald-900/90 leading-relaxed'}>
                    {renderInline(line, `${key}-q${li}`)}
                  </p>
                ))}
              </div>
            );

          case 'ul':
            return (
              <ul
                key={key}
                className={
                  compact
                    ? 'list-disc pl-4 space-y-0.5 marker:text-emerald-400'
                    : 'list-disc pl-5 space-y-1.5 marker:text-emerald-400'
                }
              >
                {block.items.map((item, li) => (
                  <li key={`${key}-l${li}`} className="leading-relaxed">
                    {renderInline(item, `${key}-l${li}`)}
                  </li>
                ))}
              </ul>
            );

          case 'ol':
            return (
              <ol
                key={key}
                className={
                  compact
                    ? 'list-decimal pl-4 space-y-0.5 marker:text-emerald-500 marker:font-bold'
                    : 'list-decimal pl-5 space-y-1.5 marker:text-emerald-600 marker:font-bold'
                }
              >
                {block.items.map((item, li) => (
                  <li key={`${key}-o${li}`} className="leading-relaxed">
                    {renderInline(item, `${key}-o${li}`)}
                  </li>
                ))}
              </ol>
            );

          case 'code':
            return (
              <pre
                key={key}
                className={
                  compact
                    ? 'bg-emerald-950/90 text-emerald-50 rounded-lg p-2 overflow-x-auto text-[8.5px] font-mono leading-relaxed'
                    : 'bg-emerald-950/95 text-emerald-50 rounded-xl p-3.5 overflow-x-auto text-[10.5px] font-mono leading-relaxed shadow-3xs'
                }
              >
                <code>{block.lines.join('\n')}</code>
              </pre>
            );

          case 'rule':
            return (
              <div
                key={key}
                className={
                  compact
                    ? 'h-px bg-emerald-100 my-1'
                    : 'h-px bg-gradient-to-r from-emerald-200 via-emerald-100 to-transparent my-4'
                }
              />
            );

          default:
            return (
              <p key={key} className="leading-relaxed">
                {renderInline(block.text, key)}
              </p>
            );
        }
      })}
    </div>
  );
}
