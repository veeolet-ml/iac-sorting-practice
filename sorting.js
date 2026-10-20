// Each step describes the decision a student must make before the array changes.
export function createSteps(values, algorithm) {
  const numbers = [...values];
  const steps = [];
  const addStep = (left, right, pass, sortedFrom) => {
    const swap = algorithm === 'bubble' ? numbers[left] > numbers[right] : left !== right;
    steps.push({ numbers: [...numbers], left, right, pass, sortedFrom, swap });
    if (swap) [numbers[left], numbers[right]] = [numbers[right], numbers[left]];
  };

  if (algorithm === 'bubble') {
    for (let end = numbers.length - 1, pass = 1; end > 0; end--, pass++) {
      let changed = false;
      for (let left = 0; left < end; left++) {
        addStep(left, left + 1, pass, end + 1);
        changed ||= steps.at(-1).swap;
      }
      if (!changed) break;
    }
  } else if (algorithm === 'selection') {
    for (let start = 0; start < numbers.length - 1; start++) {
      let minimum = start;
      for (let index = start + 1; index < numbers.length; index++) {
        if (numbers[index] < numbers[minimum]) minimum = index;
      }
      addStep(start, minimum, start + 1, start);
    }
  } else {
    throw new Error(`Unknown sorting algorithm: ${algorithm}`);
  }
  return { steps, result: numbers };
}

export function isCorrectMove(step, first, second) {
  return step.swap && ((first === step.left && second === step.right) ||
    (first === step.right && second === step.left));
}

export function generateNumbers(count) {
  const numbers = Array.from({ length: count }, (_, index) => index * 9 + 12);
  for (let index = numbers.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1));
    [numbers[index], numbers[other]] = [numbers[other], numbers[index]];
  }
  // A practice round should always contain something to sort.
  if (numbers.every((value, index) => index === 0 || numbers[index - 1] < value)) {
    [numbers[0], numbers[1]] = [numbers[1], numbers[0]];
  }
  return numbers;
}
