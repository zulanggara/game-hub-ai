import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

const STORAGE_KEY = "hog:ambient";
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

interface StoredPrefs {
  enabled: boolean;
  volume: number;
}

function loadPrefs(): StoredPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { enabled: false, volume: 0.45 };
    return { enabled: false, volume: JSON.parse(raw).volume ?? 0.45 };
  } catch {
    return { enabled: false, volume: 0.45 };
  }
}

/** Small generative drone + wind + windchime engine — no external audio files needed. */
class AmbientEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private stoppers: Array<() => void> = [];
  private chimeHandle: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  start(volume: number) {
    if (this.running) return;
    this.running = true;
    const ctx = new AudioContext();
    this.ctx = ctx;

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    this.master = master;

    // --- low drone pad ---
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.2;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 380;
    filter.connect(droneGain);
    droneGain.connect(master);

    const droneFreqs = [65.41, 98.0, 130.81];
    const droneOscs = droneFreqs.map((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
      return osc;
    });

    const filterLfo = ctx.createOscillator();
    filterLfo.frequency.value = 0.045;
    const filterLfoGain = ctx.createGain();
    filterLfoGain.gain.value = 140;
    filterLfo.connect(filterLfoGain);
    filterLfoGain.connect(filter.frequency);
    filterLfo.start();

    // --- wind (filtered noise) ---
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    const windFilter = ctx.createBiquadFilter();
    windFilter.type = "bandpass";
    windFilter.frequency.value = 500;
    windFilter.Q.value = 0.6;
    const windGain = ctx.createGain();
    windGain.gain.value = 0.045;
    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(master);
    noise.start();

    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.07;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 220;
    windLfo.connect(windLfoGain);
    windLfoGain.connect(windFilter.frequency);
    windLfo.start();

    // --- sparse windchime shimmer ---
    const delay = ctx.createDelay();
    delay.delayTime.value = 0.4;
    const feedback = ctx.createGain();
    feedback.gain.value = 0.32;
    delay.connect(feedback);
    feedback.connect(delay);
    const chimeBus = ctx.createGain();
    chimeBus.gain.value = 0.14;
    chimeBus.connect(delay);
    delay.connect(master);
    chimeBus.connect(master);

    const scheduleChime = () => {
      this.chimeHandle = setTimeout(() => {
        const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = freq;
        const g = ctx.createGain();
        g.gain.value = 0;
        osc.connect(g);
        g.connect(chimeBus);
        const now = ctx.currentTime;
        g.gain.linearRampToValueAtTime(0.5, now + 0.06);
        g.gain.exponentialRampToValueAtTime(0.0015, now + 2.8);
        osc.start(now);
        osc.stop(now + 3);
        scheduleChime();
      }, 3200 + Math.random() * 5200);
    };
    scheduleChime();

    this.stoppers = [
      ...droneOscs.map((o) => () => o.stop()),
      () => filterLfo.stop(),
      () => noise.stop(),
      () => windLfo.stop(),
    ];
  }

  setVolume(volume: number) {
    if (!this.ctx || !this.master) return;
    this.master.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.25);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.chimeHandle) clearTimeout(this.chimeHandle);
    this.stoppers.forEach((fn) => {
      try {
        fn();
      } catch {
        /* already stopped */
      }
    });
    this.stoppers = [];
    this.ctx?.close();
    this.ctx = null;
    this.master = null;
  }
}

interface AmbientContextValue {
  enabled: boolean;
  toggle: () => void;
  volume: number;
  setVolume: (v: number) => void;
}

const AmbientContext = createContext<AmbientContextValue | null>(null);

export function AmbientMusicProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<StoredPrefs>(() => loadPrefs());
  const engineRef = useRef<AmbientEngine | null>(null);

  if (!engineRef.current) engineRef.current = new AmbientEngine();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: prefs.volume }));
  }, [prefs.volume]);

  useEffect(() => {
    const engine = engineRef.current!;
    if (prefs.enabled) engine.start(prefs.volume);
    else engine.stop();
    // volume-only changes are handled by the effect below via setVolume,
    // not by restarting the whole audio graph.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs.enabled]);

  useEffect(() => {
    engineRef.current?.setVolume(prefs.volume);
  }, [prefs.volume]);

  useEffect(() => {
    const engine = engineRef.current;
    return () => engine?.stop();
  }, []);

  const value = useMemo(
    () => ({
      enabled: prefs.enabled,
      toggle: () => setPrefs((p) => ({ ...p, enabled: !p.enabled })),
      volume: prefs.volume,
      setVolume: (v: number) => setPrefs((p) => ({ ...p, volume: v })),
    }),
    [prefs.enabled, prefs.volume]
  );

  return <AmbientContext.Provider value={value}>{children}</AmbientContext.Provider>;
}

export function useAmbientMusic() {
  const ctx = useContext(AmbientContext);
  if (!ctx) throw new Error("useAmbientMusic must be used within AmbientMusicProvider");
  return ctx;
}
