import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { PhoneFormInput } from "@/components/inputs/PhoneFormInput";

// Component wrapper to handle form context
function PhoneFormInputWrapper() {
  const { control } = useForm({
    defaultValues: {
      phone: "",
    },
  });

  return <PhoneFormInput control={control} name="phone" id="test-phone" label="Test Phone" placeholder="+972-..." />;
}

describe("PhoneFormInput", () => {
  it("renders label and input", () => {
    render(<PhoneFormInputWrapper />);
    expect(screen.getByText("Test Phone")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("displays placeholder text", () => {
    render(<PhoneFormInputWrapper />);
    expect(screen.getByPlaceholderText("+972-...")).toBeInTheDocument();
  });

  it("allows user to type in the input", async () => {
    const user = userEvent.setup();
    render(<PhoneFormInputWrapper />);
    const input = screen.getByPlaceholderText("+972-...");

    await user.type(input, "+972-123-456-7890");
    expect(input).toHaveValue("+972-123-456-7890");
  });

  it("uses custom label when provided", () => {
    function CustomLabelWrapper() {
      const { control } = useForm({ defaultValues: { phone: "" } });
      return <PhoneFormInput control={control} name="phone" id="test-phone" label="Mobile Number" />;
    }

    render(<CustomLabelWrapper />);
    expect(screen.getByText("Mobile Number")).toBeInTheDocument();
  });

  it("applies disabled state when disabled prop is true", () => {
    function DisabledWrapper() {
      const { control } = useForm({ defaultValues: { phone: "" } });
      return <PhoneFormInput control={control} name="phone" id="test-phone" disabled={true} />;
    }

    render(<DisabledWrapper />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("applies custom wrapper className", () => {
    function CustomClassWrapper() {
      const { control } = useForm({ defaultValues: { phone: "" } });
      return <PhoneFormInput control={control} name="phone" id="test-phone" wrapperClassName="custom-wrapper" />;
    }

    render(<CustomClassWrapper />);
    const wrapper = screen.getByText("Phone").closest("div");
    expect(wrapper).toHaveClass("custom-wrapper");
  });

  it("displays input with type tel", () => {
    render(<PhoneFormInputWrapper />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "tel");
  });

  it("has autocomplete tel attribute", () => {
    render(<PhoneFormInputWrapper />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("autoComplete", "tel");
  });
});
