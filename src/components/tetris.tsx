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
  EDGE = 8,
}

type Cell = {
  index: number;
  status: CellStatus;
};

const board: Cell[] = [];

const getCellColor = (status: CellStatus) => {
  switch (status) {
    case CellStatus.NORMAL:
      return "#cecece";
    case CellStatus.EDGE:
      return "#7b7a7a";
    default:
      return "#e3ffbb";
  }
};

const initBoard = () => {
  let index = 0;

  for (let i = 0; i < BOARD_Y + BOARD_EDGE * 2; i++) {
    for (let j = 0; j < BOARD_X + BOARD_EDGE * 2; j++) {
      if (
        i === 0 ||
        i === BOARD_Y + BOARD_EDGE * 2 - 1 ||
        j === 0 ||
        j === BOARD_X + BOARD_EDGE * 2 - 1
      ) {
        // 周囲のセル
        board.push({
          index: index,
          status: CellStatus.EDGE,
        });
      } else {
        board.push({
          index: index,

          status: CellStatus.NORMAL,
        });
      }

      index++;
    }
  }
};

initBoard();

const Stage = styled("div")`
  display: flex;
  gap: 60px;
`;

const Block = styled("div")`
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
`;

const Tetris = () => {
  return (
    <Stage>
      <Block>
        <h2>実際の表示</h2>
        <Board>
          {board
            .filter((val) => {
              return val.status !== CellStatus.EDGE;
            })
            .map((item, index) => {
              return (
                <Cell
                  key={index}
                  style={{
                    top: `${Math.floor(index / BOARD_X) * CELL_WIDTH}px`,
                    left: `${(index % BOARD_X) * CELL_HEIGHT}px`,
                    backgroundColor: getCellColor(item.status),
                  }}
                >
                  {item.status}
                </Cell>
              );
            })}
        </Board>
      </Block>
      <Block>
        <h2>ロジック用の表示</h2>
        <Board
          style={{
            width: `${BOARD_X * CELL_WIDTH + BOARD_EDGE * CELL_WIDTH * 2}px`,
            height: `${BOARD_Y * CELL_HEIGHT + BOARD_EDGE * CELL_HEIGHT * 2}px`,
          }}
        >
          {board.map((item, index) => {
            return (
              <Cell
                key={index}
                style={{
                  top: `${
                    Math.floor(index / (BOARD_X + BOARD_EDGE * 2)) * CELL_WIDTH
                  }px`,

                  left: `${
                    (index % (BOARD_X + BOARD_EDGE * 2)) * CELL_HEIGHT
                  }px`,

                  backgroundColor: getCellColor(item.status),
                }}
              >
                {item.status}
              </Cell>
            );
          })}
        </Board>
      </Block>
    </Stage>
  );
};

export default Tetris;
