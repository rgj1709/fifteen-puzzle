export type Board = number[];

const SIZE = 4;
const TOTAL = SIZE * SIZE;

export function createSolvedBoard(): Board {
  const board: Board = [];
  for (let i = 1; i < TOTAL; i++) board.push(i);
  board.push(0); // 0 = empty
  return board;
}

function countInversions(board: Board): number {
  let inversions = 0;
  const tiles = board.filter((t) => t !== 0);
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  return inversions;
}

export function isSolvable(board: Board): boolean {
  const inversions = countInversions(board);
  const emptyRow = Math.floor(board.indexOf(0) / SIZE);
  const emptyRowFromBottom = SIZE - 1 - emptyRow;
  // For even-sized grids: solvable if (inversions + row of blank from bottom) is odd
  return (inversions + emptyRowFromBottom) % 2 === 1;
}

export function shuffleBoard(): Board {
  const board = createSolvedBoard();
  // Fisher-Yates shuffle
  for (let i = board.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [board[i], board[j]] = [board[j], board[i]];
  }
  // If not solvable, swap two non-empty tiles to fix parity
  if (!isSolvable(board)) {
    const nonEmpty = board.map((v, i) => (v !== 0 ? i : -1)).filter((i) => i !== -1);
    [board[nonEmpty[0]], board[nonEmpty[1]]] = [board[nonEmpty[1]], board[nonEmpty[0]]];
  }
  // Avoid already-solved state
  if (isWon(board)) return shuffleBoard();
  return board;
}

export function isWon(board: Board): boolean {
  for (let i = 0; i < TOTAL - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[TOTAL - 1] === 0;
}

export function getEmptyIndex(board: Board): number {
  return board.indexOf(0);
}

export function getMovableTile(board: Board, direction: "up" | "down" | "left" | "right"): number | null {
  const emptyIdx = getEmptyIndex(board);
  const emptyRow = Math.floor(emptyIdx / SIZE);
  const emptyCol = emptyIdx % SIZE;

  let tileRow = emptyRow;
  let tileCol = emptyCol;

  // The tile that would move INTO the empty space
  switch (direction) {
    case "up": tileRow = emptyRow + 1; break;    // tile below empty moves up
    case "down": tileRow = emptyRow - 1; break;  // tile above empty moves down
    case "left": tileCol = emptyCol + 1; break;  // tile right of empty moves left
    case "right": tileCol = emptyCol - 1; break; // tile left of empty moves right
  }

  if (tileRow < 0 || tileRow >= SIZE || tileCol < 0 || tileCol >= SIZE) return null;
  return tileRow * SIZE + tileCol;
}

export function canMove(board: Board, tileIndex: number): boolean {
  const emptyIdx = getEmptyIndex(board);
  const tileRow = Math.floor(tileIndex / SIZE);
  const tileCol = tileIndex % SIZE;
  const emptyRow = Math.floor(emptyIdx / SIZE);
  const emptyCol = emptyIdx % SIZE;

  return (
    (Math.abs(tileRow - emptyRow) === 1 && tileCol === emptyCol) ||
    (Math.abs(tileCol - emptyCol) === 1 && tileRow === emptyRow)
  );
}

export function canSwipeTile(board: Board, tileIndex: number, direction: "up" | "down" | "left" | "right"): boolean {
  if (board[tileIndex] === 0) return false;
  const emptyIdx = getEmptyIndex(board);
  const tileRow = Math.floor(tileIndex / SIZE);
  const tileCol = tileIndex % SIZE;
  const emptyRow = Math.floor(emptyIdx / SIZE);
  const emptyCol = emptyIdx % SIZE;

  // Check if the empty space is in the direction the user swiped from this tile
  switch (direction) {
    case "up": return emptyRow === tileRow - 1 && emptyCol === tileCol;
    case "down": return emptyRow === tileRow + 1 && emptyCol === tileCol;
    case "left": return emptyCol === tileCol - 1 && emptyRow === tileRow;
    case "right": return emptyCol === tileCol + 1 && emptyRow === tileRow;
  }
}

export function moveTile(board: Board, tileIndex: number): Board {
  if (!canMove(board, tileIndex)) return board;
  const newBoard = [...board];
  const emptyIdx = getEmptyIndex(newBoard);
  [newBoard[tileIndex], newBoard[emptyIdx]] = [newBoard[emptyIdx], newBoard[tileIndex]];
  return newBoard;
}
