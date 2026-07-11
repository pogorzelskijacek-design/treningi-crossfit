import { describe, expect, it } from 'vitest';
import { pickNextWodFormat } from './wodFormatRotation';
import { WOD_FORMAT_ROTATION } from './rotationLists';
import { makeCompletedLog } from '../testFixtures';

describe('pickNextWodFormat', () => {
  it('picks the first rotation entry when there is no history', () => {
    expect(pickNextWodFormat([])).toBe(WOD_FORMAT_ROTATION[0]);
  });

  it('does not repeat the most recently used format while others remain untried', () => {
    const history = [makeCompletedLog('thursday', '2026-07-09', { wodFormat: WOD_FORMAT_ROTATION[0] })];
    expect(pickNextWodFormat(history)).not.toBe(WOD_FORMAT_ROTATION[0]);
  });
});
