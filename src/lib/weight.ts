/** Formats a prescribed load, marking per-hand (dumbbell/kettlebell) weights. */
export function formatWeight(kg: number, perHand?: boolean): string {
  const value = Number.isInteger(kg) ? String(kg) : kg.toFixed(1);
  return perHand ? `${value} kg/hand` : `${value} kg`;
}
