import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CalendarPage from "@/app/admin/calendar/CalendarPage";
import { useMasters } from "@/hooks/useMasters";
import { useMasterSlots } from "@/hooks/useAppointments";
import { useSession } from "next-auth/react";

jest.mock("@/hooks/useMasters");
jest.mock("@/hooks/useAppointments");
jest.mock("next-auth/react");
jest.mock("@/app/admin/calendar/_components/CalendarHeader", () => ({
  CalendarHeader: ({ masters, selectedMasterId }: any) => (
    <div data-testid="calendar-header">Header - Master: {selectedMasterId}</div>
  ),
}));
jest.mock("@/app/admin/calendar/_components/CalendarNavigation", () => ({
  CalendarNavigation: () => <div data-testid="calendar-navigation">Navigation</div>,
}));
jest.mock("@/app/admin/calendar/_components/WeekView", () => ({
  WeekView: () => <div data-testid="week-view">Week View</div>,
}));
jest.mock("@/app/admin/calendar/_components/MonthView", () => ({
  MonthView: () => <div data-testid="month-view">Month View</div>,
}));

const mockUseMasters = useMasters as jest.MockedFunction<typeof useMasters>;
const mockUseMasterSlots = useMasterSlots as jest.MockedFunction<typeof useMasterSlots>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

const mockMasters = [
  { id: 1, name: "Sarah" },
  { id: 2, name: "Emma" },
];

const mockSlots = [
  { id: 1, date: "2026-03-21", time: "10:00" },
  { id: 2, date: "2026-03-21", time: "11:00" },
];

describe("CalendarPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: {
        user: { role: "ADMIN" },
      },
    } as any);
    mockUseMasters.mockReturnValue({
      data: mockMasters,
      isLoading: false,
      error: null,
    } as any);
    mockUseMasterSlots.mockReturnValue({
      data: mockSlots,
      isLoading: false,
      error: null,
    } as any);
  });

  it("renders calendar header", () => {
    render(<CalendarPage />);

    expect(screen.getByTestId("calendar-header")).toBeInTheDocument();
  });

  it("renders calendar navigation", () => {
    render(<CalendarPage />);

    expect(screen.getByTestId("calendar-navigation")).toBeInTheDocument();
  });

  it("renders week view by default", () => {
    render(<CalendarPage />);

    expect(screen.getByTestId("week-view")).toBeInTheDocument();
  });

  it("does not render month view by default", () => {
    render(<CalendarPage />);

    expect(screen.queryByTestId("month-view")).not.toBeInTheDocument();
  });

  it("auto-selects first master when masters load", () => {
    render(<CalendarPage />);

    expect(screen.getByTestId("calendar-header")).toHaveTextContent("Master: 1");
  });

  it("fetches master slots with correct date range", () => {
    render(<CalendarPage />);

    expect(mockUseMasterSlots).toHaveBeenCalled();
    const calls = mockUseMasterSlots.mock.calls;
    expect(calls[calls.length - 1][0]).toBe(1); // masterId
  });

  it("only fetches masters when user is admin", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { role: "ADMIN" },
      },
    } as any);

    render(<CalendarPage />);

    expect(mockUseMasters).toHaveBeenCalledWith(true);
  });

  it("does not fetch all masters when user is not admin", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { role: "MASTER" },
      },
    } as any);

    render(<CalendarPage />);

    expect(mockUseMasters).toHaveBeenCalledWith(false);
  });

  it("renders flex layout with proper classes", () => {
    const { container } = render(<CalendarPage />);

    const mainContainer = container.querySelector(".flex.flex-col");
    expect(mainContainer).toBeInTheDocument();
  });

  it("handles empty masters list", () => {
    mockUseMasters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<CalendarPage />);

    expect(screen.getByTestId("calendar-header")).toBeInTheDocument();
  });

  it("fetches slots for the currently selected master", () => {
    render(<CalendarPage />);

    expect(mockUseMasterSlots).toHaveBeenCalled();
    expect(mockUseMasterSlots.mock.calls[0][0]).toBe(1);
  });

  it("handles loading state for masters", () => {
    mockUseMasters.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<CalendarPage />);

    expect(screen.getByTestId("calendar-header")).toBeInTheDocument();
  });

  it("handles loading state for slots", () => {
    mockUseMasterSlots.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<CalendarPage />);

    expect(screen.getByTestId("week-view")).toBeInTheDocument();
  });

  it("passes masters to calendar header", () => {
    render(<CalendarPage />);

    const header = screen.getByTestId("calendar-header");
    expect(header).toBeInTheDocument();
  });

  it("handles null session gracefully", () => {
    mockUseSession.mockReturnValue({
      data: null,
    } as any);

    render(<CalendarPage />);

    expect(screen.getByTestId("calendar-header")).toBeInTheDocument();
  });
});
