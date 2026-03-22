import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectInput from "@/components/inputs/SelectInput";

describe("SelectInput", () => {
  const mockOptions = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("renders with placeholder", () => {
    const handleChange = jest.fn();
    render(<SelectInput value="" onValueChange={handleChange} options={mockOptions} placeholder="Select an option" />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Select an option");
  });

  it("displays all options when opened", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SelectInput value="option1" onValueChange={handleChange} options={mockOptions} />);

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    mockOptions.forEach((option) => {
      expect(screen.getByRole("option", { name: option.label })).toBeInTheDocument();
    });
  });

  it("calls onValueChange when option is selected", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SelectInput value="option1" onValueChange={handleChange} options={mockOptions} />);

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const option2 = screen.getByRole("option", { name: "Option 2" });
    await user.click(option2);

    expect(handleChange).toHaveBeenCalledWith("option2");
  });

  it("displays the currently selected value", () => {
    const handleChange = jest.fn();
    render(<SelectInput value="option2" onValueChange={handleChange} options={mockOptions} />);

    expect(screen.getByRole("combobox")).toHaveTextContent("Option 2");
  });

  it("applies custom trigger className", () => {
    const handleChange = jest.fn();
    render(
      <SelectInput
        value="option1"
        onValueChange={handleChange}
        options={mockOptions}
        triggerClassName="custom-trigger-class"
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveClass("custom-trigger-class");
  });

  it("applies custom content className", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { container } = render(
      <SelectInput
        value="option1"
        onValueChange={handleChange}
        options={mockOptions}
        className="custom-content-class"
      />
    );

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const content = document.querySelector('[role="listbox"]') as HTMLElement | null;
    expect(content).toHaveClass("custom-content-class");
  });

  it("handles empty options array", () => {
    const handleChange = jest.fn();
    render(<SelectInput value="" onValueChange={handleChange} options={[]} placeholder="No options" />);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("supports generic string type for value", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    const customOptions = [
      { value: "active" as const, label: "Active" },
      { value: "inactive" as const, label: "Inactive" },
    ];

    render(<SelectInput value="active" onValueChange={handleChange} options={customOptions} />);

    const trigger = screen.getByRole("combobox");
    await user.click(trigger);

    const option = screen.getByRole("option", { name: "Inactive" });
    await user.click(option);

    expect(handleChange).toHaveBeenCalledWith("inactive");
  });
});
