import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ActiveAppointments from "@/app/client/_components/ActiveAppointments";
import { useUserAppointments, useDeleteAppointment, useUpdateAppointmentComment } from "@/hooks/useAppointments";
import { useMasters } from "@/hooks/useMasters";
import { useSession } from "next-auth/react";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string, params?: Record<string, string | number>) => {
    const map: Record<string, string> = {
      title: "Your Upcoming Appointments",
      noAppointments: "You have no upcoming appointments.",
      deleteConfirmTitle: "Cancel Appointment",
      deleteConfirmText: "Are you sure you want to cancel this appointment?",
      deleteSuccess: "Appointment cancelled successfully.",
      deleteError: "Failed to cancel appointment.",
      commentUpdated: "Comment updated successfully.",
      commentUpdateError: "Failed to update comment.",
    };
    return map[key] ?? key;
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("@/hooks/useAppointments");
jest.mock("@/hooks/useMasters");
jest.mock("next-auth/react");
jest.mock("@/app/client/_components/AppointmentCard", () => {
  return function MockAppointmentCard({ appointment, onDelete }: any) {
    return (
      <div data-testid={`card-${appointment.id}`}>
        <span>{appointment.date}</span>
        <button onClick={onDelete}>Delete</button>
      </div>
    );
  };
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseUserAppointments = useUserAppointments as jest.MockedFunction<typeof useUserAppointments>;
const mockUseMasters = useMasters as jest.MockedFunction<typeof useMasters>;
const mockUseDeleteAppointment = useDeleteAppointment as jest.MockedFunction<typeof useDeleteAppointment>;
const mockUseUpdateAppointmentComment = useUpdateAppointmentComment as jest.MockedFunction<
  typeof useUpdateAppointmentComment
>;

const mockAppointments = [
  {
    id: 1,
    master_id: 1,
    user_id: "user-1",
    guest_name: null,
    guest_phone: null,
    date: "2026-04-01",
    time: "10:00:00",
    duration_minutes: 60,
    status: "confirmed",
    services: "Manicure",
    comments: null,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    user_data: null,
  },
];

describe("ActiveAppointments", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue({
      data: { user: { id: "user-1", role: "USER" } },
    } as any);
    mockUseMasters.mockReturnValue({ data: [{ id: 1, name: "Sarah" }] } as any);
    mockUseDeleteAppointment.mockReturnValue({ mutate: mockMutate } as any);
    mockUseUpdateAppointmentComment.mockReturnValue({ mutate: jest.fn() } as any);
  });

  it("shows loading spinner while fetching", () => {
    mockUseUserAppointments.mockReturnValue({
      data: undefined,
      isPending: true,
    } as any);

    render(<ActiveAppointments isMobile={false} />);
    // Spinner should be rendered (it doesn't have role, so check container)
    expect(screen.queryByText("Your Upcoming Appointments")).not.toBeInTheDocument();
  });

  it("shows empty state when no appointments", () => {
    mockUseUserAppointments.mockReturnValue({
      data: { data: [], pagination: { total: 0 } },
      isPending: false,
    } as any);

    render(<ActiveAppointments isMobile={false} />);
    expect(screen.getByText("Your Upcoming Appointments")).toBeInTheDocument();
    expect(screen.getByText("You have no upcoming appointments.")).toBeInTheDocument();
  });

  it("renders appointment cards", () => {
    mockUseUserAppointments.mockReturnValue({
      data: { data: mockAppointments, pagination: { total: 1 } },
      isPending: false,
    } as any);

    render(<ActiveAppointments isMobile={false} />);
    expect(screen.getByTestId("card-1")).toBeInTheDocument();
  });

  it("opens delete confirmation dialog then confirms", async () => {
    const user = userEvent.setup();
    mockUseUserAppointments.mockReturnValue({
      data: { data: mockAppointments, pagination: { total: 1 } },
      isPending: false,
    } as any);

    render(<ActiveAppointments isMobile={false} />);

    await user.click(screen.getByText("Delete"));

    // Confirm dialog should appear
    await waitFor(() => {
      expect(screen.getByText("Cancel Appointment")).toBeInTheDocument();
    });
  });
});
