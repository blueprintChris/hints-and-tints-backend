import { Grid, Square } from './constants/grid';
import { Colour } from './models/Colour';

const randomNumberFromRange = (min: number, max: number) => {
  return Math.floor(Math.random() * max - min + 1) + min;
};

export const pickRandomColourFromGrid = (grid: Grid) => {
  const row = grid[randomNumberFromRange(1, grid.length - 1)];
  const square = row.squares[randomNumberFromRange(1, row.squares.length - 1)];

  return square.hex;
};

export const getSurroundingElements = (row: number, col: number, matrix: Grid) => {
  let surroundingSpaces: Colour[] = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      // Skip the center item itself
      if (
        (i == 0 && j == 0) ||
        row + i < 0 ||
        row + i >= matrix.length ||
        col + j < 0 ||
        col + j >= matrix[0].squares.length
      ) {
        continue;
      }
      const result = matrix[row + i].squares[col + j];
      const colour = new Colour(result.ref, result.hex, result.col, i, j);

      surroundingSpaces.push(colour);
    }
  }
  return surroundingSpaces;
};

export const getSurroundingSpacesByTwo = (row: number, col: number, matrix: Grid) => {
  let surroundingSpaces: Colour[] = [];

  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      // Skip the center item itself and items that are only 1 space away
      if (
        (Math.abs(i) != 2 && Math.abs(j) != 2) ||
        row + i < 0 ||
        row + i >= matrix.length ||
        col + j < 0 ||
        col + j >= matrix[0].squares.length
      ) {
        continue;
      }
      const result = matrix[row + i].squares[col + j];
      const colour = new Colour(result.ref, result.hex, result.col, i, j);

      surroundingSpaces.push(colour);
    }
  }
  return surroundingSpaces;
};

export const getSurroundingElementsAsArray = surroundingElements => {
  const resultArray = Object.keys(surroundingElements).map(key => {
    const colour = surroundingElements[key];

    return new Colour(colour.ref, colour.hex, colour.col, colour.x, colour.y);
  });

  return resultArray;
};
