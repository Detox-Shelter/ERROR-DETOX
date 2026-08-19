import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Wind,
  Heart,
  Volume2,
  VolumeX,
  Send,
  RefreshCw,
  Sparkles,
  Smile,
  BookOpen,
  ArrowRight,
  Users,
  Maximize2,
  Cloud,
  FileText,
  Clock,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Leaf,
  Droplet,
  Sun,
  Flame,
  ChevronRight,
  Archive,
  Waves
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import GuideModal from './GuideModal';
import CommunitySquare from './CommunitySquare';
import RemedyMarkdown from './RemedyMarkdown';

// Import our beautiful generated botanical images
import leafDecor from '../assets/images/botanical_leaf_decor_1784084589115.jpg';
import cozyGarden from '../assets/images/cozy_garden_illustration_1784084604317.jpg';
import sereneForest from '../assets/images/serene_forest_ambient_1784085626266.jpg';

interface DetoxLandingPageProps {
  user: FirebaseUser | null;
  onLogin: () => void;
  onLogout: () => void;
  customDisplayName?: string;
  customGardenerTitle?: string;
  customPhotoURL?: string;
}

// Sound channels available in our Forest Ambient Mixer
interface SoundChannel {
  id: string;
  label: string;
  desc?: string;
  icon: React.ReactNode;
  active: boolean;
  gain: number;
}

// Locally persisted garden log
interface GardenLog {
  id: string;
  timestamp: string;
  errorLog: string;
  frustration: string;
  botanicalTitle: string;
  prescription: string;
  growthStage: number; // 1 to 4 leaf
  seed?: string;
}

// Static lists for seed species and zen reflections
const SEED_OPTIONS = [
  { id: 'recommend', label: '✨ 자동 추천 씨앗', desc: '정원사 AI가 에러를 분석해 마음에 위로를 줄 가장 좋은 씨앗을 추천해 줍니다', titlePrefix: '추천받은 치유목' },
  { id: 'eucalyptus', label: '🌿 유칼립투스', desc: '시간 지연이나 로딩이 멈추는 에러 정화', titlePrefix: '차분한 유칼립투스' },
  { id: 'bamboo', label: '🎋 대나무 새싹', desc: '서버 연결이나 인터넷이 끊기는 에러 정화', titlePrefix: '곧은 대나무 새싹' },
  { id: 'monstera', label: '🪴 몬스테라', desc: '용량이 꽉 차거나 데이터가 무거울 때의 에러 정화', titlePrefix: '풍성한 몬스테라' },
  { id: 'ivy', label: '🍀 아이비 넝쿨', desc: '엉키고 꼬인 해결하기 힘든 옛날 코드 정화', titlePrefix: '강인한 아이비 넝쿨' }
];

const ZEN_QUOTES = [
  { quote: "성급하게 실행한 커밋보다, 맑은 정신으로 내쉬는 한 번의 호흡이 당신의 시스템을 더 단단하게 만듭니다.", author: "어느 지혜로운 가드너" },
  { quote: "코드 속의 모든 빈 줄(Whitespace)은 호흡을 가다듬는 쉼터입니다. 여백을 두려워하지 마세요.", author: "소프트웨어 정원학 개론" },
  { quote: "가장 단단한 참나무도 혹독한 바람을 견디며 나이테를 쌓듯, 복잡한 예외(Exception)는 당신의 개발 나이테를 키워줍니다.", author: "자연계 디버깅 가이드" },
  { quote: "과습한 화분은 뿌리를 썩게 하듯, 지나치게 꼬여있는 구조는 흐름을 막습니다. 때로는 가지치기(Refactoring)가 답입니다.", author: "소프트웨어 전지 기법" },
  { quote: "새벽녘 정원사들이 이슬 맺힌 길을 조용히 거닐듯, 밤새 쌓인 에러를 향해 고요하게 숨 한 모금 내쉬며 다가가 보세요.", author: "초록빛 안식처 수칙" }
];

export default function DetoxLandingPage({ user, onLogin, onLogout, customDisplayName, customGardenerTitle, customPhotoURL }: DetoxLandingPageProps) {
  // Navigation states
  const [activeTab, setActiveTab] = useState<'garden' | 'community' | 'archive' | 'wisdom'>('garden');

  const [isSharingToCommunity, setIsSharingToCommunity] = useState(false);
  const [isSharedToCommunity, setIsSharedToCommunity] = useState(false);

  const handleShareToCommunity = async () => {
    if (isSharedToCommunity || isSharingToCommunity) return;
    setIsSharingToCommunity(true);
    try {
      let plantType = selectedSeed;
      if (plantType === 'recommend') {
        if (botanicalTitle.includes('유칼립투스')) plantType = 'eucalyptus';
        else if (botanicalTitle.includes('대나무')) plantType = 'bamboo';
        else if (botanicalTitle.includes('몬스테라')) plantType = 'monstera';
        else if (botanicalTitle.includes('아이비')) plantType = 'ivy';
        else plantType = 'recommend';
      }

      const errorTypeMap: Record<string, 'delay' | 'network' | 'memory' | 'legacy' | 'other'> = {
        eucalyptus: 'delay',
        bamboo: 'network',
        monstera: 'memory',
        ivy: 'legacy',
        recommend: 'other'
      };

      const payload = {
        nickname: customDisplayName || user?.displayName || '익명의가드너',
        gardenerTitle: customGardenerTitle || '초보 가드너 🌱',
        photoURL: customPhotoURL || user?.photoURL || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        errorLog: errorLog || '',
        frustration: frustration || '따뜻하게 싹튼 에러 정화 기록',
        errorType: errorTypeMap[plantType] || 'other',
        plantType: plantType,
        remedy: prescription || '',
        timestamp: new Date().toISOString(),
        cheers: 0
      };

      // 1. Try to add directly to Firestore
      try {
        console.log("Writing new post to Cloud Firestore...");
        const postsCol = collection(db, 'community_posts');
        await addDoc(postsCol, payload);
        setIsSharedToCommunity(true);
        console.log("Successfully wrote post to Firestore!");
        return;
      } catch (firestoreError) {
        console.warn("Firestore write error, falling back to backend API storage:", firestoreError);
      }

      // 2. Fallback to server API
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsSharedToCommunity(true);
      } else {
        throw new Error('정원 광장 서버로 전송에 실패했습니다.');
      }
    } catch (err) {
      console.error(err);
      alert('정원 광장에 일지를 전송하는 중 문제가 발생했습니다.');
    } finally {
      setIsSharingToCommunity(false);
    }
  };

  // Grounding Breath States
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [breathCycles, setBreathCycles] = useState(0);

  // Error Compost Form State
  const [errorLog, setErrorLog] = useState('');
  const [frustration, setFrustration] = useState('');
  const [selectedSeed, setSelectedSeed] = useState<string>('recommend');
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isComposting, setIsComposting] = useState(false);
  const [isSprouting, setIsSprouting] = useState(false);
  const [prescription, setPrescription] = useState<string | null>(null);
  const [botanicalTitle, setBotanicalTitle] = useState('싱그러운 치유목');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // Textarea Ref for Composting Garden
  const errorLogTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper for smooth scroll and auto focus
  const handleScrollToCompost = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveTab('garden');
    setTimeout(() => {
      const element = document.getElementById('compost-playground');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => {
        if (errorLogTextareaRef.current) {
          errorLogTextareaRef.current.focus();
        }
      }, 300);
    }, 150);
  };

  // 히어로에서 정원 광장으로 한 번에 이동한다. 탭을 바꾸고 탭 줄까지 스크롤한다.
  const handleGoToCommunity = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setActiveTab('community');
    setTimeout(() => {
      const element = document.getElementById('detox-tabs');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  // Copy and Rain states
  const [isCopied, setIsCopied] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number; noteName: string }[]>([]);
  const [autoRain, setAutoRain] = useState(false);
  const autoRainIntervalRef = useRef<number | null>(null);

  // Floating Action Button Visibility
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling down 300px
      if (window.scrollY > 300) {
        setShowFloatingBtn(true);
      } else {
        setShowFloatingBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set initial random quote on load
  useEffect(() => {
    setQuoteIndex(Math.floor(Math.random() * ZEN_QUOTES.length));
  }, []);

  // Sound Synth States & Audio Track Reference Map
  const [isAudioContextInited, setIsAudioContextInited] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Dedicated Ref tracking real Web Audio instances independently from React re-renders
  const activeAudioChannelsRef = useRef<{
    [key: string]: {
      mainGain: GainNode;
      nodes: (AudioNode | { stop?: () => void; disconnect: () => void })[];
      timers: number[];
      active: boolean;
    };
  }>({});

  const [soundChannels, setSoundChannels] = useState<SoundChannel[]>([
    { id: 'wind', label: '숲속의 바람 (Breeze)', desc: '지친 머리를 맑게 식혀주는 부드러운 바람', icon: <Wind className="w-3.5 h-3.5" />, active: false, gain: 0.16 },
    { id: 'rain', label: '차분한 가랑비 (Rain)', desc: '창가에 떨어지는 고요한 빗방울 소리', icon: <Droplet className="w-3.5 h-3.5" />, active: false, gain: 0.14 },
    { id: 'birds', label: '산뜻한 새소리 (Birds)', desc: '숲속 나뭇가지에서 지저귀는 맑은 새소리', icon: <Sprout className="w-3.5 h-3.5" />, active: false, gain: 0.09 },
    { id: 'campfire', label: '타닥타닥 모닥불 (Fire)', desc: '포근하게 타오르는 따뜻한 모닥불 소리', icon: <Flame className="w-3.5 h-3.5" />, active: false, gain: 0.15 },
    { id: 'crickets', label: '밤의 풀벌레 (Crickets)', desc: '여름밤 테라스의 서정적인 풀벌레 소리', icon: <Sparkles className="w-3.5 h-3.5" />, active: false, gain: 0.08 },
    { id: 'ocean', label: '고요한 파도 (Waves)', desc: '모래사장을 부드럽게 밀려오는 밤바다 파도', icon: <Waves className="w-3.5 h-3.5" />, active: false, gain: 0.15 }
  ]);

  // Active meditation background sound states & references (specifically for the ground/breath meditation session)
  const [activeMeditationSound, setActiveMeditationSound] = useState<'rain' | 'forest' | 'ocean' | null>('rain');
  const [isMeditationSoundPlaying, setIsMeditationSoundPlaying] = useState(false);
  const meditationGainNodeRef = useRef<GainNode | null>(null);
  const meditationSourcesRef = useRef<AudioNode[]>([]);
  const meditationLfoRef = useRef<OscillatorNode | null>(null);
  const meditationBirdTimeoutRef = useRef<number | null>(null);

  const startMeditationSound = async (soundType: 'rain' | 'forest' | 'ocean') => {
    stopMeditationSound();
    initAudioContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(0.12, ctx.currentTime);
    mainGain.connect(ctx.destination);
    meditationGainNodeRef.current = mainGain;

    if (soundType === 'rain') {
      // 1. Soft procedural rain
      const bufferSize = ctx.sampleRate * 1.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        const dust = Math.random() > 0.985 ? 0.35 * white : 0.008 * white;
        data[i] = dust;
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 1600;
      bandpass.Q.value = 1.2;

      source.connect(bandpass);
      bandpass.connect(mainGain);
      source.start(0);

      meditationSourcesRef.current = [source];
    } else if (soundType === 'forest') {
      // 2. Forest Breeze + chirping birds
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = 0.1 * white + 0.85 * lastOut;
        lastOut = data[i];
      }
      const breezeSource = ctx.createBufferSource();
      breezeSource.buffer = buffer;
      breezeSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;
      filter.Q.value = 0.8;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.09;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 120;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      breezeSource.connect(filter);
      filter.connect(mainGain);

      breezeSource.start(0);
      lfo.start(0);

      meditationSourcesRef.current = [breezeSource];
      meditationLfoRef.current = lfo;

      const birdGain = ctx.createGain();
      birdGain.gain.value = 0.05;
      birdGain.connect(mainGain);

      const triggerForestBird = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const sweepGain = ctx.createGain();

        osc.type = 'sine';
        const baseFreq = 2200 + Math.random() * 1200;
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.14);

        sweepGain.gain.setValueAtTime(0, now);
        sweepGain.gain.linearRampToValueAtTime(0.03, now + 0.02);
        sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(sweepGain);
        sweepGain.connect(birdGain);

        osc.start(now);
        osc.stop(now + 0.15);
      };

      const runBirds = () => {
        triggerForestBird();
        meditationBirdTimeoutRef.current = window.setTimeout(runBirds, 2500 + Math.random() * 4500);
      };
      runBirds();
    } else if (soundType === 'ocean') {
      // 3. Immersive ocean waves (modulating noise lowpass and amplitude over 14s cycles)
      const bufferSize = ctx.sampleRate * 2.5;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = 0.14 * white + 0.82 * lastOut;
        lastOut = data[i];
      }
      const oceanSource = ctx.createBufferSource();
      oceanSource.buffer = buffer;
      oceanSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 300;

      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07; // 14 seconds tide

      const filterLfoGain = ctx.createGain();
      filterLfoGain.gain.value = 220;

      lfo.connect(filterLfoGain);
      filterLfoGain.connect(filter.frequency);

      const ampLfoGain = ctx.createGain();
      ampLfoGain.gain.value = 0.07;

      lfo.connect(ampLfoGain);
      ampLfoGain.connect(mainGain.gain);

      oceanSource.connect(filter);
      filter.connect(mainGain);

      oceanSource.start(0);
      lfo.start(0);

      meditationSourcesRef.current = [oceanSource];
      meditationLfoRef.current = lfo;
    }

    setIsMeditationSoundPlaying(true);
  };

  const stopMeditationSound = () => {
    if (meditationBirdTimeoutRef.current) {
      clearTimeout(meditationBirdTimeoutRef.current);
      meditationBirdTimeoutRef.current = null;
    }
    if (meditationLfoRef.current) {
      try {
        meditationLfoRef.current.stop();
      } catch (e) {}
      meditationLfoRef.current.disconnect();
      meditationLfoRef.current = null;
    }
    meditationSourcesRef.current.forEach((src) => {
      try {
        (src as any).stop();
      } catch (e) {}
      src.disconnect();
    });
    meditationSourcesRef.current = [];
    if (meditationGainNodeRef.current) {
      meditationGainNodeRef.current.disconnect();
      meditationGainNodeRef.current = null;
    }
    setIsMeditationSoundPlaying(false);
  };

  // Auto trigger background sounds when breathing meditation is running
  useEffect(() => {
    if (breathPhase === 'idle') {
      stopMeditationSound();
    } else if (activeMeditationSound) {
      startMeditationSound(activeMeditationSound);
    }
  }, [breathPhase, activeMeditationSound]);

  // Clean up meditation sounds on unmount
  useEffect(() => {
    return () => {
      stopMeditationSound();
    };
  }, []);

  // Saved reflections logs (terrarium logs)
  const [savedLogs, setSavedLogs] = useState<GardenLog[]>([]);

  // Calculate dynamic terrarium stats on each render
  const totalPurifications = savedLogs.length;
  const purificationScore = totalPurifications * 15;

  let gardenLevel = 1;
  let levelTitle = "1단계: 씨앗 밭 🌱";
  let levelProgressPercent = 0;
  let nextMilestone = "2개 완료 시 2단계 진입";

  if (totalPurifications <= 1) {
    gardenLevel = 1;
    levelTitle = "1단계: 씨앗 밭 🌱";
    levelProgressPercent = totalPurifications * 50; // 0 or 50
    nextMilestone = "2개 완료 시 2단계 진입";
  } else if (totalPurifications <= 3) {
    gardenLevel = 2;
    levelTitle = "2단계: 푸른 새싹 온실 🪴";
    levelProgressPercent = Math.round(((totalPurifications - 2) / 2) * 100);
    nextMilestone = "4개 완료 시 3단계 진입";
  } else if (totalPurifications <= 5) {
    gardenLevel = 3;
    levelTitle = "3단계: 비밀의 정원 🎋";
    levelProgressPercent = Math.round(((totalPurifications - 4) / 2) * 100);
    nextMilestone = "6개 완료 시 4단계 진입";
  } else {
    gardenLevel = 4;
    levelTitle = "4단계: 울창한 테라리움 숲 🌳";
    levelProgressPercent = 100;
    nextMilestone = "최대 레벨 달성 완료!";
  }

  const hasEucalyptus = savedLogs.some((log) => log.seed === 'eucalyptus' || log.botanicalTitle.includes('유칼립투스'));
  const hasBamboo = savedLogs.some((log) => log.seed === 'bamboo' || log.botanicalTitle.includes('대나무'));
  const hasMonstera = savedLogs.some((log) => log.seed === 'monstera' || log.botanicalTitle.includes('몬스테라'));
  const hasIvy = savedLogs.some((log) => log.seed === 'ivy' || log.botanicalTitle.includes('아이비'));

  // Badges list
  const badgesList = [
    {
      id: 'badge_novice',
      title: '초보 가드너 🌱',
      desc: '첫 에러를 치유목으로 정화했습니다',
      unlocked: totalPurifications >= 1
    },
    {
      id: 'badge_master',
      title: '수호 정원사 🏆',
      desc: '3개 이상의 에러를 정원에 묻어 울창하게 길렀습니다',
      unlocked: totalPurifications >= 3
    },
    {
      id: 'badge_eucalyptus',
      title: '유칼립투스 배지 🌿',
      desc: '비동기/스레드 버그를 가꾸어 유칼립투스를 틔웠습니다',
      unlocked: hasEucalyptus
    },
    {
      id: 'badge_bamboo',
      title: '꺾이지 않는 철골 배지 🎋',
      desc: '인프라/네트워크 에러를 가꾸어 곧은 대나무를 틔웠습니다',
      unlocked: hasBamboo
    },
    {
      id: 'badge_monstera',
      title: '넓은 그늘 배지 🪴',
      desc: '데이터베이스 정체 에러를 가꾸어 몬스테라를 틔웠습니다',
      unlocked: hasMonstera
    },
    {
      id: 'badge_ivy',
      title: '생명력 넝쿨 배지 🍀',
      desc: '레거시/스파게티 코드를 가꾸어 강인한 아이비를 틔웠습니다',
      unlocked: hasIvy
    }
  ];

  // Sound generator timers
  const birdTimerRef = useRef<number | null>(null);

  // Load saved garden logs from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('error_garden_logs');
    if (cached) {
      try {
        setSavedLogs(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached logs:", e);
      }
    }
  }, []);

  // Save to local storage helper
  const saveLogsToCache = (newLogs: GardenLog[]) => {
    setSavedLogs(newLogs);
    localStorage.setItem('error_garden_logs', JSON.stringify(newLogs));
  };

  // Breathing trainer loop
  useEffect(() => {
    if (breathPhase === 'idle') return;

    const interval = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          if (breathPhase === 'inhale') {
            setBreathPhase('hold');
            return 4;
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
            return 4;
          } else {
            setBreathPhase('inhale');
            setBreathCycles((c) => c + 1);
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [breathPhase]);

  // Audio Context Initialization & Guaranteed Resume Helper
  const getOrCreateAudioContext = async (): Promise<AudioContext | null> => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      setIsAudioContextInited(true);
      return audioCtxRef.current;
    } catch (err) {
      console.error("Failed to init/resume AudioContext:", err);
      return null;
    }
  };

  const initAudioContext = () => {
    getOrCreateAudioContext();
  };

  // Stop a specific audio channel safely and cleanly
  const stopChannelAudio = (id: string) => {
    const track = activeAudioChannelsRef.current[id];
    if (!track) return;

    // 1. Immediately flag as inactive so loops or pending callbacks stop
    track.active = false;

    // 2. Clear all registered timers
    track.timers.forEach((t) => clearTimeout(t));
    track.timers = [];

    // 3. Stop and disconnect all active nodes
    track.nodes.forEach((node) => {
      try {
        if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
        }
      } catch (e) {}
      try {
        node.disconnect();
      } catch (e) {}
    });
    track.nodes = [];

    // 4. Disconnect main gain node
    try {
      track.mainGain.disconnect();
    } catch (e) {}

    delete activeAudioChannelsRef.current[id];
  };

  // Start audio synthesis for a channel
  const startChannelAudio = async (id: string, gainVal: number) => {
    const ctx = await getOrCreateAudioContext();
    if (!ctx) return;

    // Clean up existing track if any
    stopChannelAudio(id);

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(gainVal, ctx.currentTime);
    mainGain.connect(ctx.destination);

    const track = {
      mainGain,
      nodes: [] as (AudioNode | { stop?: () => void; disconnect: () => void })[],
      timers: [] as number[],
      active: true
    };
    activeAudioChannelsRef.current[id] = track;

    try {
      if (id === 'wind') {
        // 1. Forest Breeze (Pink-ish filtered noise + Slow gentle LFO wind gusts)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = 0.12 * white + 0.85 * lastOut;
          lastOut = data[i];
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;
        filter.Q.value = 0.9;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12; // breathing rate

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 180;

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSource.connect(filter);
        filter.connect(mainGain);

        noiseSource.start(0);
        lfo.start(0);

        track.nodes.push(noiseSource, filter, lfo, lfoGain);
      } else if (id === 'rain') {
        // 2. Soft Rain (Crackle noise with bandpass + highpass filtering)
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          const dust = Math.random() > 0.983 ? 0.35 * white : 0.008 * white;
          data[i] = dust;
        }

        const rainSource = ctx.createBufferSource();
        rainSource.buffer = buffer;
        rainSource.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.value = 1700;
        bandpass.Q.value = 1.2;

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 300;

        rainSource.connect(bandpass);
        bandpass.connect(highpass);
        highpass.connect(mainGain);

        rainSource.start(0);
        track.nodes.push(rainSource, bandpass, highpass);
      } else if (id === 'birds') {
        // 3. Singing Birds (Self-contained procedural scheduler with guaranteed stop)
        const birdMasterGain = ctx.createGain();
        birdMasterGain.gain.value = 1.0;
        birdMasterGain.connect(mainGain);
        track.nodes.push(birdMasterGain);

        const triggerBird = () => {
          if (!track.active || !audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const sweepGain = ctx.createGain();

          osc.type = 'sine';
          const baseFreq = 2300 + Math.random() * 1300;
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.55, now + 0.12);

          sweepGain.gain.setValueAtTime(0, now);
          sweepGain.gain.linearRampToValueAtTime(0.06, now + 0.02);
          sweepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

          osc.connect(sweepGain);
          sweepGain.connect(birdMasterGain);

          osc.start(now);
          osc.stop(now + 0.16);

          const cleanupTimer = window.setTimeout(() => {
            try { osc.disconnect(); sweepGain.disconnect(); } catch (e) {}
          }, 200);
          track.timers.push(cleanupTimer);
        };

        const scheduleBirds = () => {
          if (!track.active) return;
          triggerBird();
          if (Math.random() > 0.45) {
            const secondaryTimer = window.setTimeout(() => {
              if (track.active) triggerBird();
            }, 180);
            track.timers.push(secondaryTimer);
          }
          const nextInterval = 2200 + Math.random() * 3800;
          const mainTimer = window.setTimeout(scheduleBirds, nextInterval);
          track.timers.push(mainTimer);
        };

        scheduleBirds();
      } else if (id === 'campfire') {
        // 4. Warm Campfire (Low rumble noise + stochastic wood crackle pops)
        const bufferSize = ctx.sampleRate * 2.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = white * 0.08;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 150;

        noise.connect(lowpass);
        lowpass.connect(mainGain);
        noise.start(0);
        track.nodes.push(noise, lowpass);

        const crackleGain = ctx.createGain();
        crackleGain.gain.value = 1.0;
        crackleGain.connect(mainGain);
        track.nodes.push(crackleGain);

        const triggerCrackle = () => {
          if (!track.active || !audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const popGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(250 + Math.random() * 900, now);

          popGain.gain.setValueAtTime(0, now);
          popGain.gain.linearRampToValueAtTime(0.08, now + 0.005);
          popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

          osc.connect(popGain);
          popGain.connect(crackleGain);
          osc.start(now);
          osc.stop(now + 0.04);

          const cleanupTimer = window.setTimeout(() => {
            try { osc.disconnect(); popGain.disconnect(); } catch (e) {}
          }, 60);
          track.timers.push(cleanupTimer);
        };

        const scheduleCrackle = () => {
          if (!track.active) return;
          triggerCrackle();
          const nextInterval = 90 + Math.random() * 380;
          const timer = window.setTimeout(scheduleCrackle, nextInterval);
          track.timers.push(timer);
        };
        scheduleCrackle();
      } else if (id === 'crickets') {
        // 5. Night Crickets (High pitch sine with rapid tremolo pulse)
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 4350;

        const tremoloOsc = ctx.createOscillator();
        tremoloOsc.type = 'sine';
        tremoloOsc.frequency.value = 30;

        const tremoloGain = ctx.createGain();
        tremoloGain.gain.value = 0.5;

        const envelopeGain = ctx.createGain();
        envelopeGain.gain.value = 0.0;

        tremoloOsc.connect(tremoloGain);
        osc.connect(envelopeGain);
        envelopeGain.connect(mainGain);

        osc.start(0);
        tremoloOsc.start(0);
        track.nodes.push(osc, tremoloOsc, tremoloGain, envelopeGain);

        const runCricketRhythm = () => {
          if (!track.active || !audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
          const now = ctx.currentTime;
          envelopeGain.gain.setValueAtTime(0.0001, now);
          envelopeGain.gain.linearRampToValueAtTime(0.04, now + 0.2);
          envelopeGain.gain.setValueAtTime(0.04, now + 1.2);
          envelopeGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

          const nextTimer = window.setTimeout(runCricketRhythm, 2200 + Math.random() * 1200);
          track.timers.push(nextTimer);
        };
        runCricketRhythm();
      } else if (id === 'ocean') {
        // 6. Gentle Ocean Waves (Noise + lowpass + dedicated swellGain modulated by 13s LFO)
        const bufferSize = ctx.sampleRate * 2.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = 0.14 * white + 0.82 * lastOut;
          lastOut = data[i];
        }
        const oceanSource = ctx.createBufferSource();
        oceanSource.buffer = buffer;
        oceanSource.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 320;

        const swellGain = ctx.createGain();
        swellGain.gain.value = 0.5;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.075; // ~13.3s wave cycle

        const filterLfoGain = ctx.createGain();
        filterLfoGain.gain.value = 180;

        const ampLfoGain = ctx.createGain();
        ampLfoGain.gain.value = 0.4;

        lfo.connect(filterLfoGain);
        filterLfoGain.connect(filter.frequency);

        lfo.connect(ampLfoGain);
        ampLfoGain.connect(swellGain.gain);

        oceanSource.connect(filter);
        filter.connect(swellGain);
        swellGain.connect(mainGain);

        oceanSource.start(0);
        lfo.start(0);

        track.nodes.push(oceanSource, filter, swellGain, lfo, filterLfoGain, ampLfoGain);
      }
    } catch (err) {
      console.error(`Failed to start synth channel ${id}:`, err);
      stopChannelAudio(id);
    }
  };

  // Toggle individual sound channels
  const toggleChannel = async (id: string) => {
    const channel = soundChannels.find((ch) => ch.id === id);
    if (!channel) return;

    const nextActive = !channel.active;

    if (nextActive) {
      await startChannelAudio(id, channel.gain);
    } else {
      stopChannelAudio(id);
    }

    setSoundChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, active: nextActive } : ch))
    );
  };

  // Adjust volume for a specific channel
  const adjustChannelVolume = (id: string, vol: number) => {
    const track = activeAudioChannelsRef.current[id];
    if (track && track.mainGain && audioCtxRef.current) {
      try {
        track.mainGain.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
      } catch (e) {}
    }
    setSoundChannels((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, gain: vol } : ch))
    );
  };

  // Mute / Stop all sound channels at once
  const stopAllChannels = () => {
    soundChannels.forEach((ch) => {
      stopChannelAudio(ch.id);
    });
    setSoundChannels((prev) => prev.map((ch) => ({ ...ch, active: false })));
  };

  // Apply one-click sound preset
  const applyPreset = async (presetId: 'rain_wind' | 'fire_night' | 'ocean_breeze') => {
    stopAllChannels();
    if (presetId === 'rain_wind') {
      await startChannelAudio('rain', 0.16);
      await startChannelAudio('wind', 0.12);
      setSoundChannels((prev) =>
        prev.map((ch) => ({
          ...ch,
          active: ch.id === 'rain' || ch.id === 'wind'
        }))
      );
    } else if (presetId === 'fire_night') {
      await startChannelAudio('campfire', 0.16);
      await startChannelAudio('crickets', 0.08);
      setSoundChannels((prev) =>
        prev.map((ch) => ({
          ...ch,
          active: ch.id === 'campfire' || ch.id === 'crickets'
        }))
      );
    } else if (presetId === 'ocean_breeze') {
      await startChannelAudio('ocean', 0.16);
      await startChannelAudio('wind', 0.10);
      setSoundChannels((prev) =>
        prev.map((ch) => ({
          ...ch,
          active: ch.id === 'ocean' || ch.id === 'wind'
        }))
      );
    }
  };

  // Web Audio Pentatonic Raindrop synthesis & sound
  const playRaindropSound = (clientX?: number, containerWidth?: number) => {
    initAudioContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return '';

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Pentatonic scale frequencies (C Major Pentatonic)
    const pentatonicFreqs = [
      { note: '궁 (C4)', freq: 261.63 },
      { note: '상 (D4)', freq: 293.66 },
      { note: '각 (E4)', freq: 329.63 },
      { note: '치 (G4)', freq: 392.00 },
      { note: '우 (A4)', freq: 440.00 },
      { note: '궁 (C5)', freq: 523.25 },
      { note: '상 (D5)', freq: 587.33 },
      { note: '각 (E5)', freq: 659.25 },
      { note: '치 (G5)', freq: 783.99 },
      { note: '우 (A5)', freq: 880.00 }
    ];

    // Select index based on clientX ratio or random
    let index = Math.floor(Math.random() * pentatonicFreqs.length);
    if (clientX !== undefined && containerWidth !== undefined && containerWidth > 0) {
      const percentage = Math.max(0, Math.min(0.99, clientX / containerWidth));
      index = Math.floor(percentage * pentatonicFreqs.length);
    }
    const { freq, note } = pentatonicFreqs[index];

    try {
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const now = ctx.currentTime;

      // Primary sine tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.9, now + 0.12);

      // Bright subharmonic triangle tone for bells/xylophone feel
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(freq * 1.5, now);
      subOsc.frequency.exponentialRampToValueAtTime(freq * 1.3, now + 0.1);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3, now);
      filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.15);

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.004);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.35);
      subOsc.stop(now + 0.35);
    } catch (err) {
      console.error("Failed to play raindrop synth:", err);
    }

    return note;
  };

  const handleRainCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    const noteName = playRaindropSound(e.clientX - rect.left, rect.width);
    
    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
      noteName
    };
    setRipples((prev) => [...prev, newRipple].slice(-25));
  };

  // Auto Rain Effect
  useEffect(() => {
    if (autoRain) {
      autoRainIntervalRef.current = window.setInterval(() => {
        const randX = Math.random() * 100;
        const randY = Math.random() * 75 + 12;
        const noteName = playRaindropSound();
        setRipples((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: randX,
            y: randY,
            noteName
          }
        ].slice(-25));
      }, 450 + Math.random() * 350); // Faster, more musical drip interval (450ms - 800ms)
    } else {
      if (autoRainIntervalRef.current) {
        clearInterval(autoRainIntervalRef.current);
        autoRainIntervalRef.current = null;
      }
    }
    return () => {
      if (autoRainIntervalRef.current) {
        clearInterval(autoRainIntervalRef.current);
      }
    };
  }, [autoRain]);

  // Clean up stale ripples
  useEffect(() => {
    if (ripples.length === 0) return;
    const timer = setTimeout(() => {
      setRipples((prev) => prev.filter((r) => Date.now() - r.id < 1500));
    }, 600);
    return () => clearTimeout(timer);
  }, [ripples]);

  // Postcard copy clipboard helpers
  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback copy failed', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopyPostcard = () => {
    if (!prescription) return;
    
    const paragraphs = prescription.split('\n').filter(p => p.trim() && !p.trim().startsWith('#') && !p.trim().startsWith('>'));
    const briefAdvice = paragraphs.length > 0 ? paragraphs[0] : "복잡한 세상을 이겨내는 고요한 전지 훈련 완료";
    
    const postcardText = `[초록빛 에러 디톡스 가든 처방전 📬]
─────────────────────────────────
🌸 틔워낸 치유식물: ${botanicalTitle}
📅 정화 일시: ${new Date().toLocaleString('ko-KR')}
🌱 성장 단계: 4단계 (울창한 묘목 완료)

💬 가드너의 한 줄 처방:
"${briefAdvice}"

💡 수분 조절 가이드:
- "과습은 뿌리를 상하게 합니다 (트래픽 완급조절)"
- "때로는 소스코드를 잠시 완전히 건조시켜 보세요 (스트레칭)"

─────────────────────────────────
"가장 어두운 콘솔창에서도 생명은 기어이 초록을 피워냅니다. 오늘도 힘내세요!"
#에러디톡스 #개발자안식처 #마음치유정원`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(postcardText).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }).catch(() => {
        fallbackCopyText(postcardText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      });
    } else {
      fallbackCopyText(postcardText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Clean up sounds on destroy
  useEffect(() => {
    return () => {
      Object.keys(activeAudioChannelsRef.current).forEach((id) => {
        stopChannelAudio(id);
      });
      if (birdTimerRef.current) clearTimeout(birdTimerRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  // Form handling: Turn error into custom botanical compost & sprout flower
  const handleCompostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorLog.trim() && !frustration.trim()) {
      alert('마음 속의 답답함이나 아키텍처/에러 로그를 조금만 들려주세요!');
      return;
    }

    setIsComposting(true);
    setIsSprouting(false);
    setPrescription(null);
    setApiError(null);

    // Auto-trigger deep grounding breath to relax developer during compost
    setBreathPhase('inhale');
    setBreathSeconds(4);

    // Resolve the recommendation dynamically if selectedSeed is 'recommend'
    let resolvedSeed = selectedSeed;
    if (selectedSeed === 'recommend') {
      const combined = (errorLog + ' ' + frustration).toLowerCase();
      if (combined.match(/async|thread|promise|await|concurrency|동기|비동기|스레드|락|lock/)) {
        resolvedSeed = 'eucalyptus';
      } else if (combined.match(/network|timeout|connection|fetch|api|http|socket|서버|네트워크|연동|요청/)) {
        resolvedSeed = 'bamboo';
      } else if (combined.match(/memory|database|sql|query|db|leak|heap|메모리|데이터|디비|쿼리/)) {
        resolvedSeed = 'monstera';
      } else if (combined.match(/spaghetti|legacy|refactor|clean|mess|스파게티|레거시|정리|구조/)) {
        resolvedSeed = 'ivy';
      } else {
        const seeds = ['eucalyptus', 'bamboo', 'monstera', 'ivy'];
        resolvedSeed = seeds[Math.floor(Math.random() * seeds.length)];
      }
    }

    try {
      const response = await fetch('/api/gemini/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorLog, frustration, selectedSeed: resolvedSeed }),
      });

      // 서버리스 함수가 없으면 404 텍스트가 돌아와 JSON 파싱이 깨진다. 원인을 그대로 드러낸다.
      if (!(response.headers.get('content-type') || '').includes('application/json')) {
        throw new Error(
          response.status === 404
            ? '처방 서버(/api/gemini/refresh)를 찾지 못했습니다. 배포 설정을 확인해 주세요.'
            : `처방 서버 응답을 읽지 못했습니다. (HTTP ${response.status})`
        );
      }

      const data = await response.json();
      if (response.ok && data.text) {
        // Succeeded! Let's trigger a beautiful visual sprout animation
        setIsSprouting(true);
        setPrescription(data.text);
        
        // Generate a poetic botanical title based on the selected seed
        const seedTitles: Record<string, string[]> = {
          eucalyptus: ["은빛 이슬 맺힌 유칼립투스 🌿", "바람 결에 흩날리는 유칼립투스 🌿", "차분한 숲 속의 어린 유칼립투스 🌿"],
          bamboo: ["하늘로 굳세게 곧은 대나무 🎋", "꺾이지 않고 유연한 푸른 대나무 🎋", "정원에 곧게 솟은 대나무 새싹 🎋"],
          monstera: ["넓고 은혜로운 그늘의 몬스테라 🪴", "속이 깊고 싱그러운 몬스테라 🪴", "데이터 갈증을 정화하는 몬스테라 🪴"],
          ivy: ["바위와 담장을 타고 흐르는 아이비 🍀", "생명력이 휘돌아 나가는 아이비 넝쿨 🍀", "레거시 덤불을 든든히 감싸는 실버 아이비 🍀"]
        };
        const activeTitles = seedTitles[resolvedSeed] || ["빛을 품고 태어난 싱그러운 치유목 🌸"];
        const chosenName = activeTitles[Math.floor(Math.random() * activeTitles.length)];
        const finalTitle = selectedSeed === 'recommend' ? `✨ [추천] ${chosenName}` : chosenName;
        setBotanicalTitle(finalTitle);

        // Append to saved logs
        const newLog: GardenLog = {
          id: 'log_' + Date.now(),
          timestamp: new Date().toLocaleDateString('ko-KR') + ' ' + new Date().toLocaleTimeString('ko-KR'),
          errorLog: errorLog.slice(0, 150) + (errorLog.length > 150 ? '...' : ''),
          frustration: frustration || '답답함을 덜어낸 순간',
          botanicalTitle: finalTitle,
          prescription: data.text,
          growthStage: Math.floor(Math.random() * 2) + 3, // 3 or 4 leaves
          seed: resolvedSeed
        };
        saveLogsToCache([newLog, ...savedLogs]);

      } else {
        throw new Error(data.error || '식물이 조언을 피워내는 도중 멈추었습니다.');
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || '네트워크 감도가 잠시 흔들렸습니다.');
      
      // Beautiful local fallback matching the selected seed
      const seedTitles: Record<string, string[]> = {
        eucalyptus: ["안개 숲에서 자란 자생 유칼립투스 🌿", "수분을 머금은 가드닝 유칼립투스 🌿"],
        bamboo: ["의연하고 유연한 어린 대나무 🎋", "인고를 거쳐 우뚝 솟은 푸른 대나무 🎋"],
        monstera: ["잎맥이 시원하게 터진 몬스테라 🪴", "지친 흙 속에서 자라난 몬스테라 🪴"],
        ivy: ["끈질기게 매달려 살아낸 은빛 아이비 🍀", "장벽을 마주해 기어오르는 아이비 넝쿨 🍀"]
      };
      const activeTitles = seedTitles[resolvedSeed] || ["빗소리를 머금고 단단해진 자작나무 묘목 🌸"];
      const chosenName = activeTitles[Math.floor(Math.random() * activeTitles.length)];
      const finalTitle = selectedSeed === 'recommend' ? `✨ [추천] ${chosenName}` : chosenName;
      setBotanicalTitle(finalTitle);

      const fallbackText = `
### 📝 한눈에 보는 에러 디톡스 요약
> **🔍 에러 원인:** API Key 연동 지연 혹은 일시적인 네트워크 감도 흔들림
> **📂 에러 내용:** "${errorLog ? (errorLog.length > 80 ? errorLog.slice(0, 80) + '...' : errorLog) : '지정된 입력 오류 데이터 정화 대기'}"
> **💡 핵심 해결책:** 개발 서버 환경 변수의 \`GEMINI_API_KEY\` 설정 상태를 점검하시거나 아래 식물학 기법을 참조해 로컬 예외 처리를 추가해 보세요.

---

### 🌲 마음의 상처를 보듬는 ${finalTitle.replace('✨ [추천] ', '').split(' ')[0]} 가드너의 한마디

지금 겪고 계신 복잡한 시스템의 에러는, 나무가 깊고 비옥한 대지 속으로 단단히 뿌리를 내리는 하나의 자연스러운 성장 과정과 같습니다. 
아직 Gemini API 키가 활성화되지 않았거나 연동에 어려움이 있더라도, 쉼터 정원사의 사랑스러운 기술적 치유 조언을 전해드릴게요.

#### 🌿 이 에러를 극복하기 위한 수분 조절 비법
1. **과습은 뿌리를 상하게 합니다 (트래픽 분산):**
   - 시스템이 먹통이거나 대기 시간이 길어지고 있다면, 물을 한 번에 너무 많이 준 화분과 같습니다. 중간에 비동기 큐(Buffer Queue)를 배치해 수분을 부드럽게 골고루 흘려주세요.
2. **튼튼한 자갈돌을 깔아주세요 (예외 기본값 처리):**
   - 빈번한 에러 분출이나 Null 변수는 흙이 흘러내리는 현상과 같습니다. 방어적 코드 구조나 Optional 패턴으로 흘러내림을 든든하게 막아주세요.
3. **가끔은 햇빛 아래 완전히 건조시키세요 (스트레칭):**
   - 꼬여있는 소스코드 덤불은 아무리 잡고 늘려도 쉽게 풀리지 않습니다. 3분간 기지개를 켜고 물 한 모금을 들이켜며 모니터 밖의 풍경을 잠시 감상해 보세요.

> "거친 돌 틈 사이에서도 생명은 기어이 고개를 듭니다. 당신의 시스템은 오늘 이 순간을 계기로 훨씬 더 맑고 단단하게 도약할 것입니다."
      `;
      setPrescription(fallbackText);
      setIsSprouting(true);

      const fallbackLog: GardenLog = {
        id: 'log_' + Date.now(),
        timestamp: new Date().toLocaleDateString('ko-KR') + ' ' + new Date().toLocaleTimeString('ko-KR'),
        errorLog: errorLog.slice(0, 150) + (errorLog.length > 150 ? '...' : ''),
        frustration: frustration || '답답함을 덜어낸 순간',
        botanicalTitle: finalTitle,
        prescription: fallbackText,
        growthStage: 3,
        seed: resolvedSeed
      };
      saveLogsToCache([fallbackLog, ...savedLogs]);
    } finally {
      setIsComposting(false);
    }
  };

  const getBreathPhaseLabel = () => {
    switch (breathPhase) {
      case 'inhale': return '코로 숨을 깊게 들이마시세요... 🌿';
      case 'hold': return '숨을 잠시 멈추고 온기를 느끼세요... ✨';
      case 'exhale': return '입으로 후- 하고 걱정을 내보내세요... 🍃';
      default: return '호흡 준비 완료';
    }
  };

  return (
    <div className="space-y-16 py-4" id="detox-landing-container">
      
      {/* 1. Asymmetrical Premium Drift-Style Hero Section */}
      <section className="relative min-h-[75vh] flex flex-col justify-center rounded-3xl border border-emerald-100/40 bg-white shadow-xs p-6 sm:p-12 overflow-hidden" id="hero-drift-section">
        
        {/* Soft parallax organic grid overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#1b3b2b_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Decorative glassmorphic circular elements */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-yellow-500/3 blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10" id="drift-hero-grid">
          
          {/* Left Column: Exquisite Typography & Message */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6" id="drift-hero-intro">
            <div className="inline-flex items-center space-x-2 self-start bg-emerald-50 border border-emerald-150 px-3.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-widest text-emerald-900 uppercase">
              <Leaf className="w-3 h-3 text-emerald-600 animate-pulse" />
              <span>THE ERROR DETOX SHELTER</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-emerald-950 font-serif leading-[1.25]">
                복잡한 코드를 끄고,<br />
                <span className="text-emerald-700 underline decoration-emerald-200 decoration-wavy font-bold">초록을 켤 시간</span>
              </h1>
              <p className="text-xs sm:text-sm text-emerald-800/80 max-w-xl font-medium leading-relaxed">
                오늘도 모니터 불빛 아래서 붉은 에러 줄과 싸우며 외롭게 고군분투하는 방구석 개발자들을 위한 마음 쉼터입니다. 
                지친 마음과 버그를 흙에 묻고, 자연의 소리와 함께 따뜻한 위로와 해결의 싹을 틔워보세요.
              </p>
            </div>

            {/* Drift style quick statistics/indicators */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-emerald-50 max-w-md" id="drift-stats">
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-display">100%</span>
                <span className="block text-[10px] text-emerald-600/70 font-bold uppercase font-mono tracking-wider">눈이 편안한 쉼터</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-display">HTML5</span>
                <span className="block text-[10px] text-emerald-600/70 font-bold uppercase font-mono tracking-wider">마음을 지키는 소리</span>
              </div>
              <div className="space-y-1">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-950 font-display">Gemini</span>
                <span className="block text-[10px] text-emerald-600/70 font-bold uppercase font-mono tracking-wider">맞춤형 에러 처방전</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3.5 pt-2">
              <motion.button
                onClick={handleScrollToCompost}
                whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.25)' }}
                whileTap={{ scale: 0.98 }}
                className="relative inline-flex items-center space-x-2 bg-emerald-900 text-emerald-50 hover:bg-emerald-950 px-6 py-3.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer overflow-hidden group"
                id="hero-go-to-compost-btn"
              >
                {/* Subtle soft green light pulse on the button edge */}
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-800/20 via-emerald-700/10 to-emerald-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <Sprout className="w-4 h-4 text-emerald-400 group-hover:animate-bounce shrink-0" />
                <span className="relative z-10">에러 털어내고 쉼터로 가기 🪴</span>
                <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                onClick={handleGoToCommunity}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center space-x-2 bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-50/60 hover:border-emerald-300 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-3xs group"
                id="hero-go-to-community-btn"
              >
                <Users className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🌸 정원 광장 둘러보기</span>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <button
                onClick={() => setIsGuideOpen(true)}
                className="inline-flex items-center space-x-2 bg-white text-emerald-900 border border-emerald-150 hover:bg-emerald-50/50 px-5 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-3xs"
              >
                <span>초보 가이드 보기</span>
              </button>
            </div>
          </div>

          {/* Right Column: Dynamic Cozy Illustration & Live Soundscape widget */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6" id="drift-hero-widget">
            <div className="bg-[#FAF9F5] border border-emerald-100 rounded-3xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[360px]" id="cozy-drift-card">
              
              {/* Cover background garden */}
              <div className="absolute inset-0 opacity-[0.14] pointer-events-none">
                <img src={cozyGarden} alt="Garden View" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>

              <div className="flex items-center justify-between border-b border-emerald-100/60 pb-3 relative z-10">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span className="text-2xs font-bold text-emerald-950">가든 숲속 사운드 믹서</span>
                  {soundChannels.some((c) => c.active) && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                      {soundChannels.filter((c) => c.active).length}개 재생 중
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {soundChannels.some((c) => c.active) && (
                    <button
                      onClick={stopAllChannels}
                      className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-md transition-colors border border-rose-200/50"
                      title="모든 사운드 끄기"
                    >
                      전체 정지
                    </button>
                  )}
                  <span className="text-3xs font-mono font-bold text-emerald-700 uppercase">Live Synth</span>
                </div>
              </div>

              {/* Quick Sound Presets */}
              <div className="my-2.5 relative z-10 flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] font-bold text-emerald-800/80 mr-1">빠른 추천:</span>
                <button
                  onClick={() => applyPreset('rain_wind')}
                  className="px-2.5 py-1 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 text-[10px] font-semibold rounded-lg border border-emerald-200/60 transition-all shadow-2xs hover:scale-102"
                >
                  🌧️ 비 & 숲바람
                </button>
                <button
                  onClick={() => applyPreset('fire_night')}
                  className="px-2.5 py-1 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-[10px] font-semibold rounded-lg border border-amber-200/60 transition-all shadow-2xs hover:scale-102"
                >
                  🔥 모닥불 & 풀벌레
                </button>
                <button
                  onClick={() => applyPreset('ocean_breeze')}
                  className="px-2.5 py-1 bg-sky-50/80 hover:bg-sky-100 text-sky-900 text-[10px] font-semibold rounded-lg border border-sky-200/60 transition-all shadow-2xs hover:scale-102"
                >
                  🌊 밤바다 & 미풍
                </button>
              </div>

              {/* Sound Channels Controllers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-2 relative z-10" id="soundscape-controllers">
                {soundChannels.map((ch) => (
                  <div
                    key={ch.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      ch.active
                        ? 'bg-emerald-900/5 border-emerald-300 shadow-2xs ring-1 ring-emerald-400/30'
                        : 'bg-white/70 border-emerald-100/60 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleChannel(ch.id)}
                        className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-3xs font-bold transition-all border ${
                          ch.active
                            ? 'bg-emerald-850 text-white border-emerald-900 shadow-xs'
                            : 'bg-white text-emerald-800 border-emerald-100 hover:bg-emerald-50'
                        }`}
                      >
                        {ch.active ? <Volume2 className="w-3 h-3 animate-bounce" /> : <VolumeX className="w-3 h-3 text-gray-400" />}
                        <span>{ch.label}</span>
                      </button>

                      {ch.active && (
                        <span className="text-[10px] font-mono font-bold text-emerald-800">
                          {Math.round((ch.gain / 0.4) * 100)}%
                        </span>
                      )}
                    </div>

                    {ch.active && (
                      <div className="flex items-center space-x-1.5 mt-2 px-1">
                        <span className="text-[10px] text-emerald-700 font-bold">-</span>
                        <input
                          type="range"
                          min="0.01"
                          max="0.4"
                          step="0.01"
                          value={ch.gain}
                          onChange={(e) => adjustChannelVolume(ch.id, parseFloat(e.target.value))}
                          className="w-full accent-emerald-800 h-1.5 rounded-lg bg-emerald-200/60 cursor-pointer"
                        />
                        <span className="text-[10px] text-emerald-700 font-bold">+</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-emerald-50 text-3xs text-emerald-800/80 leading-relaxed font-medium relative z-10 mt-2">
                헤드폰을 착용하고 마음에 드는 자연 소리 채널을 조합해 보세요. 브라우저 실시간 Web Audio 신디사이저로 생성된 온전한 자연 음향이 복잡한 생각을 가라앉혀 줍니다.
              </div>
            </div>

            {/* Pentatonic Raindrops Audio Toy Card */}
            <div className="bg-[#FAF9F5] border border-emerald-100 rounded-3xl p-6 shadow-2xs relative overflow-hidden flex flex-col justify-between min-h-[300px]" id="raindrops-audio-toy">
              <div className="flex items-center justify-between border-b border-emerald-100/60 pb-3 relative z-10">
                <div className="flex items-center space-x-2">
                  <Droplet className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span className="text-2xs font-bold text-emerald-950">🌧️ 펜타토닉 빗방울 연주기</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-bold text-emerald-800">자동 비</span>
                  <button
                    onClick={() => setAutoRain(!autoRain)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      autoRain ? 'bg-emerald-700' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        autoRain ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Rain canvas play area */}
              <div
                onClick={handleRainCanvasClick}
                className="my-4 relative h-36 bg-emerald-950/90 rounded-2xl border border-emerald-800 overflow-hidden cursor-crosshair flex items-center justify-center select-none"
              >
                {/* Visual Glass panel scan lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.04)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none animate-[pulse_4s_infinite]" />
                
                {/* Instructions overlays */}
                <div className="text-center space-y-1 relative z-10 pointer-events-none opacity-60">
                  <Sparkles className="w-5 h-5 mx-auto text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="block text-3xs font-bold text-emerald-100 font-mono">PENTATONIC RAIN HARP</span>
                  <p className="text-[9px] text-emerald-300">유리창을 두드리면 맑은 빗물 소리가 연주됩니다</p>
                </div>

                {/* Animated Ripples */}
                {ripples.map((ripple) => (
                  <div
                    key={ripple.id}
                    className="absolute pointer-events-none flex flex-col items-center justify-center"
                    style={{ left: `${ripple.x}%`, top: `${ripple.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    {/* Ring expand effect */}
                    <div className="w-16 h-16 rounded-full border border-emerald-400/60 animate-[ping_1.2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-0" />
                    
                    {/* Pulsing core dot */}
                    <div className="absolute w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    
                    {/* Note Tag floating up */}
                    <span className="absolute -top-6 bg-emerald-900/90 text-emerald-200 text-[8px] font-mono font-bold px-1 py-0.5 rounded border border-emerald-700/50 shadow-sm animate-[bounce_0.6s_ease-out]">
                      {ripple.noteName}
                    </span>
                  </div>
                ))}
              </div>

              <div className="bg-white/80 p-3 rounded-xl border border-emerald-50 text-3xs text-emerald-800/80 leading-relaxed font-medium">
                동양에서 가장 완벽히 어우러지는 5음계(궁, 상, 각, 치, 우)가 유리창 가로 비율에 맞춰 조율되어 있습니다. 자동 비를 켜거나 창을 뚱땅거리며 깊은 평온을 누리세요.
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-center border-b border-emerald-100/40 pb-1 max-w-lg mx-auto" id="detox-tabs">
        {(['garden', 'community', 'archive', 'wisdom'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-3 text-xs font-bold transition-all relative cursor-pointer ${
              activeTab === tab ? 'text-emerald-900 font-extrabold' : 'text-emerald-500 hover:text-emerald-850'
            }`}
          >
            {tab === 'garden' ? '🍃 가든 쉼터' : tab === 'community' ? '🌸 정원 광장' : tab === 'archive' ? '📦 내 보관함' : '📖 기법서'}
            {activeTab === tab && (
              <motion.div
                layoutId="activeTabUnderline"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-700"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {/* mode="wait" 를 쓰면 안 된다. 자식이 조건부 네 슬롯으로 들어와서 나가는 탭의 exit 가
          해소되지 않고, 다음 탭이 영영 mount 되지 않는다. */}
      <AnimatePresence>
        
        {/* TAB 1: Garden and Error Compost Playground */}
        {activeTab === 'garden' && (
          <motion.div
            key="garden-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-12"
            id="compost-playground"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Side: Error Compost Container */}
              <div className="lg:col-span-7 flex flex-col justify-between" id="detox-compost-pane">
                <div className="bg-white border border-emerald-100 shadow-3xs rounded-3xl p-6 sm:p-8 space-y-6 flex-1 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Watermark leaf */}
                  <div className="absolute right-0 top-0 opacity-[0.04] w-64 h-64 pointer-events-none">
                    <img src={leafDecor} alt="decor" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>

                  <div className="space-y-1.5 relative z-10">
                    <span className="text-4xs font-bold font-mono px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded uppercase">1단계: 씨앗 가꾸기</span>
                    <h3 className="text-lg font-bold text-emerald-950 font-display">에러 묻고 정원 가꾸기 🪴</h3>
                    <p className="text-3xs text-emerald-800/80 leading-relaxed font-medium">
                      빨간 에러 메시지나 나를 괴롭히는 버그를 가만히 정원 흙 속에 묻어주세요. 
                      따스한 마음 위로와 함께 싱그러운 식물 가이드로 바꾸어 드립니다.
                    </p>
                  </div>

                  <form onSubmit={handleCompostSubmit} className="space-y-4 pt-3 relative z-10" id="compost-form">
                    <div className="space-y-1.5">
                      <label className="block text-3xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                        나를 힘들게 한 에러 메시지나 코드 (에러 코드)
                      </label>
                      <textarea
                        ref={errorLogTextareaRef}
                        id="error-compost-textarea"
                        value={errorLog}
                        onChange={(e) => setErrorLog(e.target.value)}
                        placeholder="예: OutOfMemoryError, DB Connection Timeout, 혹은 머리를 아프게 하는 코드 내용을 적어주세요..."
                        className="w-full h-36 p-3 text-xs bg-emerald-50/25 border border-emerald-100 rounded-2xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all font-mono placeholder:text-emerald-900/30 shadow-3xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-3xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                        지금 내 솔직한 기분이나 힘든 점 (마음 일기)
                      </label>
                      <input
                        type="text"
                        value={frustration}
                        onChange={(e) => setFrustration(e.target.value)}
                        placeholder="예: 오늘 안에 끝내고 싶은데 3시간째 이 에러로 퇴근이 늦어져 머리가 답답합니다."
                        className="w-full px-3.5 py-3 text-xs bg-emerald-50/20 border border-emerald-100 rounded-2xl focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 transition-all placeholder:text-emerald-900/30 font-medium"
                      />
                    </div>

                    {/* Seed Species Selection Button Group */}
                    <div className="space-y-2">
                      <label className="block text-3xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                        함께 키우고 싶은 초록 식물 선택
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {SEED_OPTIONS.map((seed) => (
                          <button
                            key={seed.id}
                            type="button"
                            onClick={() => setSelectedSeed(seed.id)}
                            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              seed.id === 'recommend' ? 'col-span-2 bg-gradient-to-r from-emerald-50/20 to-emerald-50/10' : 'bg-white'
                            } ${
                              selectedSeed === seed.id
                                  ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 shadow-3xs'
                                  : 'hover:bg-emerald-50/30 border-emerald-100'
                            }`}
                          >
                            <span className="text-2xs font-extrabold text-emerald-950 block">{seed.label}</span>
                            <span className="text-[9px] text-emerald-800/70 mt-0.5 leading-tight block">{seed.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isComposting}
                        className="inline-flex items-center space-x-2 bg-emerald-900 text-white hover:bg-emerald-950 disabled:bg-emerald-300 px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        {isComposting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>에러 정화하고 싹 틔우는 중...</span>
                          </>
                        ) : (
                          <>
                            <span>에러 정화하고 조언 받기</span>
                            <Send className="w-3.5 h-3.5 text-emerald-300" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                </div>
              </div>

              {/* Right Side: Active Grounding Breath Synchronizer */}
              <div className="lg:col-span-5 flex flex-col justify-between" id="detox-breath-pane">
                <div className="bg-[#FAF9F5] border border-emerald-100 shadow-3xs rounded-3xl p-6 flex flex-col items-center justify-between min-h-[420px] relative overflow-hidden flex-1">
                  
                  {/* Sunlight glow decoration */}
                  <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-yellow-300/10 to-transparent pointer-events-none"></div>

                  <div className="text-center space-y-1 relative z-10">
                    <span className="text-[10px] font-mono font-extrabold text-emerald-800 uppercase tracking-wider block">
                      Grounding Trainer
                    </span>
                    <h3 className="text-xs font-bold text-emerald-950">가든 4-4-4 심호흡 조율기</h3>
                    <p className="text-3xs text-emerald-800/80 max-w-xs mx-auto">
                      에러가 퇴비로 발효되는 동안 화면의 원형 고리의 흐름에 가만히 시선을 맞추고 숨을 들이마시고 정지하고 내쉬어 보세요.
                    </p>
                  </div>

                  {/* Breathing Circles with active waves */}
                  <div className="relative flex items-center justify-center my-8 h-40 w-40" id="breathing-circle-container">
                    
                    {/* Ring scale pulses */}
                    <AnimatePresence>
                      {breathPhase !== 'idle' && (
                        <motion.div
                          animate={{
                            scale: breathPhase === 'inhale' ? [1, 1.5] : breathPhase === 'hold' ? 1.5 : [1.5, 1],
                            opacity: breathPhase === 'inhale' ? [0.1, 0.4] : breathPhase === 'hold' ? 0.4 : [0.4, 0.1]
                          }}
                          transition={{
                            duration: 4,
                            ease: "easeInOut",
                            repeat: breathPhase === 'hold' ? Infinity : 0,
                          }}
                          className="absolute inset-0 rounded-full bg-emerald-200"
                        />
                      )}
                    </AnimatePresence>

                    {/* Core visual flower center */}
                    <motion.div
                      animate={{
                        scale: breathPhase === 'inhale' ? 1.35 : breathPhase === 'hold' ? 1.35 : breathPhase === 'exhale' ? 1 : 1,
                        rotate: breathPhase !== 'idle' ? 360 : 0
                      }}
                      transition={{
                        scale: { duration: 4, ease: "easeInOut" },
                        rotate: { duration: 16, ease: "linear", repeat: Infinity }
                      }}
                      className={`w-28 h-28 rounded-full flex flex-col items-center justify-center text-center shadow-md relative z-10 transition-colors duration-1000 ${
                        breathPhase === 'inhale'
                          ? 'bg-emerald-700 text-emerald-50'
                          : breathPhase === 'hold'
                          ? 'bg-teal-700 text-teal-50'
                          : breathPhase === 'exhale'
                          ? 'bg-emerald-900 text-emerald-50'
                          : 'bg-white text-emerald-900 border border-emerald-150'
                      }`}
                    >
                      {breathPhase === 'idle' ? (
                        <div className="flex flex-col items-center space-y-1">
                          <Heart className="w-6 h-6 text-emerald-600 animate-pulse" />
                          <span className="text-[10px] font-bold">호흡 대기</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="text-xl font-extrabold font-mono block">{breathSeconds}</span>
                          <span className="text-[8px] font-bold uppercase tracking-wider block opacity-70">
                            {breathPhase}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Natural Sound Selector for Meditation */}
                  <div className="w-full max-w-xs space-y-2 py-3 border-t border-emerald-100/50 relative z-10">
                    <span className="block text-[9px] font-bold text-emerald-800/80 uppercase tracking-widest text-center font-mono">
                      명상 배경음 선택 (Grounding Sounds)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (activeMeditationSound === 'rain') {
                            if (isMeditationSoundPlaying) {
                              stopMeditationSound();
                            } else if (breathPhase !== 'idle') {
                              startMeditationSound('rain');
                            }
                          } else {
                            setActiveMeditationSound('rain');
                            if (breathPhase !== 'idle') {
                              startMeditationSound('rain');
                            }
                          }
                        }}
                        className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          activeMeditationSound === 'rain'
                            ? 'bg-emerald-900 text-white border-emerald-950 shadow-3xs'
                            : 'bg-white text-emerald-800 border-emerald-100 hover:bg-emerald-50'
                        }`}
                      >
                        <Droplet className="w-3.5 h-3.5" />
                        <span>빗소리</span>
                        {activeMeditationSound === 'rain' && breathPhase !== 'idle' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse mt-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (activeMeditationSound === 'forest') {
                            if (isMeditationSoundPlaying) {
                              stopMeditationSound();
                            } else if (breathPhase !== 'idle') {
                              startMeditationSound('forest');
                            }
                          } else {
                            setActiveMeditationSound('forest');
                            if (breathPhase !== 'idle') {
                              startMeditationSound('forest');
                            }
                          }
                        }}
                        className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          activeMeditationSound === 'forest'
                            ? 'bg-emerald-900 text-white border-emerald-950 shadow-3xs'
                            : 'bg-white text-emerald-800 border-emerald-100 hover:bg-emerald-50'
                        }`}
                      >
                        <Wind className="w-3.5 h-3.5" />
                        <span>숲소리</span>
                        {activeMeditationSound === 'forest' && breathPhase !== 'idle' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse mt-0.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (activeMeditationSound === 'ocean') {
                            if (isMeditationSoundPlaying) {
                              stopMeditationSound();
                            } else if (breathPhase !== 'idle') {
                              startMeditationSound('ocean');
                            }
                          } else {
                            setActiveMeditationSound('ocean');
                            if (breathPhase !== 'idle') {
                              startMeditationSound('ocean');
                            }
                          }
                        }}
                        className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                          activeMeditationSound === 'ocean'
                            ? 'bg-emerald-900 text-white border-emerald-950 shadow-3xs'
                            : 'bg-white text-emerald-800 border-emerald-100 hover:bg-emerald-50'
                        }`}
                      >
                        <Waves className="w-3.5 h-3.5" />
                        <span>파도 소리</span>
                        {activeMeditationSound === 'ocean' && breathPhase !== 'idle' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse mt-0.5" />
                        )}
                      </button>
                    </div>

                    {breathPhase === 'idle' ? (
                      <p className="text-[9px] text-emerald-800/60 text-center font-medium">
                        호흡을 시작하면 선택한 자연의 소리가 자동으로 흐릅니다.
                      </p>
                    ) : (
                      <p className="text-[9px] text-emerald-800/80 text-center font-semibold flex items-center justify-center space-x-1 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                        <span>자연 음향이 흘러나오는 중...</span>
                      </p>
                    )}
                  </div>

                  {/* Controller panel */}
                  <div className="text-center w-full space-y-3 relative z-10">
                    <span className="text-2xs font-extrabold text-emerald-950 block min-h-[16px]">
                      {getBreathPhaseLabel()}
                    </span>

                    {breathPhase === 'idle' ? (
                      <button
                        onClick={() => {
                          setBreathPhase('inhale');
                          setBreathSeconds(4);
                          setBreathCycles(0);
                        }}
                        className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-3xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1.5"
                      >
                        <Wind className="w-3.5 h-3.5" />
                        <span>의식적인 호흡 시작하기</span>
                      </button>
                    ) : (
                      <div className="space-y-1">
                        <span className="text-3xs text-emerald-800/80 font-mono block">완성한 명상 서클: {breathCycles}회</span>
                        <button
                          onClick={() => setBreathPhase('idle')}
                          className="px-4 py-1 border border-red-200 text-red-700 hover:bg-red-50 text-3xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          호흡 멈추기
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              </div>

            </div>

            {/* Dynamic SPROUT Bloom Output Panel (When Gemini completes compost) */}
            <AnimatePresence>
              {isSprouting && prescription && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: 12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="bg-[#FCFBF7] border border-emerald-150 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8"
                  id="bloom-panel"
                >
                  
                  {/* Decorative Header with Blooming Plant illustration */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-emerald-100 pb-5 gap-4">
                    <div className="flex items-center space-x-4">
                      {/* Animated flower sprout icon */}
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0 border border-emerald-200">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.15, 1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Sprout className="w-6 h-6 text-emerald-700" />
                        </motion.div>
                      </div>

                      <div>
                        <span className="text-3xs font-bold font-mono text-emerald-600 block uppercase tracking-wider">YOUR RETRIEVED COMPOST SPECIES</span>
                        <h4 className="text-base font-bold text-emerald-950 font-serif flex items-center space-x-1.5">
                          <span className="text-emerald-800 font-semibold">{botanicalTitle}</span>
                          <span className="text-xs text-emerald-600 font-normal">가 피어났습니다 🌸</span>
                        </h4>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setErrorLog('');
                        setFrustration('');
                        setPrescription(null);
                        setIsSprouting(false);
                        setBreathPhase('idle');
                        setIsSharedToCommunity(false);
                      }}
                      className="self-start sm:self-center px-4 py-2 border border-emerald-200 text-emerald-800 hover:bg-emerald-50 rounded-xl text-3xs font-bold transition-colors cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>새로운 에러 분분 묻기</span>
                    </button>
                  </div>

                  {/* Botanical Prescription Body */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left 8 cols: Prescribed Wisdom */}
                    <div className="lg:col-span-8 space-y-6">
                      <div className="bg-white p-6 sm:p-7 rounded-2xl border border-emerald-50/60 shadow-2xs">
                        <RemedyMarkdown text={prescription} />
                      </div>
                    </div>

                    {/* Right 4 cols: Interactive Terrarium Visualization */}
                    <div className="lg:col-span-4 bg-white border border-emerald-50 rounded-2xl p-5 space-y-4 text-center shadow-3xs">
                      <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase tracking-widest block">Virtual Growth State</span>
                      
                      {/* Beautiful glowing SVG plant growth indicator */}
                      <div className="w-full h-44 bg-gradient-to-b from-emerald-50/20 to-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-center overflow-hidden relative">
                        {/* Sun ray backdrop */}
                        <div className="absolute top-0 w-24 h-24 rounded-full bg-yellow-100/30 blur-xl pointer-events-none"></div>

                        <svg viewBox="0 0 100 100" className="w-32 h-32 text-emerald-800 drop-shadow-md">
                          {/* Earth Ground */}
                          <path d="M 10,85 Q 50,78 90,85 L 90,95 L 10,95 Z" fill="#6B5B52" opacity="0.3" />
                          <path d="M 20,83 Q 50,75 80,83" stroke="#5C4D42" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

                          {/* Sprouted Stem */}
                          <motion.path
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            d="M 50,80 Q 48,55 52,35"
                            fill="none"
                            stroke="#15803d"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />

                          {/* 4 Leaf growths with staggers */}
                          <motion.path
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, duration: 0.6 }}
                            d="M 50,68 C 35,65 30,52 48,58 Z"
                            fill="#22c55e"
                          />
                          <motion.path
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.0, duration: 0.6 }}
                            d="M 50,55 C 65,52 70,40 52,47 Z"
                            fill="#16a34a"
                          />
                          <motion.path
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.4, duration: 0.6 }}
                            d="M 49,42 C 34,35 28,25 46,30 Z"
                            fill="#15803d"
                          />
                          <motion.path
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.8, duration: 0.6 }}
                            d="M 51,35 C 55,18 45,15 48,22 Z"
                            fill="#166534"
                          />
                          
                          {/* Floating glowing sparkles */}
                          <circle cx="28" cy="40" r="1.5" fill="#facc15" opacity="0.8" className="animate-pulse" />
                          <circle cx="74" cy="30" r="2" fill="#34d399" opacity="0.6" className="animate-pulse" />
                        </svg>
                      </div>

                      <div className="space-y-1">
                        <span className="text-3xs font-extrabold text-emerald-900 font-mono">성장 완료: 4단계 치유 묘목 🪴</span>
                        <p className="text-[10px] text-gray-400 leading-relaxed">
                          답답했던 에러를 털어내고 피어난 소중한 치유의 식물입니다. 이 기록은 '내 보관함'에 소중히 보존되어 언제든 다시 꺼내볼 수 있습니다.
                        </p>
                      </div>

                      {/* Postcard Share Button */}
                      <div className="pt-3 border-t border-emerald-100/60 space-y-2">
                        <button
                          onClick={handleCopyPostcard}
                          className={`w-full py-2.5 px-4 rounded-xl text-3xs font-extrabold transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer ${
                            isCopied
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
                          }`}
                        >
                          {isCopied ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 animate-bounce" />
                              <span>처방전 엽서 복사 완료! 📬</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5" />
                              <span>식물 처방전 엽서 복사하기 📬</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleShareToCommunity}
                          disabled={isSharedToCommunity || isSharingToCommunity}
                          className={`w-full py-2.5 px-4 rounded-xl text-3xs font-extrabold transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer ${
                            isSharedToCommunity
                              ? 'bg-emerald-800 text-white shadow-xs'
                              : 'bg-white text-emerald-900 hover:bg-emerald-50 border border-emerald-300'
                          }`}
                        >
                          {isSharingToCommunity ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>정원 광장에 심는 중... 🌸</span>
                            </>
                          ) : isSharedToCommunity ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                              <span>정원 광장에 공유 완료! 🌸</span>
                            </>
                          ) : (
                            <>
                              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                              <span>정원 광장 커뮤니티에 공유하기 💚</span>
                            </>
                          )}
                        </button>
                        
                        <p className="text-[9px] text-gray-400 font-medium">
                          처방전 엽서를 복사하거나 커뮤니티 광장에 공유해서, 방구석에서 함께 고군분투하는 다른 개발자들과 따뜻한 응원을 나눠보세요.
                        </p>
                      </div>
                    </div>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* TAB 2: Terrarium Archival Log List */}
        {activeTab === 'archive' && (
          <motion.div
            key="archive-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
            id="archive-logs"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-emerald-950 font-display">나의 디톡스 처방전 보관함</h3>
                <p className="text-3xs text-emerald-700/80 mt-0.5">그동안 에러를 털어내며 정성껏 키워낸 나만의 치유 및 디버깅 기록들입니다.</p>
              </div>

              {savedLogs.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm("그동안의 모든 식물 처방전 내역을 영구히 삭제하시겠습니까?")) {
                      saveLogsToCache([]);
                    }
                  }}
                  className="px-3 py-1.5 text-3xs border border-red-100 text-red-700 hover:bg-red-50 rounded-lg font-bold"
                >
                  보관함 비우기
                </button>
              )}
            </div>

            {/* Greenhouse Terrarium & Badges Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-emerald-50/20 border border-emerald-100/50 p-6 rounded-3xl" id="greenhouse-dashboard">
              
              {/* Left Column (5/12): Interactive Glass Jar Terrarium */}
              <div className="lg:col-span-5 bg-white border border-emerald-50 rounded-2xl p-6 flex flex-col items-center justify-between shadow-3xs relative overflow-hidden min-h-[340px]">
                {/* Sunshine backglow */}
                <div className="absolute top-0 w-40 h-40 bg-yellow-100/20 blur-2xl rounded-full pointer-events-none" />
                
                <div className="text-center space-y-1 relative z-10 w-full border-b border-gray-50 pb-3">
                  <span className="text-[9px] font-mono font-bold text-emerald-600 tracking-widest uppercase block">Virtual Sprout Ecosystem</span>
                  <h4 className="text-xs font-extrabold text-emerald-950 font-serif">나만의 에러 퇴비 테라리움</h4>
                </div>

                {/* SVG Glass Jar */}
                <div className="relative my-4 flex items-center justify-center w-full">
                  <svg viewBox="0 0 160 180" className="w-40 h-48 drop-shadow-md relative z-10">
                    {/* Glass Jar Outline */}
                    <path
                      d="M 50,30 Q 80,25 110,30 Q 130,50 130,100 C 130,140 120,160 80,160 C 40,160 30,140 30,100 Q 30,50 50,30"
                      fill="rgba(244, 243, 238, 0.25)"
                      stroke="rgba(16, 185, 129, 0.45)"
                      strokeWidth="2"
                    />
                    
                    {/* Jar lid */}
                    <rect x="65" y="14" width="30" height="9" rx="2.5" fill="#B45309" opacity="0.85" />
                    <line x1="68" y1="21" x2="92" y2="21" stroke="#78350F" strokeWidth="1.5" />
                    
                    {/* Soil Layer */}
                    <path
                      d="M 33,125 Q 80,121 127,125 C 127,145 115,158 80,158 C 45,158 33,145 33,125 Z"
                      fill="#5C3A21"
                    />
                    <path
                      d="M 34,127 Q 80,123 126,127"
                      stroke="#78350F"
                      strokeWidth="1.5"
                      fill="none"
                    />

                    {/* Pebbles */}
                    <circle cx="52" cy="144" r="3" fill="#9CA3AF" />
                    <circle cx="108" cy="142" r="4.5" fill="#4B5563" />
                    <circle cx="82" cy="149" r="2.5" fill="#D1D5DB" />

                    {/* CASE 0: Empty - Seed only */}
                    {totalPurifications === 0 && (
                      <g>
                        {/* Seed glowing */}
                        <circle cx="80" cy="116" r="3.5" fill="#FEF08A" className="animate-pulse" />
                        <path d="M 78,118 Q 80,111 84,113" stroke="#22C55E" strokeWidth="1.5" fill="none" />
                      </g>
                    )}

                    {/* CASE 1: Eucalyptus */}
                    {hasEucalyptus && (
                      <g>
                        {/* Curved stem */}
                        <path d="M 60,125 Q 52,100 56,76" fill="none" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" />
                        {/* Soft round leaves */}
                        <circle cx="46" cy="98" r="7" fill="#34D399" opacity="0.9" />
                        <circle cx="64" cy="88" r="6" fill="#10B981" opacity="0.9" />
                        <circle cx="49" cy="74" r="5.5" fill="#059669" opacity="0.9" />
                      </g>
                    )}

                    {/* CASE 2: Bamboo */}
                    {hasBamboo && (
                      <g>
                        {/* Straight tall stem */}
                        <path d="M 82,125 L 82,55" stroke="#065F46" strokeWidth="3" strokeLinecap="round" />
                        <line x1="78" y1="98" x2="86" y2="98" stroke="#047857" strokeWidth="1.5" />
                        <line x1="78" y1="78" x2="86" y2="78" stroke="#047857" strokeWidth="1.5" />
                        {/* Bamboo Leaves */}
                        <path d="M 82,78 Q 96,72 102,82 Z" fill="#34D399" />
                        <path d="M 82,62 Q 68,57 62,67 Z" fill="#10B981" />
                      </g>
                    )}

                    {/* CASE 3: Monstera */}
                    {hasMonstera && (
                      <g>
                        {/* Leftward bending stem */}
                        <path d="M 102,125 Q 110,105 103,84" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
                        {/* Big heart leaf */}
                        <path d="M 103,84 C 91,73 86,93 103,109 C 120,93 115,73 103,84 Z" fill="#10B981" />
                        {/* Leaf ribs slots */}
                        <line x1="95" y1="89" x2="101" y2="92" stroke="#065F46" strokeWidth="1" />
                        <line x1="111" y1="89" x2="105" y2="92" stroke="#065F46" strokeWidth="1" />
                      </g>
                    )}

                    {/* CASE 4: Ivy */}
                    {hasIvy && (
                      <g>
                        {/* Curly vine clinging */}
                        <path d="M 35,120 Q 30,80 46,54 Q 62,32 82,40" fill="none" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" />
                        {/* Ivy tiny heart leaves */}
                        <path d="M 33,96 C 28,93 32,88 35,93 C 38,88 42,93 37,96 Z" fill="#047857" />
                        <path d="M 41,72 C 36,69 40,64 43,69 C 46,64 50,69 45,72 Z" fill="#059669" />
                        <path d="M 53,46 C 48,43 52,38 55,43 C 58,38 62,43 57,46 Z" fill="#34D399" />
                      </g>
                    )}

                    {/* Sprouting generic leaf if they have any logs but none of seeds */}
                    {totalPurifications > 0 && !hasEucalyptus && !hasBamboo && !hasMonstera && !hasIvy && (
                      <g>
                        <path d="M 80,125 Q 76,105 80,88" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
                        <path d="M 80,105 Q 68,98 72,108 Z" fill="#22C55E" />
                        <path d="M 80,94 Q 92,88 88,98 Z" fill="#15803D" />
                      </g>
                    )}

                    {/* Floating magical spores */}
                    {totalPurifications > 0 && (
                      <g>
                        <circle cx="48" cy="58" r="1.2" fill="#FEF08A" className="animate-pulse" />
                        <circle cx="106" cy="52" r="1.8" fill="#A7F3D0" className="animate-pulse" />
                        <circle cx="76" cy="38" r="1.2" fill="#34D399" className="animate-pulse" />
                      </g>
                    )}
                  </svg>

                  {/* Absolute glowing badge with current Level inside */}
                  <div className="absolute bottom-1 right-4 bg-emerald-800 text-white font-mono text-[9px] font-black px-2 py-1 rounded-lg border border-emerald-600 shadow-sm">
                    LV. {gardenLevel}
                  </div>
                </div>

                <div className="text-center space-y-1 w-full pt-2">
                  <span className="text-[10px] text-gray-500 font-medium">
                    {totalPurifications === 0 
                      ? "아직 퇴비화된 에러가 없습니다. 쉼터에서 시작하세요!"
                      : `정원에 총 ${totalPurifications}종의 치유 식물이 자생 중입니다.`
                    }
                  </span>
                </div>
              </div>

              {/* Right Column (7/12): Level info & Badges List */}
              <div className="lg:col-span-7 bg-white border border-emerald-50 rounded-2xl p-6 flex flex-col justify-between shadow-3xs space-y-5">
                
                {/* Level metrics bar */}
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <span className="text-4xs font-mono font-extrabold text-emerald-500 uppercase block tracking-wider">GREENHOUSE ECO SYSTEM</span>
                      <h4 className="text-xs font-black text-emerald-950">{levelTitle}</h4>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-emerald-800">
                      정화 수치: {purificationScore} EP
                    </span>
                  </div>

                  {/* Progress bar container */}
                  <div className="w-full h-3 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100/30">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelProgressPercent}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"
                    />
                  </div>

                  <div className="flex justify-between text-[9px] font-bold text-gray-400">
                    <span>성장도 {levelProgressPercent}%</span>
                    <span className="text-emerald-700">{nextMilestone}</span>
                  </div>
                </div>

                {/* Collected Badges block */}
                <div className="space-y-2.5">
                  <h5 className="text-[10px] font-black text-emerald-950 font-sans tracking-wide uppercase">정원 수집 치유 배지</h5>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {badgesList.map((b) => (
                      <div
                        key={b.id}
                        className={`border rounded-2xl p-2.5 flex flex-col items-center text-center space-y-1.5 transition-all relative overflow-hidden ${
                          b.unlocked
                            ? 'bg-emerald-50/20 border-emerald-200/80 shadow-3xs'
                            : 'bg-gray-50/40 border-gray-100 opacity-50'
                        }`}
                      >
                        <span className={`text-lg block ${b.unlocked ? 'animate-bounce' : 'grayscale filter'}`} style={{ animationDuration: '4s' }}>
                          {b.unlocked ? b.title.split(' ').pop() : '🔒'}
                        </span>
                        
                        <div className="space-y-0.5">
                          <span className={`text-[10px] font-extrabold block leading-tight ${b.unlocked ? 'text-emerald-950' : 'text-gray-400'}`}>
                            {b.title.replace(/[🌱🏆🌿🎋🪴🍀]/g, '').trim()}
                          </span>
                          <span className="text-[8px] text-gray-400 leading-tight block">
                            {b.desc}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {savedLogs.length === 0 ? (
              <div className="p-12 border border-dashed border-emerald-100 rounded-3xl text-center space-y-3 bg-white max-w-lg mx-auto">
                <Archive className="w-10 h-10 mx-auto text-emerald-200" />
                <span className="block text-xs font-bold text-emerald-950">보관된 화분이 비어 있습니다.</span>
                <p className="text-3xs text-gray-400">
                  첫 번째 탭에서 지긋지긋한 에러 로그나 마음의 답답함을 입력한 뒤 "에러 묻고 싹 틔우기" 단추를 누르면 이 자리에 푸르른 기록이 안전하게 안착됩니다.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedLogs.map((log) => (
                  <div key={log.id} className="bg-white border border-emerald-50 rounded-3xl p-5 shadow-3xs flex flex-col justify-between hover:border-emerald-100 transition-all space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-gray-400">{log.timestamp}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-full">Sprouted</span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="text-2xs font-bold text-emerald-950 flex items-center space-x-1">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{log.botanicalTitle}</span>
                        </h4>

                        {/* Mental Frustration Display */}
                        {log.frustration && (
                          <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3 my-2.5 text-3xs text-amber-950 font-serif relative">
                            <div className="flex items-center space-x-1.5 mb-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-[8px] font-black font-mono text-amber-700 uppercase tracking-wider">지친 마음 한 토막</span>
                            </div>
                            <p className="italic pl-1">“{log.frustration}”</p>
                          </div>
                        )}

                        <p className="text-3xs text-gray-400 font-mono truncate">에러: {log.errorLog || "마음 해소용 입력"}</p>
                      </div>

                      {/* Snippet of the generated advice */}
                      {/* 요약 인용 카드까지만 보여준다. 평문으로 뭉개면 구조가 사라진다. */}
                      <div className="bg-[#FCFBF8] p-3 rounded-xl max-h-40 overflow-hidden border border-emerald-50/50">
                        <RemedyMarkdown text={log.prescription} variant="compact" maxBlocks={2} />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setBotanicalTitle(log.botanicalTitle);
                        setPrescription(log.prescription);
                        setIsSprouting(true);
                        setActiveTab('garden');
                        // Scroll up to see the sprout view
                        window.scrollTo({ top: 400, behavior: 'smooth' });
                      }}
                      className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl text-3xs font-bold transition-all text-center"
                    >
                      전체 화분과 조언 복원하기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 1.5: Community Shared Garden Square */}
        {activeTab === 'community' && (
          <motion.div
            key="community-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CommunitySquare 
              currentUser={user}
              customDisplayName={customDisplayName}
              customGardenerTitle={customGardenerTitle}
              customPhotoURL={customPhotoURL}
            />
          </motion.div>
        )}

        {/* TAB 3: Wisdom guide of botanical tech-analogy */}
        {activeTab === 'wisdom' && (
          <motion.div
            key="wisdom-tab"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
            id="botanical-philosophy"
          >
            <div className="text-center max-w-xl mx-auto space-y-3">
              <h3 className="text-base font-bold text-emerald-950 font-display">방구석 개발자를 위한 생각 정리법</h3>
              <p className="text-3xs text-emerald-800/80">
                복잡한 소프트웨어 아키텍처와 자연의 섭리는 서로 닮아 있습니다. 문제 해결이 막힐 때 가볍게 읽어보세요.
              </p>
              <div className="flex justify-center pt-1">
                <button
                  onClick={() => setIsGuideOpen(true)}
                  className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-3xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                  <span>에러 해결 가이드북 (TRIZ, SCAMPER, ERRC) 보기</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-white border border-emerald-50 rounded-3xl p-5 shadow-3xs space-y-3">
                <div className="p-2.5 bg-yellow-50 text-yellow-800 rounded-2xl w-9 h-9 flex items-center justify-center font-display font-extrabold text-xs">01</div>
                <h4 className="text-2xs font-bold text-emerald-950">물 공급 주기와 비동기 큐 (CQRS)</h4>
                <p className="text-3xs text-gray-500 leading-relaxed font-medium">
                  식물에게 매일 수십 리터의 물을 한 번에 부어버리면 흙이 넘쳐 뿌리가 썩어버립니다. 
                  대용량 트래픽도 이와 같습니다. 메시지 브로커(Kafka, RabbitMQ)를 대입해 물이 스며들 듯 부하를 완만하게 골고루 흡수시키세요.
                </p>
              </div>

              <div className="bg-white border border-emerald-50 rounded-3xl p-5 shadow-3xs space-y-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-2xl w-9 h-9 flex items-center justify-center font-display font-extrabold text-xs">02</div>
                <h4 className="text-2xs font-bold text-emerald-950">분갈이 타이밍과 컨테이너 격리</h4>
                <p className="text-3xs text-gray-500 leading-relaxed font-medium">
                  작은 화분에 웅크린 채 뿌리가 꼬인 마리모는 더 이상 숨을 쉬지 못합니다. 
                  기존 단일 애플리케이션(Monolithic)이 너무 커져 컴파일이 지연된다면, 과감히 분갈이하듯 도커 컨테이너(Docker / K8s) 단위의 독립된 정원으로 뿌리를 갈라 심어주세요.
                </p>
              </div>

              <div className="bg-white border border-emerald-50 rounded-3xl p-5 shadow-3xs space-y-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-800 rounded-2xl w-9 h-9 flex items-center justify-center font-display font-extrabold text-xs">03</div>
                <h4 className="text-2xs font-bold text-emerald-950">서킷 브레이커와 선제적 전지 (Pruning)</h4>
                <p className="text-3xs text-gray-500 leading-relaxed font-medium">
                  병충해에 걸린 잔가지 하나를 가만히 방치하면 나무 온몸이 시들어 말라 죽습니다. 
                  느려지고 감염된 마이크로서비스를 차단하기 위해, 회로 차단기(Circuit Breaker)를 도입하여 병든 부분을 일시 단선함으로써 전체 정원을 보호하는 지혜가 필요합니다.
                </p>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* Exquisite Floating Guide Modal */}
      {isGuideOpen && <GuideModal onClose={() => setIsGuideOpen(false)} />}

      {/* Floating Action Button for instant composting access with luxurious motion */}
      <AnimatePresence>
        {showFloatingBtn && (
          <motion.button
            key="compost-fab"
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 30 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleScrollToCompost}
            className="fixed bottom-6 right-6 z-40 flex items-center space-x-2 bg-gradient-to-r from-emerald-800 to-emerald-950 text-emerald-50 hover:from-emerald-900 hover:to-emerald-950 px-4 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow cursor-pointer border border-emerald-700/30 group"
            id="floating-compost-fab"
            title="에러 정원으로 바로가기"
          >
            {/* Pulsing glow ring behind the FAB */}
            <span className="absolute inset-0 rounded-2xl bg-emerald-500/20 animate-ping opacity-75 pointer-events-none group-hover:scale-125 transition-all duration-1000" />
            
            <div className="relative">
              <Sprout className="w-4 h-4 text-emerald-300 group-hover:animate-bounce" />
              {/* Green indicator dot */}
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-pulse border border-emerald-950" />
            </div>
            
            <span className="text-[11px] font-extrabold tracking-tight">즉시 에러 퇴비화</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

    </div>
  );
}
