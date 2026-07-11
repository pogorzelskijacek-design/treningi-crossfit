import { describe, expect, it } from 'vitest';
import { generateWorkout } from '@/coaching/programmingRules';
import { makeCheckin, makeProfile } from '@/coaching/testFixtures';
import { EXERCISE_LIBRARY } from '@/data';
import { buildDraftLog } from './workoutLogDraft';

describe('buildDraftLog', () => {
  it('pre-fills every set as completed with the prescribed reps and weight', () => {
    const workout = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    const draft = buildDraftLog(workout);

    expect(draft.loggedExercises.length).toBeGreaterThan(0);
    for (const exercise of draft.loggedExercises) {
      expect(exercise.sets.length).toBeGreaterThan(0);
      for (const set of exercise.sets) {
        expect(set.completed).toBe(true);
      }
    }
  });

  it('carries the strength lift prescribed weight onto the draft sets', () => {
    const workout = generateWorkout('tuesday', makeCheckin('tuesday'), [], [], makeProfile(), EXERCISE_LIBRARY);
    const strengthItem = workout.sections.strength.items[0];
    const draft = buildDraftLog(workout);
    const draftStrength = draft.loggedExercises.find((e) => e.exerciseId === strengthItem.exerciseId);

    expect(strengthItem.prescribedWeightKg).toBeGreaterThan(0);
    expect(draftStrength?.sets[0].weightKg).toBe(strengthItem.prescribedWeightKg);
  });
});
