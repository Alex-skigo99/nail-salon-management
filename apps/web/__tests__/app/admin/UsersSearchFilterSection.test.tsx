import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersSearchFilterSection } from "@/app/admin/clients/_components/UsersSearchFilterSection";

const masters = [
  { id: 1, name: "Master A" },
  { id: 2, name: "Master B" },
];

describe("UsersSearchFilterSection", () => {
  it("renders search input and filter selects", () => {
    const onChange = jest.fn();
    render(<UsersSearchFilterSection params={{}} onChange={onChange} masters={masters} />);

    expect(screen.getByPlaceholderText("Search by name, email or phone...")).toBeInTheDocument();
  });

  it("debounces search input", async () => {
    jest.useFakeTimers();
    const onChange = jest.fn();
    render(<UsersSearchFilterSection params={{}} onChange={onChange} masters={masters} />);

    const input = screen.getByPlaceholderText("Search by name, email or phone...");
    await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).type(input, "Alice");

    // onChange should be called after debounce
    jest.advanceTimersByTime(500);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ search: "Alice" }));
    });

    jest.useRealTimers();
  });

  it("does not trigger search for empty trimmed input", async () => {
    jest.useFakeTimers();
    const onChange = jest.fn();
    render(<UsersSearchFilterSection params={{}} onChange={onChange} masters={masters} />);

    const input = screen.getByPlaceholderText("Search by name, email or phone...");
    await userEvent.setup({ advanceTimers: jest.advanceTimersByTime }).type(input, "   ");

    jest.advanceTimersByTime(500);
    // onChange should not be called since trimmed value is empty and params.search is also undefined
    expect(onChange).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
