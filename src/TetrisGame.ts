import _cloneDeep from "lodash/cloneDeep";
import _ from "lodash";

//　セルの幅
export const CELL_WIDTH: number = 24;
//　セルの高さ
export const CELL_HEIGHT: number = 24;
//  ボードのX方向のセル数
export const BOARD_X: number = 10;
// ボードのY方向のセル数
export const BOARD_Y: number = 20;
//  ボードの周囲のセル数
export const BOARD_EDGE: number = 1;

export enum CellStatus {
  NORMAL = 0,
  TETRIS = 1,
  KET_1 = 2,
  KET_2 = 3,
  SQUARE = 4,
  L_1 = 5,
  L_2 = 6,
  T = 7,
  EDGE = 8,
  GAME_OVER = 9,
}

export type CellItem = {
  status: CellStatus;
};

// r,[y, x]
const blockShapes: {
  rotation: number;
  shape: number[][];
}[] = [
  { rotation: 0, shape: [] },
  {
    rotation: 2,
    shape: [
      [-1, 0],
      [1, 0],
      [2, 0],
    ],
  }, // tetris
  {
    rotation: 2,
    shape: [
      [-1, 0],
      [0, 1],
      [1, 1],
    ],
  }, // key 1
  {
    rotation: 2,
    shape: [
      [-1, 0],
      [0, -1],
      [1, -1],
    ],
  }, // key 2
  {
    rotation: 1,
    shape: [
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  }, // square
  {
    rotation: 4,
    shape: [
      [-1, 0],
      [1, 0],
      [1, 1],
    ],
  }, // L 1
  {
    rotation: 4,
    shape: [
      [-1, 0],
      [1, 0],
      [1, -1],
    ],
  }, // L 2
  {
    rotation: 4,
    shape: [
      [-1, 0],
      [0, 1],
      [0, -1],
    ],
  }, // T
];

let gameOver: boolean = false;
let board: CellItem[][] = [];

let ci: number = 0;
let cx: number = 0;
let cy: number = 0;
let cr: number = 0;

const initBoard = (): CellItem[][] => {
  const board: CellItem[][] = [];
  for (let y = 0; y < BOARD_Y + BOARD_EDGE * 2; y++) {
    board[y] = [];
    for (let x = 0; x < BOARD_X + BOARD_EDGE * 2; x++) {
      if (
        y === 0 ||
        y === BOARD_Y + BOARD_EDGE * 2 - 1 ||
        x === 0 ||
        x === BOARD_X + BOARD_EDGE * 2 - 1
      ) {
        // 周囲のセル
        board[y][x] = {
          status: CellStatus.EDGE,
        };
      } else {
        board[y][x] = {
          status: CellStatus.NORMAL,
        };
      }
    }
  }
  return board;
};

const newBlock = () => {
  clearLine();
  ci = Math.trunc(Math.random() * 7 + 1);
  cx = 4;
  cy = 2;
  cr = Math.trunc(Math.random() * 4);
  if (putBlock(ci, cx, cy, cr)) {
    putBlock(ci, cx, cy, cr, true);
  } else {
    gameOver = true;
    showGameOverBoard();
  }
};

const removeBlock = (
  blockIndex: number,
  x: number,
  y: number,
  rotation: number
) => {
  const blockShape = { ...blockShapes[blockIndex] };
  const rotationMax = blockShape.rotation;
  blockShape.shape.unshift([0, 0]);

  for (let [dy, dx] of blockShape.shape) {
    for (let i = 0; i < rotation % rotationMax; i++) {
      [dx, dy] = [dy, -dx];
    }

    board[y + dy][x + dx].status = CellStatus.NORMAL;
  }
  return true;
};

const putBlock = (
  blockIndex: number,
  x: number,
  y: number,
  rotation: number,
  action: boolean = false
) => {
  const blockShape = { ...blockShapes[blockIndex] };
  const rotationMax = blockShape.rotation;
  blockShape.shape.unshift([0, 0]);
  for (let [dy, dx] of blockShape.shape) {
    for (let i = 0; i < rotation % rotationMax; i++) {
      [dx, dy] = [dy, -dx];
    }

    if (action) {
      board[y + dy][x + dx].status = blockIndex;
    } else {
      // TODO: 汚いコード 必ずdryRunの後に実行されるようる
      if (board[y + dy][x + dx].status === CellStatus.EDGE) {
        return false;
      } else if (board[y + dy][x + dx].status !== CellStatus.NORMAL) {
        return false;
      }
    }
  }

  return true;
};

const showGameOverBoard = () => {
  for (let y = 0; y < BOARD_Y + BOARD_EDGE * 2; y++) {
    for (let x = 0; x < BOARD_X + BOARD_EDGE * 2; x++) {
      if (
        y === 0 ||
        y === BOARD_Y + BOARD_EDGE * 2 - 1 ||
        x === 0 ||
        x === BOARD_X + BOARD_EDGE * 2 - 1
      ) {
        // 周囲のセル
        // 何もしない
      } else {
        if (board[y][x].status !== CellStatus.NORMAL) {
          board[y][x].status = CellStatus.GAME_OVER;
        }
      }
    }
  }
};

const clearLine = () => {
  for (let y = 0; y < BOARD_Y + BOARD_EDGE * 2; y++) {
    let removeAble: boolean = true;
    for (let x = 0; x < BOARD_X + BOARD_EDGE * 2; x++) {
      if (y === 0 || y === BOARD_Y + BOARD_EDGE * 2 - 1) {
        removeAble = false;
        break;
      } else if (x === 0 || x === BOARD_X + BOARD_EDGE * 2 - 1) {
        // 周囲のセル
        // 何もしない
      } else {
        if (board[y][x].status === CellStatus.NORMAL) {
          removeAble = false;
          break;
        }
      }
    }
    if (removeAble) {
      for (let j = y; j >= 0; j--) {
        for (let x = 0; x < BOARD_X + BOARD_EDGE * 2; x++) {
          if (x === 0 || x === BOARD_X + BOARD_EDGE * 2 - 1 || j === 0) {
            // 周囲のセル
            // 何もしない
          } else {
            board[j][x].status =
              j === 1 ? CellStatus.NORMAL : board[j - 1][x].status;
          }
        }
      }
      y--;
    }
  }
};

const move = (dx: number, dy: number, dr: number): boolean => {
  removeBlock(ci, cx, cy, cr);
  if (putBlock(ci, cx + dx, cy + dy, cr + dr)) {
    putBlock(ci, cx + dx, cy + dy, cr + dr, true);
    cx += dx;
    cy += dy;
    cr += dr;
    return true;
  } else {
    putBlock(ci, cx, cy, cr, true);
    return false;
  }
};
const handleKeyDown = (e: KeyboardEvent) => {
  if (gameOver) return;
  switch (e.key) {
    case "ArrowLeft":
      move(-1, 0, 0);
      break;
    case "ArrowRight":
      move(1, 0, 0);
      break;
    case "ArrowDown":
      if (!move(0, 1, 0)) {
        newBlock();
      }
      break;
    case "ArrowUp":
      move(0, 0, 1);
      break;
    default:
      break;
  }
  e.preventDefault();
};

// init
const init = () => {
  board = initBoard();

  window.document.addEventListener("keydown", handleKeyDown);
  newBlock();

  setInterval(() => {
    if (!gameOver) {
      if (!move(0, 1, 0)) {
        newBlock();
      }
    }
  }, 1000);
};

const cleanup = () => {
  window.document.removeEventListener("keydown", handleKeyDown);
};

const getBoard = () => {
  return [...board];
};

export { init, cleanup, getBoard };
