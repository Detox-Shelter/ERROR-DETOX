import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { initAuth, googleSignIn, logout, completeRedirectSignIn, describeAuthError } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// Subcomponents
import DetoxLandingPage from './components/DetoxLandingPage';
import AvatarModal from './components/AvatarModal';
import GuideModal from './components/GuideModal';
import { Sprout, LogOut, Cloud, HelpCircle, Heart, Edit, Check, X, Camera, Sun, Moon, BookOpen, AlertTriangle } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authError, setAuthError] = useState<string>('');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Custom User Profile states
  const [profileName, setProfileName] = useState<string>('');
  const [gardenerTitle, setGardenerTitle] = useState<string>('초보 가드너 🌱');
  const [profilePhoto, setProfilePhoto] = useState<string>('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [editNameInput, setEditNameInput] = useState('');
  const [editTitleInput, setEditTitleInput] = useState('초보 가드너 🌱');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [joinDate, setJoinDate] = useState<string>('');

  // Simple Theme Toggle: 'day' (Daytime Garden) or 'night' (Night Garden)
  const [theme, setTheme] = useState<'day' | 'night'>(() => {
    return (localStorage.getItem('garden-theme') as 'day' | 'night') || 'day';
  });

  useEffect(() => {
    const root = document.getElementById('app-root');
    if (root) {
      if (theme === 'night') {
        root.classList.add('theme-night');
        document.documentElement.classList.add('dark');
      } else {
        root.classList.remove('theme-night');
        document.documentElement.classList.remove('dark');
      }
    }
    localStorage.setItem('garden-theme', theme);
  }, [theme]);

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

  // 팝업이 막혀 리디렉션으로 로그인한 경우, 돌아온 뒤 결과를 받아 처리한다.
  useEffect(() => {
    completeRedirectSignIn()
      .then((outcome) => {
        if (outcome.status === 'signed-in') {
          setUser(outcome.user);
          setNeedsAuth(false);
          setAuthError('');
        } else if (outcome.status === 'aborted') {
          setAuthError('로그인 절차가 끝나기 전에 되돌아왔습니다. Google 계정 선택을 완료해 주세요.');
        }
      })
      .catch((err) => {
        console.error('Redirect login failed:', err);
        setAuthError(describeAuthError(err));
      });
  }, []);

  // Sync custom user profile on login or auth change
  useEffect(() => {
    if (user) {
      setProfileName(user.displayName || '가드너');
      setEditNameInput(user.displayName || '가드너');
      setGardenerTitle('초보 가드너 🌱');
      setEditTitleInput('초보 가드너 🌱');
      setProfilePhoto(user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80');

      const loadProfile = async () => {
        try {
          const docRef = doc(db, 'user_profiles', user.uid);
          const docSnap = await getDoc(docRef);
          let createdDateVal = '';

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.displayName) {
              setProfileName(data.displayName);
              setEditNameInput(data.displayName);
            }
            if (data.gardenerTitle) {
              setGardenerTitle(data.gardenerTitle);
              setEditTitleInput(data.gardenerTitle);
            }
            if (data.photoURL) {
              setProfilePhoto(data.photoURL);
            }
            if (data.createdAt) {
              createdDateVal = data.createdAt;
            } else {
              const rawCreationTime = user.metadata.creationTime || new Date().toISOString();
              createdDateVal = new Date(rawCreationTime).toISOString();
              await setDoc(docRef, { createdAt: createdDateVal }, { merge: true });
            }
          } else {
            const rawCreationTime = user.metadata.creationTime || new Date().toISOString();
            createdDateVal = new Date(rawCreationTime).toISOString();
            await setDoc(docRef, {
              uid: user.uid,
              displayName: user.displayName || '가드너',
              gardenerTitle: '초보 가드너 🌱',
              photoURL: user.photoURL || '',
              createdAt: createdDateVal,
              updatedAt: new Date().toISOString()
            });
          }
          setJoinDate(createdDateVal);
        } catch (err) {
          console.error('Error loading user profile:', err);
          const rawCreationTime = user.metadata.creationTime || new Date().toISOString();
          setJoinDate(new Date(rawCreationTime).toISOString());
        }
      };
      loadProfile();
    } else {
      setProfileName('');
      setGardenerTitle('초보 가드너 🌱');
      setProfilePhoto('');
      setJoinDate('');
    }
  }, [user]);

  const handleUpdateProfilePhoto = async (newPhotoUrl: string) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'user_profiles', user.uid);
      await setDoc(docRef, {
        photoURL: newPhotoUrl,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      setProfilePhoto(newPhotoUrl);
    } catch (err) {
      console.error('Error updating profile photo:', err);
      throw err;
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const docRef = doc(db, 'user_profiles', user.uid);
      await setDoc(docRef, {
        uid: user.uid,
        displayName: editNameInput.trim() || user.displayName || '가드너',
        gardenerTitle: editTitleInput.trim() || '초보 가드너 🌱',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setProfileName(editNameInput.trim() || user.displayName || '가드너');
      setGardenerTitle(editTitleInput.trim() || '초보 가드너 🌱');
      setIsEditingProfile(false);
    } catch (err) {
      console.error('Error saving user profile:', err);
      alert('프로필 저장에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Google login failed:', err);
      setAuthError(describeAuthError(err));
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
      setAuthError('');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return '첫 경작 기록을 불러오는 중...';
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}년 ${month}월 ${day}일 첫 경작 시작 🧑‍🌾`;
    } catch {
      return '초록빛 안식처의 가드너';
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
                <span>개발자 마음 쉼터 : 에러 정원</span>
                <Sprout className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </h1>
              <p className="text-[9px] text-emerald-700/80 font-semibold font-mono uppercase tracking-wider">방구석 개발자를 위한 마음 쉼터</p>
            </div>
          </div>

          {/* Slogans / Heartfelt center indicator */}
          <div className="hidden md:flex items-center space-x-1 text-3xs font-semibold text-emerald-800/80 font-mono uppercase bg-emerald-50/50 px-3 py-1 rounded-full border border-emerald-100/30">
            <Heart className="w-3 h-3 text-emerald-600 animate-pulse mr-0.5" />
            <span>밤새우는 방구석 개발자의 따뜻한 안식처</span>
          </div>

          {/* Authentication Actions */}
          <div className="flex items-center space-x-3" id="header-actions">
            {/* Newbie Guide Shortcut Button */}
            <button
              onClick={() => setIsGuideOpen(true)}
              className="p-1.5 rounded-xl text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50/50 border border-emerald-100/30 transition-all cursor-pointer flex items-center justify-center shadow-3xs"
              title="초보 가드너 가이드 보기"
              id="newbie-guide-header-btn"
            >
              <div className="flex items-center space-x-1.5 text-[10px] font-extrabold text-emerald-850">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="hidden xs:inline">🌱 초보 가이드</span>
              </div>
            </button>

            {/* Daytime / Night Garden Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'day' ? 'night' : 'day')}
              className="p-1.5 rounded-xl text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50/50 border border-emerald-100/30 transition-all cursor-pointer flex items-center justify-center shadow-3xs"
              title={theme === 'day' ? '밤의 정원 보기 (다크 모드)' : '낮의 정원 보기 (라이트 모드)'}
              id="theme-toggle-btn"
            >
              {theme === 'day' ? (
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-emerald-800">
                  <Moon className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="hidden sm:inline">밤 정원</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-[10px] font-bold text-amber-700">
                  <Sun className="w-3.5 h-3.5 text-amber-500 animate-[spin_12s_linear_infinite]" />
                  <span className="hidden sm:inline">낮 정원</span>
                </div>
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 relative" id="user-profile">
                {isEditingProfile ? (
                  <div className="flex items-center space-x-2 bg-white border border-emerald-200/80 p-2 rounded-2xl shadow-sm z-50 animate-fade-in">
                    <div className="flex flex-col space-y-1">
                      <input
                        type="text"
                        value={editNameInput}
                        onChange={(e) => setEditNameInput(e.target.value)}
                        placeholder="가드너 이름"
                        className="px-2 py-1 text-[10px] font-bold border border-emerald-100 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-emerald-50/20 w-24"
                        maxLength={20}
                        id="profile-name-input"
                      />
                      <select
                        value={editTitleInput}
                        onChange={(e) => setEditTitleInput(e.target.value)}
                        className="px-2 py-1 text-[9px] font-semibold border border-emerald-100 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-emerald-50/20 text-emerald-800 w-24"
                        id="profile-title-select"
                      >
                        <option value="초보 가드너 🌱">초보 가드너 🌱</option>
                        <option value="새싹 정원사 🌿">새싹 정원사 🌿</option>
                        <option value="에러 청소부 🧹">에러 청소부 🧹</option>
                        <option value="코딩 연금술사 🧪">코딩 연금술사 🧪</option>
                        <option value="버그 마스터 👑">버그 마스터 👑</option>
                        <option value="수석 가드너 🌸">수석 가드너 🌸</option>
                        <option value="프로 해커 💻">프로 해커 💻</option>
                      </select>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="p-1 bg-emerald-900 text-white hover:bg-emerald-950 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                        title="저장"
                        id="profile-save-btn"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditNameInput(profileName);
                          setEditTitleInput(gardenerTitle);
                          setIsEditingProfile(false);
                        }}
                        className="p-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                        title="취소"
                        id="profile-cancel-btn"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="group relative flex items-center space-x-2 bg-white/60 hover:bg-white border border-emerald-100/50 hover:border-emerald-200 py-1 pl-1 pr-2.5 rounded-full shadow-3xs hover:shadow-2xs transition-all cursor-pointer"
                    onClick={() => setIsEditingProfile(true)}
                    title="프로필 이름/칭호 변경하려면 클릭"
                  >
                    <div 
                      className="relative group/avatar w-7 h-7 rounded-full overflow-hidden shrink-0 border border-emerald-50 shadow-4xs"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent opening name edit
                        setIsAvatarModalOpen(true);
                      }}
                      title="클릭하여 프로필 이미지 촬영 또는 변경"
                    >
                      <img
                        src={profilePhoto || user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                        alt="User photo"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-emerald-950/60 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <Camera className="w-3.5 h-3.5 text-emerald-100" />
                      </div>
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-bold text-emerald-950 truncate max-w-[80px]">{profileName}</span>
                        <Edit className="w-2.5 h-2.5 text-emerald-700/40 group-hover:text-emerald-700 transition-colors shrink-0" />
                      </div>
                      <span className="text-[8px] font-bold text-emerald-700 font-mono tracking-wide bg-emerald-500/10 px-1 py-0.25 rounded-md mt-0.5 inline-block whitespace-nowrap">
                        {gardenerTitle}
                      </span>
                    </div>

                    {/* Quick Edit Gardener Title Overlay on Hover */}
                    <div 
                      className="absolute inset-0 bg-[#FAF9F5]/98 dark:bg-[#0A1613]/98 rounded-full px-2 flex items-center justify-between opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-20"
                      onClick={(e) => e.stopPropagation()}
                      title="정원사 칭호 빠른 변경"
                    >
                      <span className="text-[8px] font-bold text-emerald-900 dark:text-emerald-400 whitespace-nowrap ml-1 shrink-0">빠른 칭호:</span>
                      <select
                        value={gardenerTitle}
                        onChange={async (e) => {
                          const newTitle = e.target.value;
                          setGardenerTitle(newTitle);
                          setEditTitleInput(newTitle);
                          if (user) {
                            try {
                              const docRef = doc(db, 'user_profiles', user.uid);
                              await setDoc(docRef, {
                                gardenerTitle: newTitle,
                                updatedAt: new Date().toISOString()
                              }, { merge: true });
                            } catch (err) {
                              console.error('Error auto-saving gardener title:', err);
                            }
                          }
                        }}
                        className="px-1.5 py-0.5 text-[8px] font-bold text-emerald-800 dark:text-emerald-100 bg-white dark:bg-[#122A25] border border-emerald-200 dark:border-emerald-800/80 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer w-[110px] shadow-4xs"
                      >
                        <option value="초보 가드너 🌱" className="bg-white dark:bg-[#0A1613] text-emerald-950 dark:text-emerald-50">초보 가드너 🌱</option>
                        <option value="새싹 정원사 🌿" className="bg-white dark:bg-[#0A1613] text-emerald-950 dark:text-emerald-50">새싹 정원사 🌿</option>
                        <option value="에러 청소부 🧹" className="bg-white dark:bg-[#0A1613] text-emerald-950 dark:text-emerald-50">에러 청소부 🧹</option>
                        <option value="코딩 연금술사 🧪" className="bg-white dark:bg-[#0A1613] text-emerald-950 dark:text-emerald-50">코딩 연금술사 🧪</option>
                        <option value="버그 마스터 👑" className="bg-white dark:bg-[#0A1613] text-emerald-950 dark:text-emerald-50">버그 마스터 👑</option>
                        <option value="수석 가드너 🌸" className="bg-white dark:bg-[#0A1613] text-emerald-950 dark:text-emerald-50">수석 가드너 🌸</option>
                        <option value="프로 해커 💻" className="bg-white dark:bg-[#0A1613] text-emerald-950 dark:text-emerald-50">프로 해커 💻</option>
                      </select>
                    </div>

                    {/* Exquisite Personal Hover Tooltip */}
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-emerald-150 p-3.5 rounded-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right z-100 space-y-2.5 text-left shadow-md">
                      <div className="flex items-center space-x-2 border-b border-emerald-100/50 pb-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span className="text-[9.5px] font-bold text-emerald-950">정원사 프로필 요약</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-3xs">
                          <span className="text-gray-500 font-medium">가드너 성함</span>
                          <span className="font-extrabold text-emerald-950">{profileName}</span>
                        </div>
                        <div className="flex items-center justify-between text-3xs">
                          <span className="text-gray-500 font-medium">활동 칭호</span>
                          <span className="font-bold text-emerald-800 bg-emerald-500/10 px-1 py-0.25 rounded-sm">{gardenerTitle}</span>
                        </div>
                        <div className="flex flex-col text-3xs pt-1.5 border-t border-emerald-50/60">
                          <span className="text-gray-500 font-medium mb-1">초록빛 안식처 입성일</span>
                          <span className="font-mono font-bold text-emerald-900 text-[10px] bg-emerald-50/80 border border-emerald-100/40 py-1 rounded-md text-center block">
                            {formatJoinDate(joinDate)}
                          </span>
                        </div>
                      </div>
                      <p className="text-[7.5px] text-gray-500 leading-normal text-center italic border-t border-emerald-50/40 pt-1.5">
                        "오늘도 고생 많았어요, 함께 힘내요! 🌱"
                      </p>
                    </div>
                  </div>
                )}

                <AvatarModal
                  isOpen={isAvatarModalOpen}
                  onClose={() => setIsAvatarModalOpen(false)}
                  currentPhotoURL={profilePhoto || user.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                  onSave={handleUpdateProfilePhoto}
                />

                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl text-emerald-600 hover:text-red-600 hover:bg-red-50/50 transition-colors cursor-pointer shrink-0"
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
                <span>{isLoggingIn ? '연결 중...' : 'Google Drive 연결'}</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Drive 연결 실패 안내 : 원인을 화면에서 바로 확인할 수 있게 노출한다 */}
      {authError && (
        <div className="bg-amber-50 border-b border-amber-200" id="auth-error-banner" role="alert">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="flex-1 text-[11px] leading-relaxed text-amber-900 font-medium break-words">
              {authError}
            </p>
            <button
              onClick={() => setAuthError('')}
              className="p-1 rounded-lg text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer shrink-0"
              title="안내 닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Landing Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8" id="main-content">
        <DetoxLandingPage
          user={user}
          onLogin={handleLogin}
          onLogout={handleLogout}
          customDisplayName={profileName}
          customGardenerTitle={gardenerTitle}
          customPhotoURL={profilePhoto}
        />
      </main>

      {/* Elegant minimalist footer */}
      <footer className="border-t border-emerald-100/40 py-8 bg-white/20 text-center space-y-2" id="app-footer">
        <div className="inline-flex items-center space-x-1 text-emerald-800">
          <Sprout className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[10px] font-bold font-mono tracking-widest uppercase">The Error Detox Garden for Indie Devs</span>
        </div>
        <p className="text-[10px] text-emerald-700/60 font-semibold max-w-md mx-auto leading-relaxed">
          방구석 모니터 불빛 아래 홀로 밤을 지새우는 개발자분들을 위해 만들었습니다. 지친 에러에서 잠시 눈을 떼고, 자연의 소리와 함께 마음을 쉬어가세요.
        </p>
      </footer>

      {isGuideOpen && (
        <GuideModal onClose={() => setIsGuideOpen(false)} />
      )}

    </div>
  );
}
