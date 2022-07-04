import styled from "@emotion/styled";

//　セルの幅
const CELL_WIDTH: number = 24;
//　セルの高さ
const CELL_HEIGHT: number = 24;
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

const board: CellItem[][] = [];

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
    default:
      return "#e3ffbb";
  }
};

const putBlock = (
  blockIndex: number,
  x: number,
  y: number,
  rotation: number,
  remove: boolean = false,
  action: boolean = false
) => {
  // 枠分プラスする
  x = x + 1;
  y = y + 1;
  const blockShape = { ...blockShapes[blockIndex] };
  const rotationMax = blockShape.rotation;
  blockShape.shape.unshift([0, 0]);

  for (let [dy, dx] of blockShape.shape) {
    for (let i = 0; i < rotation % rotationMax; i++) {
      [dx, dy] = [dy, -dx];
    }
    if (remove) {
    } else {
      board[y + dy][x + dx].status = blockIndex;
    }
  }
};

const initBoard = () => {
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
};

initBoard();
putBlock(5, 4, 10, 0, false, false);

const Stage = styled("div")`
  display: flex;
  gap: 60px;
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

const Tetris = () => {
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
    </Stage>
  );
};

export default Tetris;
