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

class TetrisGame {
  private _board: CellItem[][] = [];

  gameOver: boolean = false;

  ci: number = 0;
  cx: number = 0;
  cy: number = 0;
  cr: number = 0;

  constructor() {}

  handleKeyDown = (e: KeyboardEvent) => {
    if (this.gameOver) return;
    switch (e.key) {
      case "ArrowLeft":
        this.move(-1, 0, 0);
        break;
      case "ArrowRight":
        this.move(1, 0, 0);
        break;
      case "ArrowDown":
        if (!this.move(0, 1, 0)) {
          this.newBlock();
        }
        break;
      case "ArrowUp":
        this.move(0, 0, 1);
        break;
      default:
        break;
    }
    e.preventDefault();
  };
  initBoard(): CellItem[][] {
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
  }

  newBlock() {
    this.clearLine();
    this.ci = Math.trunc(Math.random() * 7 + 1);
    this.cx = 4;

    this.cy = 2;
    this.cr = Math.trunc(Math.random() * 4);
    if (this.putBlock(this.ci, this.cx, this.cy, this.cr)) {
      this.putBlock(this.ci, this.cx, this.cy, this.cr, true);
    } else {
      this.gameOver = true;
      this.showGameOverBoard();
    }
  }

  removeBlock(blockIndex: number, x: number, y: number, rotation: number) {
    const blockShape = { ...blockShapes[blockIndex] };
    const rotationMax = blockShape.rotation;
    blockShape.shape.unshift([0, 0]);

    for (let [dy, dx] of blockShape.shape) {
      for (let i = 0; i < rotation % rotationMax; i++) {
        [dx, dy] = [dy, -dx];
      }

      this.board[y + dy][x + dx].status = CellStatus.NORMAL;
    }
    return true;
  }

  putBlock(
    blockIndex: number,
    x: number,
    y: number,
    rotation: number,
    action: boolean = false
  ) {
    const blockShape = { ...blockShapes[blockIndex] };
    const rotationMax = blockShape.rotation;
    blockShape.shape.unshift([0, 0]);
    for (let [dy, dx] of blockShape.shape) {
      for (let i = 0; i < rotation % rotationMax; i++) {
        [dx, dy] = [dy, -dx];
      }

      if (action) {
        this.board[y + dy][x + dx].status = blockIndex;
      } else {
        // TODO: 汚いコード 必ずdryRunの後に実行されるようる
        if (this.board[y + dy][x + dx].status === CellStatus.EDGE) {
          return false;
        } else if (this.board[y + dy][x + dx].status !== CellStatus.NORMAL) {
          return false;
        }
      }
    }

    return true;
  }

  showGameOverBoard() {
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
          if (this.board[y][x].status !== CellStatus.NORMAL) {
            this.board[y][x].status = CellStatus.GAME_OVER;
          }
        }
      }
    }
  }

  clearLine() {
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
          if (this.board[y][x].status === CellStatus.NORMAL) {
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
              this.board[j][x].status =
                j === 1 ? CellStatus.NORMAL : this.board[j - 1][x].status;
            }
          }
        }
        y--;
      }
    }
  }

  move(dx: number, dy: number, dr: number): boolean {
    this.removeBlock(this.ci, this.cx, this.cy, this.cr);
    if (this.putBlock(this.ci, this.cx + dx, this.cy + dy, this.cr + dr)) {
      this.putBlock(this.ci, this.cx + dx, this.cy + dy, this.cr + dr, true);
      this.cx += dx;
      this.cy += dy;
      this.cr += dr;
      return true;
    } else {
      this.putBlock(this.ci, this.cx, this.cy, this.cr, true);
      return false;
    }
  }

  init() {
    this.board = this.initBoard();

    window.document.addEventListener("keydown", this.handleKeyDown);
    this.newBlock();

    setInterval(() => {
      if (!this.gameOver) {
        if (!this.move(0, 1, 0)) {
          this.newBlock();
        }
      }
    }, 1000);
  }

  cleanup() {
    window.document.removeEventListener("keydown", this.handleKeyDown);
  }

  get board(): CellItem[][] {
    return this._board;
  }
  set board(value: CellItem[][]) {
    this._board = value;
  }
}

export default TetrisGame;
