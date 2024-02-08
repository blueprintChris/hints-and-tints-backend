import { Grid } from './constants/grid';

const randomNumberFromRange = (min: number, max: number) => {
  return Math.floor(Math.random() * max - min + 1) + min;
};

export const pickRandomColourFromGrid = (grid: Grid) => {
  const row = grid[randomNumberFromRange(1, grid.length - 1)];
  const square = row.squares[randomNumberFromRange(1, row.squares.length - 1)];

  return square.hex;
};
