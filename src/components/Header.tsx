import React from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { Cloud, CloudOff, FolderOpen, Save, LogOut, ChevronRight, HelpCircle, Sprout, Wind } from 'lucide-react';

interface HeaderProps {
  user: FirebaseUser | null;
  needsAuth: boolean;
  isLoggingIn: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onSave: () => void;
  onOpenList: () => void;
  isSaving: boolean;
  currentStep: number;
  setStep: (step: number) => void;
  hasUnsavedChanges: boolean;
  onShowGuide: () => void;
  sessionTitle: string;
}

export default function Header({
  user,
  needsAuth,
  isLoggingIn,
  onLogin,
  onLogout,
  onSave,
  onOpenList,
  isSaving,
  currentStep,
  setStep,
  hasUnsavedChanges,
  onShowGuide,
  sessionTitle,
}: HeaderProps) {
  const steps = [
    { num: 1, label: 'Pain Point' },
    { num: 2, label: 'TRIZ 모순' },
    { num: 3, label: 'SCAMPER' },
    { num: 4, label: 'ERRC' },
    { num: 5, label: '최종 정리' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-emerald-100/60 shadow-xs" id="header-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Branding */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setStep(0)} id="header-branding">
          <div className="w-9 h-9 rounded-xl bg-emerald-900 flex items-center justify-center text-emerald-100 font-display font-extrabold text-sm tracking-tighter">
            SW
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-emerald-950 tracking-tight font-display flex items-center space-x-1">
              <span>초록빛 워크시트</span>
              <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </h1>
            <p className="text-[10px] text-emerald-700/80 font-medium font-mono">Service SW & Detox Garden</p>
          </div>
        </div>

        {/* Header center link for Error Detox Garden */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setStep(0)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              currentStep === 0
                ? 'bg-emerald-50 text-emerald-950 border border-emerald-100'
                : 'text-emerald-800 hover:text-emerald-950'
            }`}
          >
            대시보드
          </button>

          <button
            onClick={() => setStep(6)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              currentStep === 6
                ? 'bg-emerald-900 text-white shadow-sm'
                : 'text-emerald-800 hover:text-emerald-950 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100/40'
            }`}
          >
            <Wind className="w-3.5 h-3.5 animate-pulse" />
            <span>에러 디톡스 쉼터 🍃</span>
          </button>
        </div>

        {/* Steps navigation (Hidden on dashboard/detox) */}
        {currentStep > 0 && currentStep <= 5 && (
          <nav className="hidden xl:flex items-center space-x-1" id="steps-nav">
            {steps.map((s, index) => {
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;

              return (
                <React.Fragment key={s.num}>
                  <button
                    onClick={() => setStep(s.num)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-950 shadow-3xs border border-emerald-100'
                        : isPast
                        ? 'text-emerald-700 hover:text-emerald-950'
                        : 'text-emerald-400 hover:text-emerald-600'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full mr-1.5 text-3xs border border-emerald-200 font-bold font-mono">
                      {isPast ? '✓' : s.num}
                    </span>
                    {s.label}
                  </button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-3 text-emerald-300" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        )}

        {/* Actions & Profile */}
        <div className="flex items-center space-x-3" id="header-actions">
          {/* Active Session Title */}
          {currentStep > 0 && currentStep <= 5 && (
            <div className="hidden lg:flex flex-col items-end pr-3 border-r border-emerald-100/60 text-right">
              <span className="text-3xs text-emerald-600 font-mono">편집 중인 워크시트</span>
              <span className="text-2xs font-bold text-emerald-950 max-w-[120px] truncate">{sessionTitle || '제목 없는 워크시트'}</span>
            </div>
          )}

          {/* Guide Button */}
          <button
            onClick={onShowGuide}
            className="p-1.5 rounded-full text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="기법 가이드 보기"
            id="guide-btn"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {user ? (
            <>
              {/* Load / Open from Drive */}
              <button
                onClick={onOpenList}
                className="flex items-center space-x-1 px-3 py-1.5 border border-emerald-100 rounded-lg text-xs text-emerald-900 font-medium hover:bg-emerald-50 transition-all cursor-pointer"
                title="Google Drive에서 가져오기"
                id="drive-open-btn"
              >
                <FolderOpen className="w-3.5 h-3.5 text-emerald-700" />
                <span className="hidden sm:inline">보관함</span>
              </button>

              {/* Save to Drive */}
              {currentStep > 0 && currentStep <= 5 && (
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    hasUnsavedChanges
                      ? 'bg-emerald-900 text-white hover:bg-emerald-950'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                  id="drive-save-btn"
                >
                  <Save className={`w-3.5 h-3.5 ${isSaving ? 'animate-spin' : ''}`} />
                  <span>{isSaving ? '저장 중...' : '저장'}</span>
                  {!isSaving && hasUnsavedChanges && (
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  )}
                </button>
              )}

              {/* User Avatar */}
              <div className="flex items-center space-x-2 pl-1 border-l border-emerald-100" id="user-profile-badge">
                <img
                  src={user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full ring-1 ring-emerald-100 shadow-3xs"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-3xs font-semibold text-emerald-950 truncate max-w-[80px]">{user.displayName || '사용자'}</span>
                  <span className="text-[8px] text-emerald-600 font-mono flex items-center">
                    <Cloud className="w-2 h-2 text-emerald-500 mr-0.5" /> Google Drive
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1 rounded-md text-emerald-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="로그아웃"
                  id="logout-btn"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center space-x-2 bg-emerald-900 hover:bg-emerald-950 text-white disabled:bg-emerald-300 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              id="header-login-btn"
            >
              <CloudOff className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? '연동 중...' : 'Drive 연동'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Line */}
      {currentStep > 0 && currentStep <= 5 && (
        <div className="w-full bg-emerald-50 h-0.5" id="step-progress-bar">
          <div
            className="bg-emerald-800 h-0.5 transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
      )}
    </header>
  );
}
