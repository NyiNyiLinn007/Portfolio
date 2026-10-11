/**
 * Procedural ambient soundscape (soft rain + low synth pad) generated with the
 * Web Audio API — no audio files to download. Never starts automatically: it is
 * only created after the visitor deliberately clicks the sound toggle.
 */
class AmbientSound {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private nodes: AudioScheduledSourceNode[] = []

  get supported() {
    return typeof window !== 'undefined' && ('AudioContext' in window || 'webkitAudioContext' in window)
  }

  async start() {
    if (!this.supported) return false
    if (!this.ctx) this.build()
    const ctx = this.ctx!
    if (ctx.state === 'suspended') await ctx.resume()
    const now = ctx.currentTime
    this.master!.gain.cancelScheduledValues(now)
    this.master!.gain.setTargetAtTime(0.32, now, 0.8)
    return true
  }

  stop() {
    if (!this.ctx || !this.master) return
    const now = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(now)
    this.master.gain.setTargetAtTime(0, now, 0.35)
    const ctx = this.ctx
    window.setTimeout(() => {
      if (this.master && this.master.gain.value < 0.01) void ctx.suspend()
    }, 1500)
  }

  dispose() {
    this.nodes.forEach((n) => {
      try {
        n.stop()
      } catch {
        /* already stopped */
      }
    })
    this.nodes = []
    void this.ctx?.close()
    this.ctx = null
    this.master = null
  }

  private build() {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()
    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    // Rain: filtered pink-ish noise
    const length = ctx.sampleRate * 4
    const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      let last = 0
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1
        last = (last + 0.04 * white) / 1.04
        data[i] = last * 3.2 + white * 0.04
      }
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    noise.loop = true
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 1400
    const rainGain = ctx.createGain()
    rainGain.gain.value = 0.55
    noise.connect(lowpass).connect(rainGain).connect(master)
    noise.start()
    this.nodes.push(noise)

    // Pad: two detuned sines with slow tremolo
    const padGain = ctx.createGain()
    padGain.gain.value = 0.05
    padGain.connect(master)
    ;[110, 164.81, 220.5].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.detune.value = i * 4 - 4
      const g = ctx.createGain()
      g.gain.value = i === 2 ? 0.35 : 0.6
      osc.connect(g).connect(padGain)
      osc.start()
      this.nodes.push(osc)
    })
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.07
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 0.025
    lfo.connect(lfoGain).connect(padGain.gain)
    lfo.start()
    this.nodes.push(lfo)

    this.ctx = ctx
    this.master = master
  }
}

export const ambientSound = new AmbientSound()
