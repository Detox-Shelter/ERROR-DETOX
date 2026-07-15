import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { listWorksheetFiles } from '../drive';
import { DriveFile } from '../types';
import {
  Sparkles,
  ArrowRight,
  Cloud,
  FileText,
  ChevronRight,
  FolderClosed,
  Sprout,
  Wind,
  Heart
} from 'lucide-react';

// Import our beautiful cozy garden illustration generated for the hero section
import cozyGarden from '../assets/images/cozy_garden_illustration_1784084604317.jpg';

interface DashboardProps {
  user: FirebaseUser | null;
  accessToken: string | null;
  onNewSession: () => void;
  onOpenSession: (fileId: string) => void;
  onLogin: () => void;
  onOpenList: () => void;
  onOpenDetox: () => void; // New callback to open the Error Detox Garden
}

export default function Dashboard({
  user,
  accessToken,
  onNewSession,
  onOpenSession,
  onLogin,
  onOpenList,
  onOpenDetox
}: DashboardProps) {
  const [recentFiles, setRecentFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecent = async () => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const files = await listWorksheetFiles(accessToken);
        setRecentFiles(files.slice(0, 3)); // Show top 3 recent files
      } catch (err) {
        console.error('Failed to load recent files', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecent();
  }, [accessToken]);

  return (
    <div className="space-y-12 py-6 animate-fade-in" id="dashboard-container">
      {/* Botanical Hero Welcome Panel */}
      <div className="relative overflow-hidden bg-emerald-950 text-white rounded-3xl border border-emerald-900 shadow-md flex flex-col md:flex-row items-stretch" id="hero-banner">
        
        {/* Background garden image overlay on the right side */}
        <div className="absolute inset-0 md:left-1/2 opacity-25 md:opacity-40 mix-blend-lighten pointer-events-none">
          <img
            src={cozyGarden}
            alt="Cozy Garden Background"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Gradient fade to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950 to-transparent z-0"></div>

        <div className="p-8 sm:p-12 space-y-4 max-w-2xl relative z-10 flex-1 flex flex-col justify-center" id="hero-text">
          <div className="inline-flex items-center space-x-2 bg-emerald-900/60 border border-emerald-800/80 px-3 py-1 rounded-full text-3xs font-semibold font-mono tracking-wider text-emerald-100">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>SAGE GREEN BOTANICAL EDITION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight font-display">
            초록빛 페르소나 브레인스토밍 워크시트
          </h1>
          <p className="text-xs text-emerald-100/80 leading-relaxed font-medium">
            실내에서 긴 시간을 보내는 소프트웨어 엔지니어 분들의 시각적 편안함을 위해 디자인된 자연 친화적 공간입니다. TRIZ 모순 극복, SCAMPER, ERRC 기술 다이어트 프레임워크를 정원사가 식물을 가꾸듯 조화롭게 다듬고 설계해 보세요.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={onNewSession}
              className="flex items-center space-x-2 bg-white text-emerald-950 hover:bg-emerald-50 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>새 브레인스토밍 작성하기</span>
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </button>

            <button
              onClick={onOpenDetox}
              className="flex items-center space-x-2 bg-emerald-900 text-emerald-200 border border-emerald-800 hover:bg-emerald-850 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Wind className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>에러 디톡스 쉼터 가기 🍃</span>
            </button>
          </div>
        </div>

        {/* Floating badge for branding */}
        <div className="hidden md:flex relative z-10 shrink-0 w-48 bg-emerald-900/40 backdrop-blur-xs border-l border-emerald-850 items-center justify-center font-display text-4xl font-extrabold text-emerald-200 shadow-inner">
          <div className="text-center">
            <span className="block text-5s">SW</span>
            <span className="block text-4xs font-mono text-emerald-400 font-medium tracking-widest mt-1">GARDEN</span>
          </div>
        </div>
      </div>

      {/* Cloud Integration File List & Guide Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="dashboard-content-layout">
        
        {/* Left Column: Cloud Files & Heartwarming Detoxing banner */}
        <div className="lg:col-span-4 space-y-6" id="dashboard-cloud-pane">
          <div>
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-mono">내 클라우드 연동 상태</span>
          </div>

          {user ? (
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
              <div className="flex items-center space-x-3 border-b border-emerald-50 pb-3">
                <img
                  src={user.photoURL || ''}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full border border-emerald-50"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h4 className="text-2xs font-bold text-gray-900">{user.displayName}</h4>
                  <span className="text-[10px] text-gray-400 truncate block max-w-[180px]">{user.email}</span>
                </div>
              </div>

              {/* Recent Files List */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-3xs font-bold text-emerald-700 uppercase tracking-wider font-mono">최근 작성 워크시트</span>
                  <button
                    onClick={onOpenList}
                    className="text-3xs text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer"
                  >
                    전체 보기
                  </button>
                </div>

                {loading ? (
                  <div className="py-8 text-center text-3xs text-gray-400 font-mono">가져오는 중...</div>
                ) : recentFiles.length === 0 ? (
                  <div className="py-8 text-center text-3xs text-gray-400 border border-dashed border-emerald-100 rounded-xl space-y-1.5 bg-emerald-50/20">
                    <FolderClosed className="w-5 h-5 mx-auto text-emerald-300" />
                    <span>저장된 문서가 없습니다.</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {recentFiles.map((file) => {
                      const cleanName = file.name
                        .replace('Service_SW_Worksheet_', '')
                        .replace('.json', '')
                        .replace(/_/g, ' ');

                      return (
                        <button
                          key={file.id}
                          onClick={() => onOpenSession(file.id)}
                          className="w-full text-left p-2.5 rounded-xl border border-emerald-50 bg-white hover:border-emerald-100 flex items-center justify-between transition-all group cursor-pointer"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-3xs font-bold text-emerald-950 truncate group-hover:text-emerald-800">
                              {cleanName}
                            </span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-emerald-300 group-hover:text-emerald-600 transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-sm space-y-4">
              <p className="text-3xs text-emerald-800 leading-normal">
                Google 계정에 연동하시면 작업하시던 브레인스토밍 시트를 Google Drive 클라우드 전용 보안 영역에 직접 저장하고, 언제든 불러와서 자연이 가꾸어 주듯 이어서 안전하게 관리할 수 있습니다.
              </p>
              <button
                onClick={onLogin}
                className="w-full py-2.5 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-50 flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-3xs"
              >
                <Cloud className="w-4 h-4 text-emerald-600" />
                <span>Google Drive 연동하기</span>
              </button>
            </div>
          )}

          {/* Quick error detox CTA panel */}
          <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-3 shadow-3xs">
            <div className="flex items-center space-x-2 text-emerald-900">
              <Heart className="w-4 h-4 text-emerald-600 animate-pulse" />
              <h4 className="text-2xs font-bold">마음 환기가 필요하신가요?</h4>
            </div>
            <p className="text-3xs text-emerald-800/80 leading-relaxed font-medium">
              에러나 복잡한 버그 대처로 지쳐 있으시다면, 잠시 호흡 조절기와 자연의 소리를 통해 마음을 환기하고 가드너의 디버깅 치료법 조언을 가볍게 경험해 보세요.
            </p>
            <button
              onClick={onOpenDetox}
              className="text-3xs font-bold text-emerald-900 hover:text-emerald-950 flex items-center space-x-1.5 underline cursor-pointer"
            >
              <span>에러 디톡스 가든 들어가기</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Column: Three Methodologies Cards */}
        <div className="lg:col-span-8 space-y-4" id="dashboard-methods-pane">
          <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider font-mono">워크시트 핵심 프레임워크 3단계</span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="methods-cards-grid">
            {/* TRIZ */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-3xs flex flex-col justify-between hover:border-emerald-200 transition-all">
              <div className="space-y-2">
                <span className="text-4xs font-bold font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">STAGE 1</span>
                <h3 className="text-xs font-bold text-emerald-950 font-display">TRIZ 모순 극복</h3>
                <p className="text-3xs text-emerald-800/80 leading-relaxed font-medium">
                  서버 성능을 향상하려 하면 시스템 소모 예산이 오르는 등, 하나를 쥐면 하나를 놓치는 기술 상충 구조를 모순으로 정의한 뒤 4대 핵심 원리(분리, 선행, 셀프, 역발상)로 돌파합니다.
                </p>
              </div>
              <span className="text-[9px] text-emerald-600 font-mono block mt-4 border-t border-emerald-50 pt-2">대표 기법: 물리/기술 분할</span>
            </div>

            {/* SCAMPER */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-3xs flex flex-col justify-between hover:border-emerald-200 transition-all">
              <div className="space-y-2">
                <span className="text-4xs font-bold font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">STAGE 2</span>
                <h3 className="text-xs font-bold text-emerald-950 font-display">SCAMPER 다각도 변형</h3>
                <p className="text-3xs text-emerald-800/80 leading-relaxed font-medium">
                  기존 API 레이아웃이나 프록시 통신을 대체(S), 결합(C), 응용(A), 수정(M), 용도변경(P), 제거(E), 역발상(R)의 7대 질문 렌즈로 비틀어 혁신 아키텍처 시나리오를 구상합니다.
                </p>
              </div>
              <span className="text-[9px] text-emerald-600 font-mono block mt-4 border-t border-emerald-50 pt-2">대표 기법: 동기 대체, 결합 게이트웨이</span>
            </div>

            {/* ERRC */}
            <div className="bg-white p-5 rounded-2xl border border-emerald-100 shadow-3xs flex flex-col justify-between hover:border-emerald-200 transition-all">
              <div className="space-y-2">
                <span className="text-4xs font-bold font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">STAGE 3</span>
                <h3 className="text-xs font-bold text-emerald-950 font-display">ERRC 기술 다이어트</h3>
                <p className="text-3xs text-emerald-800/80 leading-relaxed font-medium">
                  블루오션 4대 질문(제거, 감소, 증가, 창조) 매트릭스를 시스템 레이어에 대입하여 과도한 병목과 수동 공수를 버리고, 신뢰성과 자동화 인프라를 대폭 창출합니다.
                </p>
              </div>
              <span className="text-[9px] text-emerald-600 font-mono block mt-4 border-t border-emerald-50 pt-2">대표 기법: 병목 레이어 버리기, 자가복구 창조</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
