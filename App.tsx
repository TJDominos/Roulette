import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, Link, MessageCircle, Gamepad2 } from 'lucide-react';
import { NavBar, LiveFeed, BalanceBar, HistoryPanel, ControlPanel, StatsOverlay } from './components/UI';
import BettingBoard from './components/BettingBoard';
import RouletteWheel3D from './components/RouletteWheel3D';
import { CommentsPanel, CommentsMobileButton, CommentsDesktopButton } from './components/CommentsPanel';
import { FloatingCommentsOverlay } from './components/FloatingCommentsOverlay';
import { PlayBoardPanel, PlayBoardMobileButton, PlayBoardDesktopButton } from './components/PlayBoardPanel';
import { RankPanel, RankMobileButton, RankDesktopButton } from './components/RankWidget';
import { GamePhase, PlayerBet, BetAction, GameRecord, GameStats } from './types';
import { WHEEL_NUMBERS, CHIP_VALUES, BOT_NAMES } from './constants';
import { calculateWinnings, prepareBetsForBackend } from './utils';
import { soundManager } from './services/SoundManager';
import { mockBackend } from './services/MockBackend';

const App = () => {
    // Game State
    const [balance, setBalance] = useState(1000);
    const [bets, setBets] = useState<Record<string, number>>({});
    const [betStack, setBetStack] = useState<BetAction[]>([]);
    const [phase, setPhase] = useState<GamePhase>('betting');
    const [lastNum, setLastNum] = useState<number | null>(null);
    const [rotation, setRotation] = useState(0);
    
    // Backend Data
    const [history, setHistory] = useState<number[]>([]);
    const [stats, setStats] = useState<GameStats>({ hot: [], cold: [], redPct: 0, blackPct: 0, evenPct: 0, oddPct: 0, lowPct: 0, highPct: 0, zeroPct: 0 });
    const nextRoundData = useRef<{ history: number[], stats: GameStats } | null>(null);

    // Auto Spin State
    const BETTING_TIME = 30;
    const [timeLeft, setTimeLeft] = useState(BETTING_TIME);

    // UI State
    const [chip, setChip] = useState(5);
    const [feed, setFeed] = useState<PlayerBet[]>([]);
    const [muted, setMuted] = useState(false);
    const [showRec, setShowRec] = useState(false);
    const [showStats, setShowStats] = useState(false); // Stats Overlay State
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [isFloatingCommentsEnabled, setIsFloatingCommentsEnabled] = useState(true);
    const [isPlayBoardOpen, setIsPlayBoardOpen] = useState(false);
    const [isRankOpen, setIsRankOpen] = useState(false);
    const [records, setRecords] = useState<GameRecord[]>([]);
    
    const unreadComments = 105; // Example count > 99
    const displayUnread = unreadComments > 99 ? '99+' : unreadComments;

    const betTotal = betStack.reduce((s, b) => s + b.amount, 0);
    const SPIN_DURATION = 25000;

    // Load Initial Data
    useEffect(() => {
        mockBackend.getInitialData().then(data => {
            setHistory(data.history);
            setStats(data.stats);
        });
    }, []);

    // Simulated Multiplayer Feed - Only active during betting phase
    useEffect(() => {
        if (phase !== 'betting') return;

        const i = setInterval(() => {
            if (Math.random() > 0.4) {
                setFeed(f => [{
                    id: `bet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    username: BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)],
                    number: String(Math.floor(Math.random() * 37)),
                    amount: CHIP_VALUES[Math.floor(Math.random() * CHIP_VALUES.length)]
                }, ...f].slice(0, 20));
            }
        }, 1500); 
        return () => clearInterval(i);
    }, [phase]);

    // Sync Mute State
    useEffect(() => { soundManager.setMuted(muted); }, [muted]);

    const placeBet = (id: string) => {
        if (phase !== 'betting' || balance < chip) return;
        soundManager.playChipPlace();
        setBalance(b => b - chip);
        setBets(b => ({ ...b, [id]: (b[id] || 0) + chip }));
        setBetStack(s => [...s, { id, amount: chip }]);
    };

    const undo = useCallback(() => {
        if (phase !== 'betting' || !betStack.length) return;
        soundManager.playUndo();
        const last = betStack[betStack.length - 1];
        setBalance(b => b + last.amount);
        setBets(b => {
            const n = { ...b };
            n[last.id] -= last.amount;
            if (n[last.id] <= 0) delete n[last.id];
            return n;
        });
        setBetStack(s => s.slice(0, -1));
    }, [phase, betStack]);

    const clear = useCallback(() => {
        if (phase !== 'betting' || betStack.length === 0) return;
        soundManager.playClear();
        setBalance(b => b + betStack.reduce((s, x) => s + x.amount, 0));
        setBets({});
        setBetStack([]);
    }, [phase, betStack]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if user is interacting with form elements
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (phase === 'betting') {
                if (e.key === 'Escape') {
                    undo();
                } else if (e.key === 'Delete') {
                    clear();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, clear, undo]);

    // Trigger Spin Animation
    const spin = useCallback((winningNumber: number) => {
        setPhase('spinning');
        soundManager.playSpinSound(SPIN_DURATION);
        
        const resultIndex = WHEEL_NUMBERS.indexOf(winningNumber);
        const anglePerItem = 360 / 37;
        const targetAngle = resultIndex * anglePerItem;
        
        setRotation(prevRotation => {
            const currentMod = prevRotation % 360;
            const targetMod = (360 - targetAngle) % 360; 
            let diff = targetMod - currentMod;
            if (diff < 0) diff += 360; 
            return prevRotation + (12 * 360) + diff;
        });
        
        setTimeout(() => {
            setLastNum(winningNumber);
            setPhase('result');
        }, SPIN_DURATION);
    }, []); 

    // Handle Game Flow
    const handleGameSequence = useCallback(async () => {
        if (phase !== 'betting') return;
        
        setPhase('locked');
        
        const backendPayload = prepareBetsForBackend(bets);
        
        try {
            // Call Backend
            const { result, history: newHistory, stats: newStats } = await mockBackend.placeBets(backendPayload);
            
            // Store new data to apply after spin
            nextRoundData.current = { history: newHistory, stats: newStats };

            // Start Animation
            spin(result);

        } catch (error) {
            console.error("Backend Error:", error);
            setPhase('betting'); 
        }

    }, [phase, bets, spin]);

    // Post-Spin Result Logic
    useEffect(() => {
        if (phase === 'result' && lastNum !== null) {
            // Calculate Winnings
            const winAmount = calculateWinnings(lastNum, bets);
            
            if (winAmount > 0) {
                setBalance(b => b + winAmount);
                soundManager.playWin();
            } else {
                soundManager.playLose();
            }
            
            // Update History and Stats from Backend response
            if (nextRoundData.current) {
                setHistory(nextRoundData.current.history);
                setStats(nextRoundData.current.stats);
                nextRoundData.current = null;
            }
            
            // Record Game for User Log
            setRecords(prev => [{
                id: Date.now(),
                result: lastNum,
                betAmount: betTotal,
                winAmount: winAmount,
                timestamp: new Date()
            }, ...prev]);
            
            // Auto Reset
            const timer = setTimeout(() => {
                setPhase('betting');
                setLastNum(null);
                setBets({});
                setBetStack([]);
                setFeed([]); // Clear the feed for the new batch
                setTimeLeft(BETTING_TIME);
            }, 3500);
            return () => clearTimeout(timer);
        }
    }, [phase, lastNum, bets, betTotal]);

    // Timer Tick
    useEffect(() => {
        if (phase === 'betting' && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
            return () => clearTimeout(timer);
        }
    }, [phase, timeLeft]);

    // Trigger Game Sequence on Time Up
    useEffect(() => {
        if (phase === 'betting' && timeLeft === 0) {
            handleGameSequence();
        }
    }, [phase, timeLeft, handleGameSequence]);

    return (
        <div className={`relative w-full h-screen bg-[#0f172a] text-white font-sans select-none overflow-hidden transition-all duration-300 ${isCommentsOpen || isPlayBoardOpen || isRankOpen ? 'md:pr-[400px]' : ''}`}>
            <div className="absolute inset-0 flex flex-col overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                <div className="flex-shrink-0 z-[100] relative">
                    <NavBar 
                        onExit={() => window.location.reload()} 
                        isMuted={muted} 
                        setIsMuted={setMuted}
                    />
                    
                    <LiveFeed feed={feed} />
                    
                    <BalanceBar 
                        balance={balance} 
                        betTotal={betTotal} 
                        records={records}
                        showRec={showRec}
                        setShowRec={setShowRec}
                        phase={phase}
                    />
                </div>

                {/* Content Container */}
                <main className="flex-1 w-full max-w-[1024px] mx-auto px-2 py-0 sm:px-4 sm:py-2 lg:px-4 lg:pt-6 lg:pb-4 flex flex-col justify-start gap-1 lg:gap-4 overflow-visible">
                    
                    {/* Top Row (Wheel & Board) */}
                    <div className="flex flex-col lg:flex-row items-center justify-center gap-1 lg:gap-8 w-full">
                        {/* Wheel */}
                        <div className="flex-shrink-0 flex items-center justify-center w-full lg:w-[380px] h-[200px] sm:h-[230px] md:h-[280px] lg:h-[368px] my-2 sm:my-4 lg:my-0 z-50 relative">
                            <div className="transform scale-[0.85] sm:scale-75 md:scale-90 lg:scale-95 xl:scale-100 transition-transform duration-500 origin-center">
                                <RouletteWheel3D rotation={rotation} lastNumber={lastNum} spinDuration={SPIN_DURATION} />
                            </div>

                            {/* Floating Comments overlay specific to wheel zone */}
                            <FloatingCommentsOverlay isEnabled={isFloatingCommentsEnabled} />

                            {/* Side Buttons - Mobile */}
                            <div className="md:hidden absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-40">
                                <CommentsMobileButton 
                                    onClick={() => setIsCommentsOpen(true)} 
                                    unreadCount={unreadComments} 
                                />
                                <PlayBoardMobileButton 
                                    onClick={() => setIsPlayBoardOpen(true)} 
                                />
                                <RankMobileButton 
                                    onClick={() => setIsRankOpen(true)}
                                />
                            </div>
                        </div>
                        
                        {/* Mobile History */}
                        <div className="lg:hidden w-full max-w-[700px] mx-auto mb-1.5 sm:mb-3 relative z-[60]">
                            <HistoryPanel history={history} stats={stats} />
                        </div>

                        {/* Board */}
                        <div className="shrink-0 lg:flex-1 w-full max-w-[700px] lg:max-w-none mx-auto lg:mx-0 flex items-center justify-start min-h-0 lg:h-[320px] z-10 action-area">
                            <BettingBoard bets={bets} onBet={placeBet} phase={phase} />
                        </div>
                    </div>

                    {/* Bottom Row (History & Controls) */}
                    <div className="flex flex-col lg:flex-row items-center lg:items-end justify-center gap-1.5 sm:gap-3 lg:gap-8 w-full relative z-[60]">
                        {/* Desktop History */}
                        <div className="hidden lg:block w-[380px] flex-shrink-0">
                            <HistoryPanel history={history} stats={stats} />
                        </div>

                        {/* Controls */}
                        <div className="w-full max-w-[700px] lg:max-w-none lg:flex-1 mx-auto lg:mx-0 action-area">
                            <ControlPanel 
                                chip={chip} 
                                setChip={setChip} 
                                undo={undo} 
                                clear={clear} 
                                phase={phase}
                                hasBets={betTotal > 0}
                                timeLeft={timeLeft}
                                maxTime={BETTING_TIME}
                            />
                        </div>
                    </div>

                    {/* Footer Labels */}
                    <div className="flex items-center justify-center gap-6 mt-4 mb-8 text-xs font-medium text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-emerald-500/70" />
                            <span>RTP 97.5%</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Link size={14} className="text-blue-500/70 animate-heartbeat" />
                            <span>On-chain Randomness</span>
                        </div>
                    </div>
                </main>
            </div>

            {/* Panels */}
            <CommentsPanel 
                isOpen={isCommentsOpen} 
                onClose={() => setIsCommentsOpen(false)} 
                isFloatingEnabled={isFloatingCommentsEnabled}
                onToggleFloating={(enabled) => setIsFloatingCommentsEnabled(enabled)}
            />
            <PlayBoardPanel isOpen={isPlayBoardOpen} onClose={() => setIsPlayBoardOpen(false)} />
            <RankPanel isOpen={isRankOpen} onClose={() => setIsRankOpen(false)} />

            {/* Side Buttons - Desktop */}
            <div className={`hidden md:flex fixed top-1/2 -translate-y-1/2 flex-col gap-3 z-40 transition-all duration-300 ${isCommentsOpen || isPlayBoardOpen || isRankOpen ? 'right-[-100px] opacity-0 pointer-events-none' : 'right-0 opacity-100'}`}>
                <CommentsDesktopButton 
                    onClick={() => setIsCommentsOpen(true)} 
                    isOpen={isCommentsOpen} 
                    unreadCount={unreadComments} 
                />
                <PlayBoardDesktopButton 
                    onClick={() => setIsPlayBoardOpen(true)} 
                />
                <RankDesktopButton 
                    onClick={() => setIsRankOpen(true)}
                />
            </div>
        </div>
    );
};

export default App;