import React from "react";
import { render, screen } from "@testing-library/react";
import { HistoryUserApptsModal } from "@/components/modals/historyUserApptsModal/HistoryUserApptsModal";
import { useUserAppointments } from "@/hooks/useAppointments";

jest.mock("@/hooks/useAppointments");

const mockUseUserAppointments = useUserAppointments as jest.MockedFunction<typeof useUserAppointments>;

describe("HistoryUserApptsModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("does not render when open is false", () => {
    mockUseUserAppointments.mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isPending: false,
    } as any);

    render(<HistoryUserApptsModal open={false} onOpenChange={jest.fn()} userId="u1" />);
    expect(screen.queryByText("Appointment History")).not.toBeInTheDocument();
  });

  it("renders with user name in title", () => {
    mockUseUserAppointments.mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isPending: false,
    } as any);

    render(<HistoryUserApptsModal open={true} onOpenChange={jest.fn()} userId="u1" userName="Alice" />);
    expect(screen.getByText("Appointment History: Alice")).toBeInTheDocument();
  });

  it("shows no appointments message when empty", () => {
    mockUseUserAppointments.mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isPending: false,
    } as any);

    render(<HistoryUserApptsModal open={true} onOpenChange={jest.fn()} userId="u1" />);
    expect(screen.getByText("No appointments found")).toBeInTheDocument();
  });

  it("renders appointment data in table", () => {
    mockUseUserAppointments.mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            master_id: 1,
            user_id: "u1",
            guest_name: null,
            guest_phone: null,
            date: "2026-03-10",
            time: "14:30:00",
            duration_minutes: 45,
            status: "confirmed",
            services: "Pedicure",
            comments: null,
            created_at: "2026-03-10T00:00:00Z",
            updated_at: "2026-03-10T00:00:00Z",
            master_data: { id: 1, name: "Sarah" },
          },
        ],
        pagination: { total: 1, currentPage: 1, perPage: 10, lastPage: 1 },
      },
      isPending: false,
    } as any);

    render(<HistoryUserApptsModal open={true} onOpenChange={jest.fn()} userId="u1" userName="Alice" />);
    expect(screen.getByText("March 10, 2026")).toBeInTheDocument();
    expect(screen.getByText("14:30")).toBeInTheDocument();
    expect(screen.getByText("Sarah")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
  });
});
