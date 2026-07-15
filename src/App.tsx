import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { initAuth, googleSignIn, logout } from './firebase';

// Subcomponents
import DetoxLandingPage from './components/DetoxLandingPage';
import { Sprout, LogOut, Cloud, HelpCircle, Heart } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  // Initialize Firebase Auth for Google cloud account synchronization if wanted
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Google login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('정원 쉼터에서 로그아웃 하시겠습니까?')) return;
    try {
      await logout();
      setUser(null);
      setNeedsAuth(true);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans antialiased text-emerald-950 transition-colors duration-300" id="app-root">
      
      {/* Exquisite Minimalist Designer Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100/40 shadow-2xs" id="header-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo / Brand */}
          <div className="flex items-center space-x-3" id="header-branding">
            <div className="w-9 h-9 rounded-2xl bg-emerald-900 flex items-center justify-center text-emerald-50 font-display font-extrabold text-sm shadow-sm">
              G
            </div>
            <div>
              <h1 className="text-xs font-bold text-emerald-950 tracking-tight font-display flex items-center space-x-1">
                <span>초록빛 에러 디톡스 가든</span>
                <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </h1>
              <p className="text-[9px] text-emerald-700/80 font-semibold font-mono uppercase tracking-wider">SW Mindful Detox Shelter</p>
            </div>
          </div>

          {/* Slogans / Heartfelt center indicator */}
          <div className="hidden md:flex items-center space-x-1 text-3xs font-semibold text-emerald-800/80 font-mono uppercase bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100/30">
            <Heart className="w-3 h-3 text-emerald-600 animate-pulse mr-0.5" />
            <span>지친 컴파일러들의 평온한 안식처</span>
          </div>

          {/* Authentication Actions */}
          <div className="flex items-center space-x-3" id="header-actions">
            {user ? (
              <div className="flex items-center space-x-3" id="user-profile">
                <div className="flex items-center space-x-2 bg-white/40 border border-emerald-100/50 py-1 pl-1 pr-2.5 rounded-full shadow-3xs">
                  <img
                    src={user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                    alt="User photo"
                    className="w-6 h-6 rounded-full border border-emerald-50"
                    referrerPolicy="no-referrer"
                  />
                  <span className="text-[10px] font-bold text-emerald-950 max-w-[80px] truncate">{user.displayName || '가드너'}</span>
                </div>

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl text-emerald-600 hover:text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer"
                  title="정원 로그아웃"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="inline-flex items-center space-x-1.5 bg-emerald-900 text-white hover:bg-emerald-950 disabled:bg-emerald-300 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Cloud className="w-3.5 h-3.5 text-emerald-200" />
                <span>{isLoggingIn ? '연동 중...' : '구글 드라이브 연동'}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Landing Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        <DetoxLandingPage
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-emerald-100/40 py-8 bg-white/20 text-center space-y-2" id="app-footer">
        <div className="inline-flex items-center space-x-1 text-emerald-800">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[10px] font-bold font-mono tracking-widest uppercase">The Green Error Detox Garden</span>
        </div>
        <p className="text-[10px] text-emerald-700/60 font-semibold max-w-md mx-auto leading-relaxed">
          이 공간은 모니터의 유해한 빛과 에러 로그로부터 당신의 정신건강을 지키기 위해 디자인되었습니다. 편안한 자연 음향 합성 소리와 깊은 호흡을 즐겨보세요.
        </p>
      </footer>

    </div>
  );
}
