import { useState } from 'react';
import { X, BookOpen, Minimize2, Check, Leaf, Sprout, Wind, Database, ChevronRight } from 'lucide-react';

interface GuideModalProps {
  onClose: () => void;
}

type TabType = 'botany' | 'triz' | 'scamper' | 'errc';

export default function GuideModal({ onClose }: GuideModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('botany');

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-gray-950/40 backdrop-blur-xs p-4 animate-fade-in" id="guide-modal-overlay">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden" id="guide-modal-container">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between" id="guide-modal-header">
          <div className="flex items-center space-x-2.5 text-gray-900">
            <BookOpen className="w-5 h-5 text-emerald-800" />
            <h3 className="text-sm font-bold text-gray-950">식물 조언 & SW 설계 기법 가이드북</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="px-5 py-2 border-b border-gray-50 bg-gray-50/50 flex space-x-1 overflow-x-auto" id="guide-tabs">
          {([
            { id: 'botany', label: '🌿 식물 조언 가이드' },
            { id: 'triz', label: '💡 TRIZ 모순' },
            { id: 'scamper', label: '🎯 SCAMPER' },
            { id: 'errc', label: '📉 ERRC 다이어트' }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-3.5 py-2 rounded-lg text-2xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-950 shadow-3xs border border-emerald-100/55'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-6 overflow-y-auto flex-1 text-xs text-gray-600 leading-relaxed space-y-6 animate-fade-in" id="guide-tab-content">
          
          {activeTab === 'botany' && (
            <div className="space-y-5">
              <div className="space-y-1.5 border-b border-emerald-50 pb-3">
                <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  소프트웨어 식물학: 에러 퇴비화 정원 돌봄 지침
                </h4>
                <p className="text-3xs text-emerald-800/80">
                  우리가 직면하는 복잡한 버그와 예외 로그는 성장을 이끄는 최고의 고농축 질소 비료입니다. 각 식물의 돌봄 수칙과 아키텍처 비유를 정독하고 치유를 경험해 보세요.
                </p>
              </div>

              <div className="space-y-4">
                {/* Eucalyptus */}
                <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-2xs flex items-center gap-1.5">
                      <span>🌿 유칼립투스 (Eucalyptus)</span>
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100/70 text-emerald-800 text-[9px] rounded-md font-bold font-mono">스레드 / 동시성 제어</span>
                  </div>
                  <p className="text-3xs text-gray-500 font-medium">
                    <strong className="text-emerald-900">식물 돌봄:</strong> 유칼립투스는 싱싱한 통풍과 규칙적이며 가벼운 물뿌리기를 좋아합니다. 잎사귀가 뒤엉켜 과습해지면 쉽게 썩습니다.<br/>
                    <strong className="text-emerald-900">SW 처방 조언:</strong> 스레드가 꼬여 데드락(Deadlock)이 걸렸다면, 동기식 병목을 비동기 이벤트 채널(CQRS, Message Queue)로 흘러가게 쪼개어 해결해보세요.
                  </p>
                </div>

                {/* Bamboo */}
                <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-2xs flex items-center gap-1.5">
                      <span>🎋 대나무 새싹 (Bamboo)</span>
                    </span>
                    <span className="px-2 py-0.5 bg-sky-100/70 text-sky-800 text-[9px] rounded-md font-bold font-mono">인프라 / 네트워크 연동</span>
                  </div>
                  <p className="text-3xs text-gray-500 font-medium">
                    <strong className="text-emerald-900">식물 돌봄:</strong> 대나무는 곧고 높은 수직 기둥을 뻗어 성장합니다. 매서운 태풍에도 흔들릴지언정 부러지지 않는 마디(Node)가 가장 핵심입니다.<br/>
                    <strong className="text-emerald-900">SW 처방 조언:</strong> 커넥션 유실, 트래픽 폭주로 인한 단선(Timeout) 시, 서킷 브레이커(Circuit Breaker)와 오토스케일링을 가동해 튼튼한 마디를 구성하세요.
                  </p>
                </div>

                {/* Monstera */}
                <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-2xs flex items-center gap-1.5">
                      <span>🪴 몬스테라 (Monstera)</span>
                    </span>
                    <span className="px-2 py-0.5 bg-yellow-100/70 text-yellow-800 text-[9px] rounded-md font-bold font-mono">데이터베이스 / 메모리 고갈</span>
                  </div>
                  <p className="text-3xs text-gray-500 font-medium">
                    <strong className="text-emerald-900">식물 돌봄:</strong> 몬스테라는 잎사귀가 커지면 스스로 잎에 구멍을 뚫어(찢잎) 아래 잎에 햇빛과 빗물이 도달하도록 돕습니다. 배수가 극히 우수해야 합니다.<br/>
                    <strong className="text-emerald-900">SW 처방 조언:</strong> 대규모 데이터가 누적되어 쿼리가 정체된다면, 거대 테이블을 분할(Partitioning)하고 적절한 인덱스를 두어 부하의 통로를 시원하게 뚫어주어야 합니다.
                  </p>
                </div>

                {/* Ivy */}
                <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950 text-2xs flex items-center gap-1.5">
                      <span>🍀 아이비 넝쿨 (Ivy)</span>
                    </span>
                    <span className="px-2 py-0.5 bg-indigo-100/70 text-indigo-800 text-[9px] rounded-md font-bold font-mono">레거시 / 스파게티 코드</span>
                  </div>
                  <p className="text-3xs text-gray-500 font-medium">
                    <strong className="text-emerald-900">식물 돌봄:</strong> 아이비는 악조건 속에서도 벽과 지지대를 감싸며 끈질기게 생명력을 넓힙니다. 복잡하게 엉킨 줄기는 정기적으로 풀어주어야 합니다.<br/>
                    <strong className="text-emerald-900">SW 처방 조언:</strong> 단단하게 얽혀 손대기 어려운 스파게티 코드라도, 중요한 도메인 비즈니스 마디부터 점진적으로 분리(Refactoring)하여 느슨한 결합도를 완성하세요.
                  </p>
                </div>
              </div>

              {/* Growth Stage Guide */}
              <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-emerald-100 space-y-2.5">
                <span className="font-bold text-emerald-950 text-2xs flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                  🌱 식물 성장 단계별 가이드 (1단계 ~ 4단계)
                </span>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2 bg-white rounded-xl border border-emerald-50 space-y-1">
                    <span className="text-emerald-800 font-bold block text-[10px]">1단계: 씨앗</span>
                    <p className="text-[9px] text-gray-400">에러 퇴비를 영양분으로 첫 싹을 틔울 준비를 합니다.</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-50 space-y-1">
                    <span className="text-emerald-800 font-bold block text-[10px]">2단계: 어린잎</span>
                    <p className="text-[9px] text-gray-400">귀여운 아기 잎사귀가 자라며 처방전을 흡수합니다.</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-50 space-y-1">
                    <span className="text-emerald-800 font-bold block text-[10px]">3단계: 성장기</span>
                    <p className="text-[9px] text-gray-400">푸른 줄기가 튼튼하게 자라나 존재감을 뽐냅니다.</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-emerald-50 space-y-1">
                    <span className="text-emerald-800 font-bold block text-[10px]">4단계: 만개</span>
                    <p className="text-[9px] text-gray-400">아름답게 완성된 치유목이 되어 정원을 지킵니다.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'triz' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-950">TRIZ (트리즈): 모순을 찾아 정면으로 극복한다</h4>
              <p>
                트리즈는 러시아에서 수백만 건의 우수 특허들을 분석하여 찾아낸 발명 문제 해결 이론입니다. 문제 해결 과정에서 마주치는 모순을 물리적, 기술적 분리를 포함한 40가지 발명 원리로 타협 없이 돌파합니다.
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1">1. 분리 및 분할 (Segmentation / Separation)</span>
                  <p className="text-2xs">동기식 병목을 비동기 이벤트 채널(CQRS, Message Queue)로 완화하거나 트래픽을 처리 단계별로 쪼개 분산 처리합니다.</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1">2. 선행 조치 (Prior Action)</span>
                  <p className="text-2xs">실시간 DB 부담을 제로로 하기 위해 캐시(Redis 등)에 배치를 돌아 데이터를 사전에 인메모리 선적재 해 두는 기법입니다.</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1">3. 셀프 서비스 (Self-Service)</span>
                  <p className="text-2xs">서킷 브레이커, 리트라이 정책, 오토 스케일링을 수립하여 시스템이 장애 상태나 부하 상황에서 사람의 대기 없이 자율 복구되게 만듭니다.</p>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                  <span className="font-bold text-gray-900 block mb-1">4. 역발상 (Reverse)</span>
                  <p className="text-2xs">클라이언트가 서버의 완료를 무작정 폴링(Pull)하는 방향에서, 역으로 게이트웨이가 클라이언트에게 웹소켓 푸시(Push)로 던져주는 이벤트 드리븐 역설계입니다.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scamper' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-950">SCAMPER (스캠퍼): 7대 질문으로 고정관념을 파괴한다</h4>
              <p>
                인간의 보편적인 사고 패턴인 대체, 결합, 응용, 수정, 용도변경, 제거, 재배열의 일곱 글자를 기술 스택 및 데이터 흐름에 정면 대입하여 신선한 변형안을 이끌어 냅니다.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="font-bold text-gray-900 font-mono text-[11px] block">[S] Substitute (대체)</span>
                  <p className="text-3xs text-gray-500 mt-0.5">REST 통신을 고효율 gRPC나 비동기 SQS 통신 프로토콜로 대체.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="font-bold text-gray-900 font-mono text-[11px] block">[C] Combine (결합)</span>
                  <p className="text-3xs text-gray-500 mt-0.5">개별 마이크로서비스 호출을 API Gateway 단의 조합(Composition)으로 통합 결합.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="font-bold text-gray-900 font-mono text-[11px] block">[A] Adapt (응용)</span>
                  <p className="text-3xs text-gray-500 mt-0.5">전기 회로의 퓨즈 개념을 차용해 소프트웨어 서킷 브레이커 설계.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="font-bold text-gray-900 font-mono text-[11px] block">[M] Modify (수정)</span>
                  <p className="text-3xs text-gray-500 mt-0.5">DB 정규화 규칙을 깨고 NoSQL 비정규화 역조회를 두어 응답 향상.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="font-bold text-gray-900 font-mono text-[11px] block">[P] Put to another use (용도 변경)</span>
                  <p className="text-3xs text-gray-500 mt-0.5">버려지는 시스템 예외 모니터링 로그 데이터를 비즈니스 이상거래 탐지(FDS) 자료로 재활용.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl">
                  <span className="font-bold text-gray-900 font-mono text-[11px] block">[E] Eliminate (제거)</span>
                  <p className="text-3xs text-gray-500 mt-0.5">중간 게이트웨이 홉 제거, 수동 보일러플레이트 CRUD 코딩 제거.</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl md:col-span-2">
                  <span className="font-bold text-gray-900 font-mono text-[11px] block">[R] Reverse (재배열)</span>
                  <p className="text-3xs text-gray-500 mt-0.5">검증 절차를 트랜잭션 도킹 이전 인터셉터 단으로 재정렬하여 데이터베이스 락(Lock) 유지 시간을 최소 점유화.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'errc' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-950">ERRC: 기술 다이어트와 블루오션 매트릭스</h4>
              <p>
                ERRC는 비즈니스 경쟁 전략의 거장인 김위찬 교수가 창안한 프레임워크입니다. 시스템의 본질적 핵심 역량을 남기기 위해 무가치한 리소스를 제거하고 혁신 기술을 창출합니다.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                  <span className="font-bold text-red-700 block mb-1">ELIMINATE (제거)</span>
                  <p className="text-3xs">당연하다고 여겼던 분산 동기 커플링, 수동 엑셀 문서 취합, 복잡한 인프라 중복 통신 노이즈 등을 과감히 도려내 완전히 생략합니다.</p>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                  <span className="font-bold text-amber-700 block mb-1">REDUCE (감소)</span>
                  <p className="text-3xs">네트워크 Latency 지연율, DB 커넥션 병목, 실패 복구에 걸리는 소요 시간(MTTR)을 압도적인 미니멀리즘 설계를 통해 줄입니다.</p>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-700 block mb-1">RAISE (증가)</span>
                  <p className="text-3xs">시스템 생존을 보장하는 최고 가용성 SLA, 대용량 트레픽 가용성(Throughput), 분산 트레이싱 추적 비율 및 전구간 가시성(Observability)을 증대시킵니다.</p>
                </div>

                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <span className="font-bold text-indigo-700 block mb-1">CREATE (창조)</span>
                  <p className="text-3xs">이전에 없던 자기 치유형(Self-healing) 복구 회로, 스키마 연계 소스코드 빌드 자동화 스크립트 등 신개념 아키텍처를 새로 수립합니다.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

