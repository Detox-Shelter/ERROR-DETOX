import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  Sparkles, 
  Search, 
  Heart, 
  Droplets, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle,
  Users,
  Bookmark,
  Share2,
  Pin,
  RefreshCw,
  Info,
  CheckCircle,
  Zap,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, increment, query, orderBy } from 'firebase/firestore';
import RemedyMarkdown, { countRemedyBlocks } from './RemedyMarkdown';

interface SharedPost {
  id: string;
  timestamp: string;
  nickname: string;
  gardenerTitle?: string;
  photoURL?: string;
  errorLog: string;
  frustration: string;
  errorType: 'delay' | 'network' | 'memory' | 'legacy' | 'other';
  plantType: 'eucalyptus' | 'bamboo' | 'monstera' | 'ivy' | 'recommend';
  remedy: string;
  cheers: number;
}

interface CommunitySquareProps {
  currentUser?: any;
  customDisplayName?: string;
  customGardenerTitle?: string;
  customPhotoURL?: string;
}

const CATEGORY_META = {
  delay: { label: '시간 지연 & 로딩', color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-700', plant: '유칼립투스 🌿' },
  network: { label: '서버 & 연결 장애', color: '#0ea5e9', bgClass: 'bg-sky-500', textClass: 'text-sky-700', plant: '대나무 🎋' },
  memory: { label: '메모리 & 용량 부족', color: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-700', plant: '몬스테라 🪴' },
  legacy: { label: '레거시 & 스파게티', color: '#047857', bgClass: 'bg-emerald-800', textClass: 'text-emerald-900', plant: '아이비 🍀' },
  other: { label: '기타 시스템 버그', color: '#6366f1', bgClass: 'bg-indigo-500', textClass: 'text-indigo-700', plant: '추천 씨앗 ✨' },
};

const NOTE_ROTATIONS = ['rotate-[0.5deg]', 'rotate-[-0.8deg]', 'rotate-[1.2deg]', 'rotate-[-1.1deg]', 'rotate-[0.7deg]', 'rotate-[-0.6deg]'];
const NOTE_BACKGROUNDS = [
  'bg-amber-50/95 border-amber-200/60 shadow-[3px_5px_10px_rgba(217,119,6,0.06)]', // Warm Yellow-beige
  'bg-sky-50/95 border-sky-200/60 shadow-[3px_5px_10px_rgba(14,165,233,0.06)]', // Sky Blue
  'bg-rose-50/95 border-rose-200/60 shadow-[3px_5px_10px_rgba(244,63,94,0.06)]', // Soft Pink
  'bg-emerald-50/95 border-emerald-200/60 shadow-[3px_5px_10px_rgba(16,185,129,0.06)]', // Mint Green
];

export default function CommunitySquare({
  currentUser,
  customDisplayName,
  customGardenerTitle,
  customPhotoURL
}: CommunitySquareProps = {}) {
  const [posts, setPosts] = useState<SharedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [isFirestoreActive, setIsFirestoreActive] = useState(false);
  const [cheerEffectId, setCheerEffectId] = useState<string | null>(null);

  // Fetch posts from Firestore (with server API backup fallback)
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Attempt Firestore Retrieval first
      try {
        console.log("Attempting to load community posts from Cloud Firestore...");
        const postsCol = collection(db, 'community_posts');
        const q = query(postsCol, orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const firestorePosts: SharedPost[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          firestorePosts.push({
            id: docSnap.id,
            timestamp: data.timestamp || new Date().toISOString(),
            nickname: data.nickname || '익명의가드너',
            gardenerTitle: data.gardenerTitle || '초보 가드너 🌱',
            photoURL: data.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
            errorLog: data.errorLog || '',
            frustration: data.frustration || '',
            errorType: data.errorType || 'other',
            plantType: data.plantType || 'recommend',
            remedy: data.remedy || '',
            cheers: data.cheers || 0
          });
        });

        // Firestore succeeded! Set active.
        setIsFirestoreActive(true);

        if (firestorePosts.length > 0) {
          setPosts(firestorePosts);
          console.log(`Successfully fetched ${firestorePosts.length} posts from Firestore.`);
          return;
        } else {
          console.log("Firestore fetched successfully, but collection is currently empty. Loading seed data from local service...");
          const res = await fetch('/api/community');
          if (res.ok) {
            const data = await res.json();
            setPosts(data);
          }
          return;
        }
      } catch (firestoreError: any) {
        console.warn("Firestore fetch error. Falling back to local Express service:", firestoreError);
        setIsFirestoreActive(false);
      }

      // 2. Fallback local backend API (Only if Firestore failed completely)
      const res = await fetch('/api/community');
      if (!res.ok) throw new Error('광장 데이터를 가져오는 중 실패했습니다.');
      const data = await res.json();
      setPosts(data);
    } catch (err: any) {
      console.error("Community fetch error:", err);
      setError(err.message || '네트워크 연결 상태를 확인해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle cheer with Firestore real-time write (optimistic ui update)
  const handleCheer = async (postId: string) => {
    try {
      // Local optimistic update
      setPosts(prev => 
        prev.map(p => p.id === postId ? { ...p, cheers: (p.cheers || 0) + 1 } : p)
      );
      
      // Trigger short visual bubble animation
      setCheerEffectId(postId);
      setTimeout(() => setCheerEffectId(null), 1200);

      if (isFirestoreActive) {
        try {
          const postDocRef = doc(db, 'community_posts', postId);
          await updateDoc(postDocRef, {
            cheers: increment(1)
          });
          return;
        } catch (firestoreError) {
          console.warn("Firestore cheer update failed, attempting backup api update:", firestoreError);
        }
      }

      // API fallback
      const res = await fetch(`/api/community/${postId}/cheer`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('응원 처리에 실패했습니다.');
      const updated = await res.json();
      
      // Sync exact cheers count
      setPosts(prev => 
        prev.map(p => p.id === postId ? { ...p, cheers: updated.cheers } : p)
      );
    } catch (err) {
      console.error("Failed to cheer:", err);
    }
  };

  // Filter & Search computation
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const combinedText = (post.nickname + ' ' + post.errorLog + ' ' + post.frustration).toLowerCase();
      const matchesSearch = combinedText.includes(searchTerm.toLowerCase());
      const matchesFilter = selectedFilter === 'all' || post.plantType === selectedFilter || post.errorType === selectedFilter;
      return matchesSearch && matchesFilter;
    });
  }, [posts, searchTerm, selectedFilter]);

  // Total statistic metrics
  const totalCheersCount = useMemo(() => {
    return posts.reduce((sum, p) => sum + (p.cheers || 0), 0);
  }, [posts]);

  // Nice readable relative time
  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return '방금 전';
      if (diffMins < 60) return `${diffMins}분 전`;
      if (diffHours < 24) return `${diffHours}시간 전`;
      if (diffDays < 7) return `${diffDays}일 전`;
      return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    } catch {
      return '과거 어느 날';
    }
  };

  return (
    <div className="space-y-8" id="community-garden-square-container">
      
      {/* Community Banner / Header with Ambient Card layout */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-850 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-emerald-800">
        <div className="absolute right-0 bottom-0 w-80 h-80 bg-radial from-emerald-500/20 to-transparent rounded-full pointer-events-none" />
        <div className="absolute left-1/3 top-0 w-48 h-48 bg-radial from-teal-400/10 to-transparent rounded-full pointer-events-none" />

        <div className="max-w-3xl space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-1.5 bg-white/10 px-3 py-1 rounded-full text-3xs font-bold tracking-wider uppercase backdrop-blur-3xs">
              <Users className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span>Community Purification Square</span>
            </div>
            
            {/* Real-time DB Status Badge */}
            {isFirestoreActive ? (
              <span className="inline-flex items-center space-x-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-4xs font-extrabold shadow-sm animate-pulse">
                <Globe className="w-2.5 h-2.5 text-emerald-400" />
                <span>Firestore Cloud Sync Active 🟢</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-4xs font-extrabold">
                <Zap className="w-2.5 h-2.5 text-amber-400 animate-bounce" />
                <span>Secure Local Server Active 🟡</span>
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold font-display leading-tight tracking-tight">
            방구석 개발자들의 에러 나눔 광장 🌸
          </h2>
          
          <p className="text-3xs text-emerald-100/90 leading-relaxed max-w-2xl font-medium">
            방구석에서 외롭게 디버깅 중인 개발자들이 마주했던 에러와, 이를 극복해낸 따뜻한 처방전을 서로 공유하는 공간입니다. 
            동료들의 에러 해결 일지를 둘러보고, 따뜻한 <strong className="text-emerald-300">응원의 물줄기</strong>를 건네보세요!
          </p>

          {/* Real-time communal statistics indicators */}
          <div className="flex flex-wrap gap-4 pt-3 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-300 font-mono text-base font-extrabold">{posts.length}</span>
              <span className="text-4xs text-emerald-100/70 font-semibold">공유된 마음 처방전</span>
            </div>
            <div className="w-px h-4 bg-white/10 align-middle self-center hidden sm:block" />
            <div className="flex items-center space-x-2">
              <span className="text-teal-300 font-mono text-base font-extrabold">{totalCheersCount}</span>
              <span className="text-4xs text-emerald-100/70 font-semibold">전달된 따뜻한 응원 🚿</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control panel: Search and Filter Tabs */}
      <div className="bg-white border border-emerald-100/80 rounded-2xl p-4 sm:p-5 shadow-3xs flex flex-col md:flex-row gap-4 items-center justify-between animate-fade-in" id="community-filter-panel">
        {/* Search Bar Input */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="w-4 h-4 text-emerald-700/50" />
          </span>
          <input
            type="text"
            placeholder="닉네임, 에러 내용, 처방 지혜 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-emerald-50/20 hover:bg-emerald-50/40 focus:bg-white text-3xs border border-emerald-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-emerald-950 placeholder:text-emerald-700/40 font-medium transition-colors"
          />
        </div>

        {/* Filter categories tabs */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0" id="community-tab-filters">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-4xs font-extrabold transition-all cursor-pointer border ${
              selectedFilter === 'all'
                ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                : 'bg-emerald-50/40 text-emerald-800 border-emerald-100 hover:bg-emerald-50'
            }`}
          >
            전체 광장 보기
          </button>
          
          <button
            onClick={() => setSelectedFilter('eucalyptus')}
            className={`px-3 py-1.5 rounded-xl text-4xs font-extrabold transition-all cursor-pointer border ${
              selectedFilter === 'eucalyptus'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white text-emerald-700 border-emerald-100 hover:bg-emerald-50/40'
            }`}
          >
            유칼립투스 🌿
          </button>

          <button
            onClick={() => setSelectedFilter('bamboo')}
            className={`px-3 py-1.5 rounded-xl text-4xs font-extrabold transition-all cursor-pointer border ${
              selectedFilter === 'bamboo'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-sky-700 border-sky-100 hover:bg-sky-50/40'
            }`}
          >
            대나무 🎋
          </button>

          <button
            onClick={() => setSelectedFilter('monstera')}
            className={`px-3 py-1.5 rounded-xl text-4xs font-extrabold transition-all cursor-pointer border ${
              selectedFilter === 'monstera'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-amber-700 border-amber-100 hover:bg-amber-50/40'
            }`}
          >
            몬스테라 🪴
          </button>

          <button
            onClick={() => setSelectedFilter('ivy')}
            className={`px-3 py-1.5 rounded-xl text-4xs font-extrabold transition-all cursor-pointer border ${
              selectedFilter === 'ivy'
                ? 'bg-emerald-900 text-white border-emerald-900'
                : 'bg-white text-emerald-850 border-emerald-100 hover:bg-emerald-50/40'
            }`}
          >
            아이비 🍀
          </button>
        </div>
      </div>

      {/* Communal Bulletin Board Container */}
      <div className="bg-[#FAF6EE] border-8 border-[#8D7660] rounded-[32px] p-6 sm:p-8 shadow-[inset_0_4px_12px_rgba(0,0,0,0.15),0_10px_25px_-5px_rgba(109,79,48,0.25)] relative overflow-hidden">
        {/* Corkboard texture accents */}
        <div className="absolute inset-0 bg-radial from-[#F1E4CE] to-[#E2D2B5] opacity-20 pointer-events-none" />
        <div className="absolute top-3 left-6 text-3xs text-[#8D7660] font-extrabold tracking-widest uppercase flex items-center space-x-1.5">
          <Pin className="w-3.5 h-3.5 rotate-45 text-[#9E3E3E]" />
          <span>COMMUNAL GARDEN BULLETIN BOARD</span>
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-4 relative z-10">
            <div className="w-10 h-10 border-4 border-emerald-700 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-3xs text-emerald-900/60 font-semibold">개발자들의 처방전을 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50/90 border border-red-200 p-8 rounded-2xl text-center space-y-3 relative z-10 max-w-md mx-auto">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto animate-bounce" />
            <h4 className="text-xs font-bold text-red-950">보드를 가져올 수 없습니다</h4>
            <p className="text-3xs text-red-800/80 leading-relaxed">{error}</p>
            <button 
              onClick={fetchPosts}
              className="px-4 py-2 bg-white border border-red-200 text-red-800 text-4xs font-bold rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
            >
              다시 시도하기 🔄
            </button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-3xs border border-amber-200/50 p-12 rounded-2xl text-center space-y-3 relative z-10 max-w-md mx-auto mt-6">
            <Sprout className="w-10 h-10 text-emerald-600/40 mx-auto animate-bounce" />
            <h4 className="text-xs font-bold text-amber-950">아직 공유된 처방전이 없습니다</h4>
            <p className="text-3xs text-emerald-800/60 leading-relaxed">
              가장 먼저 에러를 털어내고 나만의 마음 처방전을 커뮤니티에 공유해 보세요! 💚
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 relative z-10" id="community-posts-grid">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, idx) => {
                const meta = CATEGORY_META[post.errorType] || CATEGORY_META.other;
                const isExpanded = expandedPostId === post.id;
                const isEffecting = cheerEffectId === post.id;
                
                // Deterministic styling to prevent re-render flickers
                const rotation = NOTE_ROTATIONS[idx % NOTE_ROTATIONS.length];
                const bgStyle = NOTE_BACKGROUNDS[idx % NOTE_BACKGROUNDS.length];

                return (
                  <motion.div
                    layout
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                    className={`relative p-5 pt-7 border border-neutral-300/40 hover:border-emerald-300 hover:shadow-md hover:scale-[1.01] hover:rotate-0 transition-all duration-300 rounded-[4px] ${rotation} ${bgStyle} flex flex-col justify-between`}
                  >
                    {/* Retro Pushpin Pin Effect */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#B53E3E] rounded-full shadow-sm z-20 border border-[#9E2E2E]">
                      <div className="w-1.5 h-1.5 bg-white/70 rounded-full absolute top-0.5 left-0.5" />
                      <div className="w-0.5 h-3.5 bg-neutral-500 absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-85" />
                    </div>

                    <div className="space-y-4">
                      {/* Note Header: User details */}
                      <div className="flex items-start justify-between border-b border-amber-900/10 pb-2.5">
                        <div className="flex items-center space-x-2 max-w-[70%]">
                          <img
                            src={post.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'}
                            alt={`${post.nickname}'s avatar`}
                            className="w-7 h-7 rounded-full border border-emerald-950/10 object-cover shadow-3xs shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-1 flex-wrap gap-y-0.5">
                              <span className="font-extrabold text-emerald-950 text-2xs truncate max-w-[80px]">{post.nickname}</span>
                              <span className="text-4xs font-bold text-emerald-800 font-mono tracking-wide bg-emerald-500/10 px-1 py-0.25 rounded-sm whitespace-nowrap">
                                {post.gardenerTitle || '초보 가드너 🌱'}
                              </span>
                            </div>
                            <span className="text-4xs text-gray-500 font-mono flex items-center gap-1 font-semibold">
                              <Calendar className="w-3 h-3 text-emerald-800" />
                              {formatTimeAgo(post.timestamp)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end space-y-1">
                          <span className={`px-1.5 py-0.5 rounded text-4xs font-extrabold font-mono text-white ${meta.bgClass} shadow-3xs`}>
                            {meta.label}
                          </span>
                          <span className="text-4xs font-bold text-emerald-900 bg-emerald-500/10 border border-emerald-500/10 px-1.5 py-0.5 rounded-full">
                            {meta.plant}
                          </span>
                        </div>
                      </div>

                      {/* Frustration / Confession quote card */}
                      <div className="bg-white/40 border border-neutral-200/50 rounded-xl p-3 relative shadow-3xs">
                        <div className="absolute top-1 left-2.5 text-xs opacity-15 text-emerald-950">“</div>
                        <p className="text-3xs text-emerald-950 font-semibold italic pl-3.5 pr-2.5 leading-relaxed">
                          {post.frustration}
                        </p>
                        <div className="text-right text-xs opacity-15 text-emerald-950 mr-2 -mt-1">”</div>
                      </div>

                      {/* Expandable Technical Log */}
                      {post.errorLog && (
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => setExpandedPostId(isExpanded ? null : post.id)}
                            className="flex items-center space-x-1 py-1 text-4xs font-bold text-neutral-600 hover:text-emerald-900 cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span>마주했던 시스템 에러 로그 {isExpanded ? '닫기' : '자세히 보기'}</span>
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <pre className="p-3 bg-neutral-900/5 border border-neutral-400/20 rounded-lg text-4xs font-mono text-neutral-800 whitespace-pre-wrap max-h-32 overflow-y-auto mt-1 leading-normal shadow-3xs">
                                  {post.errorLog}
                                </pre>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      {/* Purification Botanical Prescription Block */}
                      <div className="p-3.5 bg-white/70 border border-amber-900/10 rounded-xl relative space-y-2 shadow-4xs">
                        <span className="text-4xs font-mono font-extrabold text-emerald-900 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                          <span>BOTANICAL PURIFICATION REMEDY</span>
                        </span>

                        <div className="space-y-1.5">
                          {/* 줄이 아니라 블록 단위로 잘라야 코드 펜스 한가운데가 끊기지 않는다. */}
                          <RemedyMarkdown text={post.remedy} variant="compact" maxBlocks={2} />
                          {countRemedyBlocks(post.remedy) > 2 && (
                            <span className="text-3xs text-emerald-800/60 block font-bold mt-1">
                              ...더 많은 처방 내역 포함됨
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom controls: support cheering sprinkler */}
                    <div className="border-t border-amber-900/5 mt-4 pt-3.5 flex items-center justify-between relative">
                      
                      {/* Sprinkler Shower Floating Effect */}
                      <AnimatePresence>
                        {isEffecting && (
                          <motion.span
                            initial={{ opacity: 0, y: -5, scale: 0.5 }}
                            animate={{ opacity: 0.9, y: -38, scale: 1.25 }}
                            exit={{ opacity: 0 }}
                            className="absolute bottom-11 right-4 bg-emerald-800 text-white text-4xs font-extrabold px-2.5 py-1 rounded-full shadow-md pointer-events-none flex items-center space-x-1"
                          >
                            <Droplets className="w-3 h-3 text-sky-200" />
                            <span>촉촉한 치유 🚿 +1</span>
                          </motion.span>
                        )}
                      </AnimatePresence>

                      <span className="text-4xs text-[#8D7660] font-bold flex items-center gap-1">
                        <Bookmark className="w-3 h-3 text-[#8D7660]" />
                        <span>가든 치유 지혜</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleCheer(post.id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-900 hover:text-emerald-950 rounded-xl text-4xs font-extrabold transition-all cursor-pointer border border-emerald-500/10 shadow-3xs"
                      >
                        <Droplets className="w-3.5 h-3.5 text-emerald-700" />
                        <span>응원의 물줄기 🚿</span>
                        <strong className="font-mono text-emerald-950 font-bold bg-white/90 px-1.5 py-0.5 rounded-md min-w-[16px] text-center shadow-4xs">
                          {post.cheers || 0}
                        </strong>
                      </button>
                    </div>

                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

    </div>
  );
}
