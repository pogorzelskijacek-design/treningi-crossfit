import { getExerciseName } from './index';

/** The official CrossFit "Essentials" movement-demo playlist the videos come from. */
export const ESSENTIALS_PLAYLIST_ID = 'PLdWvFCOAvyr3EWQhtfcEMd3DVM5sJdPL4';
export const ESSENTIALS_PLAYLIST_URL = `https://www.youtube.com/playlist?list=${ESSENTIALS_PLAYLIST_ID}`;

/**
 * Maps an exercise id (and the Olympic-lift progression keys used in the skill
 * block) to its exact demo video on the CrossFit Essentials playlist. Only
 * confident matches are listed here; anything absent falls back to a scoped
 * YouTube search via {@link exerciseVideo}.
 */
export const EXERCISE_VIDEO_IDS: Record<string, string> = {
  // Barbell — squat / hinge / press
  'back-squat': 'QmZAiBqPvZw',
  'front-squat': 'uYumuL_G_V0',
  deadlift: '1ZXobu7JvvE',
  thruster: 'L219ltL15zk',
  'push-press': 'iaBVSJm78ko',
  'split-jerk': 'GUDkOtraHHY',
  'strict-press': '5yWaNOvgFCM', // "The Shoulder Press"
  'bench-press': 'SCVCLChPQFY',
  // Barbell — clean family
  'power-clean': 'Sk1vhXhHO_A', // "The Power Clean and Split Jerk"
  'squat-clean': 'Ty14ogq_Vok', // "The Clean"
  'hang-clean': '0aP3tgKZcHQ', // "The Hang Power Clean"
  snatch: 'GhxhiehJcQY',
  // Dumbbell / kettlebell
  'dumbbell-snatch': '3mlhF3dptAo',
  'dumbbell-clean': 'SYxObzJ3gn0',
  'dumbbell-thruster': 'u3wKkZjE8QM',
  'dumbbell-push-press': '4tCaD42ghlc',
  'dumbbell-walking-lunge': 'DlhojghkaQ0', // "The Walking Lunge"
  'turkish-get-up': 'saYKvqSscuY',
  'kettlebell-swing-russian': 'mKDIuUbH94Q',
  'kettlebell-swing-american': 'mKDIuUbH94Q',
  'kettlebell-snatch': 'Pm-b2XFeABA',
  // Bodyweight
  burpees: 'auBLPXO8Fww',
  'air-squat': 'rMvwVtlqjTE',
  'push-ups': '0pkjOk0EiAk',
  'box-jumps': 'NBY9-kTuHEk',
  'toes-to-bar': '6dHvTlsMvNY',
  'ghd-sit-ups': 'oFwt7WfnPcc',
  'sit-ups': 'VIZX2Ru9qU8', // "The AbMat Sit-Up"
  // Gymnastics
  'pull-ups': '2mAoQUCM_18', // "Pull-Up Variations"
  'chest-to-bar-pull-ups': 'AyPTCEXTjOo',
  'ring-rows': 'sEAOZc77wk8',
  'ring-dips': 'EznLCDBAPIU',
  'handstand-push-ups': '0wDEO6shVjc',
  'handstand-walk': '_-9_46by2JI', // "The Handstand"
  'bar-muscle-up': 'o69WaY_7k2c',
  'l-sit': 'WHi1bvZLwlw',
  // Machine
  'row-erg': 'fxfhQMbATCw', // "Rowing Technique Tips"
  // Olympic-lift progression keys (Tuesday skill block) — mapped to the closest
  // official clean / front-squat / deadlift demo so every rotation has a video.
  HighHangPowerClean: '0aP3tgKZcHQ', // The Hang Power Clean
  HangPowerClean: '0aP3tgKZcHQ',
  HangClean: '0aP3tgKZcHQ',
  TallClean: 'Ty14ogq_Vok', // The Clean
  MuscleClean: 'Ty14ogq_Vok',
  CleanPull: 'Ty14ogq_Vok',
  CleanDeadlift: '1ZXobu7JvvE', // The Deadlift
  PauseClean: 'Ty14ogq_Vok',
  TempoClean: 'Ty14ogq_Vok',
  FrontSquat: 'uYumuL_G_V0', // The Front Squat
  CleanComplex: 'Ty14ogq_Vok',
};

export interface ExerciseVideo {
  /** True when this points at an exact CrossFit demo; false for a YouTube-search fallback. */
  exact: boolean;
  /** 11-char YouTube video id — present only for exact matches (embeddable). */
  videoId?: string;
  /** Link that opens the demo (within the playlist) or a scoped search. */
  url: string;
  thumbnailUrl?: string;
}

/** Resolves the best available demo video (or a scoped search) for an exercise. */
export function exerciseVideo(exerciseId: string, exerciseName?: string): ExerciseVideo {
  const videoId = EXERCISE_VIDEO_IDS[exerciseId];
  if (videoId) {
    return {
      exact: true,
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}&list=${ESSENTIALS_PLAYLIST_ID}`,
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    };
  }
  const name = exerciseName ?? getExerciseName(exerciseId);
  return {
    exact: false,
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`CrossFit ${name} technique`)}`,
  };
}
