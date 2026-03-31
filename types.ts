
export type GamePhase = 'betting' | 'locked' | 'spinning' | 'result';

export interface PlayerBet {
  id: string;
  username: string;
  number: string;
  amount: number;
}

export interface BetAction {
  id: string;
  amount: number;
}

export interface ChipProps {
  value: number;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "board" | "selector";
}

export interface GameRecord {
  id: number;
  result: number;
  betAmount: number;
  winAmount: number;
  timestamp: Date;
}

export interface GameStats {
    hot: number[];
    cold: number[];
    redPct: number;
    blackPct: number;
    evenPct: number;
    oddPct: number;
    lowPct: number;
    highPct: number;
    zeroPct: number;
}

// Backend Data Structures (Motoko/Candid Compatibility)
export type BackendBetType = 
    | { Straight: number }
    | { Split: number[] }
    | { Street: number[] }
    | { Corner: number[] }
    | { Line: number[] }
    | { Trio: number[] }
    | { Basket: number[] }
    | { Column1: null }
    | { Column2: null }
    | { Column3: null }
    | { Dozen1: null }
    | { Dozen2: null }
    | { Dozen3: null }
    | { Red: null }
    | { Black: null }
    | { Odd: null }
    | { Even: null }
    | { Low: null }
    | { High: null };

export interface BackendBetEntry {
    betType: BackendBetType;
    amount: number;
}
