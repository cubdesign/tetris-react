import { render, screen } from "@testing-library/react";
import Home from "@/pages/index";

describe("Home", () => {
  test("render title", () => {
    render(<Home />);
    expect(screen.getByText(/TETRIS/)).toBeInTheDocument();
    // screen.debug();
  });
});
