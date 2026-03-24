import React from "react";
import { render, screen } from "@testing-library/react";
import HistoryPage from "@/app/client/_components/HistoryPage";
import { useUserAppointments } from "@/hooks/useAppointments";
import { useMasters } from "@/hooks/useMasters";
import { useSession } from "next-auth/react";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const map: Record<string, string> = {
      title: "Appointment History",
      noHistory: "No appointment history found.",
      date: "Date",
      time: "Time",
      master: "Master",
      duration: "Duration",
      minutes: "min",
      services: "Services",
      status: "Status",
      comments: "Comments",
    };
    return map[key] ?? key;
  }),
}));

jest.mock("@/hooks/useAppointments");
jest.mock("@/hooks/useMasters");
jest.mock("next-auth/react");

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseUserAppointments = useUserAppointments as jest.MockedFunction<typeof useUserAppointments>;
const mockUseMasters = useMasters as jest.MockedFunction<typeof useMasters>;

describe("HistoryPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1", role: "USER" } },
    } as any);
    mockUseMasters.mockReturnValue({
      data: [{ id: 1, name: "Sarah" }],
    } as any);
  });

  it("renders title", () => {
    mockUseUserAppointments.mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isPending: false,
    } as any);

    render(<HistoryPage isMobile={false} />);
    expect(screen.getByText("Appointment History")).toBeInTheDocument();
  });

  it("shows no history message when empty", () => {
    mockUseUserAppointments.mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isPending: false,
    } as any);

    render(<HistoryPage isMobile={false} />);
    expect(screen.getByText("No appointment history found.")).toBeInTheDocument();
  });

  it("renders table with appointment data", () => {
    mockUseUserAppointments.mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            master_id: 1,
            user_id: "user-1",
            guest_name: null,
            guest_phone: null,
            date: "2026-03-01",
            time: "10:00:00",
            duration_minutes: 60,
            status: "confirmed",
            services: "Manicure",
            comments: "Test",
            created_at: "2026-03-01T00:00:00Z",
            updated_at: "2026-03-01T00:00:00Z",
            master_data: { id: 1, name: "Sarah" },
          },
        ],
        pagination: { total: 1, currentPage: 1, perPage: 10, lastPage: 1 },
      },
      isPending: false,
    } as any);

    render(<HistoryPage isMobile={false} />);
    expect(screen.getByText("March 1, 2026")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("Sarah")).toBeInTheDocument();
  });
});
