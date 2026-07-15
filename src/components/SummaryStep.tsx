import { useState } from 'react';
import { BrainstormingSession } from '../types';
import { SCAMPER_PROMPTS, TRIZ_PRINCIPLES } from '../data';
import { Check, Copy, Printer, FileDown, ArrowLeft, Save, AlertCircle, Info } from 'lucide-react';

interface SummaryStepProps {
  session: BrainstormingSession;
  onChange: (updates: Partial<BrainstormingSession>) => void;
  onPrev: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export default function SummaryStep({
  session,
  onChange,
  onPrev,
  onSave,
  isSaving,
  hasUnsavedChanges
}: SummaryStepProps) {
  const [copied, setCopied] = useState(false);

  const handleFieldChange = (field: 'trizKeyIdea' | 'scamperKeyIdea' | 'errcKeyIdea' | 'actionableSolution', value: string) => {
    onChange({
      finalSummary: {
        ...session.finalSummary,
        [field]: value
      }
    });
  };

  // Generate clean Markdown output
  const generateMarkdown = () => {
    let md = `# [Service SW 페르소나 브레인스토밍 워크시트] ${session.title}\n\n`;
    md += `* **작성 일자:** ${new Date(session.lastUpdated).toLocaleString('ko-KR')}\n`;
    md += `* **대상 페르소나:** 서비스 소프트웨어 엔지니어 (Service SW)\n\n`;

    md += `## 1. 나의 Pain Point\n> ${session.painPoint.text}\n\n`;

    md += `## 2. TRIZ (트리즈) 브레인스토밍\n`;
    md += `* **도출된 기술적 상충 모순:** ${session.triz.contradiction}\n`;
    md += `* **적용된 발명 원리 및 해결안:**\n`;
    session.triz.selectedPrinciples.forEach(pid => {
      const p = TRIZ_PRINCIPLES.find(item => item.id === pid);
      if (p) {
        md += `  * **${p.nameKr} (${p.name}):** ${session.triz.ideas[pid] || '아이디어 미작성'}\n`;
      }
    });
    md += `\n`;

    md += `## 3. SCAMPER (스캠퍼) 브레인스토밍\n`;
    session.scamper.selectedLetters.forEach(letter => {
      const p = SCAMPER_PROMPTS.find(item => item.letter === letter);
      if (p) {
        md += `* **[${letter}] ${p.titleKr} (${p.title}):** ${session.scamper.ideas[letter] || '아이디어 미작성'}\n`;
      }
    });
    md += `\n`;

    md += `## 4. ERRC 기술 다이어트 매트릭스\n`;
    md += `* **ELIMINATE (제거):** ${session.errc.eliminate}\n`;
    md += `* **REDUCE (감소):** ${session.errc.reduce}\n`;
    md += `* **RAISE (증가):** ${session.errc.raise}\n`;
    md += `* **CREATE (창조):** ${session.errc.create}\n\n`;

    md += `## 5. 최종 종합 및 아키텍처 솔루션 정리\n`;
    md += `### [TRIZ 핵심 반영 안]\n${session.finalSummary.trizKeyIdea || '기입 안 됨'}\n\n`;
    md += `### [SCAMPER 핵심 반영 안]\n${session.finalSummary.scamperKeyIdea || '기입 안 됨'}\n\n`;
    md += `### [ERRC 핵심 반영 안]\n${session.finalSummary.errcKeyIdea || '기입 안 됨'}\n\n`;
    md += `### 💡 [최종 실행 가능한 구체적 아키텍처 솔루션]\n${session.finalSummary.actionableSolution || '기입 안 됨'}\n`;

    return md;
  };

  const copyToClipboard = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper auto-compile buttons (Quick pull-in from previous steps)
  const autoCompileTriz = () => {
    const activeIdeas = session.triz.selectedPrinciples
      .map(pid => {
        const p = TRIZ_PRINCIPLES.find(item => item.id === pid);
        return `[${p?.nameKr}] ${session.triz.ideas[pid] || ''}`;
      })
      .filter(t => t.trim().length > 10)
      .join('\n');
    handleFieldChange('trizKeyIdea', activeIdeas);
  };

  const autoCompileScamper = () => {
    const activeIdeas = session.scamper.selectedLetters
      .map(letter => `[${letter}] ${session.scamper.ideas[letter] || ''}`)
      .filter(t => t.trim().length > 5)
      .join('\n');
    handleFieldChange('scamperKeyIdea', activeIdeas);
  };

  const autoCompileErrc = () => {
    const activeIdeas = `E: ${session.errc.eliminate.substring(0, 80)}...\nR: ${session.errc.reduce.substring(0, 80)}...\nR: ${session.errc.raise.substring(0, 80)}...\nC: ${session.errc.create.substring(0, 80)}...`;
    handleFieldChange('errcKeyIdea', activeIdeas);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="summary-step-container">
      {/* Print-only CSS block */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          #header-container, #summary-nav, #actions-panel, #compiler-triggers, .no-print {
            display: none !important;
          }
          .print-full {
            width: 100% !important;
            max-width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-card {
            border: 1px solid #e5e7eb !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Intro section */}
      <div className="border-b border-gray-100 pb-5 flex flex-col md:flex-row md:items-center md:justify-between no-print" id="summary-intro">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Step 5. 최종 종합 정리 및 문서 저장</h2>
          <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
            각 기법(TRIZ, SCAMPER, ERRC)에서 도출한 핵심 아이디어를 융합하여 서비스 소프트웨어 엔지니어링 관점에서 실제 적용할 최종 아키텍처 솔루션을 종합 정의합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print-full" id="summary-layout">
        {/* Left column: Summary input forms */}
        <div className="lg:col-span-7 space-y-5 print-full" id="summary-input-forms">
          {/* TRIZ Core Input */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3 print-card">
            <div className="flex items-center justify-between no-print" id="triz-summary-header">
              <span className="text-2xs font-bold text-gray-800 uppercase tracking-wider font-mono">1. TRIZ 기법 반영 아이디어 요약</span>
              <button
                onClick={autoCompileTriz}
                className="text-3xs text-gray-500 hover:text-gray-900 font-semibold underline cursor-pointer"
              >
                앞전 단계 아이디어 자동 취합
              </button>
            </div>
            <textarea
              value={session.finalSummary.trizKeyIdea}
              onChange={(e) => handleFieldChange('trizKeyIdea', e.target.value)}
              placeholder="TRIZ 단계에서 얻은 가장 확실한 아키텍처 개선 핵심 아이디어를 정리해 주세요."
              rows={3}
              className="w-full p-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 leading-relaxed"
            />
          </div>

          {/* SCAMPER Core Input */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3 print-card">
            <div className="flex items-center justify-between no-print" id="scamper-summary-header">
              <span className="text-2xs font-bold text-gray-800 uppercase tracking-wider font-mono">2. SCAMPER 기법 반영 아이디어 요약</span>
              <button
                onClick={autoCompileScamper}
                className="text-3xs text-gray-500 hover:text-gray-900 font-semibold underline cursor-pointer"
              >
                앞전 단계 아이디어 자동 취합
              </button>
            </div>
            <textarea
              value={session.finalSummary.scamperKeyIdea}
              onChange={(e) => handleFieldChange('scamperKeyIdea', e.target.value)}
              placeholder="SCAMPER 단계에서 얻은 대체(S), 결합(C), 제거(E) 등의 주요 변형 관점을 간략히 요약합니다."
              rows={3}
              className="w-full p-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 leading-relaxed"
            />
          </div>

          {/* ERRC Core Input */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-3 print-card">
            <div className="flex items-center justify-between no-print" id="errc-summary-header">
              <span className="text-2xs font-bold text-gray-800 uppercase tracking-wider font-mono">3. ERRC 기법 반영 아이디어 요약</span>
              <button
                onClick={autoCompileErrc}
                className="text-3xs text-gray-500 hover:text-gray-900 font-semibold underline cursor-pointer"
              >
                앞전 단계 아이디어 자동 취합
              </button>
            </div>
            <textarea
              value={session.finalSummary.errcKeyIdea}
              onChange={(e) => handleFieldChange('errcKeyIdea', e.target.value)}
              placeholder="ERRC를 통해 도려낼 불필요한 레이어/대기시간과, 창조 및 강화할 신뢰성 메커니즘을 요약합니다."
              rows={3}
              className="w-full p-3 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 leading-relaxed"
            />
          </div>

          {/* Actionable Final Architecture Solution */}
          <div className="bg-gray-950 text-white p-6 rounded-2xl shadow-md space-y-4 print-card print:bg-white print:text-black print:border print:border-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-gray-100 print:text-black">💡 최종 실행 가능한 구체적 아키텍처 솔루션</span>
            </div>
            <p className="text-3xs text-gray-400 leading-normal border-l border-gray-700 pl-3 print:text-gray-600 print:border-gray-300">
              앞선 요약본들을 연계하여 개발 프로세스 혹은 아키텍처 변경(예: CQRS + Kafka 이벤트 브로커 도입, Gradle 스키마 플러그인 빌드 환경 전면 적용 등)의 구체적인 구현 지침과 액션 아이템을 수립해 주세요.
            </p>
            <textarea
              value={session.finalSummary.actionableSolution}
              onChange={(e) => handleFieldChange('actionableSolution', e.target.value)}
              placeholder="예: API 게이트웨이 레이어에 Redis 전처리 캐싱 검증 서브모듈을 이식하여 동기식 DB 커넥션 병목을 70% 차단하며, 주문 완료 이벤트를 Kafka 토픽에 전달하고 재고/결제 서비스는 비동기 리스너(Listener) 방식으로 전환하는 하이브리드 아키텍처를 전개한다."
              rows={7}
              className="w-full p-4 rounded-xl bg-gray-900 border border-gray-800 text-white text-xs focus:outline-none focus:ring-1 focus:ring-white transition-all placeholder:text-gray-500 leading-relaxed print:bg-white print:text-black print:border-gray-200"
            />
          </div>
        </div>

        {/* Right column: Action panel, Document Export, and Quick Previews */}
        <div className="lg:col-span-5 space-y-6 no-print" id="actions-panel">
          {/* Document Management Card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
            <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider font-mono block">문서 보관 및 내보내기</span>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Save directly to Google Drive */}
              <button
                onClick={onSave}
                disabled={isSaving}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  hasUnsavedChanges
                    ? 'bg-gray-950 text-white border-transparent hover:bg-gray-800'
                    : 'bg-gray-50 text-gray-700 border-gray-100 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                  <div className="text-left">
                    <span>{isSaving ? 'Google Drive에 저장 중...' : 'Google Drive에 최종 저장'}</span>
                    <p className="text-[10px] font-normal text-gray-400">전용 클라우드에 실시간 동기화</p>
                  </div>
                </div>
                {hasUnsavedChanges && (
                  <span className="px-2 py-0.5 text-3xs font-mono font-bold bg-orange-500 text-white rounded-md">변경됨</span>
                )}
              </button>

              {/* Copy Markdown */}
              <button
                onClick={copyToClipboard}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 transition-all text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                  <div className="text-left">
                    <span>{copied ? '복사 완료!' : '클립보드에 마크다운 복사'}</span>
                    <p className="text-[10px] font-normal text-gray-400">노션, 슬라이드, 문서 등에 바로 붙여넣기</p>
                  </div>
                </div>
              </button>

              {/* Print / Save PDF */}
              <button
                onClick={handlePrint}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-gray-150 bg-white hover:bg-gray-50 transition-all text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <Printer className="w-4 h-4 text-gray-500" />
                  <div className="text-left">
                    <span>PDF 다운로드 및 인쇄</span>
                    <p className="text-[10px] font-normal text-gray-400">이쁘게 정리된 실물 용지 크기로 인쇄</p>
                  </div>
                </div>
              </button>
            </div>

            {hasUnsavedChanges && (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-3xs leading-normal">
                  저장되지 않은 변경사항이 있습니다. 다른 화면으로 이동하거나 창을 닫기 전 <strong>Google Drive에 최종 저장</strong> 단추를 반드시 눌러주세요.
                </p>
              </div>
            )}
          </div>

          {/* Quick Recap Preview of all steps */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
            <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider font-mono block">단계별 도출 아이디어 전체 보기</span>

            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {/* Pain Point recap */}
              <div className="space-y-1">
                <span className="text-3xs font-mono font-bold text-gray-400 uppercase">Step 1. Pain Point</span>
                <p className="text-3xs text-gray-600 bg-gray-50/50 p-2 rounded-lg border border-gray-100 line-clamp-2">
                  {session.painPoint.text}
                </p>
              </div>

              {/* TRIZ contradiction & selected ideas */}
              <div className="space-y-1">
                <span className="text-3xs font-mono font-bold text-gray-400 uppercase">Step 2. TRIZ 모순 및 해결책</span>
                <p className="text-3xs text-gray-600 bg-gray-50/50 p-2 rounded-lg border border-gray-100 line-clamp-2">
                  모순: {session.triz.contradiction}
                </p>
                {session.triz.selectedPrinciples.map(pid => {
                  const p = TRIZ_PRINCIPLES.find(item => item.id === pid);
                  return (
                    <div key={pid} className="text-[10px] text-gray-500 pl-2 border-l border-gray-200">
                      <strong>{p?.nameKr}:</strong> {session.triz.ideas[pid] || '미기재'}
                    </div>
                  );
                })}
              </div>

              {/* SCAMPER recap */}
              <div className="space-y-1">
                <span className="text-3xs font-mono font-bold text-gray-400 uppercase">Step 3. SCAMPER 아이디어</span>
                {session.scamper.selectedLetters.map(letter => {
                  const p = SCAMPER_PROMPTS.find(item => item.letter === letter);
                  return (
                    <div key={letter} className="text-[10px] text-gray-500 pl-2 border-l border-gray-200">
                      <strong>{letter} ({p?.titleKr}):</strong> {session.scamper.ideas[letter] || '미기재'}
                    </div>
                  );
                })}
                {session.scamper.selectedLetters.length === 0 && (
                  <p className="text-3xs text-gray-400 italic">도출된 SCAMPER 안이 없습니다.</p>
                )}
              </div>

              {/* ERRC recap */}
              <div className="space-y-1">
                <span className="text-3xs font-mono font-bold text-gray-400 uppercase">Step 4. ERRC 기술 다이어트</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="bg-gray-50 p-1.5 rounded text-[9px] text-gray-600 truncate">
                    <strong>E (제거):</strong> {session.errc.eliminate}
                  </div>
                  <div className="bg-gray-50 p-1.5 rounded text-[9px] text-gray-600 truncate">
                    <strong>R (감소):</strong> {session.errc.reduce}
                  </div>
                  <div className="bg-gray-50 p-1.5 rounded text-[9px] text-gray-600 truncate">
                    <strong>R (증가):</strong> {session.errc.raise}
                  </div>
                  <div className="bg-gray-50 p-1.5 rounded text-[9px] text-gray-600 truncate">
                    <strong>C (창조):</strong> {session.errc.create}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-gray-100 pt-6 flex justify-start no-print" id="summary-nav">
        <button
          onClick={onPrev}
          className="flex items-center space-x-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Step 4 이동</span>
        </button>
      </div>
    </div>
  );
}
