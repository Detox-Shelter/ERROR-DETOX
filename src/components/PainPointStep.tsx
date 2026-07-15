import { BrainstormingSession } from '../types';
import { PAIN_POINT_PRESETS } from '../data';
import { AlertCircle, FileText, Check, ArrowRight } from 'lucide-react';

interface PainPointStepProps {
  session: BrainstormingSession;
  onChange: (updates: Partial<BrainstormingSession>) => void;
  onNext: () => void;
}

export default function PainPointStep({ session, onChange, onNext }: PainPointStepProps) {
  const handleSelectPreset = (presetId: string, title: string, description: string) => {
    onChange({
      title: session.title || title,
      painPoint: {
        type: 'preset',
        presetId,
        text: description,
      },
      // Clear downstream details to prevent mismatch, but keep if user is just switching around
      triz: {
        ...session.triz,
        contradiction: session.triz.contradiction || '',
      }
    });
  };

  const handleCustomTextChange = (text: string) => {
    onChange({
      painPoint: {
        type: 'custom',
        presetId: undefined,
        text,
      }
    });
  };

  const handleTitleChange = (title: string) => {
    onChange({ title });
  };

  const currentPresetId = session.painPoint.presetId;
  const painPointText = session.painPoint.text;

  return (
    <div className="space-y-8 animate-fade-in" id="painpoint-step-container">
      {/* Intro section */}
      <div className="border-b border-gray-100 pb-5" id="painpoint-intro">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Step 1. 나의 Pain Point 설정</h2>
        <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
          서비스 소프트웨어 개발 및 운영 과정에서 마주치는 실제적이고 해결이 필요한 문제를 설정합니다.
          기본 제공되는 대표 Pain Point 예시를 사용하거나, 직접 겪고 계신 구체적인 인프라/코드 이슈를 적어보세요.
        </p>
      </div>

      {/* Title Field */}
      <div className="space-y-2" id="session-title-field">
        <label className="text-xs font-semibold text-gray-800 uppercase tracking-wider font-mono">
          워크시트 제목 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={session.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="예: 마이크로서비스 동기 호출 제거 및 비동기 처리 설계"
          className="w-full max-w-xl px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 font-sans"
        />
        <p className="text-3xs text-gray-400">이 워크시트가 Google Drive에 저장될 때의 파일명 등으로 사용됩니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="painpoint-content-layout">
        {/* Left Side: Preset Selection */}
        <div className="lg:col-span-7 space-y-4" id="preset-list-container">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider font-mono">
              대표 Service SW Pain Point 예시 선택
            </span>
            <span className="text-3xs text-gray-400 font-mono">하나를 선택해 바로 시작할 수 있습니다</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {PAIN_POINT_PRESETS.map((preset) => {
              const isSelected = session.painPoint.type === 'preset' && currentPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.id, preset.title, preset.description)}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 focus:outline-none ${
                    isSelected
                      ? 'border-gray-900 bg-gray-50/50 shadow-xs'
                      : 'border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`p-1.5 rounded-md ${isSelected ? 'bg-gray-950 text-white' : 'bg-gray-50 text-gray-500'}`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-semibold text-gray-900">{preset.title}</h4>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-gray-950 text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-2xs text-gray-500 leading-relaxed pl-1">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Custom Prompt Input */}
        <div className="lg:col-span-5 space-y-4" id="custom-input-container">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-800 uppercase tracking-wider font-mono">
              내가 겪고 있는 Pain Point (직접 입력 / 수정)
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs space-y-4">
            <div className="space-y-2">
              <textarea
                value={painPointText}
                onChange={(e) => handleCustomTextChange(e.target.value)}
                placeholder="예: 우리 팀 서비스는 하루 수백만 건의 대용량 결제 배치가 도는 동안 실시간 결제 승인 API의 타임아웃 에러율이 15% 이상 치솟는 만성적인 데이터베이스 락(Lock) 경합 문제를 겪고 있다."
                rows={8}
                className="w-full p-4 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition-all placeholder:text-gray-400 leading-relaxed"
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-xl flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
              <div className="text-3xs text-gray-500 leading-normal">
                <span className="font-semibold text-gray-700">작성 팁:</span> 어떤 서비스 상황에서(예: 트래픽 급증, 대형 배치 실행 중), 어떤 기술적 결과(예: DB 타임아웃, 응답 속도 저하, 데이터 유실)가 발생하는지 적을수록 뒤의 TRIZ 모순 도출과 해결책 수립이 훨씬 구체화됩니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-gray-100 pt-6 flex justify-end" id="painpoint-nav">
        <button
          onClick={onNext}
          disabled={!session.title.trim() || !painPointText.trim()}
          className="flex items-center space-x-2 bg-gray-955 hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <span>Step 2 (TRIZ 모순) 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
