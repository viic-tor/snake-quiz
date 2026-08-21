class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.isMuted = false;
    this.bgmInterval = null;
    this.isBgmPlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.connect(this.ctx.destination);
    this.masterGain.gain.value = this.isMuted ? 0 : 0.3; 
    
    // Resume context si estaba suspendido (por políticas de autoplay)
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.init(); // Asegurarnos de tener el contexto
    this.isMuted = !this.isMuted;
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.3, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  _playTone(freq, type, duration, vol = 1, slideToFreq = null) {
    if (!this.ctx || this.isMuted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (slideToFreq) {
        osc.frequency.exponentialRampToValueAtTime(slideToFreq, this.ctx.currentTime + duration);
      }

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play failed:", e);
    }
  }

  playHover() {
    this._playTone(800, 'square', 0.05, 0.05);
  }

  playClick() {
    this._playTone(1200, 'square', 0.1, 0.1, 1500);
  }

  playEat() {
    this._playTone(400, 'square', 0.15, 0.2, 800);
  }

  playCorrect() {
    this._playTone(440, 'square', 0.1, 0.2); 
    setTimeout(() => this._playTone(554, 'square', 0.1, 0.2), 100); 
    setTimeout(() => this._playTone(659, 'square', 0.3, 0.2), 200); 
  }

  playWrong() {
    this._playTone(150, 'sawtooth', 0.3, 0.3, 100);
  }

  playCrash() {
    this._playTone(100, 'square', 0.4, 0.4, 40);
  }

  playLevelUp() {
    this._playTone(440, 'square', 0.1, 0.2);
    setTimeout(() => this._playTone(659, 'square', 0.1, 0.2), 100);
    setTimeout(() => this._playTone(880, 'square', 0.3, 0.2), 200);
  }

  startBGM() {
    if (this.isBgmPlaying) return;
    this.isBgmPlaying = true;
    
    // Un loop muy sencillo y sutil de 8-bit bassline
    let step = 0;
    const notes = [220, 220, 261, 293, 220, 220, 196, 261];
    
    this.bgmInterval = setInterval(() => {
      if (!this.ctx || this.isMuted) return;
      const freq = notes[step % notes.length];
      this._playTone(freq, 'triangle', 0.2, 0.03); // Volumen muy bajo para no molestar
      step++;
    }, 250);
  }

  // --- POWERUP SOUNDS ---
  
  powerupAppear() {
    this._playTone(880, 'sine', 0.1, 0.1, 1200);
    setTimeout(() => this._playTone(1200, 'sine', 0.2, 0.1, 1760), 100);
  }

  powerupCollectCommon() {
    this._playTone(600, 'square', 0.1, 0.15, 800);
  }

  powerupCollectRare() {
    this._playTone(700, 'square', 0.1, 0.15, 900);
    setTimeout(() => this._playTone(900, 'square', 0.1, 0.15, 1100), 100);
  }

  powerupCollectEpic() {
    this._playTone(400, 'square', 0.1, 0.2, 600);
    setTimeout(() => this._playTone(600, 'square', 0.2, 0.2, 800), 100);
  }

  powerupCollectLegendary() {
    this._playTone(440, 'sine', 0.1, 0.2);
    setTimeout(() => this._playTone(554, 'sine', 0.1, 0.2), 100);
    setTimeout(() => this._playTone(659, 'sine', 0.1, 0.2), 200);
    setTimeout(() => this._playTone(880, 'sine', 0.3, 0.2), 300);
  }

  powerupCollectMythic() {
    this._playTone(300, 'sawtooth', 0.1, 0.3, 400);
    setTimeout(() => this._playTone(400, 'sawtooth', 0.1, 0.3, 600), 100);
    setTimeout(() => this._playTone(600, 'sawtooth', 0.4, 0.3, 1200), 200);
  }

  powerupBounce() {
    this._playTone(200, 'sine', 0.3, 0.3, 600);
  }

  slowMoStart() {
    this._playTone(800, 'sawtooth', 0.5, 0.2, 200);
  }

  slowMoEnd() {
    this._playTone(200, 'sawtooth', 0.5, 0.2, 800);
  }

  shieldBreak() {
    this._playTone(800, 'square', 0.1, 0.3, 100);
    setTimeout(() => this._playTone(400, 'square', 0.2, 0.3, 50), 100);
  }

  freezeTime() {
    this._playTone(1000, 'sine', 0.5, 0.2, 1000);
  }


  stopBGM() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
