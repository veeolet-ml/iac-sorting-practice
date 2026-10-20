import test from 'node:test';
import assert from 'node:assert/strict';
import { createSteps, isCorrectMove, generateNumbers } from '../sorting.js';

for (const algorithm of ['bubble', 'selection']) {
  test(`${algorithm} produces valid steps and a sorted result`, () => {
    for (const input of [[4, 1, 3, 2], [1, 2, 3], [3, 2, 1], [2, 2, 1], [1]]) {
      const original = [...input];
      const { steps, result } = createSteps(input, algorithm);
      let current = [...input];
      for (const step of steps) {
        assert.deepEqual(step.numbers, current);
        if (algorithm === 'bubble') {
          assert.equal(step.right, step.left + 1);
          assert.equal(step.swap, current[step.left] > current[step.right]);
        } else {
          assert.equal(current[step.right], Math.min(...current.slice(step.left)));
        }
        if (step.swap) {
          assert.equal(isCorrectMove(step, step.right, step.left), true);
          [current[step.left], current[step.right]] = [current[step.right], current[step.left]];
        } else {
          assert.equal(isCorrectMove(step, step.left, step.right), false);
        }
      }
      assert.deepEqual(current, result);
      assert.deepEqual(result, [...input].sort((a, b) => a - b));
      assert.deepEqual(input, original);
    }
  });
}

test('wrong pairs are rejected', () => {
  const { steps } = createSteps([3, 2, 1], 'bubble');
  assert.equal(isCorrectMove(steps[0], 0, 2), false);
});

test('new sets are unique and unsorted for every offered size', () => {
  for (const count of [6, 8, 10]) {
    for (let attempt = 0; attempt < 100; attempt++) {
      const numbers = generateNumbers(count);
      assert.equal(numbers.length, count);
      assert.equal(new Set(numbers).size, count);
      assert.notDeepEqual(numbers, [...numbers].sort((a, b) => a - b));
    }
  }
});
