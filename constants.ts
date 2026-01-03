export const WIN_SCORE = 100;
export const SPAWN_RATE_MS = 600; 
export const GRAVITY_SPEED_BASE = 0.5;
export const PLAYER_WIDTH_PERCENT = 18; 
export const ITEM_WIDTH_PERCENT = 12;

export const ASSETS = {
  playerOptions: ['👸', '🐱'],
  good: ['🎂', '🎁', '💖', '🧁', '👑'],
  bad: ['🥦', '💣', '🐜']
};

export const COLORS = {
  textPrimary: 'text-pink-600',
  buttonBg: 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500',
};

// --- AUDIO SYSTEM (Web Audio API) ---
// Gera sons simples sem precisar de arquivos externos
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

export const playSound = (type: 'collect' | 'damage' | 'win' | 'explosion' | 'happy_birthday') => {
  const ctx = initAudio();
  if (!ctx) return;
  const now = ctx.currentTime;

  if (type === 'collect') {
    // Efeito "Nham" / "Crunch" (Comendo)
    const bufferSize = ctx.sampleRate * 0.15;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(1200, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.15); 

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.linearRampToValueAtTime(800, now + 0.1); 
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.1);
    
    osc.start(now);
    osc.stop(now + 0.1);

  } else if (type === 'damage') {
    // Efeito "Eca" / "Pou doente"
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 30;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 40; 
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start(now);
    lfo.stop(now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.start(now);
    osc.stop(now + 0.4);

  } else if (type === 'explosion') {
     // Explosão
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     osc.connect(gain);
     gain.connect(ctx.destination);

     osc.type = 'square';
     osc.frequency.setValueAtTime(100, now);
     osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.8);
     gain.gain.setValueAtTime(0.5, now);
     gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
     osc.start(now);
     osc.stop(now + 0.8);

  } else if (type === 'win') {
    // Fanfarra curta
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const time = now + (i * 0.12);
      osc.frequency.value = freq;
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
      osc.start(time);
      osc.stop(time + 0.5);
    });
  } else if (type === 'happy_birthday') {
    // Melodia de Parabéns pra Você (Key: G Major / adaptado)
    // Notas: G4 G4 A4 G4 C5 B4 ... G4 G4 A4 G4 D5 C5
    const G4 = 392.00;
    const A4 = 440.00;
    const B4 = 493.88;
    const C5 = 523.25;
    const D5 = 587.33;

    const melody = [
        { f: G4, d: 0.3, t: 0 },
        { f: G4, d: 0.1, t: 0.4 },
        { f: A4, d: 0.4, t: 0.6 },
        { f: G4, d: 0.4, t: 1.1 },
        { f: C5, d: 0.4, t: 1.6 },
        { f: B4, d: 0.8, t: 2.1 }, // ...nesta data querida
        
        { f: G4, d: 0.3, t: 3.1 },
        { f: G4, d: 0.1, t: 3.5 },
        { f: A4, d: 0.4, t: 3.7 },
        { f: G4, d: 0.4, t: 4.2 },
        { f: D5, d: 0.4, t: 4.7 },
        { f: C5, d: 0.8, t: 5.2 }, // ...muitas felicidades
    ];

    melody.forEach(({f, d, t}) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle'; // Timbre suave tipo flauta/piano 8-bit
        osc.frequency.value = f;
        
        const startTime = now + t;
        const endTime = startTime + d;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Attack
        gain.gain.setValueAtTime(0.3, endTime - 0.05);
        gain.gain.linearRampToValueAtTime(0, endTime); // Release

        osc.start(startTime);
        osc.stop(endTime);
    });
  }
};