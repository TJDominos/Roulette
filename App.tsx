import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavBar, LiveFeed, BalanceBar, HistoryPanel, ControlPanel, StatsOverlay } from './components/UI';
import BettingBoard from './components/BettingBoard';
import RouletteWheel3D from './components/RouletteWheel3D';
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
    const [records, setRecords] = useState<GameRecord[]>([]);
    
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
        <div className="relative w-full h-screen bg-[#0f172a] text-white font-sans select-none overflow-hidden">
            <div className="absolute inset-0 flex flex-col overflow-y-auto lg:overflow-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                
                {/* Mobile Roulette (Hidden on Desktop) */}
                <div className="lg:hidden flex-shrink-0 flex items-center justify-center w-full min-h-[220px] sm:min-h-[250px] z-0 relative mt-4">
                    <div className="transform scale-[0.60] sm:scale-75 transition-transform duration-500 origin-center -my-8 sm:-my-4">
                        <RouletteWheel3D rotation={rotation} lastNumber={lastNum} spinDuration={SPIN_DURATION} />
                    </div>
                </div>

                <div className="flex-shrink-0 z-20">
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
                    />
                </div>

                {/* Content Container */}
                <main className="flex-1 w-full max-w-[1800px] mx-auto p-2 sm:p-4 lg:p-8 flex flex-col lg:flex-row items-stretch justify-center gap-2 lg:gap-16 lg:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    
                    {/* Left Section (Wheel & Stats) */}
                    <div className="flex-shrink-0 flex flex-col items-center lg:items-center justify-between lg:justify-end z-0 relative lg:w-[500px] lg:gap-8">
                        {/* Desktop Roulette (Hidden on Mobile) */}
                        <div className="hidden lg:flex flex-shrink-0 lg:flex-none items-center justify-center w-full lg:mb-28 min-h-[250px] sm:min-h-[300px]">
                            <div className="transform scale-[0.65] sm:scale-75 md:scale-90 lg:scale-110 xl:scale-125 transition-transform duration-500 origin-center -my-6 sm:my-0">
                                <RouletteWheel3D rotation={rotation} lastNumber={lastNum} spinDuration={SPIN_DURATION} />
                            </div>
                        </div>
                        
                        <div className="hidden lg:block w-full">
                            <HistoryPanel history={history} stats={stats} onShowStats={() => setShowStats(true)} />
                        </div>
                    </div>

                    {/* Right Section (Board & Controls) */}
                    <div className="shrink-0 lg:flex-1 w-full max-w-[700px] flex flex-col gap-1.5 sm:gap-4 lg:gap-8 lg:h-auto justify-end lg:justify-end z-10 pb-1 lg:pb-0">
                        <div className="lg:hidden w-full">
                            <HistoryPanel history={history} stats={stats} onShowStats={() => setShowStats(true)} />
                        </div>

                        <div className="w-full flex items-center justify-center min-h-0">
                            <BettingBoard bets={bets} onBet={placeBet} phase={phase} />
                        </div>

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
                </main>

                {/* Render StatsOverlay at root level to ensure it sits on top of everything */}
                {showStats && <StatsOverlay stats={stats} onClose={() => setShowStats(false)} />}
            </div>
        </div>
    );
};

export default App;