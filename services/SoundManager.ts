class SoundManager {
    private ctx: AudioContext | null = null;
    private gain: GainNode | null = null;
    private muted = false;

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.gain = this.ctx.createGain();
            this.gain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    setMuted(m: boolean) {
        this.muted = m;
        if (this.gain) this.gain.gain.value = m ? 0 : 1;
    }

    playChipSelect() {
        if (this.muted) return;
        this.init();
        if (!this.ctx || !this.gain) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g);
        g.connect(this.gain);
        o.frequency.setValueAtTime(1800, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.03);
        g.gain.setValueAtTime(0.2, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
        o.start();
        o.stop(this.ctx.currentTime + 0.06);
    }

    playChipPlace() {
        if (this.muted) return;
        this.init();
        if (!this.ctx || !this.gain) return;
        const now = this.ctx.currentTime;
        
        // Ceramic click
        const o1 = this.ctx.createOscillator();
        const g1 = this.ctx.createGain();
        const f1 = this.ctx.createBiquadFilter();
        o1.connect(f1);
        f1.connect(g1);
        g1.connect(this.gain);
        o1.type = 'triangle';
        o1.frequency.setValueAtTime(2800, now);
        o1.frequency.exponentialRampToValueAtTime(1200, now + 0.04);
        f1.type = 'bandpass';
        f1.frequency.value = 2000;
        f1.Q.value = 2;
        g1.gain.setValueAtTime(0.3, now);
        g1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        o1.start();
        o1.stop(now + 0.1);
        
        // Thump
        const o2 = this.ctx.createOscillator();
        const g2 = this.ctx.createGain();
        o2.connect(g2);
        g2.connect(this.gain);
        o2.frequency.setValueAtTime(150, now);
        o2.frequency.exponentialRampToValueAtTime(60, now + 0.08);
        g2.gain.setValueAtTime(0.25, now);
        g2.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        o2.start();
        o2.stop(now + 0.1);
    }

    // Synchronized spin sound - takes duration parameter
    playSpinSound(duration = 4000) {
        if (this.muted) return;
        this.init();
        if (!this.ctx || !this.gain) return;
        
        const now = this.ctx.currentTime;
        const dur = duration / 1000;

        // Ball clicks - start fast, slow down (no scratching/friction)
        let t = 0;
        let interval = 0.04;
        // Increased iteration limit from 50 to 200 to support longer durations (10s+)
        for (let i = 0; i < 200 && t < dur - 0.5; i++) {
            const ct = now + t;
            const prog = t / dur;
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.connect(g);
            g.connect(this.gain);
            o.frequency.setValueAtTime(1800 - prog * 800 + Math.random() * 200, ct);
            o.frequency.exponentialRampToValueAtTime(900, ct + 0.015);
            g.gain.setValueAtTime(0.15 * (1 - prog * 0.3), ct);
            g.gain.exponentialRampToValueAtTime(0.01, ct + 0.025);
            o.start(ct);
            o.stop(ct + 0.03);
            t += interval;
            interval *= 1.06; // Slow down
        }

        // Ball drop bounces - plays at end of spin
        const dropTime = now + dur - 0.4;
        const bounces = [
            { delay: 0, freq: 800, vol: 0.35 },
            { delay: 0.1, freq: 700, vol: 0.28 },
            { delay: 0.17, freq: 650, vol: 0.22 },
            { delay: 0.23, freq: 600, vol: 0.16 },
            { delay: 0.28, freq: 550, vol: 0.12 }
        ];
        
        bounces.forEach(({ delay, freq, vol }) => {
            const o = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            o.connect(g);
            g.connect(this.gain!);
            o.frequency.setValueAtTime(freq, dropTime + delay);
            o.frequency.exponentialRampToValueAtTime(freq * 0.6, dropTime + delay + 0.06);
            g.gain.setValueAtTime(vol, dropTime + delay);
            g.gain.exponentialRampToValueAtTime(0.01, dropTime + delay + 0.08);
            o.start(dropTime + delay);
            o.stop(dropTime + delay + 0.08);
        });

        // Gentle suspense tone
        const so = this.ctx.createOscillator();
        const sg = this.ctx.createGain();
        so.connect(sg);
        sg.connect(this.gain);
        so.frequency.setValueAtTime(60, now);
        so.frequency.linearRampToValueAtTime(80, now + dur * 0.7);
        so.frequency.linearRampToValueAtTime(50, now + dur);
        sg.gain.setValueAtTime(0.03, now);
        sg.gain.linearRampToValueAtTime(0.08, now + dur * 0.8);
        sg.gain.linearRampToValueAtTime(0.01, now + dur);
        so.start(now);
        so.stop(now + dur);
    }

    playWin() {
        if (this.muted) return;
        this.init();
        if (!this.ctx || !this.gain) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((f, i) => {
            const o = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            o.connect(g);
            g.connect(this.gain!);
            o.frequency.value = f;
            g.gain.setValueAtTime(0.25, now + i * 0.08);
            g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.08 + 0.5);
            o.start(now + i * 0.08);
            o.stop(now + i * 0.08 + 0.5);
        });
    }

    playLose() {
        if (this.muted) return;
        this.init();
        if (!this.ctx || !this.gain) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g);
        g.connect(this.gain);
        o.frequency.setValueAtTime(350, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.6);
        g.gain.setValueAtTime(0.15, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.6);
        o.start();
        o.stop(this.ctx.currentTime + 0.6);
    }

    playUndo() {
        if (this.muted) return;
        this.init();
        if (!this.ctx || !this.gain) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g);
        g.connect(this.gain);
        o.frequency.setValueAtTime(800, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.12);
        g.gain.setValueAtTime(0.2, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        o.start();
        o.stop(this.ctx.currentTime + 0.12);
    }

    playClear() {
        if (this.muted) return;
        this.init();
        if (!this.ctx || !this.gain) return;
        const o = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        o.connect(g);
        g.connect(this.gain);
        o.frequency.setValueAtTime(600, this.ctx.currentTime);
        o.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.15);
        g.gain.setValueAtTime(0.15, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        o.start();
        o.stop(this.ctx.currentTime + 0.15);
    }
}

export const soundManager = new SoundManager();