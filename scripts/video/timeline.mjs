// One clock for picture and sound: every cue the soundtrack hits is a moment the composition moves.
export const DURATION = 45;
export const FPS = 30;

export const HOOK_WORDS = ["What", "changed", "outside", "your", "club", "this", "week?"];

export const CUES = {
  words: HOOK_WORDS.map((_, i) => 0.25 + i * 0.32),
  chips: [3.4, 3.7, 4.0, 4.3, 4.6, 4.9, 5.2],
  whooshes: [3.0, 9.0, 14.0, 19.0, 36.0],
  impact: 24.0,
  beats: [30.0, 31.0, 32.0, 33.0], // Anticipate, Decide, Activate, Learn
  click: 34.0,
  reveal: 36.0,
  cta: 40.5
};
