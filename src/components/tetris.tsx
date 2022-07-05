import styled from "@emotion/styled";
import { useEffect, useState, useRef } from "react";
import _cloneDeep from "lodash/cloneDeep";
import _ from "lodash";
//　セルの幅
const CELL_WIDTH: number = 44;
//　セルの高さ
const CELL_HEIGHT: number = 44;
//  ボードのX方向のセル数
const BOARD_X: number = 10;
// ボードのY方向のセル数
const BOARD_Y: number = 20;
//  ボードの周囲のセル数
const BOARD_EDGE: number = 1;

enum CellStatus {
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

type CellItem = {
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

const getCellColor = (status: CellStatus) => {
  switch (status) {
    case CellStatus.NORMAL:
      return "#cecece";
    case CellStatus.TETRIS:
      return "#ff0000";
    case CellStatus.KET_1:
      return "#00ff00";
    case CellStatus.KET_2:
      return "#0000ff";
    case CellStatus.SQUARE:
      return "#ffff00";
    case CellStatus.L_1:
      return "#ff00ff";
    case CellStatus.L_2:
      return "#00ffff";
    case CellStatus.T:
      return "#ffa500";
    case CellStatus.EDGE:
      return "#7b7a7a";
    case CellStatus.GAME_OVER:
      return "#ff0000";

    default:
      return "#e3ffbb";
  }
};

const initBoard = () => {
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

const Stage = styled("div")`
  display: flex;
  gap: 60px;
  background-color: aliceblue;
`;

const Area = styled("div")`
  h2 {
    text-align: center;
  }
`;

const Board = styled("div")`
  position: relative;
  top: 0;
  left: 0;
  width: ${BOARD_X * CELL_WIDTH}px;
  height: ${BOARD_Y * CELL_HEIGHT}px;
  background-color: #ff0000;
`;

const Cell = styled("div")`
  position: absolute;
  top: 0;
  left: 0;
  width: ${CELL_WIDTH}px;
  height: ${CELL_HEIGHT}px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  background-color: #0000ff;
  border: outset 3px #686565;
`;

let ci: number = 0;
let cx: number = 0;
let cy: number = 0;
let cr: number = 0;

const Tetris = () => {
  const [board, setBoard] = useState<CellItem[][]>(initBoard());
  const [gameOver, setGameOver] = useState<boolean>(false);

  const boardRef = useRef<CellItem[][]>(board);
  const gameOverRef = useRef<boolean>(gameOver);

  //
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOverRef.current) return;
      gameOverRef.current = false;
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

    window.document.addEventListener("keydown", handleKeyDown);
    newBlock();

    setInterval(() => {
      if (!gameOverRef.current) {
        if (!move(0, 1, 0)) {
          newBlock();
        }
      }
    }, 500);

    return () => {
      window.document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    // TODO: 汚いコード
    boardRef.current = board;
    gameOverRef.current = gameOver;
  }, [board, gameOver]);

  const newBlock = () => {
    ci = Math.trunc(Math.random() * 7 + 1);
    cx = 4;
    cy = 2;
    cr = Math.trunc(Math.random() * 4);
    if (putBlock(ci, cx, cy, cr)) {
      putBlock(ci, cx, cy, cr, true);
    } else {
      setGameOver(true);
      showGameOverBoard();
    }
  };

  const removeBlock = (
    blockIndex: number,
    x: number,
    y: number,
    rotation: number
  ) => {
    const _board: CellItem[][] = _cloneDeep<CellItem[][]>(boardRef.current);

    const blockShape = { ...blockShapes[blockIndex] };
    const rotationMax = blockShape.rotation;
    blockShape.shape.unshift([0, 0]);

    for (let [dy, dx] of blockShape.shape) {
      for (let i = 0; i < rotation % rotationMax; i++) {
        [dx, dy] = [dy, -dx];
      }

      _board[y + dy][x + dx].status = CellStatus.NORMAL;
      // TODO: 汚いコード
      boardRef.current = _board;
      setBoard(_board);
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
    const _board: CellItem[][] = _cloneDeep<CellItem[][]>(boardRef.current);

    const blockShape = { ...blockShapes[blockIndex] };
    const rotationMax = blockShape.rotation;
    blockShape.shape.unshift([0, 0]);
    for (let [dy, dx] of blockShape.shape) {
      for (let i = 0; i < rotation % rotationMax; i++) {
        [dx, dy] = [dy, -dx];
      }

      if (action) {
        _board[y + dy][x + dx].status = blockIndex;
        // TODO: 汚いコード
        boardRef.current = _board;
        setBoard(_board);
      } else {
        // TODO: 汚いコード 必ずdryRunの後に実行されるようる
        if (_board[y + dy][x + dx].status === CellStatus.EDGE) {
          return false;
        } else if (_board[y + dy][x + dx].status !== CellStatus.NORMAL) {
          return false;
        }
      }
    }

    return true;
  };

  const showGameOverBoard = () => {
    const _board: CellItem[][] = _cloneDeep<CellItem[][]>(boardRef.current);
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
          if (_board[y][x].status !== CellStatus.NORMAL) {
            _board[y][x].status = CellStatus.GAME_OVER;
          }
        }
      }
    }
    setBoard(_board);
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

  return (
    <Stage>
      <Area>
        <h2>実際の表示</h2>
        <Board>
          {board
            .reduce((acc, val) => {
              const row = val.reduce((acc2, cell) => {
                if (cell.status !== CellStatus.EDGE) {
                  acc2.push(cell);
                }
                return acc2;
              }, [] as CellItem[]);

              if (row.length > 0) {
                acc.push(row);
              }

              return acc;
            }, [] as CellItem[][])
            .map((item, index) => {
              return item.map((item2, index2) => {
                return (
                  <Cell
                    key={index + "-" + index2}
                    style={{
                      top: `${index * CELL_HEIGHT}px`,
                      left: `${index2 * CELL_WIDTH}px`,
                      backgroundColor: getCellColor(item2.status),
                    }}
                  >
                    {item2.status}
                  </Cell>
                );
              });
            })}
        </Board>
      </Area>
      <Area>
        <h2>ロジック用の表示</h2>
        <Board
          style={{
            width: `${BOARD_X * CELL_WIDTH + BOARD_EDGE * CELL_WIDTH * 2}px`,
            height: `${BOARD_Y * CELL_HEIGHT + BOARD_EDGE * CELL_HEIGHT * 2}px`,
          }}
        >
          {board.map((item, index) => {
            return item.map((item2, index2) => {
              return (
                <Cell
                  key={"key" + index + "-" + index2}
                  style={{
                    top: `${index * CELL_HEIGHT}px`,

                    left: `${index2 * CELL_WIDTH}px`,

                    backgroundColor: getCellColor(item2.status),
                  }}
                >
                  {item2.status}
                  {/* {index + "-" + index2} */}
                </Cell>
              );
            });
          })}
        </Board>
      </Area>
    </Stage>
  );
};

export default Tetris;
