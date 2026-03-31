import { RED_NUMBERS } from './constants';
import { BackendBetEntry, BackendBetType } from './types';

export const getNumberColor = (num: number): string => {
  if (num === 0) return 'green';
  if (RED_NUMBERS.has(num)) return 'red';
  return 'black';
};

export const getChipColor = (value: number) => {
  if (value === 1) return 'bg-gray-300 text-gray-900 ring-gray-400'; 
  if (value === 2) return 'bg-blue-600 text-white ring-blue-400';
  if (value === 5) return 'bg-white text-gray-900 ring-yellow-500';
  if (value === 10) return 'bg-red-600 text-white ring-red-400';
  if (value === 20) return 'bg-emerald-600 text-white ring-emerald-400';
  return 'bg-gray-500';
};

export const getBetNumbers = (betId: string): number[] => {
  if (betId.includes('_')) {
      return betId.split('_').map(Number);
  }
  const n = parseInt(betId);
  if (!isNaN(n)) return [n];
  return [];
};

export const calculateWinnings = (result: number, bets: Record<string, number>): number => {
  let winnings = 0;
  Object.entries(bets).forEach(([betId, amount]) => {
      let isWin = false, multiplier = 0;

      if (betId.match(/^[\d_]+$/)) {
          const numbers = getBetNumbers(betId);
          if (numbers.includes(result)) { 
              isWin = true; 
              multiplier = 36 / numbers.length; 
          }
      } else {
          switch(betId) {
              case '1st12': isWin = result >= 1 && result <= 12; multiplier = 3; break;
              case '2nd12': isWin = result >= 13 && result <= 24; multiplier = 3; break;
              case '3rd12': isWin = result >= 25 && result <= 36; multiplier = 3; break;
              case '1-18': isWin = result >= 1 && result <= 18; multiplier = 2; break;
              case '19-36': isWin = result >= 19 && result <= 36; multiplier = 2; break;
              case 'EVEN': isWin = result !== 0 && result % 2 === 0; multiplier = 2; break;
              case 'ODD': isWin = result !== 0 && result % 2 !== 0; multiplier = 2; break;
              case 'RED': isWin = RED_NUMBERS.has(result); multiplier = 2; break;
              case 'BLACK': isWin = !RED_NUMBERS.has(result) && result !== 0; multiplier = 2; break;
              case 'row1': isWin = result !== 0 && result % 3 === 1; multiplier = 3; break;
              case 'row2': isWin = result !== 0 && result % 3 === 2; multiplier = 3; break;
              case 'row3': isWin = result !== 0 && result % 3 === 0; multiplier = 3; break;
          }
      }
      if (isWin) winnings += amount * multiplier;
  });
  return winnings;
};

export const getHotCold = (history: number[]) => {
  const freq: Record<number, number> = {};
  for (let i = 0; i <= 36; i++) freq[i] = 0;
  history.slice(0, 50).forEach(n => freq[n]++);
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return { 
      hot: sorted.slice(0, 3).map(([n]) => +n), 
      cold: sorted.slice(-3).reverse().map(([n]) => +n) 
  };
};

// Converts local betting state to backend data structure
export const prepareBetsForBackend = (bets: Record<string, number>): BackendBetEntry[] => {
    return Object.entries(bets).map(([betId, amount]) => {
      let betType: BackendBetType;
  
      // Mapped Strings
      if (betId === 'row1') betType = { Column1: null };
      else if (betId === 'row2') betType = { Column2: null };
      else if (betId === 'row3') betType = { Column3: null };
      else if (betId === '1st12') betType = { Dozen1: null };
      else if (betId === '2nd12') betType = { Dozen2: null };
      else if (betId === '3rd12') betType = { Dozen3: null };
      else if (betId === 'RED') betType = { Red: null };
      else if (betId === 'BLACK') betType = { Black: null };
      else if (betId === 'EVEN') betType = { Even: null };
      else if (betId === 'ODD') betType = { Odd: null };
      else if (betId === '1-18') betType = { Low: null };
      else if (betId === '19-36') betType = { High: null };
      else {
        // Number Sets
        const nums = getBetNumbers(betId);
        const len = nums.length;
        
        if (len === 1) {
          betType = { Straight: nums[0] };
        } else if (len === 2) {
          betType = { Split: nums };
        } else if (len === 3) {
          // 0-1-2 or 0-2-3 -> Trio
          if (nums.includes(0)) {
             betType = { Trio: nums };
          } else {
             betType = { Street: nums };
          }
        } else if (len === 4) {
          // 0-1-2-3 -> Basket
          if (nums.includes(0)) {
              betType = { Basket: nums };
          } else {
              betType = { Corner: nums };
          }
        } else if (len === 6) {
          betType = { Line: nums };
        } else {
           // Fallback
           console.warn("Unknown bet pattern:", betId, nums);
           betType = { Straight: 0 }; 
        }
      }
  
      return { betType, amount };
    });
  };