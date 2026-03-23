import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientNav, { ClientTab } from "@/app/client/_components/ClientNav";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const map: Record<string, string> = {
      backToMain: "Back to Main",
      activeAppointments: "Active Appointments",
      history: "History",
      profile: "Profile",
      feedback: "Feedback",
    };
    return map[key] ?? key;
  }),
}));

describe("ClientNav", () => {
  const defaultProps = {
    activeTab: "appointments" as ClientTab,
    onTabChange: jest.fn(),
    isMobile: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all navigation tabs", () => {
    render(<ClientNav {...defaultProps} />);

    expect(screen.getByText("Back to Main")).toBeInTheDocument();
    expect(screen.getByText("Active Appointments")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
  });

  it("highlights the active tab", () => {
    render(<ClientNav {...defaultProps} activeTab="appointments" />);

    const activeBtn = screen.getByText("Active Appointments");
    expect(activeBtn).toHaveClass("bg-pink-200");
  });

  it("calls onTabChange when a tab is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = jest.fn();
    render(<ClientNav {...defaultProps} onTabChange={onTabChange} />);

    await user.click(screen.getByText("History"));
    expect(onTabChange).toHaveBeenCalledWith("history");
  });

  it("calls onTabChange with 'back' when Back to Main is clicked", async () => {
    const user = userEvent.setup();
    const onTabChange = jest.fn();
    render(<ClientNav {...defaultProps} onTabChange={onTabChange} />);

    await user.click(screen.getByText("Back to Main"));
    expect(onTabChange).toHaveBeenCalledWith("back");
  });

  it("applies mobile styles when isMobile is true", () => {
    render(<ClientNav {...defaultProps} isMobile={true} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveClass("text-xs");
    });
  });
});
