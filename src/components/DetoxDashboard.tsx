import React, { useState, useMemo } from 'react';
import { PurifiedError } from '../types';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  Trash2, 
  Sprout, 
  ChevronDown, 
  ChevronUp, 
  Sparkles,
  Award,
  AlertTriangle,
  Flame,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DetoxDashboardProps {
  history: PurifiedError[];
  onClearHistory: () => void;
}

const CATEGORY_META = {
  delay: { label: '시간 지연 & 로딩', color: '#10b981', bgClass: 'bg-emerald-500', textClass: 'text-emerald-700', plant: '유칼립투스 🌿' },
  network: { label: '서버 & 연결 장애', color: '#0ea5e9', bgClass: 'bg-sky-500', textClass: 'text-sky-700', plant: '대나무 🎋' },
  memory: { label: '메모리 & 용량 부족', color: '#f59e0b', bgClass: 'bg-amber-500', textClass: 'text-amber-700', plant: '몬스테라 🪴' },
  legacy: { label: '레거시 & 스파게티', color: '#047857', bgClass: 'bg-emerald-800', textClass: 'text-emerald-900', plant: '아이비 🍀' },
  other: { label: '기타 시스템 버그', color: '#6366f1', bgClass: 'bg-indigo-500', textClass: 'text-indigo-700', plant: '추천 씨앗 ✨' },
};

export default function DetoxDashboard({ history, onClearHistory }: DetoxDashboardProps) {
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // 1. Calculate General Metrics
  const totalCount = history.length;

  const typeCounts = useMemo(() => {
    const counts = { delay: 0, network: 0, memory: 0, legacy: 0, other: 0 };
    history.forEach((item) => {
      if (counts[item.errorType] !== undefined) {
        counts[item.errorType]++;
      } else {
        counts.other++;
      }
    });
    return counts;
  }, [history]);

  const dominantCategory = useMemo(() => {
    let maxCount = -1;
    let dominant: keyof typeof CATEGORY_META = 'other';
    (Object.keys(typeCounts) as Array<keyof typeof typeCounts>).forEach((key) => {
      const value = typeCounts[key];
      if (value > maxCount) {
        maxCount = value;
        dominant = key as keyof typeof CATEGORY_META;
      }
    });
    return totalCount > 0 ? { type: dominant, count: maxCount, ...CATEGORY_META[dominant] } : null;
  }, [typeCounts, totalCount]);

  // 2. Weekly Trend Data Calculation (Last 7 Days)
  const weeklyData = useMemo(() => {
    const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];
    const result = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        dateStr: `${d.getMonth() + 1}/${d.getDate()}`,
        dayName: daysOfWeek[d.getDay()],
        count: 0,
        fullDate: d.toDateString(),
      };
    });

    history.forEach((item) => {
      const itemDate = new Date(item.timestamp).toDateString();
      const match = result.find((r) => r.fullDate === itemDate);
      if (match) {
        match.count++;
      }
    });

    return result;
  }, [history]);

  const maxWeeklyCount = useMemo(() => {
    const max = Math.max(...weeklyData.map((d) => d.count));
    return max === 0 ? 5 : max; // fallback limit for bar rendering
  }, [weeklyData]);

  // 3. Donut Chart Slices Data Calculation
  const donutSlices = useMemo(() => {
    if (totalCount === 0) return [];
    
    let currentOffset = 0;
    const radius = 38;
    const circumference = 2 * Math.PI * radius; // ~238.76

    return (Object.keys(typeCounts) as Array<keyof typeof typeCounts>)
      .map((type) => {
        const count = typeCounts[type];
        const percentage = count / totalCount;
        const strokeDasharray = `${(percentage * circumference).toFixed(2)} ${circumference.toFixed(2)}`;
        const strokeDashoffset = (-currentOffset).toFixed(2);
        
        currentOffset += percentage * circumference;

        return {
          type,
          count,
          percentage: Math.round(percentage * 100),
          strokeDasharray,
          strokeDashoffset,
          meta: CATEGORY_META[type],
        };
      })
      .filter((slice) => slice.count > 0);
  }, [typeCounts, totalCount]);

  // Format date helper
  const formatDateStr = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-[#FAF9F5] border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 mt-10 relative overflow-hidden" id="detox-dashboard-card">
      {/* Decorative leafy touch */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-radial from-emerald-100/10 to-transparent pointer-events-none" />
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-emerald-100/60 pb-5 relative z-10">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1 text-emerald-800">
            <Sprout className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-3xs font-bold font-mono tracking-wider uppercase">My Greenery Purify Stats</span>
          </div>
          <h3 className="text-base font-bold text-emerald-950 font-display">
            나의 에러 정화 대시보드 🪴
          </h3>
          <p className="text-3xs text-emerald-800/70">
            버그와 에러를 정화하고 푸르른 마음과 청정한 코드를 일구어 낸 가든 통계입니다.
          </p>
        </div>

        {history.length > 5 && (
          <button
            type="button"
            onClick={() => {
              if (confirm('모든 에러 정화 기록을 초기화하시겠습니까? (기본 가이드 정원사 씨앗은 복구됩니다)')) {
                onClearHistory();
              }
            }}
            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-100 rounded-xl text-4xs font-bold transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
            <span>나의 정화 일지 리셋</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10" id="dashboard-metrics-grid">
        {/* Metric 1 */}
        <div className="bg-white border border-emerald-100/70 rounded-2xl p-4 flex items-center space-x-4 shadow-3xs hover:border-emerald-200 transition-colors">
          <div className="p-3 bg-emerald-50 rounded-xl">
            <Award className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="space-y-0.5">
            <span className="text-4xs font-bold font-mono text-emerald-800/60 block tracking-wider">TOTAL PURIFIED</span>
            <span className="text-xl font-extrabold font-mono text-emerald-950 block leading-none">
              {totalCount} <span className="text-xs font-semibold text-emerald-800">회</span>
            </span>
            <span className="text-[9px] text-emerald-700/80 font-medium block">에러의 정화와 처방 완료</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-emerald-100/70 rounded-2xl p-4 flex items-center space-x-4 shadow-3xs hover:border-emerald-200 transition-colors">
          <div className="p-3 bg-amber-50 rounded-xl">
            <Flame className="w-5 h-5 text-amber-600" />
          </div>
          <div className="space-y-0.5">
            <span className="text-4xs font-bold font-mono text-amber-800/60 block tracking-wider">DOMINANT ILLUSION</span>
            <span className="text-xs font-extrabold text-amber-950 block truncate leading-none mt-1">
              {dominantCategory ? dominantCategory.label : '데이터 부족'}
            </span>
            <span className="text-[9px] text-amber-700/80 font-medium block mt-1">
              {dominantCategory ? `가장 지치게 만든 버그 빌런 (${dominantCategory.count}회)` : '새싹 가든 보살핌 중'}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-emerald-100/70 rounded-2xl p-4 flex items-center space-x-4 shadow-3xs hover:border-emerald-200 transition-colors">
          <div className="p-3 bg-sky-50 rounded-xl">
            <Calendar className="w-5 h-5 text-sky-600" />
          </div>
          <div className="space-y-0.5">
            <span className="text-4xs font-bold font-mono text-sky-800/60 block tracking-wider">GARDEN HEALTH</span>
            <span className="text-xs font-extrabold text-sky-950 block leading-none mt-1">
              {totalCount >= 8 ? '상쾌한 원시림 🌲' : totalCount >= 5 ? '푸르른 쉼터 가든 🪴' : '어린 새싹 정원 🌱'}
            </span>
            <span className="text-[9px] text-sky-700/80 font-medium block mt-1">
              정화 주기에 따라 정원이 울창해집니다
            </span>
          </div>
        </div>
      </div>

      {/* Visual Charts Layout (2-Column) */}
      {totalCount === 0 ? (
        <div className="bg-white border border-emerald-100/60 rounded-2xl p-8 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-emerald-600/40 mx-auto animate-bounce" />
          <h4 className="text-xs font-bold text-emerald-950">아직 정화된 에러 역사가 없습니다</h4>
          <p className="text-3xs text-emerald-800/60 max-w-sm mx-auto">
            위의 가든 쉼터에서 나를 지치게 한 코드 버그와 마주한 답답함을 작성해 보세요. 
            처방전이 발급되면 이곳에 실시간 통계가 아름답게 피어납니다!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="dashboard-charts-container">
          
          {/* Donut Chart: Error Type Proportion */}
          <div className="md:col-span-6 bg-white border border-emerald-100/60 rounded-2xl p-5 flex flex-col justify-between shadow-3xs">
            <div className="space-y-0.5 border-b border-emerald-50 pb-2 mb-4">
              <span className="text-[9px] font-mono font-bold text-emerald-600 flex items-center space-x-1">
                <PieChart className="w-3 h-3" />
                <span>ERROR TYPE PROPORTION</span>
              </span>
              <h4 className="text-xs font-extrabold text-emerald-950">에러 유형별 정화 비중</h4>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* Donut SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    className="stroke-emerald-50/50"
                    strokeWidth="11"
                    fill="transparent"
                  />
                  {donutSlices.map((slice) => (
                    <motion.circle
                      key={slice.type}
                      cx="50"
                      cy="50"
                      r="38"
                      stroke={slice.meta.color}
                      strokeWidth={hoveredSlice === slice.type ? "14" : "11"}
                      fill="transparent"
                      strokeDasharray={slice.strokeDasharray}
                      strokeDashoffset={slice.strokeDashoffset}
                      strokeLinecap="round"
                      onMouseEnter={() => setHoveredSlice(slice.type)}
                      onMouseLeave={() => setHoveredSlice(null)}
                      className="cursor-pointer transition-all duration-300"
                      animate={{
                        strokeWidth: hoveredSlice === slice.type ? 14 : 11
                      }}
                    />
                  ))}
                </svg>

                {/* Centered Total Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {hoveredSlice ? (
                      <motion.div
                        key={hoveredSlice}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center"
                      >
                        <span className="text-[8px] font-mono font-bold uppercase tracking-wider block" style={{ color: CATEGORY_META[hoveredSlice as keyof typeof CATEGORY_META].color }}>
                          {CATEGORY_META[hoveredSlice as keyof typeof CATEGORY_META].label.split(' ')[0]}
                        </span>
                        <span className="text-base font-extrabold font-mono text-emerald-950 leading-none">
                          {typeCounts[hoveredSlice as keyof typeof CATEGORY_META]}<span className="text-4xs font-bold">회</span>
                        </span>
                        <span className="text-[8px] text-gray-400 block font-bold leading-none">
                          {Math.round((typeCounts[hoveredSlice as keyof typeof CATEGORY_META] / totalCount) * 100)}%
                        </span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="total"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center"
                      >
                        <span className="text-[8px] font-bold text-gray-400 block tracking-widest uppercase">TOTAL</span>
                        <span className="text-lg font-extrabold font-mono text-emerald-950 leading-none">
                          {totalCount}<span className="text-3xs font-semibold text-emerald-900">회</span>
                        </span>
                        <span className="text-[8px] text-emerald-600/80 block font-bold">정화 완료</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Legends */}
              <div className="flex flex-col space-y-1.5 justify-center">
                {donutSlices.map((slice) => (
                  <button
                    key={slice.type}
                    type="button"
                    onMouseEnter={() => setHoveredSlice(slice.type)}
                    onMouseLeave={() => setHoveredSlice(null)}
                    className={`flex items-center space-x-2 text-left p-1.5 rounded-lg transition-colors cursor-pointer ${
                      hoveredSlice === slice.type ? 'bg-emerald-50/50' : ''
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: slice.meta.color }} />
                    <div className="flex flex-col leading-none">
                      <span className="text-4xs font-extrabold text-emerald-950 flex items-center gap-1">
                        {slice.meta.label}
                        <span className="font-mono text-emerald-700/60 text-[9px]">({slice.count}회)</span>
                      </span>
                      <span className="text-[8px] text-gray-400 mt-0.5">{slice.meta.plant}로 분갈이</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart: Weekly Purify Activity */}
          <div className="md:col-span-6 bg-white border border-emerald-100/60 rounded-2xl p-5 flex flex-col justify-between shadow-3xs">
            <div className="space-y-0.5 border-b border-emerald-50 pb-2 mb-4">
              <span className="text-[9px] font-mono font-bold text-emerald-600 flex items-center space-x-1">
                <BarChart2 className="w-3 h-3" />
                <span>WEEKLY TREND ACTIVITY</span>
              </span>
              <h4 className="text-xs font-extrabold text-emerald-950">최근 일주일 정화 활동 트렌드</h4>
            </div>

            {/* Custom Bar Chart Canvas */}
            <div className="flex-1 flex flex-col justify-end min-h-[140px] pt-4">
              <div className="flex items-end justify-between h-28 w-full px-2">
                {weeklyData.map((data, idx) => {
                  const heightPercent = (data.count / maxWeeklyCount) * 100;
                  const barHeight = Math.max((heightPercent / 100) * 80, 4); // minimum 4px height

                  return (
                    <div 
                      key={idx} 
                      className="flex-1 flex flex-col items-center group relative cursor-pointer"
                      onMouseEnter={() => setHoveredBar(idx)}
                      onMouseLeave={() => setHoveredBar(null)}
                    >
                      {/* Tooltip on hover */}
                      <AnimatePresence>
                        {hoveredBar === idx && (
                          <motion.div
                            initial={{ opacity: 0, y: 4, scale: 0.9 }}
                            animate={{ opacity: 1, y: -4, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.9 }}
                            className="absolute -top-10 bg-emerald-950 text-white text-[9px] font-mono font-bold px-2 py-1 rounded-lg shadow-md whitespace-nowrap z-20"
                          >
                            {data.count}회 정화
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Animated Column Bar */}
                      <div className="w-7 sm:w-8 bg-emerald-50/50 rounded-t-lg overflow-hidden flex items-end h-24 relative">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${barHeight}px` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className={`w-full rounded-t-md transition-colors ${
                            data.count > 0 
                              ? hoveredBar === idx ? 'bg-emerald-600' : 'bg-gradient-to-t from-emerald-800 to-emerald-500' 
                              : 'bg-emerald-100/50'
                          }`}
                        />
                      </div>

                      {/* X Axis Labels */}
                      <span className="text-[9px] font-mono font-bold text-emerald-950/70 mt-2 block">
                        {data.dayName}
                      </span>
                      <span className="text-[8px] text-gray-400 font-mono">
                        {data.dateStr}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Purification Logs */}
      <div className="space-y-3 relative z-10" id="dashboard-recent-logs-section">
        <div className="flex items-center space-x-1.5 border-b border-emerald-50 pb-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <h4 className="text-xs font-bold text-emerald-950">초록빛 정화 일지 목록</h4>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {history.map((log) => {
            const isExpanded = expandedLogId === log.id;
            const meta = CATEGORY_META[log.errorType];

            return (
              <div 
                key={log.id} 
                className="bg-white border border-emerald-100/50 hover:border-emerald-200/80 rounded-xl transition-all overflow-hidden"
              >
                {/* Header item */}
                <button
                  type="button"
                  onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                  className="w-full p-3.5 flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold font-mono shrink-0 ${meta.bgClass} text-white`}>
                      {meta.label.split(' ')[0]}
                    </span>
                    <div className="truncate flex-1 pr-4">
                      <span className="text-3xs font-mono font-semibold text-emerald-950 block truncate">
                        {log.errorLog.substring(0, 100) || "에러 코드 없음"}
                      </span>
                      <span className="text-4xs text-gray-400 font-medium block mt-0.5">
                        {formatDateStr(log.timestamp)} • {log.frustration.substring(0, 50) || "솔직한 털어놓음 없음"}...
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-emerald-800">
                    <span className="text-4xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded-full shrink-0">
                      {meta.plant}
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 shrink-0" />}
                  </div>
                </button>

                {/* Collapsible Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-emerald-50/50 bg-[#FAF9F5]/40"
                    >
                      <div className="p-4 space-y-4 text-3xs text-emerald-950/90 leading-relaxed">
                        
                        {/* Error Log block */}
                        {log.errorLog && (
                          <div className="space-y-1">
                            <span className="block font-bold text-emerald-900 font-mono tracking-wider text-[8px] uppercase">
                              📟 마주했던 무거운 에러 로그
                            </span>
                            <pre className="p-2.5 bg-emerald-950/5 rounded-lg text-[10px] font-mono text-emerald-950 overflow-x-auto whitespace-pre-wrap max-h-36">
                              {log.errorLog}
                            </pre>
                          </div>
                        )}

                        {/* Frustration complaint */}
                        {log.frustration && (
                          <div className="space-y-1">
                            <span className="block font-bold text-emerald-900 font-mono tracking-wider text-[8px] uppercase">
                              💬 그때 마주한 솔직한 심정 한마디
                            </span>
                            <p className="px-1 font-medium italic text-emerald-800">
                              "{log.frustration}"
                            </p>
                          </div>
                        )}

                        {/* Botanical Prescription Remedy */}
                        <div className="space-y-1.5 p-3.5 bg-emerald-50/50 border border-emerald-100/40 rounded-xl">
                          <span className="font-extrabold text-emerald-950 block flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span>🌿 가드너의 디톡스 처방전 & 조언</span>
                          </span>
                          
                          <div className="space-y-2 mt-1.5 text-[10px] leading-relaxed text-emerald-900/90">
                            {log.remedy.split('\n').map((line, idx) => {
                              const trimmed = line.trim();
                              if (trimmed.startsWith('###')) {
                                return <h5 key={idx} className="font-bold text-emerald-950 mt-2 text-[10px] border-l-2 border-emerald-500 pl-1">{trimmed.replace('###', '')}</h5>;
                              }
                              if (trimmed.startsWith('####')) {
                                return <h6 key={idx} className="font-bold text-emerald-900 mt-1.5 text-[9px]">{trimmed.replace('####', '')}</h6>;
                              }
                              if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                                return <li key={idx} className="ml-3 list-disc my-0.5">{trimmed.substring(1).trim()}</li>;
                              }
                              if (trimmed.startsWith('>') || trimmed.startsWith('\"')) {
                                return <blockquote key={idx} className="italic text-emerald-800 pl-3 border-l-2 border-emerald-200 py-0.5 my-1 bg-emerald-50/20">{trimmed.replace(/[>"\\]/g, '')}</blockquote>;
                              }
                              return trimmed ? <p key={idx}>{trimmed}</p> : <div key={idx} className="h-1" />;
                            })}
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
