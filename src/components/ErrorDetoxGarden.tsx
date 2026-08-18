import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Volume2,
  VolumeX,
  Wind,
  Heart,
  Smile,
  Sprout,
  Send,
  RefreshCw,
  Loader,
  Timer,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PurifiedError } from '../types';
import DetoxDashboard from './DetoxDashboard';
import GardenSeedlingVisual from './GardenSeedlingVisual';

// Import the generated botanical image safely
import leafDecor from '../assets/images/botanical_leaf_decor_1784084589115.jpg';

// Predefined seed history logs to enrich the first impression of the garden
const DEFAULT_HISTORY: PurifiedError[] = [
  {
    id: 'seed-1',
    timestamp: '2026-07-14T10:15:00.000Z',
    errorLog: 'java.lang.OutOfMemoryError: Java heap space',
    frustration: '배포 전날 대용량 로그 적재하다가 힙메모리가 터져서 주말 반납할 뻔했어요.',
    errorType: 'memory',
    plantType: 'monstera',
    remedy: '### 🪴 몬스테라 분갈이 처방전\n무거운 힙메모리 찌꺼기를 흡수하여 싱그러운 초록 잎사귀로 피워냈습니다.\n\n#### 🌿 가드너의 조언\n- 가비지 컬렉터가 과도하게 무거워질 때는 버퍼 크기 조절 및 스트림 분할 처리를 검토해 보세요.'
  },
  {
    id: 'seed-2',
    timestamp: '2026-07-14T14:30:00.000Z',
    errorLog: 'Error: Connection lost to database server at 10.0.4.15:5432',
    frustration: '인프라 점검 중에 갑자기 커넥션 끊겨서 서비스 전체가 휘청였습니다.',
    errorType: 'network',
    plantType: 'bamboo',
    remedy: '### 🎋 대나무 연결망 강화 처방전\n땅속 깊은 뿌리로 영양분을 안정적으로 연결하듯 데이터베이스 연결을 단단히 정화했습니다.\n\n#### 🌿 가드너의 조언\n- 커넥션 풀 최소 크기를 유지하고 자동 재연결(Keep-Alive) 설정을 강화하여 예기치 못한 단절에 대비하세요.'
  },
  {
    id: 'seed-3',
    timestamp: '2026-07-15T09:00:00.000Z',
    errorLog: 'Loading timeout exceeded after 15000ms. Retrying...',
    frustration: '비동기 루프 안에서 응답이 무한 대기에 걸려 모바일 화면이 하얗게 굳어버렸어요.',
    errorType: 'delay',
    plantType: 'eucalyptus',
    remedy: '### 🌿 차분한 유칼립투스 순환 처방전\n정체된 스레드와 로딩 지연을 상쾌하게 정화했습니다.\n\n#### 🌿 가드너의 조언\n- 비동기 대기 처리에 타임아웃 서킷 브레이커 패턴을 적용하여, 지연이 발생할 시 사용자에게 즉각 피드백을 전달할 수 있도록 순환 구조를 만드세요.'
  },
  {
    id: 'seed-4',
    timestamp: '2026-07-15T11:45:00.000Z',
    errorLog: 'function renderLegacyCartItem(...) { // TODO: Refactor this 2018 spaghetti... }',
    frustration: '7년 전에 짜인 암호 같은 레거시 카트 코드를 분석하느라 골머리를 앓았습니다.',
    errorType: 'legacy',
    plantType: 'ivy',
    remedy: '### 🍀 아이비 지탱 처방전\n얽히고설킨 레거시 코드의 실타래를 지혜롭고 든든한 초록 지지대로 삼았습니다.\n\n#### 🌿 가드너의 조언\n- 한 번에 대대적으로 리팩토링하기보다, 마이크로 유닛 테스트를 감싸서 조금씩 불필요한 줄기를 쳐내듯 정화해 나가세요.'
  },
  {
    id: 'seed-5',
    timestamp: '2026-07-15T16:20:00.000Z',
    errorLog: 'Uncaught TypeError: Cannot read properties of undefined (reading "status")',
    frustration: '갑자기 한밤중에 들어온 예기치 못한 API 포맷 에러로 가슴이 쿵쾅거렸습니다.',
    errorType: 'other',
    plantType: 'recommend',
    remedy: '### ✨ 가드너 추천 씨앗 정화\n타입 불일치와 정의되지 않은 속성 에러를 유기적 방어 아키텍처로 정화했습니다.\n\n#### 🌿 가드너의 조언\n- 예외적인 구조에는 항상 디폴트 객체(Null Object Pattern)나 옵셔널 체이닝을 활용해 아키텍처에 그늘막을 씌워 보호해 주어야 합니다.'
  }
];

// Simple intelligent classifier to map errors to categories
const classifyErrorType = (log: string, frustration: string): 'delay' | 'network' | 'memory' | 'legacy' | 'other' => {
  const combined = (log + ' ' + frustration).toLowerCase();
  if (
    combined.includes('timeout') || 
    combined.includes('delay') || 
    combined.includes('slow') || 
    combined.includes('loading') || 
    combined.includes('지연') || 
    combined.includes('느려') || 
    combined.includes('대기') || 
    combined.includes('로딩') || 
    combined.includes('타임아웃')
  ) {
    return 'delay';
  }
  if (
    combined.includes('connection') || 
    combined.includes('network') || 
    combined.includes('http') || 
    combined.includes('fetch') || 
    combined.includes('connect') || 
    combined.includes('서버') || 
    combined.includes('네트워크') || 
    combined.includes('인터넷') || 
    combined.includes('연결') || 
    combined.includes('끊')
  ) {
    return 'network';
  }
  if (
    combined.includes('memory') || 
    combined.includes('heap') || 
    combined.includes('size') || 
    combined.includes('limit') || 
    combined.includes('oom') || 
    combined.includes('용량') || 
    combined.includes('메모리') || 
    combined.includes('무거') || 
    combined.includes('과부하') || 
    combined.includes('터')
  ) {
    return 'memory';
  }
  if (
    combined.includes('legacy') || 
    combined.includes('spaghetti') || 
    combined.includes('refactor') || 
    combined.includes('레거시') || 
    combined.includes('스파게티') || 
    combined.includes('꼬인') || 
    combined.includes('옛날')
  ) {
    return 'legacy';
  }
  return 'other';
};

interface ErrorDetoxGardenProps {
  onBack: () => void;
}

// Deep breathing states
type BreathPhase = 'idle' | 'inhale' | 'hold' | 'exhale';

export default function ErrorDetoxGarden({ onBack }: ErrorDetoxGardenProps) {
  const [errorLog, setErrorLog] = useState('');
  const [frustration, setFrustration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [detoxResult, setDetoxResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Local storage synchronized history list
  const [history, setHistory] = useState<PurifiedError[]>(() => {
    const saved = localStorage.getItem('error_detox_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse error detox history:", e);
      }
    }
    return DEFAULT_HISTORY;
  });

  useEffect(() => {
    localStorage.setItem('error_detox_history', JSON.stringify(history));
  }, [history]);

  // Grounding section tabs: 'breath' (default) or 'timer'
  const [groundTab, setGroundTab] = useState<'breath' | 'timer'>('breath');

  // Breathing Trainer state
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('idle');
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [breathCount, setBreathCount] = useState(0);

  // Ambient sound synthesizer state
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscillatorNodeRef = useRef<OscillatorNode | null>(null);
  const birdTimerRef = useRef<any>(null);

  // Meditation timer states
  const [timerDuration, setTimerDuration] = useState<number>(300); // Default to 5 minutes (300s)
  const [timerRemaining, setTimerRemaining] = useState<number>(300);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerShowComplete, setTimerShowComplete] = useState<boolean>(false);
  const timerIntervalRef = useRef<any>(null);

  // Procedural bird sound generator
  const playBirdChirp = (ctx: AudioContext, destination: AudioNode) => {
    try {
      const now = ctx.currentTime;
      // Sequence of 2 to 4 rapid, high-pitched chirp notes
      const noteCount = 2 + Math.floor(Math.random() * 3);
      let startTime = now;

      for (let i = 0; i < noteCount; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';

        // Organic bird whistle frequency range (approx. 2.8kHz to 5.2kHz)
        const baseFreq = 2800 + Math.random() * 600;
        const targetFreq = baseFreq + 1200 + Math.random() * 800;
        const duration = 0.07 + Math.random() * 0.05; // 70ms - 120ms

        osc.frequency.setValueAtTime(baseFreq, startTime);
        // Realistic bird chirp frequency sweep (fast pitch sweep up)
        osc.frequency.exponentialRampToValueAtTime(targetFreq, startTime + duration);

        // Amplitude envelope: Quick attack, fast exponential decay
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.linearRampToValueAtTime(0.015, startTime + duration * 0.15); // Clear, gentle volume
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(destination);

        osc.start(startTime);
        osc.stop(startTime + duration);

        // Gap between individual chirps inside the group (40ms - 90ms)
        startTime += duration + 0.04 + Math.random() * 0.05;
      }
    } catch (e) {
      console.error("Failed to play bird chirp:", e);
    }
  };

  // Deep breathing timer loop
  useEffect(() => {
    if (breathPhase === 'idle') return;

    const timer = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          // Switch phase
          if (breathPhase === 'inhale') {
            setBreathPhase('hold');
            return 4; // 4 seconds hold
          } else if (breathPhase === 'hold') {
            setBreathPhase('exhale');
            return 4; // 4 seconds exhale
          } else {
            setBreathPhase('inhale');
            setBreathCount(c => c + 1);
            return 4; // 4 seconds inhale
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathPhase]);

  const startBreathing = () => {
    setBreathPhase('inhale');
    setBreathSeconds(4);
    setBreathCount(0);
  };

  const stopBreathing = () => {
    setBreathPhase('idle');
  };

  // Web Audio Synthesizer: Soothing Wind & Ocean Rustle + Procedural Birds
  const isAmbientPlayingRef = useRef(false);

  const toggleAmbientSound = async () => {
    if (isAmbientPlaying) {
      isAmbientPlayingRef.current = false;
      // Stop audio
      if (oscillatorNodeRef.current) {
        try { oscillatorNodeRef.current.stop(); } catch (e) {}
        try { oscillatorNodeRef.current.disconnect(); } catch (e) {}
      }
      if (noiseNodeRef.current) {
        try { (noiseNodeRef.current as any).stop?.(); } catch (e) {}
        try { noiseNodeRef.current.disconnect(); } catch (e) {}
      }
      if (gainNodeRef.current) {
        try { gainNodeRef.current.disconnect(); } catch (e) {}
      }
      if (birdTimerRef.current) {
        clearInterval(birdTimerRef.current);
        birdTimerRef.current = null;
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try {
          await audioContextRef.current.close();
        } catch (e) {}
      }
      audioContextRef.current = null;
      setIsAmbientPlaying(false);
    } else {
      // Start synthesis of a soothing pink-noise ambient forest breeze
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        audioContextRef.current = ctx;
        isAmbientPlayingRef.current = true;

        // Generate Pink Noise (or White Noise with Lowpass Filter to sound like wind/waves)
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Pink-ish filter approximation
          output[i] = 0.12 * white + 0.85 * lastOut;
          lastOut = output[i];
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        // BiquadFilter to create rustling leaf / wind effect
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; // soft warm sound
        filter.Q.value = 1.0;

        // LFO (Low Frequency Oscillator) to modulate the filter frequency for wind gusts
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.15; // ultra slow breathing rate (0.15 Hz)
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 250; // modulate filter between 150Hz and 650Hz

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency); // modulate cutoff frequency

        // Dynamic Volume control
        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0.01, ctx.currentTime);
        mainGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 1.5); // Smooth fade-in

        // Connect nodes
        noiseSource.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);

        // Start playback
        noiseSource.start(0);
        lfo.start(0);

        // Store references
        (noiseNodeRef as any).current = noiseSource;
        (oscillatorNodeRef as any).current = lfo as any;
        gainNodeRef.current = mainGain;

        // Start Procedural Bird Chirping Loop
        setTimeout(() => {
          if (isAmbientPlayingRef.current && audioContextRef.current && audioContextRef.current.state === 'running') {
            playBirdChirp(ctx, ctx.destination);
          }
        }, 1200);

        birdTimerRef.current = setInterval(() => {
          if (isAmbientPlayingRef.current && audioContextRef.current && audioContextRef.current.state === 'running') {
            const extraDelay = Math.random() * 2500;
            setTimeout(() => {
              if (isAmbientPlayingRef.current && audioContextRef.current && audioContextRef.current.state === 'running') {
                playBirdChirp(ctx, ctx.destination);
              }
            }, extraDelay);
          }
        }, 6000);

        setIsAmbientPlaying(true);
      } catch (err) {
        console.error("Failed to initialize Web Audio Synthesizer:", err);
      }
    }
  };

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (birdTimerRef.current) {
        clearInterval(birdTimerRef.current);
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Completion sound chime using procedural Web Audio
  const playCompletionChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      // Use existing audio context if running, or spin up a quick transient one
      const ctx = audioContextRef.current || new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5 (맑고 청아한 도)
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 1.8); // 맑고 시원한 옥타브 위로 상승

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now); // E5 (싱그러운 미)

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.15); // 부드럽고 잔잔한 종소리
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 1.8);
      osc2.start(now);
      osc2.stop(now + 1.8);
    } catch (e) {
      console.error("Failed to play completion chime:", e);
    }
  };

  // Manage timer countdown
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setTimerShowComplete(true);
            playCompletionChime();
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isTimerRunning]);

  const selectTimerDuration = (minutes: number) => {
    const seconds = minutes * 60;
    setTimerDuration(seconds);
    setTimerRemaining(seconds);
    setIsTimerRunning(false);
    setTimerShowComplete(false);
  };

  const toggleTimer = () => {
    if (!isTimerRunning) {
      // Auto-start ambient sound to aid meditation
      if (!isAmbientPlaying) {
        toggleAmbientSound();
      }
      setTimerShowComplete(false);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerRemaining(timerDuration);
    setTimerShowComplete(false);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDetoxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorLog.trim() && !frustration.trim()) {
      alert('마음의 답답함이나 마주하신 에러 로그 중 하나는 입력해 주세요!');
      return;
    }

    setIsGenerating(true);
    setDetoxResult(null);
    setError(null);

    // Trigger breathing to guide them while waiting
    startBreathing();

    let finalRemedy = '';
    const errType = classifyErrorType(errorLog, frustration);
    const plantMap: Record<string, 'eucalyptus' | 'bamboo' | 'monstera' | 'ivy' | 'recommend'> = {
      delay: 'eucalyptus',
      network: 'bamboo',
      memory: 'monstera',
      legacy: 'ivy',
      other: 'recommend'
    };
    const plantType = plantMap[errType];

    try {
      const response = await fetch('/api/gemini/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorLog, frustration }),
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
        finalRemedy = data.text;
        setDetoxResult(data.text);
      } else {
        throw new Error(data.error || '응답을 받지 못했습니다.');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback response for reassuring developer if Gemini fails / no API key is set
      setError(err.message || '네트워크 상태나 API 설정을 확인해 주세요.');
      
      // Beautiful local botanical wisdom fallback
      finalRemedy = `
### 🍃 방구석 개발자를 위한 따뜻한 지혜와 위로

잠시 모니터 불빛에서 눈을 떼고 창밖을 보거나 깊게 숨을 내쉬어 보세요. 
방구석에서 홀로 버그와 외롭게 씨름하고 있지만, 지금 마주한 에러는 여러분의 코드와 실력이 한 단계 더 단단해지기 위한 자연스러운 과정입니다.

#### 🌿 지친 개발자를 위한 마음 다독임 & 처방
1. **과습을 피하듯, 마음의 과부하를 내려놓으세요:**
   - 붉은 에러 로그가 계속된다면 잠시 마음의 흐름이 막힌 것일 수 있습니다. 머릿속을 스치는 부담감을 잠시 비워두고, 문제를 작게 나누어 하나씩 차근차근 점검해 보세요.
2. **튼튼한 받침대를 세우듯 기본을 챙기세요:**
   - Unexpected Null이나 타입 에러가 난다면, 식물이 넘어지지 않도록 대를 세워주듯 옵셔널 체이닝(\`?. \`)이나 기본값(Default Value)을 세심하게 챙겨주세요.
3. **밤새운 머리에는 짧은 휴식이 최고의 백신입니다:**
   - 풀리지 않던 난제도 15분의 가벼운 스트레칭이나 물 한 잔을 마시고 돌아오면 거짓말처럼 시원하게 풀리곤 합니다.

> "모니터 앞에서의 수많은 시행착오는 결코 헛되지 않습니다. 밤새 고군분투하는 여러분의 노력을 진심으로 응원합니다."
      `;
      setDetoxResult(finalRemedy);
    } finally {
      setIsGenerating(false);

      // Create and record a new purified log
      const newPurified: PurifiedError = {
        id: 'purified-' + Date.now(),
        timestamp: new Date().toISOString(),
        errorLog: errorLog || '입력한 에러 로그 없음',
        frustration: frustration || '입력한 마음 내용 없음',
        errorType: errType,
        plantType: plantType,
        remedy: finalRemedy
      };
      setHistory(prev => [newPurified, ...prev]);
    }
  };

  const getBreathPhraseLabel = () => {
    switch (breathPhase) {
      case 'inhale': return '들이마시기 (Inhale)...';
      case 'hold': return '잠시 멈추기 (Hold)...';
      case 'exhale': return '천천히 내쉬기 (Exhale)...';
      default: return '마음 가다듬기';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-4 animate-fade-in" id="error-detox-root">
      {/* Header Back Link */}
      <div className="flex items-center justify-between border-b border-emerald-100/60 pb-4" id="detox-header-nav">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>원래 대시보드로 돌아가기</span>
        </button>
      </div>

      {/* 묘목 성장 시각화 가든 */}
      <GardenSeedlingVisual purifiedCount={history.length} />

      {/* Main Grid: Input and Breathing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="detox-main-layout">
        
        {/* Left Column: Form Input */}
        <div className="lg:col-span-7 space-y-6" id="detox-form-section">
          <div className="bg-[#FAF9F5] border border-emerald-100/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 relative overflow-hidden">
            {/* Soft decorative background leaf */}
            <div className="absolute right-0 bottom-0 opacity-[0.06] w-48 h-48 pointer-events-none">
              <img src={leafDecor} alt="decor" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>

            <div className="space-y-1 relative z-10">
              <div className="inline-flex items-center space-x-1.5 text-emerald-800">
                <Sprout className="w-4 h-4 text-emerald-600" />
                <span className="text-3xs font-bold font-mono tracking-wider">방구석 개발자를 위한 맞춤 처방전</span>
              </div>
              <h2 className="text-xl font-bold text-emerald-950 font-display">
                모니터 앞 지친 마음을 위한 에러 쉼터
              </h2>
              <p className="text-3xs text-emerald-700/80 leading-relaxed font-medium">
                밤새 나를 고생시켰던 에러 메시지나 마음속 답답함을 편하게 남겨주세요. 
                자연의 소리와 함께 지친 마음을 비워내고, 따뜻한 위로와 문제 해결의 힌트가 담긴 처방전을 전해드립니다.
              </p>
            </div>

            <form onSubmit={handleDetoxSubmit} className="space-y-4 pt-2 relative z-10">
              {/* Error Log textarea */}
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                  나를 밤새우게 한 에러 메시지나 코드
                </label>
                <textarea
                  value={errorLog}
                  onChange={(e) => setErrorLog(e.target.value)}
                  placeholder="예: NullPointerException, OutOfMemoryError, 혹은 해결되지 않는 통신 타임아웃 로그를 편하게 붙여넣어 주세요..."
                  className="w-full h-32 p-3 text-xs bg-white/70 border border-emerald-100 rounded-xl focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 transition-all font-mono placeholder:text-emerald-900/30"
                />
              </div>

              {/* Frustration / Complaint textarea */}
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                  지금 느끼는 답답함이나 솔직한 마음
                </label>
                <input
                  type="text"
                  value={frustration}
                  onChange={(e) => setFrustration(e.target.value)}
                  placeholder="예: 몇 시간째 붉은 에러 줄과 싸우고 있어서 머리가 지치고 가슴이 답답해요..."
                  className="w-full px-3.5 py-3 text-xs bg-white/70 border border-emerald-100 rounded-xl focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 transition-all placeholder:text-emerald-900/30 font-medium"
                />
              </div>

              {/* Audio controller and submit buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={toggleAmbientSound}
                  className={`inline-flex items-center space-x-2 px-3 py-2 rounded-xl text-3xs font-semibold border transition-all cursor-pointer ${
                    isAmbientPlaying
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                      : 'bg-white text-emerald-800 border-emerald-100 hover:bg-emerald-50/50'
                  }`}
                >
                  {isAmbientPlaying ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 animate-bounce" />
                      <span>자연의 소리 끄기</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>자연의 소리 켜기</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="inline-flex items-center space-x-2 bg-emerald-900 text-white hover:bg-emerald-950 disabled:bg-emerald-300 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>에러를 다독이며 처방전을 만드는 중...</span>
                    </>
                  ) : (
                    <>
                      <span>에러 털어내고 처방전 받기</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Breathing Grounding space or Meditation Timer */}
        <div className="lg:col-span-5 space-y-6" id="detox-breath-section">
          <div className="bg-white border border-emerald-100/80 rounded-3xl p-6 shadow-sm flex flex-col min-h-[420px] relative overflow-hidden">
            
            {/* Soft background glow decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/40 rounded-full blur-2xl pointer-events-none" />

            {/* Grounding Tab Buttons */}
            <div className="flex border-b border-emerald-100/60 pb-3 mb-5 w-full">
              <button
                type="button"
                onClick={() => setGroundTab('breath')}
                className={`flex-1 text-center pb-2 text-2xs font-extrabold transition-all cursor-pointer border-b-2 ${
                  groundTab === 'breath'
                    ? 'border-emerald-600 text-emerald-950'
                    : 'border-transparent text-emerald-800/40 hover:text-emerald-950/80'
                }`}
              >
                🌬️ 마음 호흡기
              </button>
              <button
                type="button"
                onClick={() => setGroundTab('timer')}
                className={`flex-1 text-center pb-2 text-2xs font-extrabold transition-all cursor-pointer border-b-2 ${
                  groundTab === 'timer'
                    ? 'border-emerald-600 text-emerald-950'
                    : 'border-transparent text-emerald-800/40 hover:text-emerald-950/80'
                }`}
              >
                ⏳ 몰입 명상 타이머
              </button>
            </div>

            {groundTab === 'breath' ? (
              <div className="flex-1 flex flex-col items-center justify-between space-y-4">
                <div className="text-center space-y-1 w-full">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 block uppercase tracking-wider">
                    Breathing & Grounding
                  </span>
                  <h3 className="text-xs font-bold text-emerald-950">마음 가라앉히기 호흡기</h3>
                  <p className="text-3xs text-gray-400 max-w-xs mx-auto">
                    잠시 화면에서 시선을 돌려, 원의 수축과 팽창 리듬에 맞춰 4초간 함께 호흡해 보세요. 심박수가 차분해질 것입니다.
                  </p>
                </div>

                {/* Breathing circles */}
                <div className="relative flex items-center justify-center my-4 h-40 w-40" id="breathing-circle-container">
                  {/* Outer pulsing ring */}
                  <AnimatePresence>
                    {breathPhase !== 'idle' && (
                      <motion.div
                        animate={{
                          scale: breathPhase === 'inhale' ? [1, 1.45] : breathPhase === 'hold' ? 1.45 : [1.45, 1],
                          opacity: breathPhase === 'inhale' ? [0.15, 0.4] : breathPhase === 'hold' ? 0.4 : [0.4, 0.15]
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

                  {/* Core interactive circle */}
                  <motion.div
                    animate={{
                      scale: breathPhase === 'inhale' ? 1.35 : breathPhase === 'hold' ? 1.35 : breathPhase === 'exhale' ? 1 : 1
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className={`w-24 h-24 rounded-full flex flex-col items-center justify-center text-center shadow-md relative z-10 transition-colors duration-500 ${
                      breathPhase === 'inhale'
                        ? 'bg-emerald-600 text-white'
                        : breathPhase === 'hold'
                        ? 'bg-teal-600 text-white'
                        : breathPhase === 'exhale'
                        ? 'bg-emerald-800 text-white'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    }`}
                  >
                    {breathPhase === 'idle' ? (
                      <Heart className="w-6 h-6 text-emerald-600 animate-pulse" />
                    ) : (
                      <span className="text-sm font-extrabold font-mono">{breathSeconds}</span>
                    )}
                  </motion.div>
                </div>

                {/* Controller */}
                <div className="text-center w-full space-y-3">
                  <span className="text-2xs font-bold text-emerald-950 block h-4">
                    {getBreathPhraseLabel()}
                  </span>

                  {breathPhase === 'idle' ? (
                    <button
                      type="button"
                      onClick={startBreathing}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-3xs font-semibold rounded-xl border border-emerald-200 transition-all cursor-pointer inline-flex items-center space-x-1.5 mx-auto"
                    >
                      <Wind className="w-3.5 h-3.5" />
                      <span>호흡 가이드 시작하기</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-3xs text-gray-400 font-mono block">완료한 호흡 주기: {breathCount}회</span>
                      <button
                        type="button"
                        onClick={stopBreathing}
                        className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-3xs font-semibold rounded-xl border border-red-200 transition-all cursor-pointer mx-auto"
                      >
                        호흡 정지
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-between space-y-4">
                <div className="text-center space-y-1 w-full">
                  <span className="text-[10px] font-mono font-bold text-emerald-600 block uppercase tracking-wider">
                    Serenity Timer
                  </span>
                  <h3 className="text-xs font-bold text-emerald-950">몰입형 명상 타이머</h3>
                  <p className="text-3xs text-gray-400 max-w-xs mx-auto">
                    눈을 감고 숲의 소리에 귀를 기울여 보세요. 선택한 명상 시간 동안 머릿속의 복잡한 잔상을 깨끗이 흘려보냅니다.
                  </p>
                </div>

                {/* Progress Circle Visualizer */}
                <div className="relative flex items-center justify-center my-3 h-40 w-40">
                  {/* Glowing halo */}
                  {isTimerRunning && (
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.1, 0.25, 0.1]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute inset-2 rounded-full bg-emerald-100 blur-md"
                    />
                  )}

                  {/* SVG progress circle */}
                  <svg className="w-36 h-36 transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="54"
                      className="stroke-emerald-50/80"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r="54"
                      className="stroke-emerald-600"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray={339.29} // 2 * Math.PI * 54
                      animate={{
                        strokeDashoffset: 339.29 * (1 - (timerRemaining / timerDuration))
                      }}
                      transition={{ duration: 1, ease: "linear" }}
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Timer display */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                    <span className="text-lg font-extrabold font-mono text-emerald-950 tracking-tight">
                      {formatTime(timerRemaining)}
                    </span>
                    <span className="text-[8px] text-emerald-600 font-semibold font-mono tracking-wider">
                      {isTimerRunning ? 'MEDITATING' : 'PAUSED'}
                    </span>
                  </div>
                </div>

                {/* Duration select controls or complete state */}
                <div className="w-full text-center space-y-4">
                  {timerShowComplete ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-3 bg-emerald-50 border border-emerald-100 rounded-2xl max-w-xs mx-auto"
                    >
                      <span className="text-2xs font-extrabold text-emerald-950 block">✨ 명상 완료!</span>
                      <span className="text-4xs text-emerald-800 leading-relaxed block mt-1">
                        명상 시간이 온전히 끝났습니다. 머릿속이 더 가볍고 편안해지셨기를 바랍니다.
                      </span>
                    </motion.div>
                  ) : (
                    /* Preset selectors */
                    <div className="flex items-center justify-center space-x-1.5">
                      {[5, 10, 15].map((mins) => (
                        <button
                          key={mins}
                          type="button"
                          onClick={() => selectTimerDuration(mins)}
                          className={`px-3 py-1.5 rounded-lg text-4xs font-bold font-mono transition-all border cursor-pointer ${
                            timerDuration === mins * 60
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-3xs'
                              : 'bg-emerald-50/50 text-emerald-900/60 border-emerald-100 hover:bg-emerald-50 hover:text-emerald-950'
                          }`}
                        >
                          {mins}분
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Play/Pause/Reset action control */}
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      type="button"
                      onClick={toggleTimer}
                      className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-3xs font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center space-x-1.5"
                    >
                      {isTimerRunning ? (
                        <>
                          <Pause className="w-3 h-3" />
                          <span>잠시 멈춤</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-emerald-300 fill-emerald-300" />
                          <span>명상 시작</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={resetTimer}
                      title="타이머 초기화"
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-100 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Panel: Mind Refreshing Remedy */}
      <AnimatePresence>
        {detoxResult && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="bg-[#FCFBF7] border border-emerald-100/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6"
            id="detox-remedy-result"
          >
            <div className="flex items-center justify-between border-b border-emerald-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <Smile className="w-5 h-5 text-emerald-700" />
                <h3 className="text-xs font-bold text-emerald-950 font-display">개발자를 위한 마음 처방전</h3>
              </div>

              <button
                onClick={() => {
                  setErrorLog('');
                  setFrustration('');
                  setDetoxResult(null);
                  stopBreathing();
                }}
                className="inline-flex items-center space-x-1 text-3xs text-emerald-800 hover:text-emerald-950 underline font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>새로운 에러 털어내기</span>
              </button>
            </div>

            {/* Error prescription markdown body */}
            <div className="prose prose-emerald max-w-none text-xs text-emerald-950/80 leading-relaxed space-y-4">
              {detoxResult.split('\n').map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith('###')) {
                  return <h4 key={idx} className="text-xs font-bold text-emerald-950 mt-4 border-l-2 border-emerald-500 pl-2">{trimmed.replace('###', '')}</h4>;
                }
                if (trimmed.startsWith('####')) {
                  return <h5 key={idx} className="text-[11px] font-bold text-emerald-900 mt-3">{trimmed.replace('####', '')}</h5>;
                }
                if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                  return <li key={idx} className="ml-4 list-disc my-1">{trimmed.substring(1).trim()}</li>;
                }
                if (trimmed.startsWith('>') || trimmed.startsWith('\"')) {
                  return <blockquote key={idx} className="italic text-emerald-800 pl-4 border-l-4 border-emerald-200 py-1 my-2 bg-emerald-50/30 rounded-r-lg">{trimmed.replace(/[>"\\]/g, '')}</blockquote>;
                }
                if (trimmed.startsWith('1.') || trimmed.startsWith('2.') || trimmed.startsWith('3.')) {
                  return <p key={idx} className="font-medium text-emerald-950 mt-2">{trimmed}</p>;
                }
                return trimmed ? <p key={idx}>{trimmed}</p> : <div key={idx} className="h-2" />;
              })}
            </div>

            <div className="pt-4 border-t border-emerald-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-emerald-800">
              <span className="text-3xs font-mono">가드너의 한 줄 생각: "모든 훌륭한 아키텍처는 풍파를 견디며 단단해진 거목을 닮았습니다."</span>
              <button
                onClick={onBack}
                className="px-4 py-2 bg-emerald-900 hover:bg-emerald-950 text-white text-3xs font-bold rounded-xl shadow-xs cursor-pointer text-center"
              >
                환기 완료! 브레인스토밍 계속하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Detox Statistics & Activity History Dashboard */}
      <DetoxDashboard 
        history={history} 
        onClearHistory={() => setHistory(DEFAULT_HISTORY)} 
      />
    </div>
  );
}
