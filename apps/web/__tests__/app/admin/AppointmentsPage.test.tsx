import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppointmentsPage from "@/app/admin/appointments/AppointmentsPage";
import { useAllAppointments } from "@/hooks/useAppointments";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/hooks/useAppointments", () => ({
  ...jest.requireActual("@/hooks/useAppointments"),
  useAllAppointments: jest.fn(),
}));
jest.mock("@/hooks/useMasters", () => ({
  useMasters: () => ({ data: [{ id: 1, name: "Jane Smith" }], isLoading: false }),
}));
jest.mock("@/components/modals/adminAppointmentDialog/AdminAppointmentDialog", () => ({
  AdminAppointmentDialog: ({ open, date, masterId }: any) =>
    open ? (
      <div data-testid="appointment-dialog">
        Dialog for {date} master {masterId}
      </div>
    ) : null,
}));

const mockUseAllAppointments = useAllAppointments as jest.MockedFunction<typeof useAllAppointments>;

const mockAppointments = [
  {
    id: 1,
    master_id: 1,
    user_id: "uuid-1",
    guest_name: null,
    guest_phone: null,
    date: "2026-04-15",
    time: "10:00:00",
    duration_minutes: 60,
    status: "new" as const,
    services: "Manicure",
    comments: "Test comment",
    created_at: "2026-04-10T10:00:00Z",
    updated_at: "2026-04-10T10:00:00Z",
    user_data: {
      id: "uuid-1",
      name: "Alice",
      email: "alice@test.com",
      phone: "+123",
      image: null,
      language: "en" as const,
    },
    master_data: { id: 1, name: "Jane Smith", description: null },
  },
  {
    id: 2,
    master_id: 1,
    user_id: null,
    guest_name: "Bob Guest",
    guest_phone: "+456",
    date: "2026-04-16",
    time: "14:00:00",
    duration_minutes: 30,
    status: "confirmed" as const,
    services: "Pedicure",
    comments: null,
    created_at: "2026-04-10T12:00:00Z",
    updated_at: "2026-04-10T12:00:00Z",
    user_data: null,
    master_data: { id: 1, name: "Jane Smith", description: null },
  },
];

const paginatedMockAppointments = {
  data: mockAppointments,
  pagination: { currentPage: 1, perPage: 20, from: 1, to: 2, total: 2, lastPage: 1, prevPage: null, nextPage: null },
};

describe("AppointmentsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page header", () => {
    mockUseAllAppointments.mockReturnValue({
      data: {
        data: [],
        pagination: {
          currentPage: 1,
          perPage: 20,
          from: 0,
          to: 0,
          total: 0,
          lastPage: 1,
          prevPage: null,
          nextPage: null,
        },
      },
      isLoading: false,
      error: null,
    } as any);
    render(<AppointmentsPage />);

    expect(screen.getByText("Appointments")).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseAllAppointments.mockReturnValue({ data: undefined, isLoading: false, error: new Error("fail") } as any);
    render(<AppointmentsPage />);

    expect(screen.getByText("Failed to load appointments")).toBeInTheDocument();
  });

  it("renders appointments in table", () => {
    mockUseAllAppointments.mockReturnValue({ data: paginatedMockAppointments, isLoading: false, error: null } as any);
    render(<AppointmentsPage />);

    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Bob Guest").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Manicure")).toBeInTheDocument();
  });

  it("opens appointment dialog when row is clicked", async () => {
    const user = userEvent.setup();
    mockUseAllAppointments.mockReturnValue({ data: paginatedMockAppointments, isLoading: false, error: null } as any);
    render(<AppointmentsPage />);

    const aliceRow = screen
      .getAllByText("Alice")
      .find((el) => el.closest("tr"))
      ?.closest("tr");
    if (aliceRow) await user.click(aliceRow);

    await waitFor(() => {
      expect(screen.getByTestId("appointment-dialog")).toHaveTextContent("Dialog for 2026-04-15 master 1");
    });
  });

  it("shows 'No appointments found' when data is empty", () => {
    mockUseAllAppointments.mockReturnValue({
      data: {
        data: [],
        pagination: {
          currentPage: 1,
          perPage: 20,
          from: 0,
          to: 0,
          total: 0,
          lastPage: 1,
          prevPage: null,
          nextPage: null,
        },
      },
      isLoading: false,
      error: null,
    } as any);
    render(<AppointmentsPage />);

    expect(screen.getByText("No appointments found")).toBeInTheDocument();
  });
});
