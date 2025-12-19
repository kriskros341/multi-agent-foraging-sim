import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { Random } from '@/util/index.ts';

describe('Random', () => {
  beforeEach(() => {
    // Reset seed before each test
    Random.setSeed(null);
  });

  test('should produce a variety of numbers without a seed', () => {
    const numbers = Array.from({ length: 10 }, () => Random.next());
    const uniqueNumbers = new Set(numbers);
    assert.ok(uniqueNumbers.size > 1, 'The random number generator should produce more than one unique value.');
  });

  test('should produce deterministic results with a seed', () => {
    Random.setSeed(12345);
    const num1 = Random.next();
    Random.setSeed(12345);
    const num2 = Random.next();
    assert.strictEqual(num1, num2);
  });

  test('choice should return an element from the array', () => {
    const arr = [1, 2, 3, 4, 5];
    const choice = Random.choice(arr);
    assert.ok(arr.includes(choice!));
  });

  test('choice should return undefined for an empty array', () => {
    const arr: number[] = [];
    const choice = Random.choice(arr);
    assert.strictEqual(choice, undefined);
  });

  test('randomTile should return a valid tile within the size', () => {
    const size = 10;
    const tile = Random.randomTile(size);
    assert.ok(tile[0] >= 0 && tile[0] < size);
    assert.ok(tile[1] >= 0 && tile[1] < size);
  });
});
