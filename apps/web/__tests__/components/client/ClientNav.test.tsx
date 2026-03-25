import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientNav from "@/app/client/_components/ClientNav";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/client/appointments",
}));

jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: jest.fn(() => false),
}));

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
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders all navigation tabs", () => {
    render(<ClientNav />);

    expect(screen.getByText("Back to Main")).toBeInTheDocument();
    expect(screen.getByText("Active Appointments")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Feedback")).toBeInTheDocument();
  });

  it("highlights the active tab based on pathname", () => {
    render(<ClientNav />);

    const activeBtn = screen.getByText("Active Appointments");
    expect(activeBtn).toHaveClass("bg-pink-200");
  });

  it("calls router.push with the correct path when a tab is clicked", async () => {
    const user = userEvent.setup();
    render(<ClientNav />);

    await user.click(screen.getByText("History"));
    expect(mockPush).toHaveBeenCalledWith("/client/history");
  });

  it("calls router.push with /home when Back to Main is clicked", async () => {
    const user = userEvent.setup();
    render(<ClientNav />);

    await user.click(screen.getByText("Back to Main"));
    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  it("applies mobile styles when isMobile is true", () => {
    const { useIsMobile } = jest.requireMock("@/hooks/use-mobile");
    useIsMobile.mockReturnValue(true);

    render(<ClientNav />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveClass("text-xs");
    });
  });
});
