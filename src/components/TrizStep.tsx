import { BrainstormingSession } from '../types';
import { TRIZ_PRINCIPLES, PAIN_POINT_PRESETS } from '../data';
import { HelpCircle, ChevronRight, CheckSquare, Square, Info, ArrowLeft, ArrowRight } from 'lucide-react';

interface TrizStepProps {
  session: BrainstormingSession;
  onChange: (updates: Partial<BrainstormingSession>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function TrizStep({ session, onChange, onNext, onPrev }: TrizStepProps) {
  // Find preset contradiction if any to show as helper
  const preset = PAIN_POINT_PRESETS.find(p => p.id === session.painPoint.presetId);

  const handleContradictionChange = (contradiction: string) => {
    onChange({
      triz: {
        ...session.triz,
        contradiction
      }
    });
  };

  const togglePrinciple = (id: string) => {
    const isSelected = session.triz.selectedPrinciples.includes(id);
    let updated: string[];

    if (isSelected) {
      updated = session.triz.selectedPrinciples.filter(pid => pid !== id);
    } else {
      updated = [...session.triz.selectedPrinciples, id];
    }

    onChange({
      triz: {
        ...session.triz,
        selectedPrinciples: updated
      }
    });
  };

  const handleIdeaChange = (id: string, idea: string) => {
    onChange({
      triz: {
        ...session.triz,
        ideas: {
          ...session.triz.ideas,
          [id]: idea
        }
      }
    });
  };

  const applyPresetContradiction = () => {
    if (preset) {
      handleContradictionChange(preset.exampleConflict);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="triz-step-container">
      {/* Intro section */}
      <div className="border-b border-gray-100 pb-5" id="triz-intro">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Step 2. TRIZ 모순 발굴 및 해결안 설계</h2>
        <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
          트리즈(TRIZ)의 핵심은 기술 시스템의 <strong>상충 모순(Physical/Technical Contradiction)</strong>을 명확히 파악하고, 이를 절협하는 대신 근본적으로 극복하는 창의적 원리를 대입하는 것입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="triz-layout">
        {/* Left column: Contradiction Definition */}
        <div className="lg:col-span-5 space-y-5" id="contradiction-pane">
          <div>
            <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider font-mono">
              나의 기술적 상충 모순 정의하기
            </span>
            <p className="text-3xs text-gray-400 mt-0.5">"A를 개선하려고 하면, B가 악화되어 불가능하다"의 형태로 서술해 봅니다.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
            {/* Display active Pain Point as context */}
            <div className="p-3 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block font-mono">대상 Pain Point</span>
              <p className="text-2xs text-gray-600 mt-1 line-clamp-2 italic">"{session.painPoint.text}"</p>
            </div>

            {/* Auto-suggest button if preset is active */}
            {preset && (
              <button
                onClick={applyPresetContradiction}
                className="w-full flex items-center justify-between text-left p-3 rounded-xl border border-gray-100 bg-gray-50 text-2xs font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-200 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <Info className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>이 Pain Point의 권장 모순 예시 적용하기</span>
                </div>
                <ChevronRight className="w-3 h-3 text-gray-400" />
              </button>
            )}

            <div className="space-y-2">
              <textarea
                value={session.triz.contradiction}
                onChange={(e) => handleContradictionChange(e.target.value)}
                placeholder="예: 트래픽 급증을 제어하기 위해 대기열 대기 방식을 두려고 하면(이점), 실시간성 보장이 나빠지고 사용자 경험이 극도로 떨어진다(모순)."
                rows={6}
                className="w-full p-4 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 leading-relaxed"
              />
            </div>

            <div className="p-3.5 bg-gray-950 text-white rounded-xl space-y-1.5">
              <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider block font-mono">💡 트리즈 발명 모순 작성 팁</span>
              <p className="text-3xs text-gray-300 leading-normal">
                트래픽 폭증을 감당하려 스펙을 무작정 늘리면(이점), 서브스크립션 비용이 과하게 올라간다(모순)와 같이 <strong>성능 향상 vs 자원 소모</strong> 또는 <strong>정합성 확보 vs 지연 시간(Latency)</strong>의 양 극단을 뾰족하게 대비시켜 보세요.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Principles and Idea Input */}
        <div className="lg:col-span-7 space-y-4" id="triz-principles-pane">
          <div>
            <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider font-mono">
              적용할 트리즈 원리 선택 및 해결안 아이디어 작성
            </span>
            <p className="text-3xs text-gray-400 mt-0.5">체크박스를 눌러 선택한 후, 아래에 구체적인 아키텍처 아이디어를 작성해 보세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="principles-checkbox-grid">
            {TRIZ_PRINCIPLES.map((p) => {
              const isSelected = session.triz.selectedPrinciples.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePrinciple(p.id)}
                  className={`flex items-start text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50/50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="mr-3 mt-0.5 shrink-0 text-gray-900">
                    {isSelected ? <CheckSquare className="w-4.5 h-4.5" /> : <Square className="w-4.5 h-4.5" />}
                  </div>
                  <div>
                    <h4 className="text-2xs font-bold text-gray-900 leading-tight">
                      {p.nameKr}
                    </h4>
                    <span className="text-[9px] text-gray-400 font-mono block mt-0.5">{p.name}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Principle Ideas textareas */}
          <div className="space-y-4 mt-4" id="triz-ideas-inputs">
            {session.triz.selectedPrinciples.length === 0 ? (
              <div className="p-8 border border-dashed border-gray-200 rounded-2xl bg-white text-center text-xs text-gray-400">
                위에서 적용할 트리즈 원리를 선택해 주세요. 여기에 구체적인 작성 란이 열립니다.
              </div>
            ) : (
              TRIZ_PRINCIPLES.filter(p => session.triz.selectedPrinciples.includes(p.id)).map((p) => {
                const currentIdea = session.triz.ideas[p.id] || '';
                return (
                  <div key={p.id} className="bg-white p-4.5 rounded-2xl border border-gray-100 shadow-3xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-gray-900">{p.nameKr}</span>
                        <span className="text-[10px] text-gray-400 font-mono ml-2">({p.name})</span>
                      </div>
                      <div className="relative group shrink-0">
                        <span className="cursor-help p-1 text-gray-400 hover:text-gray-900 transition-colors">
                          <HelpCircle className="w-4 h-4" />
                        </span>
                        <div className="absolute right-0 bottom-6 hidden group-hover:block bg-gray-950 text-white p-3.5 rounded-xl w-72 text-3xs leading-relaxed shadow-lg z-20">
                          <span className="font-semibold text-gray-300 block mb-1">Service SW 적용 사례:</span>
                          {p.example}
                        </div>
                      </div>
                    </div>
                    <p className="text-3xs text-gray-500 leading-normal">{p.description}</p>
                    <textarea
                      value={currentIdea}
                      onChange={(e) => handleIdeaChange(p.id, e.target.value)}
                      placeholder={`예: ${p.id === 'segmentation' ? '대량 데이터 유입용 SQS 대기열과 결제 상태 조회 데이터베이스(DynamoDB) 분리 및 CQRS 패턴 적용.' : p.id === 'prior-action' ? '로그인 토큰 검증 정보를 게이트웨이 메모리(Redis Cluster)에 10분간 선적재.' : '이 원리를 적용해 볼 아이디어를 작성해 보세요.'}`}
                      rows={3}
                      className="w-full p-3.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400"
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-gray-100 pt-6 flex justify-between" id="triz-nav">
        <button
          onClick={onPrev}
          className="flex items-center space-x-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Step 1 이동</span>
        </button>

        <button
          onClick={onNext}
          disabled={!session.triz.contradiction.trim() || session.triz.selectedPrinciples.length === 0}
          className="flex items-center space-x-2 bg-gray-955 hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <span>Step 3 (SCAMPER) 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
