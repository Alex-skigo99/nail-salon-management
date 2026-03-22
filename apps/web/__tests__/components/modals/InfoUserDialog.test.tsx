import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InfoUserDialog from "@/components/modals/InfoUserDialog";
import { useTranslations } from "next-intl";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

describe("InfoUserDialog", () => {
  beforeEach(() => {
    mockUseTranslations.mockReturnValue(((key: string) => {
      const translations: Record<string, string> = {
        "dialogs.infoUserDialog.defaultErrorTitle": "Error",
        "dialogs.infoUserDialog.defaultConfirmTitle": "Confirm Action",
        "dialogs.infoUserDialog.defaultInfoTitle": "Information",
        "dialogs.infoUserDialog.cancel": "Cancel",
        "dialogs.infoUserDialog.confirm": "Confirm",
        "dialogs.infoUserDialog.ok": "OK",
        // also include short keys for the namespace helper used in components
        ok: "OK",
        cancel: "Cancel",
        confirm: "Confirm",
        defaultErrorTitle: "Error",
        defaultConfirmTitle: "Confirm Action",
        defaultInfoTitle: "Information",
      };
      return translations[key] || translations[`dialogs.infoUserDialog.${key}`] || key;
    }) as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders dialog when open is true", () => {
    const handleOpenChange = jest.fn();
    render(
      <InfoUserDialog open={true} onOpenChange={handleOpenChange} type="info" infoText="This is an info message" />
    );

    expect(screen.getByText("This is an info message")).toBeInTheDocument();
  });

  it("does not render dialog when open is false", () => {
    const handleOpenChange = jest.fn();
    const { container } = render(
      <InfoUserDialog open={false} onOpenChange={handleOpenChange} type="info" infoText="This is an info message" />
    );

    const dialogContent = container.querySelector("[role='dialog']");
    expect(dialogContent).not.toBeInTheDocument();
  });

  it("displays custom title when provided", () => {
    const handleOpenChange = jest.fn();
    render(
      <InfoUserDialog
        open={true}
        onOpenChange={handleOpenChange}
        type="info"
        title="Custom Title"
        infoText="Info text"
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
  });

  it("displays default error title when type is 'error'", () => {
    const handleOpenChange = jest.fn();
    render(<InfoUserDialog open={true} onOpenChange={handleOpenChange} type="error" infoText="Error message" />);

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("displays default confirm title when type is 'confirm'", () => {
    const handleOpenChange = jest.fn();
    render(<InfoUserDialog open={true} onOpenChange={handleOpenChange} type="confirm" infoText="Are you sure?" />);

    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
  });

  it("displays default info title when type is 'info'", () => {
    const handleOpenChange = jest.fn();
    render(<InfoUserDialog open={true} onOpenChange={handleOpenChange} type="info" infoText="Info message" />);

    expect(screen.getByText("Information")).toBeInTheDocument();
  });

  it("displays default success title when type is 'success'", () => {
    const handleOpenChange = jest.fn();
    render(
      <InfoUserDialog open={true} onOpenChange={handleOpenChange} type="success" infoText="Operation successful" />
    );

    expect(screen.getByText("Information")).toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked for confirm type", async () => {
    const user = userEvent.setup();
    const handleOpenChange = jest.fn();
    const handleConfirm = jest.fn();

    render(
      <InfoUserDialog
        open={true}
        onOpenChange={handleOpenChange}
        type="confirm"
        infoText="Confirm this action"
        onConfirm={handleConfirm}
      />
    );

    const confirmButton = screen.getByRole("button", { name: "Confirm" });
    await user.click(confirmButton);

    expect(handleConfirm).toHaveBeenCalled();
  });

  it("calls onOpenChange when ok button is clicked for info type", async () => {
    const user = userEvent.setup();
    const handleOpenChange = jest.fn();

    render(<InfoUserDialog open={true} onOpenChange={handleOpenChange} type="info" infoText="Info message" />);

    const okButton = screen.getByRole("button", { name: "OK" });
    await user.click(okButton);

    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows cancel button for confirm type", () => {
    const handleOpenChange = jest.fn();

    render(<InfoUserDialog open={true} onOpenChange={handleOpenChange} type="confirm" infoText="Confirm?" />);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("does not show cancel button for info type", () => {
    const handleOpenChange = jest.fn();

    render(<InfoUserDialog open={true} onOpenChange={handleOpenChange} type="info" infoText="Info" />);

    const buttons = screen.getAllByRole("button");
    const nonCloseButtons = buttons.filter((b) => b.getAttribute("data-slot") !== "dialog-close");
    expect(nonCloseButtons).toHaveLength(1); // Only OK button (exclude dialog close)
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const handleOpenChange = jest.fn();
    const handleCancel = jest.fn();

    render(
      <InfoUserDialog
        open={true}
        onOpenChange={handleOpenChange}
        type="confirm"
        infoText="Confirm?"
        onCancel={handleCancel}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    await user.click(cancelButton);

    expect(handleCancel).toHaveBeenCalled();
  });

  it("displays custom labels when provided", () => {
    const handleOpenChange = jest.fn();

    render(
      <InfoUserDialog
        open={true}
        onOpenChange={handleOpenChange}
        type="confirm"
        infoText="Confirm?"
        confirmLabel="Accept"
        cancelLabel="Reject"
      />
    );

    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("displays okLabel for non-confirm types", () => {
    const handleOpenChange = jest.fn();

    render(<InfoUserDialog open={true} onOpenChange={handleOpenChange} type="info" infoText="Info" okLabel="Got it" />);

    expect(screen.getByRole("button", { name: "Got it" })).toBeInTheDocument();
  });

  it("accepts React nodes as infoText", () => {
    const handleOpenChange = jest.fn();

    render(
      <InfoUserDialog
        open={true}
        onOpenChange={handleOpenChange}
        type="info"
        infoText={
          <>
            <span>Custom paragraph</span>
            <span>Custom span</span>
          </>
        }
      />
    );

    expect(screen.getByText("Custom paragraph")).toBeInTheDocument();
    expect(screen.getByText("Custom span")).toBeInTheDocument();
  });

  it("applies custom className to dialog", () => {
    const handleOpenChange = jest.fn();

    const { container } = render(
      <InfoUserDialog
        open={true}
        onOpenChange={handleOpenChange}
        type="info"
        infoText="Info"
        className="custom-dialog-class"
      />
    );

    const dialogContent = document.querySelector(".custom-dialog-class");
    expect(dialogContent).toBeInTheDocument();
  });

  it("displays custom icon when provided", () => {
    const handleOpenChange = jest.fn();

    render(
      <InfoUserDialog
        open={true}
        onOpenChange={handleOpenChange}
        type="info"
        infoText="Info"
        icon={<span data-testid="custom-icon">✓</span>}
      />
    );

    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("applies different button variants based on type", () => {
    const handleOpenChange = jest.fn();

    render(<InfoUserDialog open={true} onOpenChange={handleOpenChange} type="error" infoText="Error" />);

    const errorButton = document.querySelector("button[class*='destructive']");
    expect(errorButton).toBeInTheDocument();
  });
});
