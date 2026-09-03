/**
 * Web Audio API sound effects generator.
 * No external audio files needed — all sounds are synthesized.
 */
const AudioManager = (() => {

    let ctx = null;

    function getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (ctx.state === 'suspended') {
            ctx.resume();
        }
        return ctx;
    }

    function playClick() {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
        osc.connect(gain).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.08);
    }

    function playWin() {
        const ac = getCtx();
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ac.currentTime + i * 0.08);
            gain.gain.linearRampToValueAtTime(0.12, ac.currentTime + i * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + i * 0.08 + 0.2);
            osc.connect(gain).connect(ac.destination);
            osc.start(ac.currentTime + i * 0.08);
            osc.stop(ac.currentTime + i * 0.08 + 0.2);
        });
    }

    function playLose() {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ac.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.4);
        gain.gain.setValueAtTime(0.12, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
        osc.connect(gain).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.4);
    }

    function playHover() {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.03, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.03);
        osc.connect(gain).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.03);
    }

    function playDangerTick() {
        const ac = getCtx();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = 'sine';
        osc.frequency.value = 600;
        gain.gain.setValueAtTime(0.06, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);
        osc.connect(gain).connect(ac.destination);
        osc.start();
        osc.stop(ac.currentTime + 0.05);
    }

    return { playClick, playWin, playLose, playHover, playDangerTick };

})();