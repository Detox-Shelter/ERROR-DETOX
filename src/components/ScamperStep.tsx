import { useState } from 'react';
import { BrainstormingSession } from '../types';
import { SCAMPER_PROMPTS } from '../data';
import { HelpCircle, FileText, Check, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';

interface ScamperStepProps {
  session: BrainstormingSession;
  onChange: (updates: Partial<BrainstormingSession>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ScamperStep({ session, onChange, onNext, onPrev }: ScamperStepProps) {
  const [activeLetter, setActiveLetter] = useState<'S' | 'C' | 'A' | 'M' | 'P' | 'E' | 'R'>('S');

  const handleToggleLetter = (letter: 'S' | 'C' | 'A' | 'M' | 'P' | 'E' | 'R') => {
    const isSelected = session.scamper.selectedLetters.includes(letter);
    let updated: ('S' | 'C' | 'A' | 'M' | 'P' | 'E' | 'R')[];

    if (isSelected) {
      updated = session.scamper.selectedLetters.filter(l => l !== letter);
    } else {
      updated = [...session.scamper.selectedLetters, letter];
    }

    onChange({
      scamper: {
        ...session.scamper,
        selectedLetters: updated,
      }
    });
  };

  const handleIdeaChange = (letter: 'S' | 'C' | 'A' | 'M' | 'P' | 'E' | 'R', idea: string) => {
    onChange({
      scamper: {
        ...session.scamper,
        ideas: {
          ...session.scamper.ideas,
          [letter]: idea,
        }
      }
    });

    // Automatically check the letter if user is typing
    if (!session.scamper.selectedLetters.includes(letter) && idea.trim() !== '') {
      onChange({
        scamper: {
          ...session.scamper,
          selectedLetters: [...session.scamper.selectedLetters, letter],
          ideas: {
            ...session.scamper.ideas,
            [letter]: idea,
          }
        }
      });
    }
  };

  const currentPrompt = SCAMPER_PROMPTS.find(p => p.letter === activeLetter)!;

  return (
    <div className="space-y-8 animate-fade-in" id="scamper-step-container">
      {/* Intro section */}
      <div className="border-b border-gray-100 pb-5" id="scamper-intro">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Step 3. SCAMPER 질문을 통한 아이디어 발상</h2>
        <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
          SCAMPER는 7개의 구체적인 질문 렌즈(대체, 결합, 응용, 수정, 용도변경, 제거, 재배열)를 사용해 기존 시스템을 다양한 각도로 비틀어 신선한 아키텍처 개선 아이디어를 도출합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="scamper-layout">
        {/* Left pane: 7 SCAMPER Selectors */}
        <div className="lg:col-span-4 space-y-3" id="scamper-selectors">
          <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider font-mono">
            스캠퍼 질문 프레임워크 (7글자)
          </span>

          <div className="grid grid-cols-1 gap-2">
            {SCAMPER_PROMPTS.map((p) => {
              const isSelected = session.scamper.selectedLetters.includes(p.letter);
              const isActive = activeLetter === p.letter;

              return (
                <button
                  key={p.letter}
                  onClick={() => {
                    setActiveLetter(p.letter);
                  }}
                  className={`text-left p-3.5 rounded-xl border transition-all duration-150 flex items-center justify-between cursor-pointer ${
                    isActive
                      ? 'border-gray-950 bg-gray-50/50 shadow-3xs'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3.5">
                    {/* Circle badge for letter */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation(); // Only toggle selection
                        handleToggleLetter(p.letter);
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-xs border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-gray-900 text-white border-transparent'
                          : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {isSelected ? '✓' : p.letter}
                    </div>

                    <div>
                      <h4 className="text-2xs font-bold text-gray-900 leading-tight">
                        {p.titleKr}
                      </h4>
                      <span className="text-[9px] text-gray-400 font-mono block mt-0.5">{p.title}</span>
                    </div>
                  </div>

                  {isActive && (
                    <ChevronRight className="w-3.5 h-3.5 text-gray-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right pane: Active Question Detailed Prompts & Input */}
        <div className="lg:col-span-8 space-y-4" id="scamper-active-pane">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-3xs space-y-6">
            {/* Header of Active prompt */}
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-mono font-black text-gray-950 px-2.5 py-1 bg-gray-100 rounded-lg">
                  {currentPrompt.letter}
                </span>
                <div>
                  <h3 className="text-xs font-bold text-gray-900">{currentPrompt.titleKr} ({currentPrompt.title})</h3>
                  <p className="text-3xs text-gray-400">이 렌즈를 통해 시스템의 일부를 변형해 보세요.</p>
                </div>
              </div>

              {/* Quick toggle check for active */}
              <button
                onClick={() => handleToggleLetter(currentPrompt.letter)}
                className={`px-2.5 py-1.5 rounded-lg text-3xs font-semibold border transition-all cursor-pointer ${
                  session.scamper.selectedLetters.includes(currentPrompt.letter)
                    ? 'bg-gray-950 text-white border-transparent'
                    : 'bg-white text-gray-500 hover:border-gray-300'
                }`}
              >
                {session.scamper.selectedLetters.includes(currentPrompt.letter) ? '아이디어 채택됨 ✓' : '아이디어 채택하기'}
              </button>
            </div>

            {/* Questions to think */}
            <div className="space-y-2">
              <span className="text-3xs font-bold text-gray-400 uppercase tracking-wider font-mono">생각해 볼 핵심 질문</span>
              <ul className="list-disc list-inside space-y-1.5 pl-1.5">
                {currentPrompt.questions.map((q, idx) => (
                  <li key={idx} className="text-2xs text-gray-600 leading-normal font-medium">{q}</li>
                ))}
              </ul>
            </div>

            {/* Service SW examples */}
            <div className="p-4 bg-gray-50 rounded-xl space-y-2">
              <span className="text-3xs font-bold text-gray-400 uppercase tracking-wider font-mono block">Service SW 실제 사례</span>
              <div className="grid grid-cols-1 gap-2.5">
                {currentPrompt.serviceSwExamples.map((ex, idx) => (
                  <div key={idx} className="text-3xs text-gray-600 leading-relaxed bg-white p-2.5 rounded-lg border border-gray-100">
                    {ex}
                  </div>
                ))}
              </div>
            </div>

            {/* Textarea Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-3xs font-bold text-gray-400 uppercase tracking-wider font-mono">나의 {currentPrompt.titleKr} ({currentPrompt.letter}) 아이디어</span>
                {session.scamper.ideas[currentPrompt.letter]?.length > 0 && (
                  <span className="text-3xs text-green-500 font-semibold font-mono">작성 중</span>
                )}
              </div>
              <textarea
                value={session.scamper.ideas[currentPrompt.letter] || ''}
                onChange={(e) => handleIdeaChange(currentPrompt.letter, e.target.value)}
                placeholder={`예: ${activeLetter === 'S' ? '동기식 API 결합 호출을 AWS SQS 메시지 발송으로 교체하고 결제 완료를 이벤트를 통해 비동기로 전달.' : activeLetter === 'E' ? '레거시 내부 트랜잭션 도킹을 아예 중단하고 완전 격리된 별도의 배송 마이크로서비스 DB 구축.' : '이 분야에서 떠오른 해결 안을 적어주세요.'}`}
                rows={5}
                className="w-full p-4 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 leading-relaxed"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-gray-100 pt-6 flex justify-between" id="scamper-nav">
        <button
          onClick={onPrev}
          className="flex items-center space-x-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Step 2 이동</span>
        </button>

        <button
          onClick={onNext}
          disabled={session.scamper.selectedLetters.length === 0}
          className="flex items-center space-x-2 bg-gray-955 hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <span>Step 4 (ERRC) 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
