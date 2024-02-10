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

export const getSurroundingElements = (x: number, y: number, matrix: Grid) => {
  var x_limit = matrix.length;
  if (x_limit == 0) return null; // matrix is empty

  var y_limit = matrix[0].squares.length; // Assumes all rows in the matrix are of same length (otherwise, not a matrix, right?)

  const results = {
    tl: x - 1 >= 0 && y - 1 >= 0 ? matrix[x - 1].squares[y - 1] : null,
    ml: y - 1 >= 0 ? matrix[x].squares[y - 1] : null,
    bl: x + 1 < x_limit && y - 1 >= 0 ? matrix[x + 1].squares[y - 1] : null,

    tc: x - 1 >= 0 ? matrix[x - 1].squares[y] : null,
    bc: x + 1 < x_limit ? matrix[x + 1].squares[y] : null,

    tr: x - 1 >= 0 && y + 1 < y_limit ? matrix[x - 1].squares[y + 1] : null,
    mr: y + 1 < y_limit ? matrix[x].squares[y + 1] : null,
    br: x + 1 < x_limit && y + 1 < y_limit ? matrix[x + 1].squares[y + 1] : null,
  };

  return results;
};

export const getSurroundingElementsAsArray = surroundingElements => {
  const resultArray = Object.keys(surroundingElements).map(key => {
    const colour = surroundingElements[key];

    return new Colour(colour.ref, colour.hex, colour.col, colour.x, colour.y);
  });

  return resultArray;
};
