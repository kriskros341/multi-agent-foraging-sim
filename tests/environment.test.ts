import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { Environment, TILE_TYPES } from '@/environment.ts';

describe('Environment', () => {
  let env: Environment;

  beforeEach(() => {
    env = new Environment(10);
  });

  test('should be created with the correct size', () => {
    assert.strictEqual(env.size, 10);
    assert.strictEqual(env.tiles.length, 10);
    assert.strictEqual(env.tiles[0].length, 10);
  });

  test('should contain a BASE tile in the middle', () => {
    const middle = Math.floor(10 / 2);
    assert.strictEqual(env.tiles[middle][middle].type, TILE_TYPES.BASE);
  });

  test('snapshotTypeCounts should return a copy of the typeCounter', () => {
    const counts = env.snapshotTypeCounts();
    assert.deepStrictEqual(counts, env.typeCounter);
    counts.BASE = 100;
    assert.notDeepStrictEqual(counts, env.typeCounter);
  });

  test('typeCounter should correctly count the tiles', () => {
    let resourceCount = 0;
    let baseCount = 0;
    let emptyCount = 0;
    for (let i = 0; i < env.size; i++) {
      for (let j = 0; j < env.size; j++) {
        if (env.tiles[i][j].type === TILE_TYPES.RESOURCE) {
          resourceCount++;
        } else if (env.tiles[i][j].type === TILE_TYPES.BASE) {
          baseCount++;
        } else if (env.tiles[i][j].type === TILE_TYPES.EMPTY) {
          emptyCount++;
        }
      }
    }
    const counts = env.snapshotTypeCounts();
    assert.strictEqual(counts.RESOURCE, resourceCount);
    assert.strictEqual(counts.BASE, baseCount);
    assert.strictEqual(counts.EMPTY, emptyCount);
  });
});
