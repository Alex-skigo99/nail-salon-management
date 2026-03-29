import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DaySlotTable } from "@/app/admin/calendar/_components/DaySlotTable";
import type { DaySlots } from "@/types/appointmentTypes";

jest.mock("@/hooks/use-mobile", () => ({
  useIsMobile: () => false,
}));

jest.mock("@/hooks/useUsers");

jest.mock("@/components/modals/userDataModal/UserDataModal", () => ({
  UserDataModal: ({ open, userId }: any) => (open ? <div data-testid="user-data-modal">Modal for {userId}</div> : null),
}));

const baseDaySlots: DaySlots = {
  date: "2026-03-30",
  start_time: "09:00",
  end_time: "17:00",
  slot_duration: 60,
  slots_count: 2,
  slots: [
    {
      start_time: "09:00",
      end_time: "10:00",
      status: "book",
      appointment_data: {
        id: 1,
        master_id: 1,
        user_id: "u1",
        guest_name: null,
        guest_phone: null,
        date: "2026-03-30",
        time: "09:00",
        duration_minutes: 60,
        status: "confirmed",
        services: "Manicure",
        comments: null,
        created_at: "2026-03-28T10:00:00Z",
        updated_at: "2026-03-28T10:00:00Z",
        user_data: { id: "u1", name: "Alice", email: "alice@test.com", phone: "+123", image: null },
      },
    },
    {
      start_time: "10:00",
      end_time: "11:00",
      status: "book",
      appointment_data: {
        id: 2,
        master_id: 1,
        user_id: null,
        guest_name: "Bob Guest",
        guest_phone: "+456",
        date: "2026-03-30",
        time: "10:00",
        duration_minutes: 60,
        status: "new",
        services: "Pedicure",
        comments: null,
        created_at: "2026-03-28T11:00:00Z",
        updated_at: "2026-03-28T11:00:00Z",
        user_data: null,
      },
    },
  ],
};

describe("DaySlotTable", () => {
  it("renders registered user name as clickable", () => {
    render(<DaySlotTable daySlots={baseDaySlots} onSlotClick={jest.fn()} />);

    const aliceButton = screen.getByRole("button", { name: "Alice" });
    expect(aliceButton).toBeInTheDocument();
    expect(aliceButton).toHaveClass("hover:underline");
  });

  it("renders guest name as plain text (not a button)", () => {
    render(<DaySlotTable daySlots={baseDaySlots} onSlotClick={jest.fn()} />);

    expect(screen.queryByRole("button", { name: "Bob Guest" })).not.toBeInTheDocument();
    expect(screen.getByText("Bob Guest")).toBeInTheDocument();
  });

  it("opens UserDataModal when registered user name is clicked", async () => {
    const user = userEvent.setup();
    render(<DaySlotTable daySlots={baseDaySlots} onSlotClick={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Alice" }));

    expect(screen.getByTestId("user-data-modal")).toHaveTextContent("Modal for u1");
  });

  it("does not trigger onSlotClick when name is clicked", async () => {
    const user = userEvent.setup();
    const onSlotClick = jest.fn();
    render(<DaySlotTable daySlots={baseDaySlots} onSlotClick={onSlotClick} />);

    await user.click(screen.getByRole("button", { name: "Alice" }));

    expect(onSlotClick).not.toHaveBeenCalled();
  });
});
