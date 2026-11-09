export const round2 = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const safeDivide = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : numerator / denominator;
