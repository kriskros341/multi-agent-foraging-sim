import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { Agent } from '@/agent.ts';
import { Environment } from '@/environment.ts';
import { IdlePolicy } from '@/policies/IdlePolicy.ts';
import { Vector2D } from '@/constants.ts';

describe('Agent', () => {
  let env: Environment;

  beforeEach(() => {
    env = new Environment(10);
  });

  test('should be created with a random position if none is provided', () => {
    const agent = new Agent(env);
    assert.ok(agent.position);
    assert.ok(agent.position[0] >= 0 && agent.position[0] < env.size);
    assert.ok(agent.position[1] >= 0 && agent.position[1] < env.size);
  });

  test('should be created with a specific position if provided', () => {
    const position: Vector2D = [5, 5];
    const agent = new Agent(env, position);
    assert.deepStrictEqual(agent.position, position);
  });

  test('should have IdlePolicy by default', () => {
    const agent = new Agent(env);
    assert.ok(agent.policy instanceof IdlePolicy);
  });

  test('should allow setting a new policy', () => {
    const agent = new Agent(env);
    const newPolicy = new IdlePolicy(); // Or any other policy
    agent.setPolicy(newPolicy);
    assert.strictEqual(agent.policy, newPolicy);
  });

  test('move should update agent position', () => {
    const agent = new Agent(env, [5, 5]);
    agent.move([1, 0]); // Move right
    assert.deepStrictEqual(agent.position, [6, 5]);
  });

  test('move should not update position if move is out of bounds', () => {
    const agent = new Agent(env, [9, 9]);
    agent.move([1, 0]); // Move right
    assert.deepStrictEqual(agent.position, [9, 9]);
  });

  test('getVision should return a 3x3 grid of tiles around the agent', () => {
    const agent = new Agent(env, [5, 5]);
    const vision = agent.getVision();
    assert.strictEqual(vision.length, 9);
  });

  test('getVision should handle edge cases (corners)', () => {
    const agent = new Agent(env, [0, 0]);
    const vision = agent.getVision();
    assert.strictEqual(vision.length, 4);
  });
});
