import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Volume2, VolumeX, Bell, ChevronUp, ChevronDown, X, Undo2, Trash2, Play, History, Flame, Snowflake, Clock, BarChart2, Users } from 'lucide-react';
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
        // Optimized selector size for new control panel
        selector: "w-[26px] h-[26px] text-[9px] ring-1 sm:w-10 sm:h-10 sm:text-[10px] md:w-12 md:h-12 md:text-[11px] lg:w-14 lg:h-14 lg:text-sm"
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
        <header className="flex items-center justify-between px-3 py-2.5 bg-[#1a1a2e] border-b border-white/5 shrink-0 shadow-sm z-50 select-none">
            <button onClick={onExit} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors">
                <ArrowLeft size={20} className="text-gray-400" />
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
        </header>
    );
};

// ==========================================
// LIVE FEED (UPDATED)
// ==========================================
export const LiveFeed: React.FC<{feed: PlayerBet[]}> = ({ feed }) => {
    return (
        <div className="w-full bg-slate-900/90 border-b border-white/5 py-1.5 overflow-hidden relative shrink-0 z-30">
            <div className="flex items-center gap-3 px-4">
                <div className="shrink-0 flex items-center gap-1.5 opacity-60">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-bold uppercase tracking-widest text-white">Live</span>
                </div>
                <div className="h-4 w-px bg-white/10 shrink-0" />
                
                <div className="flex items-center gap-2 overflow-hidden w-full"> 
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
export const BalanceBar: React.FC<{balance: number; betTotal: number; records: GameRecord[]; showRec: boolean; setShowRec: (v: boolean) => void}> = ({ 
    balance, betTotal, records, showRec, setShowRec
}) => {
    const latestRecord = records[0];
    const latestNet = latestRecord ? latestRecord.winAmount - latestRecord.betAmount : 0;
    let gainColor = 'text-gray-400';
    if (latestNet > 0) gainColor = 'text-emerald-400';
    else if (latestNet < 0) gainColor = 'text-red-400';

    return (
        <div className="relative shrink-0 z-40">
            <div className="flex items-center justify-end gap-3 sm:gap-6 px-4 py-2 bg-slate-900/60 border-b border-white/5 shadow-sm">
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
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">Last</span>
                    <div className="flex items-center gap-1">
                        <span className={`font-mono font-bold text-lg sm:text-xl filter drop-shadow-sm ${gainColor}`}>
                            {latestNet > 0 ? '+' : ''}{latestNet === 0 ? '$0' : `$${latestNet}`}
                        </span>
                        {showRec ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </div>
                </button>
            </div>
            {showRec && (
                <div className="absolute right-0 top-full z-50 w-72 max-h-64 overflow-y-auto bg-slate-900 border border-white/10 rounded-b-lg shadow-2xl">
                    <div className="p-2 border-b border-white/10 flex justify-between bg-slate-800/50">
                        <span className="text-xs font-semibold text-gray-300">Game History</span>
                        <button onClick={() => setShowRec(false)}><X size={14} className="text-gray-400" /></button>
                    </div>
                    {records.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-xs">No records</div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {records.map(r => {
                                const net = r.winAmount - r.betAmount;
                                return (
                                    <div key={r.id} className="p-2 flex justify-between text-xs hover:bg-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                                r.result === 0 ? 'bg-emerald-600' : RED_NUMBERS.has(r.result) ? 'bg-[#D92D28]' : 'bg-zinc-800'
                                            }`}>{r.result}</div>
                                            <span className="text-gray-400">{r.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                                        </div>
                                        <span className={net > 0 ? 'text-emerald-400 font-semibold' : net < 0 ? 'text-red-400' : 'text-gray-500'}>
                                            {net > 0 ? `+$${net}` : net < 0 ? `-$${Math.abs(net)}` : '$0'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==========================================
// STATS OVERLAY
// ==========================================
export const StatsOverlay: React.FC<{ stats: GameStats, onClose: () => void }> = ({ stats, onClose }) => {
    // Light Theme Layout
    return (
        <div 
            className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex justify-center items-center p-4"
            onClick={onClose}
        >
            <div 
                className="w-full max-w-sm bg-slate-100 rounded-2xl border border-slate-300 shadow-2xl p-4 sm:p-6 overflow-y-auto animate-fade-in text-slate-800"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <BarChart2 size={18} className="text-yellow-600"/>
                        Last 100 Spins
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Hot Numbers */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Flame size={14} className="text-orange-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hot Numbers</span>
                        </div>
                        <div className="flex gap-3">
                            {stats.hot.map((n, i) => (
                                <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md text-white ${
                                    n === 0 ? 'bg-emerald-600' : RED_NUMBERS.has(n) ? 'bg-[#D92D28]' : 'bg-black'
                                }`}>
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cold Numbers */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Snowflake size={14} className="text-blue-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cold Numbers</span>
                        </div>
                        <div className="flex gap-3">
                            {stats.cold.map((n, i) => (
                                <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md text-white ${
                                    // Matched Hot Numbers Styling
                                    n === 0 ? 'bg-emerald-600' : RED_NUMBERS.has(n) ? 'bg-[#D92D28]' : 'bg-black'
                                }`}>
                                    {n}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-300" />

                    {/* Percentages */}
                    <div className="space-y-4">
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
                
                <div className="mt-8 text-center">
                    <p className="text-[10px] text-slate-400">Statistics based on the last 100 rounds.</p>
                </div>
            </div>
            <style>{`
                @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
                .animate-fade-in { animation: fade-in 0.2s ease-out; }
            `}</style>
        </div>
    );
};

const ZeroBar: React.FC<{ value: number }> = ({ value }) => (
    <div>
        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span>Zero (0)</span>
            <span className="font-mono text-slate-800">{value}%</span>
        </div>
        <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
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
        <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5">
            <span>{label}</span>
        </div>
        {/* Bar Container - Percentages inside bars */}
        <div className="h-5 w-full bg-slate-200 rounded-md overflow-hidden flex relative shadow-inner text-[10px] font-bold text-white leading-none">
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
// HISTORY PANEL
// ==========================================
export const HistoryPanel: React.FC<{history: number[]; stats: GameStats; onShowStats: () => void}> = ({ history, stats, onShowStats }) => {
    const last20 = history.slice(0, 20); // Sorted newest first
    const [expanded, setExpanded] = useState(false);
    
    return (
        <div className="relative w-full z-30">
            {/* Expanded Popup - Opens Upward */}
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

            {/* Main Bar */}
            <div className="w-full bg-slate-900/70 rounded-lg border border-white/10 p-2 sm:p-2.5 lg:p-4 shadow-inner lg:shadow-xl transition-all relative z-40">
                <div className="flex flex-row gap-2 lg:gap-6">
                    {/* Left - Last 20 wrapping - SCROLLABLE & CLICKABLE */}
                    <div 
                        className="flex-1 min-w-0 overflow-hidden flex flex-col justify-center cursor-pointer hover:bg-white/5 rounded-l-lg transition-colors group px-1 -ml-1"
                        onClick={() => setExpanded(!expanded)}
                    >
                        <div className="flex items-center gap-2 mb-1 lg:mb-3 pl-1">
                            <div className="text-[10px] lg:text-xs text-gray-500 font-bold uppercase tracking-widest group-hover:text-gray-300 transition-colors">
                                Last 20 Draws
                            </div>
                            {expanded ? <ChevronDown size={12} className="text-gray-500"/> : <ChevronUp size={12} className="text-gray-500"/>}
                        </div>
                        
                        {/* Horizontal Scroll Container */}
                        <div className="flex items-center gap-1.5 lg:gap-2.5 overflow-x-auto scrollbar-hide w-full py-1.5 px-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
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
                            <div className="w-1 shrink-0" />
                        </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="w-px bg-white/10 self-stretch shrink-0" />
                    
                    {/* Right - Hot/Cold stacked - CLICKABLE */}
                    <button 
                        onClick={onShowStats}
                        className="relative flex flex-col gap-1 lg:gap-2 shrink-0 justify-center min-w-[fit-content] pr-1 pl-2 lg:pl-6 lg:pr-4 hover:bg-white/5 rounded-r-lg transition-colors group"
                        title="View Full Statistics"
                    >
                        {/* Hot */}
                        <div className="flex items-center gap-3 lg:gap-4">
                            <Flame size={12} className="text-orange-500 shrink-0 group-hover:scale-110 transition-transform lg:w-4 lg:h-4" />
                            <div className="flex gap-1.5 font-mono">
                                {stats.hot.map((n, i) => (
                                    <span key={`h${i}`} className={`text-xs lg:text-sm font-black ${n === 0 ? 'text-emerald-400' : RED_NUMBERS.has(n) ? 'text-red-400' : 'text-slate-200'}`}>{n}</span>
                                ))}
                            </div>
                        </div>
                        {/* Cold */}
                        <div className="flex items-center gap-3 lg:gap-4">
                            <Snowflake size={12} className="text-blue-500 shrink-0 group-hover:scale-110 transition-transform lg:w-4 lg:h-4" />
                            <div className="flex gap-1.5 font-mono">
                                {stats.cold.map((n, i) => (
                                    <span key={`c${i}`} className={`text-xs lg:text-sm font-black ${n === 0 ? 'text-emerald-400' : RED_NUMBERS.has(n) ? 'text-red-400' : 'text-slate-200'}`}>{n}</span>
                                ))}
                            </div>
                        </div>
                    </button>
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
            <div className="self-center flex items-center gap-2 sm:gap-4 bg-slate-900/90 border border-white/10 px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-full shadow-2xl backdrop-blur-md min-w-[180px] sm:min-w-[240px] justify-center transition-all">
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
                    <div className="flex-1 flex justify-center items-center gap-1.5 sm:gap-3 lg:gap-6 overflow-x-auto scrollbar-hide py-0.5 sm:py-2 h-full">
                        {CHIP_VALUES.map(v => (
                            <button
                                key={v}
                                onClick={() => setChip(v)}
                                className={`
                                    relative transition-all duration-200 shrink-0
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