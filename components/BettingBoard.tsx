import React from 'react';
import { GamePhase } from '../types';
import { RED_NUMBERS } from '../constants';
import { getBetNumbers } from '../utils';
import { CasinoChip } from './UI';

// Position constants specifically for the board layout
// Grid Layout: 3 rows of numbers (25% height each) + 2 rows of side bets (12.5% height each)
// Row 1 Center: 12.5%
// Row 2 Center: 37.5%
// Row 3 Center: 62.5%
// Row 4 Center (Dozens): 75% + 6.25% = 81.25%
// Row 5 Center (Simple): 87.5% + 6.25% = 93.75%
const CHIP_POSITIONS: Record<string, {left: string; top: string}> = {
    '0': { left: '3.57%', top: '37.5%' }, // Center of rows 1-3 (0-75%)
    'row3': { left: '96.43%', top: '12.5%' },
    'row2': { left: '96.43%', top: '37.5%' },
    'row1': { left: '96.43%', top: '62.5%' },
    '1st12': { left: '28.57%', top: '81.25%' },
    '2nd12': { left: '50%', top: '81.25%' },
    '3rd12': { left: '71.43%', top: '81.25%' },
    '1-18': { left: '17.86%', top: '93.75%' },
    'EVEN': { left: '32.14%', top: '93.75%' },
    'RED': { left: '46.43%', top: '93.75%' },
    'BLACK': { left: '60.71%', top: '93.75%' },
    'ODD': { left: '75%', top: '93.75%' },
    '19-36': { left: '89.29%', top: '93.75%' },
    '0_1': { left: '7.14%', top: '62.5%' }, // Next to Row 3 (1)
    '0_2': { left: '7.14%', top: '37.5%' }, // Next to Row 2 (2)
    '0_3': { left: '7.14%', top: '12.5%' }, // Next to Row 1 (3)
    '0_1_2': { left: '7.14%', top: '50%' }, // Intersection 1/2
    '0_2_3': { left: '7.14%', top: '25%' }, // Intersection 2/3
    '0_1_2_3': { left: '7.14%', top: '75%' }, // Corner of 0, 1st 12
};

const BettingBoard: React.FC<{bets: Record<string, number>; onBet: (id: string) => void; phase: GamePhase}> = ({ bets, onBet, phase }) => {
    const colW = 100 / 14;
    // Row Height for Numbers grid (Top 75% of board)
    const rowH = 25; 
    
    const bet = (id: string) => phase === 'betting' && onBet(id);

    const getChipPosition = (key: string): {left: string; top: string} => {
        if (CHIP_POSITIONS[key]) return CHIP_POSITIONS[key];
        const nums = getBetNumbers(key);
        if (nums.length === 0) return { left: '50%', top: '50%' };
        let totalLeft = 0, totalTop = 0;
        nums.forEach(n => {
            if (n === 0) { totalLeft += 3.57; totalTop += 37.5; } 
            else {
                const col = Math.ceil(n / 3);
                const row = n % 3 === 0 ? 0 : (3 - (n % 3));
                totalLeft += colW * (col + 0.5);
                // row 0 -> 12.5, row 1 -> 37.5, row 2 -> 62.5
                totalTop += row * rowH + 12.5; 
            }
        });

        // Street bet override (3 nums) - Bottom line of numbers
        if (nums.length === 3 && !nums.includes(0)) {
            const sorted = [...nums].sort((a, b) => a - b);
            if (sorted[0] >= 1 && sorted[2] - sorted[0] === 2) {
                return { left: `${totalLeft / 3}%`, top: '75%' };
            }
        }
        
        // Double Street (Line) bet override (6 nums) - Bottom line intersection
        if (nums.length === 6 && !nums.includes(0)) {
             const sorted = [...nums].sort((a, b) => a - b);
             if (sorted[5] - sorted[0] === 5) {
                 return { left: `${totalLeft / 6}%`, top: '75%' };
             }
        }

        return { left: `${totalLeft / nums.length}%`, top: `${totalTop / nums.length}%` };
    };

    const rowTop = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36];
    const rowMid = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35];
    const rowBot = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34];

    // Standard Casino Colors
    const COLOR_RED = 'bg-[#D92D28]';
    const COLOR_BLACK = 'bg-[#1F2633]';
    const COLOR_GREEN = 'bg-[#0C5C30]';
    const COLOR_HOVER = 'hover:brightness-125';
    
    // Improved Grid Lines
    const BORDER_COLOR = 'border-slate-500/50';

    return (
        <div className="w-full relative select-none">
            {/* Aspect ratio tuned for new layout: 3 rows full height, 2 rows half height */}
            <div className={`w-full aspect-[14/7] sm:aspect-[14/5] bg-[#0f172a] rounded-lg shadow-2xl ring-4 ring-slate-800 transition-all duration-300 border-2 ${BORDER_COLOR}`}>
                <div className="w-full h-full grid grid-cols-[1fr_repeat(12,1fr)_1fr] grid-rows-[repeat(3,1fr)_0.5fr_0.5fr] rounded-lg overflow-hidden">
                    
                    {/* Zero - spans 3 number rows */}
                    <div className={`${COLOR_GREEN} border-b ${BORDER_COLOR} flex items-center justify-center text-white font-bold cursor-pointer ${COLOR_HOVER} active:scale-95 transition-all`} style={{gridColumn:'1',gridRow:'1/4'}} onClick={()=>bet('0')}><span className="-rotate-90 sm:rotate-0 text-lg shadow-sm">0</span></div>
                    
                    {/* Numbers Grid */}
                    {rowTop.map((n,i)=><div key={n} className={`${RED_NUMBERS.has(n)? COLOR_RED : COLOR_BLACK} border-r border-b ${i===0?'border-l':''} ${BORDER_COLOR} flex items-center justify-center text-white font-bold text-[10px] sm:text-sm cursor-pointer ${COLOR_HOVER} transition-all`} style={{gridColumn:i+2,gridRow:1}} onClick={()=>bet(n.toString())}>{n}</div>)}
                    {rowMid.map((n,i)=><div key={n} className={`${RED_NUMBERS.has(n)? COLOR_RED : COLOR_BLACK} border-r border-b ${i===0?'border-l':''} ${BORDER_COLOR} flex items-center justify-center text-white font-bold text-[10px] sm:text-sm cursor-pointer ${COLOR_HOVER} transition-all`} style={{gridColumn:i+2,gridRow:2}} onClick={()=>bet(n.toString())}>{n}</div>)}
                    {rowBot.map((n,i)=><div key={n} className={`${RED_NUMBERS.has(n)? COLOR_RED : COLOR_BLACK} border-r border-b ${i===0?'border-l':''} ${BORDER_COLOR} flex items-center justify-center text-white font-bold text-[10px] sm:text-sm cursor-pointer ${COLOR_HOVER} transition-all`} style={{gridColumn:i+2,gridRow:3}} onClick={()=>bet(n.toString())}>{n}</div>)}
                    
                    {/* 2:1 Labels */}
                    {['row3','row2','row1'].map((k,i)=><div key={k} className={`bg-transparent border-b ${BORDER_COLOR} flex items-center justify-center text-slate-300 font-bold text-[8px] sm:text-xs cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:14,gridRow:i+1}} onClick={()=>bet(k)}>2:1</div>)}
                    
                    {/* Dozens - Reduced Height */}
                    <div className={`bg-transparent border-r border-b border-l ${BORDER_COLOR} flex items-center justify-center text-slate-300 font-bold text-[8px] sm:text-xs cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'2/6',gridRow:4}} onClick={()=>bet('1st12')}>1st 12</div>
                    <div className={`bg-transparent border-r border-b ${BORDER_COLOR} flex items-center justify-center text-slate-300 font-bold text-[8px] sm:text-xs cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'6/10',gridRow:4}} onClick={()=>bet('2nd12')}>2nd 12</div>
                    <div className={`bg-transparent border-r border-b ${BORDER_COLOR} flex items-center justify-center text-slate-300 font-bold text-[8px] sm:text-xs cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'10/14',gridRow:4}} onClick={()=>bet('3rd12')}>3rd 12</div>
                    
                    {/* Bottom Bets - Reduced Height */}
                    <div className={`bg-transparent border-r border-l ${BORDER_COLOR} flex items-center justify-center text-slate-300 font-bold text-[8px] sm:text-xs cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'2/4',gridRow:5}} onClick={()=>bet('1-18')}>1-18</div>
                    <div className={`bg-transparent border-r ${BORDER_COLOR} flex items-center justify-center text-slate-300 font-bold text-[8px] sm:text-xs cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'4/6',gridRow:5}} onClick={()=>bet('EVEN')}>EVEN</div>
                    
                    {/* Red/Black */}
                    <div className={`bg-transparent border-r ${BORDER_COLOR} flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'6/8',gridRow:5}} onClick={()=>bet('RED')}>
                        <div className={`w-8 h-4 sm:w-12 sm:h-6 ${COLOR_RED} rounded-sm shadow-sm flex items-center justify-center text-[8px] sm:text-[10px] text-white font-bold`}>RED</div>
                    </div>
                    <div className={`bg-transparent border-r ${BORDER_COLOR} flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'8/10',gridRow:5}} onClick={()=>bet('BLACK')}>
                        <div className={`w-8 h-4 sm:w-12 sm:h-6 ${COLOR_BLACK} rounded-sm border border-slate-600 shadow-sm flex items-center justify-center text-[8px] sm:text-[10px] text-white font-bold`}>BLACK</div>
                    </div>
                    
                    <div className={`bg-transparent border-r ${BORDER_COLOR} flex items-center justify-center text-slate-300 font-bold text-[8px] sm:text-xs cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'10/12',gridRow:5}} onClick={()=>bet('ODD')}>ODD</div>
                    <div className={`bg-transparent border-r ${BORDER_COLOR} flex items-center justify-center text-slate-300 font-bold text-[8px] sm:text-xs cursor-pointer hover:bg-white/5 transition-colors`} style={{gridColumn:'12/14',gridRow:5}} onClick={()=>bet('19-36')}>19-36</div>
                </div>
            </div>
            
            {/* Click handlers for split bets */}
            {/* Horizontal Splits */}
            {[0,1].map(rg=>Array.from({length:12},(_,c)=>{const col=c+1,t=col*3-(rg===0?0:1),b=col*3-(rg===0?1:2),id=`${Math.min(t,b)}_${Math.max(t,b)}`;return<div key={`hs${rg}${c}`} className="absolute cursor-pointer hover:bg-yellow-400/30 rounded-sm z-10" style={{left:`calc(${colW*(col+0.5)}% - 12px)`,top:`calc(${(rg+1)*rowH}% - 6px)`,width:'24px',height:'12px'}} onClick={()=>bet(id)}/>;}))}
            {/* Vertical Splits */}
            {[0,1,2].map(r=>Array.from({length:11},(_,c)=>{const col=c+1,l=col*3-(r===0?0:r===1?1:2),rt=(col+1)*3-(r===0?0:r===1?1:2),id=`${Math.min(l,rt)}_${Math.max(l,rt)}`;return<div key={`vs${r}${c}`} className="absolute cursor-pointer hover:bg-yellow-400/30 rounded-sm z-10" style={{left:`calc(${colW*(col+1)}% - 6px)`,top:`calc(${r*rowH+rowH/2}% - 12px)`,width:'12px',height:'24px'}} onClick={()=>bet(id)}/>;}))}
            {/* Corners */}
            {[0,1].map(rg=>Array.from({length:11},(_,c)=>{const col=c+1,tl=col*3-(rg===0?0:1),tr=(col+1)*3-(rg===0?0:1),bl=col*3-(rg===0?1:2),br=(col+1)*3-(rg===0?1:2),nums=[tl,tr,bl,br].sort((a,b)=>a-b),id=nums.join('_');return<div key={`cr${rg}${c}`} className="absolute cursor-pointer hover:bg-blue-400/30 rounded-full z-20" style={{left:`calc(${colW*(col+1)}% - 8px)`,top:`calc(${(rg+1)*rowH}% - 8px)`,width:'16px',height:'16px'}} onClick={()=>bet(id)}/>;}))}
            {/* Streets (rows of 3) - trigger at bottom of cell */}
            {Array.from({length:12},(_,c)=>{const col=c+1,id=`${(col-1)*3+1}_${(col-1)*3+2}_${(col-1)*3+3}`;return<div key={`st${c}`} className="absolute cursor-pointer hover:bg-purple-400/30 rounded-sm z-10" style={{left:`calc(${colW*(col+0.5)}% - 14px)`,top:'calc(75% - 7px)',width:'28px',height:'14px'}} onClick={()=>bet(id)}/>;}).flat()}
            {/* Double Streets (rows of 6) - trigger at intersection of bottom line and vertical separators */}
            {Array.from({length:11},(_,c)=>{const col=c+1,start=(col-1)*3+1,id=Array.from({length:6},(_,j)=>start+j).join('_');return<div key={`ds${c}`} className="absolute cursor-pointer hover:bg-orange-400/30 rounded-full z-20" style={{left:`calc(${colW*(col+1)}% - 8px)`,top:'calc(75% - 8px)',width:'16px',height:'16px'}} onClick={()=>bet(id)}/>;})}
            
            {/* Zero special bets */}
            <div className="absolute cursor-pointer hover:bg-yellow-400/30 rounded-sm z-10" style={{left:`calc(${colW}% - 6px)`,top:'calc(62.5% - 12px)',width:'12px',height:'24px'}} onClick={()=>bet('0_1')}/>
            <div className="absolute cursor-pointer hover:bg-yellow-400/30 rounded-sm z-10" style={{left:`calc(${colW}% - 6px)`,top:'calc(37.5% - 12px)',width:'12px',height:'24px'}} onClick={()=>bet('0_2')}/>
            <div className="absolute cursor-pointer hover:bg-yellow-400/30 rounded-sm z-10" style={{left:`calc(${colW}% - 6px)`,top:'calc(12.5% - 12px)',width:'12px',height:'24px'}} onClick={()=>bet('0_3')}/>
            
            <div className="absolute cursor-pointer hover:bg-purple-400/30 rounded-full z-20" style={{left:`calc(${colW}% - 7px)`,top:'calc(50% - 7px)',width:'14px',height:'14px'}} onClick={()=>bet('0_1_2')}/>
            <div className="absolute cursor-pointer hover:bg-purple-400/30 rounded-full z-20" style={{left:`calc(${colW}% - 7px)`,top:'calc(25% - 7px)',width:'14px',height:'14px'}} onClick={()=>bet('0_2_3')}/>
            {/* 0-1-2-3 (Basket/First Four) */}
            <div className="absolute cursor-pointer hover:bg-cyan-400/30 rounded-full z-20" style={{left:`calc(${colW}% - 8px)`,top:'calc(75% - 8px)',width:'16px',height:'16px'}} onClick={()=>bet('0_1_2_3')}/>
            
            {/* Placed Chips Layer */}
            <div className="absolute inset-0 pointer-events-none">
                {Object.entries(bets).map(([k,v])=>{
                    const p = getChipPosition(k);
                    return <div key={k} className="absolute -translate-x-1/2 -translate-y-1/2 z-40 transition-all duration-300 ease-out" style={{left:p.left,top:p.top}}><CasinoChip value={v} size="board"/></div>;
                })}
            </div>
        </div>
    );
};

export default BettingBoard;