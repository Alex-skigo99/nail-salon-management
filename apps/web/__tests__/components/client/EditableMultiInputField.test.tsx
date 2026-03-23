import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EditableMultiInputField from "@/app/client/_components/EditableMultiInputField";

describe("EditableMultiInputField", () => {
  const defaultProps = {
    label: "Name",
    value: "John Doe",
    onSave: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and value in display mode", () => {
    render(<EditableMultiInputField {...defaultProps} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("shows edit button when not disabled", () => {
    render(<EditableMultiInputField {...defaultProps} />);

    const editBtn = screen.getByRole("button");
    expect(editBtn).toBeInTheDocument();
  });

  it("hides edit button when disabled", () => {
    render(<EditableMultiInputField {...defaultProps} disabled />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("switches to edit mode on pencil click", async () => {
    const user = userEvent.setup();
    render(<EditableMultiInputField {...defaultProps} />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("John Doe");
  });

  it("calls onSave with new value on confirm", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(<EditableMultiInputField {...defaultProps} onSave={onSave} />);

    await user.click(screen.getByRole("button"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Jane Doe");

    // Click the save (check) button
    const buttons = screen.getAllByRole("button");
    const saveBtn = buttons[0]; // first button is save
    await user.click(saveBtn);

    expect(onSave).toHaveBeenCalledWith("Jane Doe");
  });

  it("cancels edit without calling onSave", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(<EditableMultiInputField {...defaultProps} onSave={onSave} />);

    await user.click(screen.getByRole("button"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "Changed");

    // Click the cancel (X) button
    const buttons = screen.getAllByRole("button");
    const cancelBtn = buttons[1]; // second button is cancel
    await user.click(cancelBtn);

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("saves on Enter key", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(<EditableMultiInputField {...defaultProps} onSave={onSave} />);

    await user.click(screen.getByRole("button"));
    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "New Value{Enter}");

    expect(onSave).toHaveBeenCalledWith("New Value");
  });

  it("cancels on Escape key", async () => {
    const user = userEvent.setup();
    const onSave = jest.fn();
    render(<EditableMultiInputField {...defaultProps} onSave={onSave} />);

    await user.click(screen.getByRole("button"));
    await user.keyboard("{Escape}");

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("displays error message when provided", () => {
    render(<EditableMultiInputField {...defaultProps} errorMessage="This email is taken" />);

    expect(screen.getByText("This email is taken")).toBeInTheDocument();
  });

  it("shows placeholder when value is empty", () => {
    render(<EditableMultiInputField {...defaultProps} value="" placeholder="No phone number" />);

    expect(screen.getByText("No phone number")).toBeInTheDocument();
  });
});
