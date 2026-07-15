import { BrainstormingSession } from '../types';
import { ArrowLeft, ArrowRight, Trash2, ShieldAlert, ArrowUpCircle, Sparkles } from 'lucide-react';

interface ErrcStepProps {
  session: BrainstormingSession;
  onChange: (updates: Partial<BrainstormingSession>) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function ErrcStep({ session, onChange, onNext, onPrev }: ErrcStepProps) {
  const handleTextChange = (field: 'eliminate' | 'reduce' | 'raise' | 'create', value: string) => {
    onChange({
      errc: {
        ...session.errc,
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in" id="errc-step-container">
      {/* Intro section */}
      <div className="border-b border-gray-100 pb-5" id="errc-intro">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Step 4. ERRC 프레임워크 기반 아키텍처 다이어트</h2>
        <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
          블루오션 전략의 ERRC 기법을 통해 서비스 시스템에서 제거할(E) 군더더기, 감축할(R) 오버헤드, 대폭 늘릴(R) 신뢰성 및 가시성, 새로 도입할(C) 자동화 및 혁신 요소를 명확히 도출합니다.
        </p>
      </div>

      {/* 2x2 ERRC Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="errc-grid">
        {/* Eliminate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs hover:border-gray-200 transition-all flex flex-col space-y-3" id="errc-eliminate-card">
          <div className="flex items-center space-x-3 text-red-600">
            <div className="p-2 rounded-lg bg-red-50">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">ELIMINATE (제거)</h3>
              <p className="text-[10px] text-gray-400">업계 관행 중 완전히 없애야 할 요소는?</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal pl-1 border-l-2 border-red-200">
            예: 수동 API 명세 동기화 작업, 타이트한 동기식 네트워크 결합도(Tight-coupling), 교차 DB 조인 쿼리 등 아키텍처를 뒤흔드는 무거운 요소들을 완전히 없앱니다.
          </p>
          <textarea
            value={session.errc.eliminate}
            onChange={(e) => handleTextChange('eliminate', e.target.value)}
            placeholder="제거할 비효율적/의존적 요소들을 기입하세요..."
            rows={5}
            className="w-full p-4 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all placeholder:text-gray-400 leading-relaxed shrink-0"
          />
        </div>

        {/* Reduce */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs hover:border-gray-200 transition-all flex flex-col space-y-3" id="errc-reduce-card">
          <div className="flex items-center space-x-3 text-amber-600">
            <div className="p-2 rounded-lg bg-amber-50">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">REDUCE (감소)</h3>
              <p className="text-[10px] text-gray-400">기준 이하로 줄여야 할 요소는?</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal pl-1 border-l-2 border-amber-200">
            예: 데이터베이스 Lock 대기 시간(Latency), 단순 CRUD 보일러플레이트 작성 공수, 트랜잭션 전파율 차단을 통한 복구 지연 시간(MTTR)을 크게 낮춥니다.
          </p>
          <textarea
            value={session.errc.reduce}
            onChange={(e) => handleTextChange('reduce', e.target.value)}
            placeholder="줄여야 할 부하/대기 시간/비용 등을 기입하세요..."
            rows={5}
            className="w-full p-4 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all placeholder:text-gray-400 leading-relaxed shrink-0"
          />
        </div>

        {/* Raise */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs hover:border-gray-200 transition-all flex flex-col space-y-3" id="errc-raise-card">
          <div className="flex items-center space-x-3 text-emerald-600">
            <div className="p-2 rounded-lg bg-emerald-50">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">RAISE (증가)</h3>
              <p className="text-[10px] text-gray-400">업계 평균 이상으로 끌어올릴 요소는?</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal pl-1 border-l-2 border-emerald-200">
            예: 시스템 가용성(SLA), 초당 최대 트레픽 처리율(Throughput), 분산 트레이싱 추적 비율 및 전구간 가시성(Observability), 단위/통합 테스트 커버리지를 키웁니다.
          </p>
          <textarea
            value={session.errc.raise}
            onChange={(e) => handleTextChange('raise', e.target.value)}
            placeholder="상승시킬 신뢰성/안정성/개발 만족도를 기입하세요..."
            rows={5}
            className="w-full p-4 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-gray-400 leading-relaxed shrink-0"
          />
        </div>

        {/* Create */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-3xs hover:border-gray-200 transition-all flex flex-col space-y-3" id="errc-create-card">
          <div className="flex items-center space-x-3 text-indigo-600">
            <div className="p-2 rounded-lg bg-indigo-50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-900">CREATE (창조)</h3>
              <p className="text-[10px] text-gray-400">새롭게 아키텍처에 도입해 볼 메커니즘은?</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-500 leading-normal pl-1 border-l-2 border-indigo-200">
            예: 자가 복구형 라우팅 서킷 브레이커, 데이터베이스 스키마 기반 소스코드 자동 생성 빌더, 비동기 보상 트랜잭션 오케스트레이션 엔진을 새롭게 창출합니다.
          </p>
          <textarea
            value={session.errc.create}
            onChange={(e) => handleTextChange('create', e.target.value)}
            placeholder="새롭게 도입할 독보적 기술 요소를 기입하세요..."
            rows={5}
            className="w-full p-4 rounded-xl border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-gray-400 leading-relaxed shrink-0"
          />
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="border-t border-gray-100 pt-6 flex justify-between" id="errc-nav">
        <button
          onClick={onPrev}
          className="flex items-center space-x-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Step 3 이동</span>
        </button>

        <button
          onClick={onNext}
          disabled={!session.errc.eliminate.trim() || !session.errc.reduce.trim() || !session.errc.raise.trim() || !session.errc.create.trim()}
          className="flex items-center space-x-2 bg-gray-955 hover:bg-gray-800 disabled:bg-gray-200 text-white disabled:text-gray-400 px-5 py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-all cursor-pointer"
        >
          <span>Step 5 (최종 정리) 이동</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
