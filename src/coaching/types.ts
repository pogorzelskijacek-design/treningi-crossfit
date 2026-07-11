import type { MovementPattern, MuscleGroup } from '@/domain';

/** One rule's contribution to the final workout, kept for the "why" trace and UI. */
export interface RuleTrace {
  rule: string;
  effect: string;
}

export interface VolumeIntensityAdjustment {
  volumeMultiplier: number;
  intensityMultiplier: number;
  traces: RuleTrace[];
}

export interface SorenessExclusions {
  excludedMuscles: MuscleGroup[];
  excludedPatterns: MovementPattern[];
  traces: RuleTrace[];
}
