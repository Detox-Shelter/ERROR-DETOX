import React, { useState, useEffect } from 'react';
import { Sprout, Sparkles, Droplets, Award, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GardenSeedlingVisualProps {
  purifiedCount: number;
}

interface StageDetail {
  level: number;
  name: string;
  desc: string;
  rangeText: string;
  emoji: string;
  themeColor: string;
}

const STAGES: StageDetail[] = [
  {
    level: 1,
    name: '흙 속의 에러 씨앗 🫘',
    desc: '아직은 조용하지만, 버그를 정화할 준비가 된 잠재력 가득한 씨앗 상태입니다.',
    rangeText: '0 ~ 1회 정화',
    emoji: '🫘',
    themeColor: '#b45309' // amber-700
  },
  {
    level: 2,
    name: '아기 연둣빛 새싹 🌱',
    desc: '지친 마음을 비워내고 마주한 에러들이 촉촉한 밑거름이 되어 새싹이 틔었습니다!',
    rangeText: '2 ~ 3회 정화',
    emoji: '🌱',
    themeColor: '#10b981' // emerald-500
  },
  {
    level: 3,
    name: '싱그러운 가든 묘목 🪴',
    desc: '점차 잎사귀가 넓어지며 햇살을 받기 시작한 튼튼하고 어린 묘목입니다.',
    rangeText: '4 ~ 5회 정화',
    emoji: '🪴',
    themeColor: '#059669' // emerald-600
  },
  {
    level: 4,
    name: '꽃봉오리 머금은 나무 🌿',
    desc: '시스템이 한층 더 유연해지고, 아름다운 꽃을 피우기 위해 꽃봉오리가 맺혔습니다.',
    rangeText: '6 ~ 7회 정화',
    emoji: '🌿',
    themeColor: '#047857' // emerald-700
  },
  {
    level: 5,
    name: '찬란히 만개한 디톡스 거목 🌳✨',
    desc: '모든 역경과 버그를 슬기롭게 승화시켜 깊고 푸르른 그늘과 만개한 꽃 향기를 퍼뜨리는 거목입니다!',
    rangeText: '8회 이상 정화',
    emoji: '🌳',
    themeColor: '#065f46' // emerald-800
  }
];

export default function GardenSeedlingVisual({ purifiedCount }: GardenSeedlingVisualProps) {
  const [isWatering, setIsWatering] = useState(false);
  const [rustleCount, setRustleCount] = useState(0);
  const [showStageGuide, setShowStageGuide] = useState(false);

  // Determine current growth stage index
  const getStageIndex = (count: number): number => {
    if (count <= 1) return 0;
    if (count <= 3) return 1;
    if (count <= 5) return 2;
    if (count <= 7) return 3;
    return 4;
  };

  const currentStageIndex = getStageIndex(purifiedCount);
  const currentStage = STAGES[currentStageIndex];

  // Calculate percentage of progress to the next milestone
  const getProgressToNext = () => {
    if (purifiedCount <= 1) return { percent: (purifiedCount / 2) * 100, remaining: 2 - purifiedCount, nextStage: '새싹 🌱' };
    if (purifiedCount <= 3) return { percent: ((purifiedCount - 2) / 2) * 100, remaining: 4 - purifiedCount, nextStage: '묘목 🪴' };
    if (purifiedCount <= 5) return { percent: ((purifiedCount - 4) / 2) * 100, remaining: 6 - purifiedCount, nextStage: '꽃봉오리 🌿' };
    if (purifiedCount <= 7) return { percent: ((purifiedCount - 6) / 2) * 100, remaining: 8 - purifiedCount, nextStage: '찬란한 거목 🌳' };
    return { percent: 100, remaining: 0, nextStage: '최고 단계 도달 🎉' };
  };

  const progress = getProgressToNext();

  // Water the plant animation trigger
  const triggerWatering = () => {
    if (isWatering) return;
    setIsWatering(true);
    setTimeout(() => {
      setIsWatering(false);
    }, 2500);
  };

  // Rustle leaves on click
  const triggerRustle = () => {
    setRustleCount(prev => prev + 1);
  };

  return (
    <div className="bg-gradient-to-br from-[#FCFBF7] to-[#FAF9F5] border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden" id="garden-seedling-visual-card">
      {/* Dynamic inline styles for premium growth keyframes */}
      <style>{`
        @keyframes plant-sway {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(2deg); }
        }
        @keyframes leaf-sway-left {
          0%, 100% { transform: rotate(-35deg) scale(1); }
          50% { transform: rotate(-38deg) scale(1.05); }
        }
        @keyframes leaf-sway-right {
          0%, 100% { transform: rotate(35deg) scale(1); }
          50% { transform: rotate(38deg) scale(1.05); }
        }
        @keyframes sparkle-float {
          0% { transform: translateY(10px) scale(0); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
        }
        @keyframes water-drop {
          0% { transform: translateY(-20px) scale(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 0.8; }
          100% { transform: translateY(90px) scale(0.6); opacity: 0; }
        }
        @keyframes plant-shake {
          0%, 100% { transform: scale(1) rotate(0); }
          20% { transform: scale(1.05) rotate(-3deg); }
          40% { transform: scale(0.98) rotate(3deg); }
          60% { transform: scale(1.02) rotate(-2deg); }
          80% { transform: scale(1) rotate(1deg); }
        }
        .animate-plant-sway {
          animation: plant-sway 4s ease-in-out infinite;
          transform-origin: bottom center;
        }
        .animate-leaf-left {
          animation: leaf-sway-left 3.5s ease-in-out infinite;
          transform-origin: bottom right;
        }
        .animate-leaf-right {
          animation: leaf-sway-right 3.2s ease-in-out infinite;
          transform-origin: bottom left;
        }
        .animate-sparkle {
          animation: sparkle-float 2.5s ease-in-out infinite;
        }
        .animate-water {
          animation: water-drop 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-plant-shake {
          animation: plant-shake 0.6s ease-in-out;
        }
      `}</style>

      {/* Background Decorative Rings */}
      <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-100/10 rounded-full pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-36 h-36 bg-emerald-50/20 rounded-full pointer-events-none" />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left Side: The Interactive Plant Canvas */}
        <div className="md:col-span-5 flex flex-col items-center justify-center bg-white/50 border border-emerald-50 rounded-2xl p-6 h-72 relative">
          <div className="absolute top-2 left-2 flex items-center space-x-1.5 bg-emerald-50/60 px-2.5 py-1 rounded-lg text-[9px] font-bold text-emerald-800">
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>정화 지수: {purifiedCount} LEVEL</span>
          </div>

          {/* Interactive instruction hint */}
          <div className="absolute bottom-2 text-center">
            <span className="text-[9px] text-emerald-800/40 font-semibold block">
              묘목을 클릭하여 싱그러운 풀잎 소리를 깨워보세요
            </span>
          </div>

          {/* Sparkles / Magic Pollen drifting up (Increases with stage) */}
          {currentStageIndex >= 1 && (
            <div className="absolute inset-x-0 top-6 bottom-24 pointer-events-none overflow-hidden">
              {Array.from({ length: currentStageIndex * 3 + 2 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-sparkle bg-emerald-300 rounded-full"
                  style={{
                    width: `${Math.random() * 3 + 1.5}px`,
                    height: `${Math.random() * 3 + 1.5}px`,
                    left: `${20 + Math.random() * 60}%`,
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${2 + Math.random() * 1.5}s`
                  }}
                />
              ))}
            </div>
          )}

          {/* Rain / Water Droplets showering down when watering */}
          {isWatering && (
            <div className="absolute inset-x-0 top-0 bottom-24 pointer-events-none overflow-hidden z-20">
              {Array.from({ length: 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-water bg-sky-300 rounded-full"
                  style={{
                    width: '3.5px',
                    height: '8px',
                    left: `${15 + Math.random() * 70}%`,
                    top: `0px`,
                    animationDelay: `${i * 0.08}s`,
                    opacity: 0.8
                  }}
                />
              ))}
            </div>
          )}

          {/* The Plant Container & Plant elements */}
          <div 
            onClick={triggerRustle}
            className={`relative flex flex-col items-center justify-end w-44 h-48 cursor-pointer select-none transition-transform duration-300 active:scale-95 ${
              rustleCount > 0 ? 'animate-plant-shake' : ''
            }`}
            key={rustleCount} // re-mount to trigger shake animation on clicks
          >
            
            {/* ============================================================ */}
            {/* CSS BASED GROWING BOTANICAL STAGES */}
            {/* ============================================================ */}

            {/* STAGE 1: Seed in the Soil */}
            {currentStageIndex === 0 && (
              <div className="absolute bottom-11 flex flex-col items-center">
                {/* Microscopic sprout sprout head */}
                {purifiedCount === 1 && (
                  <div className="w-1.5 h-3 bg-emerald-500 rounded-full origin-bottom animate-pulse mb-0.5" />
                )}
                {/* Seed */}
                <div className="w-4 h-3 bg-amber-800 rounded-full border border-amber-950 relative flex items-center justify-center shadow-3xs">
                  <div className="w-1.5 h-0.5 bg-yellow-200 rounded-full absolute top-0.5" />
                </div>
              </div>
            )}

            {/* STAGE 2: Simple Sprout */}
            {currentStageIndex === 1 && (
              <div className="absolute bottom-11 flex flex-col items-center origin-bottom animate-plant-sway">
                {/* Mini Leaves */}
                <div className="flex justify-between w-8 relative -bottom-2 z-10">
                  <div className="w-4 h-2.5 bg-emerald-400 rounded-full transform rotate-[-25deg] origin-bottom-right" />
                  <div className="w-4 h-2.5 bg-emerald-500 rounded-full transform rotate-[25deg] origin-bottom-left" />
                </div>
                {/* Curved Stem */}
                <div className="w-1.5 h-10 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-full" />
              </div>
            )}

            {/* STAGE 3: Young Seedling with Leaves */}
            {currentStageIndex === 2 && (
              <div className="absolute bottom-11 flex flex-col items-center origin-bottom animate-plant-sway">
                {/* Leaves Branch Layer 2 (Top) */}
                <div className="flex justify-between w-10 relative -bottom-1.5 z-10">
                  <div className="w-5 h-3 bg-emerald-400 rounded-full transform rotate-[-30deg] origin-bottom-right shadow-3xs" />
                  <div className="w-5 h-3 bg-emerald-500 rounded-full transform rotate-[30deg] origin-bottom-left shadow-3xs" />
                </div>

                {/* Leaves Branch Layer 1 (Middle) */}
                <div className="flex justify-between w-14 relative -bottom-3.5 z-10">
                  <div className="w-6 h-3 bg-emerald-500 rounded-full transform rotate-[-15deg] origin-bottom-right shadow-3xs" />
                  <div className="w-6 h-3 bg-emerald-600 rounded-full transform rotate-[15deg] origin-bottom-left shadow-3xs" />
                </div>

                {/* Mid-sized Stem */}
                <div className="w-2.5 h-16 bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-full shadow-2xs" />
              </div>
            )}

            {/* STAGE 4: Budding Plant */}
            {currentStageIndex === 3 && (
              <div className="absolute bottom-11 flex flex-col items-center origin-bottom animate-plant-sway">
                
                {/* Pink Flower Bud at the center top */}
                <div className="w-3.5 h-4 bg-pink-400 border border-pink-500 rounded-full absolute -top-3.5 animate-pulse flex items-center justify-center">
                  <div className="w-1.5 h-2 bg-yellow-300 rounded-full absolute" />
                </div>

                {/* Leaves Layer 3 (Top) */}
                <div className="flex justify-between w-12 relative -bottom-1.5 z-10">
                  <div className="w-6 h-3.5 bg-emerald-400 rounded-full transform rotate-[-35deg] origin-bottom-right shadow-3xs" />
                  <div className="w-6 h-3.5 bg-emerald-500 rounded-full transform rotate-[35deg] origin-bottom-left shadow-3xs" />
                </div>

                {/* Leaves Layer 2 (Middle) */}
                <div className="flex justify-between w-18 relative -bottom-4 z-10">
                  <div className="w-8 h-4 bg-emerald-500 rounded-full transform rotate-[-20deg] origin-bottom-right shadow-3xs" />
                  <div className="w-8 h-4 bg-emerald-600 rounded-full transform rotate-[20deg] origin-bottom-left shadow-3xs" />
                </div>

                {/* Leaves Layer 1 (Bottom branch) */}
                <div className="flex justify-between w-20 relative -bottom-7.5 z-10">
                  <div className="w-8 h-4 bg-emerald-600 rounded-full transform rotate-[-10deg] origin-bottom-right shadow-3xs" />
                  <div className="w-8 h-4 bg-emerald-700 rounded-full transform rotate-[10deg] origin-bottom-left shadow-3xs" />
                </div>

                {/* Healthy Branching Stem */}
                <div className="w-3.5 h-22 bg-gradient-to-t from-emerald-800 to-emerald-500 rounded-full shadow-2xs" />
              </div>
            )}

            {/* STAGE 5: Mighty Blossomed Detox Tree */}
            {currentStageIndex === 4 && (
              <div className="absolute bottom-11 flex flex-col items-center origin-bottom animate-plant-sway">
                
                {/* Multiple Blooming Flowers with glowing central pistils */}
                <div className="absolute -top-7 flex space-x-5 z-20">
                  {/* Left Flower */}
                  <div className="relative w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center shadow-3xs animate-pulse">
                    <div className="absolute w-2.5 h-2.5 bg-pink-400 rounded-full" />
                    <div className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-ping" />
                    {/* Petals */}
                    <div className="absolute -top-1 w-2 h-2 bg-pink-200 rounded-full" />
                    <div className="absolute -bottom-1 w-2 h-2 bg-pink-200 rounded-full" />
                    <div className="absolute -left-1 w-2 h-2 bg-pink-200 rounded-full" />
                    <div className="absolute -right-1 w-2 h-2 bg-pink-200 rounded-full" />
                  </div>

                  {/* Center Star Blooming Flower */}
                  <div className="relative w-6 h-6 bg-yellow-50 rounded-full flex items-center justify-center shadow-2xs">
                    <div className="absolute w-3 h-3 bg-pink-400 rounded-full" />
                    <div className="absolute w-1.5 h-1.5 bg-yellow-300 rounded-full" />
                    {/* Petals */}
                    <div className="absolute -top-1 w-2.5 h-2.5 bg-pink-200 rounded-full" />
                    <div className="absolute -bottom-1 w-2.5 h-2.5 bg-pink-200 rounded-full" />
                    <div className="absolute -left-1 w-2.5 h-2.5 bg-pink-200 rounded-full" />
                    <div className="absolute -right-1 w-2.5 h-2.5 bg-pink-200 rounded-full" />
                  </div>

                  {/* Right Flower */}
                  <div className="relative w-5 h-5 bg-pink-100 rounded-full flex items-center justify-center shadow-3xs animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <div className="absolute w-2.5 h-2.5 bg-pink-400 rounded-full" />
                    <div className="absolute w-1 h-1 bg-yellow-300 rounded-full" />
                    {/* Petals */}
                    <div className="absolute -top-1 w-2 h-2 bg-pink-200 rounded-full" />
                    <div className="absolute -bottom-1 w-2 h-2 bg-pink-200 rounded-full" />
                    <div className="absolute -left-1 w-2 h-2 bg-pink-200 rounded-full" />
                    <div className="absolute -right-1 w-2 h-2 bg-pink-200 rounded-full" />
                  </div>
                </div>

                {/* Dense Foliage (Deep and light green leaves clusters) */}
                <div className="flex justify-between w-14 relative -bottom-1 z-10">
                  <div className="w-7 h-4 bg-emerald-400 rounded-full transform rotate-[-40deg] origin-bottom-right shadow-3xs" />
                  <div className="w-7 h-4 bg-emerald-500 rounded-full transform rotate-[40deg] origin-bottom-left shadow-3xs" />
                </div>

                <div className="flex justify-between w-22 relative -bottom-3 z-10">
                  <div className="w-9 h-5 bg-emerald-500 rounded-full transform rotate-[-25deg] origin-bottom-right shadow-3xs" />
                  <div className="w-9 h-5 bg-emerald-600 rounded-full transform rotate-[25deg] origin-bottom-left shadow-3xs" />
                </div>

                <div className="flex justify-between w-26 relative -bottom-5.5 z-10">
                  <div className="w-10 h-5 bg-emerald-600 rounded-full transform rotate-[-12deg] origin-bottom-right shadow-3xs" />
                  <div className="w-10 h-5 bg-emerald-700 rounded-full transform rotate-[12deg] origin-bottom-left shadow-3xs" />
                </div>

                {/* Sturdy Trunk */}
                <div className="w-5 h-24 bg-gradient-to-t from-emerald-900 to-emerald-600 rounded-b-md rounded-t-xl shadow-xs relative">
                  {/* Bark textures */}
                  <div className="absolute left-1.5 top-4 w-0.5 h-10 bg-emerald-950/20 rounded-full" />
                  <div className="absolute right-1.5 top-8 w-0.5 h-8 bg-emerald-950/20 rounded-full" />
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* The Terracotta / Zen Garden Pot */}
            {/* ============================================================ */}
            <div className="w-28 h-11 bg-[#E2BCA2] border-t border-[#F2D7C5] rounded-b-2xl relative shadow-sm flex flex-col items-center justify-between overflow-hidden z-10">
              {/* Dark soil layer at the very top of pot */}
              <div className="w-full h-1.5 bg-[#603813] absolute top-0" />
              
              {/* Decorative oriental ribbon/tag on the pot */}
              <div className="w-3 h-5 bg-emerald-800/80 rounded-b-md absolute left-1/2 -translate-x-1/2 top-1.5 flex flex-col justify-end pb-0.5 items-center">
                <div className="w-1 h-1 bg-yellow-400 rounded-full" />
              </div>
              
              <div className="w-full text-[7px] text-[#805030] font-mono font-bold tracking-widest text-center mt-5 uppercase">
                ERROR DETOX
              </div>

              {/* Shading/Highlights */}
              <div className="w-full h-1 bg-black/5" />
            </div>
          </div>
        </div>

        {/* Right Side: Descriptions and Stats details */}
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="p-1 bg-emerald-50 rounded-lg shrink-0">
                <Award className="w-4 h-4 text-emerald-600" />
              </span>
              <span className="text-3xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                DETOX GARDEN GROWTH STATUS
              </span>
            </div>
            
            <div className="flex items-baseline space-x-2">
              <h3 className="text-lg font-bold text-emerald-950 font-display">
                {currentStage.name}
              </h3>
              <span className="text-3xs font-semibold px-2 py-0.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
                {currentStage.rangeText}
              </span>
            </div>
            
            <p className="text-3xs text-emerald-950/70 leading-relaxed font-medium">
              {currentStage.desc}
            </p>
          </div>

          {/* Seed Milestone Progress Bar */}
          <div className="bg-white border border-emerald-50 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-3xs font-bold text-emerald-950">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                <span>성장 가든 단계 게이지</span>
              </span>
              <span className="font-mono text-emerald-700/80">{purifiedCount}회 완료</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-3 bg-emerald-50/50 rounded-full border border-emerald-100/40 relative overflow-hidden flex items-center">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.percent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
              <span>{currentStage.emoji} {currentStage.name.split(' ')[1] || '단계'}</span>
              <span>
                {progress.remaining > 0 ? (
                  <>다음 성장까지: <strong className="font-bold text-emerald-950">{progress.remaining}회</strong> 정화 필요</>
                ) : (
                  <span className="text-emerald-700 font-extrabold flex items-center gap-0.5">
                    최고 단계 정화 거목 도달! 🎉
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={triggerWatering}
              disabled={isWatering}
              className={`inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-3xs font-extrabold border transition-all cursor-pointer ${
                isWatering
                  ? 'bg-sky-50 border-sky-100 text-sky-700 animate-pulse'
                  : 'bg-white border-emerald-100 text-emerald-900 hover:bg-emerald-50/40'
              }`}
            >
              <Droplets className={`w-3.5 h-3.5 ${isWatering ? 'text-sky-500 animate-bounce' : 'text-emerald-600'}`} />
              <span>{isWatering ? '물뿌리는 중...' : '물뿌리개 물 주기 🚿'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowStageGuide(!showStageGuide)}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-emerald-50/40 hover:bg-emerald-50 text-emerald-800 border border-emerald-100/50 rounded-xl text-3xs font-bold transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-emerald-700" />
              <span>성장 보상 안내서 {showStageGuide ? '닫기' : '열기'}</span>
            </button>
          </div>

          {/* Stage Guide Collapsible details */}
          <AnimatePresence>
            {showStageGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-white border border-emerald-100/60 p-4 rounded-2xl space-y-2.5">
                  <h4 className="text-3xs font-extrabold text-emerald-950">🌱 에러 디톡스 가든 단계 안내</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {STAGES.map((st) => (
                      <div 
                        key={st.level} 
                        className={`p-2 rounded-lg border text-center transition-all ${
                          st.level === currentStage.level
                            ? 'bg-emerald-50/50 border-emerald-300 shadow-3xs scale-[1.02]'
                            : 'bg-transparent border-gray-100'
                        }`}
                      >
                        <span className="text-base block">{st.emoji}</span>
                        <span className="text-[9px] font-extrabold text-emerald-950 block mt-1 truncate">
                          {st.name.replace(/🌳|🫘|🌱|🪴|🌿|✨/g, '').trim()}
                        </span>
                        <span className="text-[8px] text-gray-400 block font-bold mt-0.5">
                          {st.rangeText}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
