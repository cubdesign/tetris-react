import styled from "@emotion/styled";
import { useEffect, useState, useRef } from "react";
import TetrisGame, {
  BOARD_EDGE,
  BOARD_X,
  BOARD_Y,
  CellItem,
  CellStatus,
  CELL_HEIGHT,
  CELL_WIDTH,
} from "../TetrisGame";

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
  background-color: #ebedfb;
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

const game: TetrisGame = new TetrisGame();

const Tetris = () => {
  const [board, setBoard] = useState<CellItem[][]>([]);
  const loop = () => {
    setBoard([...game.board]);
    return requestAnimationFrame(loop);
  };

  useEffect(() => {
    game.init();
    loop();
    return () => {
      game.cleanup();
    };
  }, []);

  return (
    <Stage>
      <Area>
        <h2>実際の表示</h2>
        <Board>
          {board.length > 0 &&
            board
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
          {board.length > 0 &&
            board.map((item, index) => {
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
