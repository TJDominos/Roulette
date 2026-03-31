
import { WHEEL_NUMBERS, RED_NUMBERS } from '../constants';
import { GameStats, BackendBetEntry } from '../types';

class MockBackendService {
    private history: number[] = [];

    constructor() {
        // Generate initial 100 spins for better stats
        for (let i = 0; i < 100; i++) {
            this.history.unshift(WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)]);
        }
    }

    async getInitialData(): Promise<{ history: number[], stats: GameStats }> {
        return new Promise((resolve) => {
             setTimeout(() => {
                resolve({
                    history: this.history.slice(0, 20),
                    stats: this.calculateStats()
                });
             }, 100);
        });
    }

    async placeBets(bets: BackendBetEntry[]): Promise<{ result: number, history: number[], stats: GameStats }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Determine result
                const result = WHEEL_NUMBERS[Math.floor(Math.random() * WHEEL_NUMBERS.length)];
                
                // Update Server State
                this.history.unshift(result);
                if (this.history.length > 500) this.history.pop(); // Keep manageable size

                // Calculate fresh stats
                const stats = this.calculateStats();

                resolve({
                    result,
                    history: this.history.slice(0, 20), // Return top 20 for the bar
                    stats
                });
            }, 500); // Simulate Network Latency
        });
    }

    private calculateStats(): GameStats {
        // Stats based on last 100 spins (Updated from 50)
        const last100 = this.history.slice(0, 100);
        const total = last100.length || 1;
        
        let red = 0, black = 0, even = 0, odd = 0, low = 0, high = 0, zero = 0;
        const freq: Record<number, number> = {};
        
        // Initialize all numbers to 0 to find true cold numbers
        for (let i = 0; i <= 36; i++) freq[i] = 0;

        last100.forEach(n => {
            freq[n]++;
            if (n === 0) {
                zero++;
            } else {
                if (RED_NUMBERS.has(n)) red++; else black++;
                if (n % 2 === 0) even++; else odd++;
                if (n <= 18) low++; else high++;
            }
        });

        // Hot: Top 3 frequent
        const hot = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([n]) => parseInt(n));

        // Cold: Bottom 3 frequent (Ascending count)
        const cold = Object.entries(freq)
            .sort((a, b) => a[1] - b[1])
            .slice(0, 3)
            .map(([n]) => parseInt(n));

        const toPct = (val: number) => parseFloat(((val / total) * 100).toFixed(1));

        return {
            hot,
            cold,
            redPct: toPct(red),
            blackPct: toPct(black),
            evenPct: toPct(even),
            oddPct: toPct(odd),
            lowPct: toPct(low),
            highPct: toPct(high),
            zeroPct: toPct(zero)
        };
    }
}

export const mockBackend = new MockBackendService();