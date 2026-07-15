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
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import the generated botanical image safely
import leafDecor from '../assets/images/botanical_leaf_decor_1784084589115.jpg';

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

  // Web Audio Synthesizer: Soothing Wind & Ocean Rustle
  const toggleAmbientSound = () => {
    if (isAmbientPlaying) {
      // Stop audio
      if (oscillatorNodeRef.current) {
        try { oscillatorNodeRef.current.stop(); } catch (e) {}
      }
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
      setIsAmbientPlaying(false);
    } else {
      // Start synthesis of a soothing pink-noise ambient forest breeze
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

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
        mainGain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2.0); // Smooth fade-in

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
    };
  }, []);

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

    try {
      const response = await fetch('/api/gemini/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errorLog, frustration }),
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setDetoxResult(data.text);
      } else {
        throw new Error(data.error || '응답을 받지 못했습니다.');
      }
    } catch (err: any) {
      console.error(err);
      // Fallback response for reassuring developer if Gemini fails / no API key is set
      setError(err.message || '네트워크 상태나 API 설정을 확인해 주세요.');
      
      // Beautiful local botanical wisdom fallback
      setDetoxResult(`
### 🍃 숲길에서 전하는 작은 지혜와 위로

잠시 에러 로그에서 고개를 들어 창밖을 보시거나, 깊고 푸른 숲속의 바람을 상상해 보세요. 
지금 마주하신 에러는 시스템이 더 건강하게 자라기 위해 분갈이를 요청하는 신호와 같습니다.

#### 🌿 마주하신 에러에 대한 가드너의 조언 (자체 환기 처방)
1. **과습을 피하듯, 과부하를 줄이세요:**
   - 만약 타임아웃이나 대기 병목이라면, 데이터 스트림의 흐름(Flow)이 정체된 것일 수 있습니다. CQRS 비동기 구조나 버퍼링을 도입해 식물에게 물을 조금씩 나누어 주듯 트래픽을 분할해 보세요.
2. **단단한 지지대를 세우세요:**
   - NullPointer나 예외가 터졌다면, 식물이 쓰러지지 않도록 대를 세우듯 \`Optional\`이나 기본값을 꼼꼼히 배치해 아키텍처에 든든한 뼈대를 얹어줄 때입니다.
3. **잠시 휴식을 주는 햇살을 쬐어주세요:**
   - 숲의 생물들은 밤새 조용히 숨 쉬며 성장을 준비합니다. 해결되지 않는 복잡한 아키텍처 난제는 30분간의 정원 산책이나 스트레칭 이후에 거짓말처럼 풀리곤 합니다.

> "코드의 덤불 속에서도 싱그러운 새싹은 언제나 돋아납니다. 오늘도 묵묵히 흙을 일구는 당신의 수고에 감사드립니다."
      `);
    } finally {
      setIsGenerating(false);
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
          <span>워크시트 대시보드로 돌아가기</span>
        </button>

        <div className="inline-flex items-center space-x-2">
          <span className="text-4xs font-bold font-mono px-2 py-1 bg-emerald-100 text-emerald-950 rounded-full">
            DETOX GARDEN
          </span>
        </div>
      </div>

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
                <span className="text-3xs font-bold font-mono tracking-wider">OFFLINE & ONLINE MINDFUL DEBUGGING</span>
              </div>
              <h2 className="text-xl font-bold text-emerald-950 font-display">
                초록빛 에러 디톡스 가든 쉼터
              </h2>
              <p className="text-3xs text-emerald-700/80 leading-relaxed font-medium">
                지긋지긋한 서버 컴파일 에러, 메모리 릭, 혹은 답답한 만성 장애 로그를 아래에 적어주세요. 
                싱그러운 바람 소리와 함께 마음을 환기하고 자연의 비유와 디버깅 지혜를 담은 따뜻한 처방전을 전해드립니다.
              </p>
            </div>

            <form onSubmit={handleDetoxSubmit} className="space-y-4 pt-2 relative z-10">
              {/* Error Log textarea */}
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                  나를 괴롭히는 에러 로그 / 컴파일 메시지
                </label>
                <textarea
                  value={errorLog}
                  onChange={(e) => setErrorLog(e.target.value)}
                  placeholder="예: NullPointerException, OutOfMemoryError, 혹은 해결되지 않는 통신 타임아웃 로그를 붙여넣어 주세요..."
                  className="w-full h-32 p-3 text-xs bg-white/70 border border-emerald-100 rounded-xl focus:border-emerald-300 focus:ring-1 focus:ring-emerald-300 transition-all font-mono placeholder:text-emerald-900/30"
                />
              </div>

              {/* Frustration / Complaint textarea */}
              <div className="space-y-1.5">
                <label className="block text-3xs font-bold text-emerald-800 uppercase tracking-wider font-mono">
                  지금 마주하신 지치고 답답한 심정 한마디
                </label>
                <input
                  type="text"
                  value={frustration}
                  onChange={(e) => setFrustration(e.target.value)}
                  placeholder="예: 오늘 배포해야 하는데 3시간째 머리가 아프고 힘듭니다."
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
                      <span>자연의 소리 끄기 (Ambient ON)</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>자연의 소리 켜기 (Ambient OFF)</span>
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
                      <span>초록빛 조언 피워내는 중...</span>
                    </>
                  ) : (
                    <>
                      <span>마음 정화 및 조언 받기</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Breathing Grounding space */}
        <div className="lg:col-span-5 space-y-6" id="detox-breath-section">
          <div className="bg-white border border-emerald-100/80 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-between min-h-[380px] relative overflow-hidden">
            
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
            <div className="relative flex items-center justify-center my-6 h-40 w-40" id="breathing-circle-container">
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
              <span className="text-2xs font-bold text-emerald-950 block">
                {getBreathPhraseLabel()}
              </span>

              {breathPhase === 'idle' ? (
                <button
                  onClick={startBreathing}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-3xs font-semibold rounded-xl border border-emerald-200 transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  <Wind className="w-3.5 h-3.5" />
                  <span>호흡 가이드 시작하기</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <span className="text-3xs text-gray-400 font-mono block">완료한 호흡 주기: {breathCount}회</span>
                  <button
                    onClick={stopBreathing}
                    className="px-4 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-3xs font-semibold rounded-xl border border-red-200 transition-all cursor-pointer"
                  >
                    호흡 정지
                  </button>
                </div>
              )}
            </div>
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
                <h3 className="text-xs font-bold text-emerald-950 font-display">초록빛 가드너의 디톡스 처방전</h3>
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
                <span>새 에러 환기하기</span>
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
    </div>
  );
}
