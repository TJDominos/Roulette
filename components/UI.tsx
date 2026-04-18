import React, { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, Volume2, VolumeX, Bell, ChevronUp, ChevronDown, X, Undo2, Trash2, Play, History, Flame, Snowflake, Clock, BarChart2, Users } from 'lucide-react';
import { getChipColor } from '../utils';
import { ChipProps, PlayerBet, GameRecord, GamePhase, GameStats } from '../types';
import { CHIP_VALUES, RED_NUMBERS } from '../constants';
import { soundManager } from '../services/SoundManager';

// ==========================================
// CASINO CHIP
// ==========================================
export const CasinoChip: React.FC<ChipProps> = ({ value, className = "", size = "md" }) => {
    const sizeClasses = {
        xs: "w-4 h-4 text-[6px] ring-1",
        sm: "w-5 h-5 text-[8px] ring-1",
        md: "w-8 h-8 text-[10px] ring-2",
        lg: "w-12 h-12 text-sm ring-[3px]",
        board: "w-[16px] h-[16px] text-[6px] ring-1 sm:w-[20px] sm:h-[20px] sm:text-[7px] md:w-[24px] md:h-[24px] md:text-[8px]",
        // Optimized selector size for new control panel (reduced by ~30% on sm/md/lg)
        selector: "w-[26px] h-[26px] text-[9px] ring-1 sm:w-7 sm:h-7 sm:text-[9px] md:w-8 md:h-8 md:text-[10px] lg:w-10 lg:h-10 lg:text-[11px]"
    };

    const currentSizeClass = sizeClasses[size] || sizeClasses.md;
    const colorClass = getChipColor(value);

    return (
        <div className={`${currentSizeClass} rounded-full flex items-center justify-center font-bold shadow-[0_3px_8px_rgba(0,0,0,0.6)] relative ${colorClass} ${className} transition-transform select-none`}>
            <div className="absolute inset-[12%] border border-dashed border-current opacity-50 rounded-full"></div>
            <span className="relative z-10 drop-shadow-md">{value}</span>
        </div>
    );
};

// ==========================================
// NAV BAR
// ==========================================
export const NavBar: React.FC<{
    onExit: () => void; 
    isMuted: boolean; 
    setIsMuted: (v: boolean) => void;
}> = ({ onExit, isMuted, setIsMuted }) => {
    const handleMuteToggle = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        soundManager.setMuted(newMuted);
    };
    return (
        <header className="w-full bg-[#1a1a2e] border-b border-white/5 shrink-0 shadow-sm z-50 select-none">
            <div className="max-w-[1024px] mx-auto flex items-center justify-between px-3 py-2.5 w-full">
                <button onClick={onExit} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                    <LogOut size={20} className="text-gray-400 rotate-180" />
                </button>
                <h1 className="text-base font-semibold text-white tracking-wide font-serif">Roulette</h1>
                <div className="flex items-center gap-1">
                    <button onClick={handleMuteToggle} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                        {isMuted ? <VolumeX size={18} className="text-gray-400" /> : <Volume2 size={18} className="text-gray-400" />}
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                        <Bell size={18} className="text-gray-400" />
                    </button>
                </div>
            </div>
        </header>
    );
};

// ==========================================
// LIVE FEED (UPDATED)
// ==========================================
export const LiveFeed: React.FC<{feed: PlayerBet[]}> = ({ feed }) => {
    return (
        <div className="w-full h-9 bg-slate-900/90 border-b border-white/5 py-1.5 overflow-hidden relative shrink-0 z-30">
            <div className="max-w-[1024px] mx-auto flex items-center gap-3 px-4 w-full h-full relative">
                <div className="shrink-0 flex items-center gap-1.5 opacity-60">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live Bets</span>
                </div>
                <div className="h-4 w-px bg-white/10 shrink-0" />
                
                <div className="flex items-center gap-2 overflow-hidden w-full h-full"> 
                     {feed.map((bet) => (
                        <div key={bet.id} className="flex items-center gap-2 bg-slate-800/50 border border-white/10 rounded-full pl-1 pr-3 py-0.5 shrink-0 animate-slide-in">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shadow-sm text-white ${
                                 bet.number === '0' ? 'bg-emerald-600' : RED_NUMBERS.has(+bet.number) ? 'bg-[#D92D28]' : 'bg-black'
                            }`}>
                                {bet.number}
                            </div>
                            <span className="text-[10px] font-medium text-slate-300 max-w-[70px] truncate">{bet.username}</span>
                            <span className="text-[10px] font-bold text-yellow-400 font-mono">${bet.amount}</span>
                        </div>
                     ))}
                </div>
            </div>
             {/* Gradient fade on the right to smooth out cutoff */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0f172a] to-transparent pointer-events-none" />
            
            <style>{`
                @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                .animate-slide-in { animation: slideIn 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

// ==========================================
// BALANCE BAR
// ==========================================
export const BalanceBar: React.FC<{
    balance: number; 
    betTotal: number; 
    records: GameRecord[]; 
    showRec: boolean; 
    setShowRec: (v: boolean) => void;
    phase: GamePhase;
}> = ({ 
    balance, betTotal, records, showRec, setShowRec, phase
}) => {
    const [displayWin, setDisplayWin] = useState(0);
    const [animateWin, setAnimateWin] = useState(false);

    useEffect(() => {
        if (phase === 'betting') {
            setAnimateWin(false);
        }
    }, [phase]);

    useEffect(() => {
        if (records.length > 0 && phase === 'result') {
            const newWin = records[0].winAmount;
            setDisplayWin(newWin);
            if (newWin > 0) {
                setAnimateWin(true);
                const t = setTimeout(() => setAnimateWin(false), 2000);
                return () => clearTimeout(t);
            }
        }
    }, [records, phase]);

    const gainColor = displayWin > 0 ? 'text-emerald-400' : 'text-gray-400';

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showRec && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowRec(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRec, setShowRec]);

    const betRecords = records.filter(r => r.betAmount > 0);

    const formatTime = (d: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        const yy = d.getFullYear().toString().slice(-2);
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        const ss = pad(d.getSeconds());
        return `${yy}${mm}${dd} ${hh}:${min}:${ss}`;
    };

    return (
        <div className="w-full bg-slate-900/60 border-b border-white/5 shadow-sm shrink-0 z-40">
            <div className="max-w-[1024px] mx-auto relative w-full">
                <div className="flex justify-end px-4 py-2">
                    <div className="relative flex items-center justify-end gap-3 sm:gap-6" ref={containerRef}>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Balance</span>
                            <span className="font-mono font-bold text-emerald-400 text-lg sm:text-xl filter drop-shadow-sm">${balance.toLocaleString()}</span>
                        </div>
                        
                        <div className="w-px h-6 bg-white/10" />
                        
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bet</span>
                            <span className="font-mono font-bold text-yellow-400 text-lg sm:text-xl filter drop-shadow-sm">${betTotal.toLocaleString()}</span>
                        </div>
                        
                        <div className="w-px h-6 bg-white/10" />
                        
                        <button onClick={() => setShowRec(!showRec)} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-white/5 transition-colors group">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Last Win</span>
                            <div className="flex items-center gap-1">
                                <span className={`inline-block font-mono font-bold text-lg sm:text-xl filter transition-all duration-500 ease-out ${
                                    animateWin 
                                        ? 'text-yellow-400 scale-125 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]' 
                                        : `${gainColor} drop-shadow-sm`
                                }`}>
                                    ${displayWin.toLocaleString()}
                                </span>
                                {showRec ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                            </div>
                        </button>

                        {showRec && (
                            <div className="absolute right-0 top-full mt-2 z-50 w-full max-h-64 overflow-y-auto bg-slate-900 border border-white/10 rounded-lg shadow-2xl">
                                <div className="p-2 border-b border-white/10 flex justify-between bg-slate-800/50 sticky top-0 backdrop-blur-md">
                                    <span className="text-xs font-semibold text-gray-300">My Record</span>
                                    <button onClick={() => setShowRec(false)}><ChevronUp size={14} className="text-gray-400" /></button>
                                </div>
                                {betRecords.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500 text-xs">No records</div>
                                ) : (
                                <div className="divide-y divide-white/5">
                                    {betRecords.map(r => {
                                        const net = r.winAmount - r.betAmount;
                                        return (
                                            <div key={r.id} className="p-2 flex flex-col gap-1.5 text-xs hover:bg-white/5">
                                                <div className="text-[10px] text-gray-500 font-mono">{formatTime(r.timestamp)}</div>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                                            r.result === 0 ? 'bg-emerald-600' : RED_NUMBERS.has(r.result) ? 'bg-[#D92D28]' : 'bg-zinc-800'
                                                        }`}>{r.result}</div>
                                                        <span className="text-gray-300">Bet: ${r.betAmount.toLocaleString()}</span>
                                                    </div>
                                                    <span className={net > 0 ? 'text-emerald-400 font-semibold' : net < 0 ? 'text-red-400' : 'text-gray-500'}>
                                                        Net: {net > 0 ? `+$${net.toLocaleString()}` : net < 0 ? `-$${Math.abs(net).toLocaleString()}` : '$0'}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// STATS COMPONENTS
// ==========================================
const ZeroBar: React.FC<{ value: number }> = ({ value }) => (
    <div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
            <span>Zero (0)</span>
            <span className="font-mono text-white">{value}%</span>
        </div>
        <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
            <div className="h-full bg-emerald-600 transition-all duration-500" style={{ width: `${value}%` }} />
        </div>
    </div>
);

const StatBar: React.FC<{
    label: string;
    leftLabel: string;
    rightLabel: string;
    leftVal: number;
    rightVal: number;
    leftColor: string;
    rightColor: string;
}> = ({ label, leftLabel, rightLabel, leftVal, rightVal, leftColor, rightColor }) => (
    <div>
        <div className="flex justify-between text-xs font-bold text-gray-400 mb-1.5">
            <span>{label}</span>
        </div>
        {/* Bar Container - Percentages inside bars */}
        <div className="h-5 w-full bg-slate-800 rounded-md overflow-hidden flex relative shadow-inner text-[10px] font-bold text-white leading-none">
            {/* Left Bar - Content: Label Left, Percentage Right (End of bar) */}
            <div className={`h-full ${leftColor} transition-all duration-500 flex items-center justify-between px-2 min-w-[fit-content]`} style={{ width: `${leftVal}%` }}>
                {leftVal > 15 && <span className="drop-shadow-sm uppercase mr-1">{leftLabel}</span>}
                <span className="drop-shadow-sm">{leftVal}%</span>
            </div>
            
            {/* Spacer */}
            <div className="flex-1"></div>
            
            {/* Right Bar - Content: Percentage Left (Tip of bar), Label Right */}
            <div className={`h-full ${rightColor} transition-all duration-500 flex items-center justify-between px-2 min-w-[fit-content]`} style={{ width: `${rightVal}%` }}>
                <span className="drop-shadow-sm">{rightVal}%</span>
                {rightVal > 15 && <span className="drop-shadow-sm uppercase ml-1">{rightLabel}</span>}
            </div>
        </div>
    </div>
);

// ==========================================
// LAST DRAWS PANEL
// ==========================================
export const LastDrawsPanel: React.FC<{history: number[]}> = ({ history }) => {
    const last20 = history.slice(0, 20); // Sorted newest first
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (containerRef.current && !containerRef.current.contains(target)) {
                const isActionArea = (target as Element).closest?.('.action-area');
                if (!isActionArea) setExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative flex-1 min-w-0 z-30" ref={containerRef}>
            {expanded && (
                <div className="absolute bottom-full mb-1 left-0 w-full bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl animate-fade-in z-50">
                    <div className="flex justify-between items-center mb-3 px-1 border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last 20 Spins</span>
                        <button onClick={() => setExpanded(false)} className="hover:bg-white/10 p-0.5 rounded transition-colors">
                            <ChevronDown size={14} className="text-gray-400"/>
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-start">
                        {last20.map((n, i) => (
                            <div 
                                key={`${i}-${n}-exp`} 
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-md
                                    ${n === 0 ? 'bg-emerald-600' : RED_NUMBERS.has(n) ? 'bg-[#D92D28]' : 'bg-zinc-800'}
                                `}
                            >
                                {n}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div 
                className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center rounded-l-lg transition-colors pl-1 pr-2 lg:pr-4 -ml-1 cursor-pointer hover:bg-white/5 group"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-2 mb-1 lg:mb-3 pl-1 py-1 rounded w-fit">
                    <div className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                        Last 20 Draws
                    </div>
                    {expanded ? <ChevronDown size={12} className="text-gray-500"/> : <ChevronUp size={12} className="text-gray-500"/>}
                </div>
                
                <div 
                    className="flex items-center gap-1.5 lg:gap-2.5 overflow-x-auto scrollbar-hide w-full py-1.5 px-1" 
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
                    {last20.length === 0 ? (
                        <span className="text-gray-600 text-[10px] italic pl-1">Waiting for spin...</span>
                    ) : (
                        last20.map((n, i) => (
                            <div 
                                key={`${i}-${n}`} 
                                className={`
                                    shrink-0 rounded-full flex items-center justify-center font-bold border shadow-sm transition-all
                                    w-5 h-5 text-[10px] lg:w-9 lg:h-9 lg:text-sm leading-none tracking-tighter
                                    ${i === 0 ? 'ring-2 ring-yellow-400 z-10 opacity-100 scale-105' : 'opacity-80'}
                                    ${n === 0 ? 'bg-emerald-600 border-emerald-400' : 
                                    RED_NUMBERS.has(n) ? 'bg-[#D92D28] border-red-400' : 'bg-zinc-800 border-zinc-500'}
                                `}
                            >
                                {n}
                            </div>
                        ))
                    )}
                    <div className="w-4 lg:w-8 shrink-0" />
                </div>
            </div>
        </div>
    );
};

// ==========================================
// HOT/COLD NUMBERS PANEL
// ==========================================
export const HotColdPanel: React.FC<{stats: GameStats}> = ({ stats }) => {
    const [expanded, setExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (containerRef.current && !containerRef.current.contains(target)) {
                const isActionArea = (target as Element).closest?.('.action-area');
                if (!isActionArea) setExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative shrink-0 z-30" ref={containerRef}>
            {expanded && (
                <div className="absolute bottom-full mb-1 right-0 w-[280px] sm:w-80 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg p-3 sm:p-4 shadow-2xl animate-fade-in z-50">
                    <div className="flex justify-between items-center mb-3 px-1 border-b border-white/5 pb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <BarChart2 size={14} className="text-yellow-600"/>
                            Last 100 Spins
                        </span>
                        <button onClick={() => setExpanded(false)} className="hover:bg-white/10 p-0.5 rounded transition-colors">
                            <ChevronDown size={14} className="text-gray-400"/>
                        </button>
                    </div>
                    <div className="space-y-4 pt-1">
                        <ZeroBar value={stats.zeroPct} />
                        <StatBar 
                            label="Red / Black" 
                            leftLabel="Red" 
                            rightLabel="Black" 
                            leftVal={stats.redPct} 
                            rightVal={stats.blackPct} 
                            leftColor="bg-[#D92D28]" 
                            rightColor="bg-black" 
                        />
                        <StatBar 
                            label="Even / Odd" 
                            leftLabel="Even" 
                            rightLabel="Odd" 
                            leftVal={stats.evenPct} 
                            rightVal={stats.oddPct} 
                            leftColor="bg-blue-600" 
                            rightColor="bg-indigo-600" 
                        />
                        <StatBar 
                            label="1-18 / 19-36" 
                            leftLabel="Low" 
                            rightLabel="High" 
                            leftVal={stats.lowPct} 
                            rightVal={stats.highPct} 
                            leftColor="bg-emerald-600" 
                            rightColor="bg-teal-700" 
                        />
                    </div>
                </div>
            )}
            <div 
                onClick={() => setExpanded(!expanded)}
                className="relative flex flex-col gap-1 lg:gap-2 shrink-0 justify-center min-w-[fit-content] px-2 lg:px-4 hover:bg-white/5 rounded-r-lg transition-colors group cursor-pointer h-full"
                title="View Full Statistics"
            >
                <div className="flex items-center gap-3 lg:gap-4">
                    <Flame size={12} className="text-orange-500 shrink-0 group-hover:scale-110 transition-transform lg:w-4 lg:h-4" />
                    <div className="flex gap-1.5 font-mono">
                        {stats.hot.map((n, i) => (
                            <span key={`h${i}`} className={`text-xs lg:text-sm font-black ${n === 0 ? 'text-emerald-400' : RED_NUMBERS.has(n) ? 'text-red-400' : 'text-slate-200'}`}>{n}</span>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-3 lg:gap-4">
                    <Snowflake size={12} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform lg:w-4 lg:h-4" />
                    <div className="flex gap-1.5 font-mono">
                        {stats.cold.map((n, i) => (
                            <span key={`c${i}`} className={`text-xs lg:text-sm font-black ${n === 0 ? 'text-emerald-400' : RED_NUMBERS.has(n) ? 'text-red-400' : 'text-slate-200'}`}>{n}</span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// HISTORY PANEL (WRAPPER)
// ==========================================
export const HistoryPanel: React.FC<{history: number[]; stats: GameStats}> = ({ history, stats }) => {
    return (
        <div className="relative w-full z-30">
            {/* Main Bar */}
            <div className="w-full bg-slate-900/70 rounded-lg border border-white/10 p-2 sm:p-2.5 lg:p-4 shadow-inner lg:shadow-xl transition-all relative z-40">
                <div className="flex flex-row items-stretch">
                    <LastDrawsPanel history={history} />
                    
                    {/* Divider */}
                    <div className="w-px bg-white/10 self-stretch shrink-0 my-1 lg:my-2" />
                    
                    <HotColdPanel stats={stats} />
                </div>
            </div>
        </div>
    );
};

// ==========================================
// CONTROL PANEL
// ==========================================
export const ControlPanel: React.FC<{
    chip: number;
    setChip: (v: number) => void;
    undo: () => void;
    clear: () => void;
    phase: GamePhase;
    hasBets: boolean;
    timeLeft: number;
    maxTime: number;
}> = ({ chip, setChip, undo, clear, phase, hasBets, timeLeft, maxTime }) => {

    const progress = (timeLeft / maxTime) * 100;

    return (
        <div className="w-full max-w-3xl mx-auto flex flex-col gap-2 sm:gap-3 relative z-20 pb-2 sm:pb-0">
            {/* Status Window - Centered above, floating, pill-shaped */}
            <div className="self-center flex items-center gap-2 sm:gap-4 bg-slate-900/90 border border-white/10 px-4 sm:px-8 h-8 sm:h-12 rounded-full shadow-2xl backdrop-blur-md min-w-[180px] sm:min-w-[240px] justify-center transition-all">
                 <div className={`text-xs sm:text-base font-black uppercase tracking-widest ${phase === 'betting' ? 'text-yellow-400' : 'text-slate-200'}`}>
                    {phase === 'betting' ? 'Place Your Bets' : phase === 'locked' ? 'No More Bets' : phase === 'spinning' ? 'Spinning...' : 'Winning Number'}
                 </div>
                 {phase === 'betting' && (
                     <div className="flex items-center gap-1 sm:gap-1.5 text-white font-mono font-bold bg-white/10 px-1.5 sm:px-2 py-0.5 rounded text-xs sm:text-base">
                        <Clock size={12} className="text-yellow-400 sm:w-3.5 sm:h-3.5"/>
                        <span>{timeLeft}s</span>
                     </div>
                 )}
            </div>

            {/* Main Control Strip */}
            <div className="bg-[#1a1a2e] rounded-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                
                {/* Time Bar - Strictly Yellow */}
                <div className="h-1.5 w-full bg-slate-800">
                     <div 
                        className="h-full bg-yellow-400 transition-all duration-1000 ease-linear"
                        style={{ width: `${phase === 'betting' ? progress : 0}%` }}
                    />
                </div>

                {/* Buttons and Chips Row - Single Zone */}
                {/* Fixed height to prevent overflow issues with chips */}
                <div className="flex items-center justify-between p-1.5 sm:p-4 gap-1.5 sm:gap-4 h-14 sm:h-24">
                    
                    {/* Clear (Left) - White */}
                    <button 
                        onClick={clear}
                        disabled={!hasBets || phase !== 'betting'}
                        className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shrink-0"
                        title="Clear Bets (Esc)"
                    >
                        <Trash2 size={18} className="sm:w-6 sm:h-6" />
                    </button>

                    {/* Chips (Center) */}
                    <div className="flex-1 flex justify-center items-center gap-2 sm:gap-4 lg:gap-6 overflow-x-auto scrollbar-hide py-2 sm:py-4 px-1 h-full">
                        {CHIP_VALUES.map(v => (
                            <button
                                key={v}
                                onClick={() => setChip(v)}
                                className={`
                                    relative transition-all duration-200 shrink-0 mx-0.5 sm:mx-1
                                    ${chip === v ? '-translate-y-1 sm:-translate-y-1.5 scale-110' : 'hover:-translate-y-1 hover:scale-105 opacity-80 hover:opacity-100'}
                                `}
                            >
                                <CasinoChip 
                                    value={v} 
                                    size="selector"
                                    className={chip === v ? "ring-2 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : ""} 
                                />
                            </button>
                        ))}
                    </div>

                    {/* Undo (Right) - White */}
                    <button 
                        onClick={undo}
                        disabled={!hasBets || phase !== 'betting'}
                        className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl bg-slate-800/50 hover:bg-white/10 border border-white/5 hover:border-white/20 text-white transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shrink-0"
                        title="Undo Last Bet (Del/Bksp)"
                    >
                        <Undo2 size={18} className="sm:w-6 sm:h-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};