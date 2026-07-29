export type NetworkKey = 'visual' | 'auditory' | 'language' | 'motion' | 'defaultMode'

export const NETWORKS: { key: NetworkKey; label: string; color: string }[] = [
  { key: 'visual', label: 'Visual', color: '#141412' },
  { key: 'auditory', label: 'Auditory', color: '#6f6d66' },
  { key: 'language', label: 'Language', color: '#9c9a91' },
  { key: 'motion', label: 'Motion', color: '#bcbab0' },
  { key: 'defaultMode', label: 'Default-mode', color: '#d4d2c8' },
]

export const COMPOSITE_COLOR = '#c9700a'

export interface EngagementPoint {
  t: number // seconds
  visual: number
  auditory: number
  language: number
  motion: number
  defaultMode: number
  composite: number
}

export interface Variant {
  id: string
  label: string
  note: string
  score: number
  curve: EngagementPoint[]
  drivers: string[]
}

export interface TestResult {
  id: string
  name: string
  timestamp: string
  variants: Variant[]
  winnerId: string
  winnerReason: string
}

// Deterministic pseudo-random for stable mock curves
function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function makeCurve(seed: number, base: number, hookStrength: number): EngagementPoint[] {
  const rand = seeded(seed)
  const points: EngagementPoint[] = []
  for (let i = 0; i <= 30; i++) {
    const t = i * 0.5
    // Hook spike early, decay shaped by hookStrength
    const hook = hookStrength * Math.exp(-t / 6)
    const drift = 0.08 * Math.sin(t / 2.2 + seed)
    const noise = () => (rand() - 0.5) * 0.09
    const visual = clamp(base + hook * 0.9 + drift + noise())
    const auditory = clamp(base - 0.05 + hook * 0.6 + noise())
    const language = clamp(base - 0.1 + hook * 0.5 + drift * 0.5 + noise())
    const motion = clamp(base - 0.08 + hook * 0.7 + noise())
    const defaultMode = clamp(0.85 - (visual + auditory) / 2.4 + noise())
    const composite = clamp(visual * 0.3 + auditory * 0.2 + language * 0.2 + motion * 0.2 - defaultMode * 0.1 + 0.1)
    points.push({
      t,
      visual: round(visual),
      auditory: round(auditory),
      language: round(language),
      motion: round(motion),
      defaultMode: round(defaultMode),
      composite: round(composite),
    })
  }
  return points
}

function clamp(v: number) {
  return Math.min(1, Math.max(0.05, v))
}
function round(v: number) {
  return Math.round(v * 1000) / 1000
}

export const MOCK_TESTS: TestResult[] = [
  {
    id: 'tst-0042',
    name: 'Cold open vs. text hook',
    timestamp: '2026-07-28T14:32:00Z',
    winnerId: 'A',
    winnerReason: 'Variant A sustains visual-network engagement 31% longer through the 3–8s window.',
    variants: [
      {
        id: 'A',
        label: 'A',
        note: 'Cold open, no title card',
        score: 78,
        curve: makeCurve(42, 0.52, 0.55),
        drivers: [
          'Visual network holds above baseline through 0–8s — the motion-heavy cold open keeps the eyes locked.',
          'Default-mode activity stays suppressed, a strong indicator attention is externally directed.',
          'Auditory engagement spikes at 2.5s where the beat drop lands.',
        ],
      },
      {
        id: 'B',
        label: 'B',
        note: 'Text hook overlay, 1.5s title card',
        score: 64,
        curve: makeCurve(7, 0.48, 0.38),
        drivers: [
          'Language network activates early (reading the overlay) but decays fast after 3s.',
          'Visual engagement dips during the static title card — a predicted look-away window.',
          'Default-mode activity creeps up after 6s, suggesting drifting attention.',
        ],
      },
    ],
  },
  {
    id: 'tst-0041',
    name: 'POV vs. tutorial framing',
    timestamp: '2026-07-26T09:12:00Z',
    winnerId: 'B',
    winnerReason: 'Variant B triggers a stronger language-network response in the first 4 seconds.',
    variants: [
      {
        id: 'A',
        label: 'A',
        note: 'POV framing',
        score: 59,
        curve: makeCurve(13, 0.45, 0.35),
        drivers: [
          'Motion network engagement is steady but visual interest plateaus early.',
          'No strong hook spike detected in the first 3 seconds.',
        ],
      },
      {
        id: 'B',
        label: 'B',
        note: 'Direct tutorial promise',
        score: 71,
        curve: makeCurve(29, 0.5, 0.48),
        drivers: [
          'Language network fires hard on the spoken promise at 0.5s.',
          'Composite attention decays slower than 80% of reference clips.',
        ],
      },
      {
        id: 'C',
        label: 'C',
        note: 'Question hook',
        score: 66,
        curve: makeCurve(55, 0.47, 0.44),
        drivers: [
          'Solid early spike, but auditory engagement drops during the 4–6s pause.',
          'Default-mode suppression weakens after the question resolves.',
        ],
      },
    ],
  },
  {
    id: 'tst-0040',
    name: 'Thumbnail motion test',
    timestamp: '2026-07-22T18:45:00Z',
    winnerId: 'A',
    winnerReason: 'Variant A produces a sharper motion-network onset within the first second.',
    variants: [
      {
        id: 'A',
        label: 'A',
        note: 'Whip pan intro',
        score: 82,
        curve: makeCurve(3, 0.55, 0.6),
        drivers: [
          'Strongest motion-network onset in your history — the whip pan lands.',
          'Visual and motion networks stay coupled through 10s, a durable-attention pattern.',
        ],
      },
      {
        id: 'B',
        label: 'B',
        note: 'Static hero frame',
        score: 51,
        curve: makeCurve(88, 0.42, 0.28),
        drivers: [
          'Flat onset. The static frame gives the visual system nothing to track.',
          'Default-mode activity rises within 4s — early scroll risk.',
        ],
      },
    ],
  },
  {
    id: 'tst-0039',
    name: 'Voiceover pacing',
    timestamp: '2026-07-19T11:03:00Z',
    winnerId: 'B',
    winnerReason: 'Faster pacing in Variant B keeps auditory engagement above threshold twice as long.',
    variants: [
      {
        id: 'A',
        label: 'A',
        note: '1.0x pacing',
        score: 62,
        curve: makeCurve(17, 0.47, 0.4),
        drivers: ['Auditory engagement dips below threshold at 5.5s during a slow passage.'],
      },
      {
        id: 'B',
        label: 'B',
        note: '1.15x pacing, cut pauses',
        score: 74,
        curve: makeCurve(61, 0.51, 0.5),
        drivers: [
          'Cutting pauses removes two predicted look-away windows.',
          'Language and auditory networks remain coupled through the full 15s.',
        ],
      },
    ],
  },
]

export function getTest(id: string): TestResult | undefined {
  return MOCK_TESTS.find((t) => t.id === id)
}

export function scoreDelta(test: TestResult): number {
  const scores = test.variants.map((v) => v.score).sort((a, b) => b - a)
  return scores.length > 1 ? scores[0] - scores[1] : 0
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d
    .toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'UTC',
    })
    .replace(',', ' ·')
}
