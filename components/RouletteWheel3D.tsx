import React, { useMemo } from 'react';
import { WHEEL_NUMBERS, RED_NUMBERS } from '../constants';

const RouletteWheel3D: React.FC<{rotation: number; lastNumber: number | null; spinDuration?: number}> = ({ rotation, lastNumber, spinDuration = 4000 }) => {
    // Exact colors matching the betting board
    const COLOR_RED = '#D92D28';
    const COLOR_BLACK = '#1F2633';
    const COLOR_GREEN = '#0C5C30';

    const segments = useMemo(() => 
        WHEEL_NUMBERS.map((num, i) => {
            let color = COLOR_BLACK;
            if (num === 0) color = COLOR_GREEN;
            else if (RED_NUMBERS.has(num)) color = COLOR_RED;
            
            return { 
                num, 
                angle: i * (360 / 37), 
                color 
            };
        }), 
    []);

    return (
        <div className="relative flex items-center justify-center w-[226px] h-[226px] sm:w-[288px] sm:h-[288px] lg:w-[368px] lg:h-[368px]" style={{ perspective: '800px' }}>
            {/* Outer wooden frame - Thinner rim */}
            <div 
                className="absolute inset-0 m-auto w-[226px] h-[226px] sm:w-[288px] sm:h-[288px] lg:w-[368px] lg:h-[368px] rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.8)]" 
                style={{ transform: 'rotateX(20deg)', background: 'linear-gradient(to bottom, #78350f, #451a03)' }} 
            />
            {/* Inner wooden ring */}
            <div 
                className="absolute inset-0 m-auto w-[222px] h-[222px] sm:w-[282px] sm:h-[282px] lg:w-[360px] lg:h-[360px] rounded-full border-4 border-[#5d2606]" 
                style={{ transform: 'rotateX(20deg)', background: 'linear-gradient(to bottom, #92400e, #78350f)' }} 
            />
            {/* Chrome rim */}
            <div 
                className="absolute inset-0 m-auto w-[218px] h-[218px] sm:w-[276px] sm:h-[276px] lg:w-[352px] lg:h-[352px] rounded-full shadow-inner" 
                style={{ transform: 'rotateX(20deg)', background: 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 50%, #4b5563 100%)' }} 
            />
            {/* Ball track */}
            <div 
                className="absolute inset-0 m-auto w-[214px] h-[214px] sm:w-[270px] sm:h-[270px] lg:w-[346px] lg:h-[346px] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]" 
                style={{ transform: 'rotateX(20deg)', background: 'conic-gradient(from 180deg, #27272a, #18181b)' }} 
            />
            
            {/* Main Wheel - Larger to reduce gap */}
            <div className="absolute inset-0 m-auto w-[210px] h-[210px] sm:w-[265px] sm:h-[265px] lg:w-[340px] lg:h-[340px]" style={{ transform: 'rotateX(20deg)' }}>
                <div 
                    className="absolute inset-0 rounded-full overflow-hidden shadow-2xl" 
                    style={{ transform: `rotate(${rotation}deg)`, transition: `transform ${spinDuration}ms cubic-bezier(0.15, 0.6, 0.2, 1)` }}
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
                        <defs>
                            <linearGradient id="gld" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#fcd34d" />
                                <stop offset="100%" stopColor="#b45309" />
                            </linearGradient>
                            <radialGradient id="cone" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#b45309" />
                                <stop offset="100%" stopColor="#451a03" />
                            </radialGradient>
                            {/* Dark matte center gradient */}
                            <radialGradient id="center-light" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#1c1917" />
                                <stop offset="100%" stopColor="#000000" />
                            </radialGradient>
                        </defs>
                        
                        {/* Wheel segments */}
                        {segments.map((seg, i) => {
                            // Calculating path for each wedge
                            const a1 = (i * 360 / 37 - 360 / 74 - 90) * Math.PI / 180;
                            const a2 = (i * 360 / 37 + 360 / 74 - 90) * Math.PI / 180;
                            
                            // Reduced inner radius
                            const r1 = 48, r2 = 15;
                            
                            const path = `M ${50 + r1 * Math.cos(a1)} ${50 + r1 * Math.sin(a1)} A ${r1} ${r1} 0 0 1 ${50 + r1 * Math.cos(a2)} ${50 + r1 * Math.sin(a2)} L ${50 + r2 * Math.cos(a2)} ${50 + r2 * Math.sin(a2)} A ${r2} ${r2} 0 0 0 ${50 + r2 * Math.cos(a1)} ${50 + r2 * Math.sin(a1)} Z`;
                            
                            // Text position
                            const ta = i * 360 / 37 - 90;
                            const textRadius = 42;
                            const tx = 50 + textRadius * Math.cos(ta * Math.PI / 180);
                            const ty = 50 + textRadius * Math.sin(ta * Math.PI / 180);
                            
                            return (
                                <g key={seg.num}>
                                    <path d={path} fill={seg.color} stroke="#171717" strokeWidth="0.2" />
                                    {/* Gold separators */}
                                    <line x1={50 + r1 * Math.cos(a1)} y1={50 + r1 * Math.sin(a1)} x2={50 + r2 * Math.cos(a1)} y2={50 + r2 * Math.sin(a1)} stroke="url(#gld)" strokeWidth="0.5" />
                                    <text x={tx} y={ty} fill="white" fontSize="5" fontWeight="900" textAnchor="middle" dominantBaseline="middle" transform={`rotate(${i * 360 / 37}, ${tx}, ${ty})`} style={{textShadow: '0px 1px 1px rgba(0,0,0,0.8)'}}>
                                        {seg.num}
                                    </text>
                                </g>
                            );
                        })}
                        
                        {/* Inner circle - Dark fill */}
                        <circle cx="50" cy="50" r="15" fill="url(#center-light)" stroke="url(#gld)" strokeWidth="0.5" />
                        <text 
                            x="50" 
                            y="50" 
                            fill="#92400e" 
                            fontSize="3.5" 
                            fontWeight="700" 
                            textAnchor="middle" 
                            dominantBaseline="middle"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)', letterSpacing: '0.5px' }}
                        >
                            Randseed
                        </text>
                    </svg>
                </div>
            </div>

            {/* Pointer Pin */}
            <div className="absolute top-[3%] left-1/2 z-30 drop-shadow-md" style={{ transform: 'translateX(-50%) rotateX(20deg)' }}>
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[14px] border-t-yellow-400 filter drop-shadow" />
            </div>
            
            {/* Result display overlay */}
            {lastNumber !== null && (
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                    {/* Background Overlay */}
                    <div className="absolute w-[44%] h-[44%] bg-white/80 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)] backdrop-blur-sm" />

                    <div 
                        className={`relative z-10 text-6xl sm:text-7xl font-black animate-bounce ${
                            lastNumber === 0 ? 'text-[#0C5C30]' : RED_NUMBERS.has(lastNumber) ? 'text-[#D92D28]' : 'text-black'
                        }`} 
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    >
                        {lastNumber}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouletteWheel3D;