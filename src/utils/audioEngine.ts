import { SoundscapeType } from "../types";

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private currentType: SoundscapeType = "none";
  private masterGain: GainNode | null = null;
  private activeNodes: { stop?: () => void; disconnect?: () => void }[] = [];
  private isPlaying = false;
  private volume = 0.4;
  private crackleInterval: number | null = null;
  private birdInterval: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (!this.masterGain && this.ctx) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): SoundscapeType {
    return this.currentType;
  }

  public isSoundPlaying(): boolean {
    return this.isPlaying;
  }

  public stop() {
    if (this.crackleInterval) {
      window.clearInterval(this.crackleInterval);
      this.crackleInterval = null;
    }
    if (this.birdInterval) {
      window.clearInterval(this.birdInterval);
      this.birdInterval = null;
    }

    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
    }

    setTimeout(() => {
      this.activeNodes.forEach((node) => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch {
          // ignore
        }
      });
      this.activeNodes = [];
      this.isPlaying = false;
      this.currentType = "none";
    }, 200);
  }

  public play(type: SoundscapeType) {
    if (type === "none") {
      this.stop();
      return;
    }

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // If changing sound, stop previous
    this.stop();

    setTimeout(() => {
      if (!this.ctx || !this.masterGain) return;
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.currentType = type;
      this.isPlaying = true;

      switch (type) {
        case "rain":
          this.playRain();
          break;
        case "fireplace":
          this.playFireplace();
          break;
        case "alpha_waves":
          this.playAlphaWaves();
          break;
        case "birds":
          this.playBirds();
          break;
      }
    }, 220);
  }

  private playRain() {
    if (!this.ctx || !this.masterGain) return;

    // Pink/Brown noise generator
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Low pass filter for soft rainfall texture
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(850, this.ctx.currentTime);

    // High pass to eliminate deep hum
    const hpFilter = this.ctx.createBiquadFilter();
    hpFilter.type = "highpass";
    hpFilter.frequency.setValueAtTime(200, this.ctx.currentTime);

    whiteNoise.connect(hpFilter);
    hpFilter.connect(filter);
    filter.connect(this.masterGain);

    whiteNoise.start();
    this.activeNodes.push(whiteNoise, filter, hpFilter);
  }

  private playFireplace() {
    if (!this.ctx || !this.masterGain) return;

    // Low rumble bed
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.04;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.setValueAtTime(320, this.ctx.currentTime);

    noise.connect(lowpass);
    lowpass.connect(this.masterGain);
    noise.start();
    this.activeNodes.push(noise, lowpass);

    // Dynamic crackle bursts
    const triggerCrackle = () => {
      if (!this.ctx || !this.isPlaying || this.currentType !== "fireplace" || !this.masterGain) return;
      const crackleGain = this.ctx.createGain();
      const pop = this.ctx.createBufferSource();
      const popBuffer = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * 0.05), this.ctx.sampleRate);
      const popData = popBuffer.getChannelData(0);
      for (let i = 0; i < popData.length; i++) {
        popData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (popData.length * 0.2));
      }
      pop.buffer = popBuffer;

      const bandpass = this.ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 1200 + Math.random() * 2200;
      bandpass.Q.value = 4.0;

      crackleGain.gain.setValueAtTime(0.08 + Math.random() * 0.14, this.ctx.currentTime);

      pop.connect(bandpass);
      bandpass.connect(crackleGain);
      crackleGain.connect(this.masterGain);

      pop.start();
      pop.onended = () => {
        pop.disconnect();
        bandpass.disconnect();
        crackleGain.disconnect();
      };
    };

    this.crackleInterval = window.setInterval(() => {
      if (Math.random() > 0.4) {
        triggerCrackle();
      }
    }, 280);
  }

  private playAlphaWaves() {
    if (!this.ctx || !this.masterGain) return;

    // Carrier frequency: 196 Hz (G3 note)
    // Left ear 196Hz, Right ear 206Hz => 10Hz Alpha brainwave rhythm
    const leftOsc = this.ctx.createOscillator();
    const rightOsc = this.ctx.createOscillator();
    leftOsc.type = "sine";
    rightOsc.type = "sine";
    leftOsc.frequency.setValueAtTime(196, this.ctx.currentTime);
    rightOsc.frequency.setValueAtTime(206, this.ctx.currentTime);

    // Spatial panner for stereo binaural immersion
    const merger = this.ctx.createChannelMerger(2);
    const leftGain = this.ctx.createGain();
    const rightGain = this.ctx.createGain();
    leftGain.gain.value = 0.22;
    rightGain.gain.value = 0.22;

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);

    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(this.masterGain);

    leftOsc.start();
    rightOsc.start();
    this.activeNodes.push(leftOsc, rightOsc, leftGain, rightGain, merger);
  }

  private playBirds() {
    if (!this.ctx || !this.masterGain) return;

    // Gentle ambient warm breeze
    const bufferSize = this.ctx.sampleRate * 2;
    const breezeBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = breezeBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.015;
    }
    const breeze = this.ctx.createBufferSource();
    breeze.buffer = breezeBuffer;
    breeze.loop = true;

    const breezeFilter = this.ctx.createBiquadFilter();
    breezeFilter.type = "lowpass";
    breezeFilter.frequency.value = 450;

    breeze.connect(breezeFilter);
    breezeFilter.connect(this.masterGain);
    breeze.start();
    this.activeNodes.push(breeze, breezeFilter);

    // Procedural bird chirps
    const chirp = () => {
      if (!this.ctx || !this.isPlaying || this.currentType !== "birds" || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 2200 + Math.random() * 1200;
      const now = this.ctx.currentTime;
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.22);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    };

    this.birdInterval = window.setInterval(() => {
      if (Math.random() > 0.45) {
        chirp();
        if (Math.random() > 0.5) {
          setTimeout(chirp, 120);
        }
      }
    }, 1800);
  }
}

export const soundscapeEngine = new SoundscapeEngine();
