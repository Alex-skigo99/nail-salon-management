import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppointmentCard from "@/app/client/_components/AppointmentCard";
import type { AppointmentRetrieve } from "@/types/appointmentTypes";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => {
    const translations: Record<string, string> = {
      today: "Today",
      tomorrow: "Tomorrow",
      daysToGo: "{days} days to go",
      master: "Master",
      minutes: "min",
      services: "Services",
      deleteAppointment: "Cancel appointment",
      editComment: "Edit comment",
      commentPlaceholder: "Add a comment...",
      save: "Save",
      cancel: "Cancel",
    };
    return (key: string, params?: Record<string, string | number>) => {
      let text = translations[key] ?? key;
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          text = text.replace(`{${k}}`, String(v));
        });
      }
      return text;
    };
  }),
}));

const mockAppointment: AppointmentRetrieve = {
  id: 1,
  master_id: 1,
  user_id: "user-123",
  guest_name: null,
  guest_phone: null,
  date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  time: "10:00:00",
  duration_minutes: 60,
  status: "confirmed",
  services: "Manicure, Pedicure",
  comments: "Please use gel polish",
  created_at: "2026-03-01T10:00:00Z",
  updated_at: "2026-03-01T10:00:00Z",
  user_data: null,
};

describe("AppointmentCard", () => {
  const defaultProps = {
    appointment: mockAppointment,
    masterName: "Sarah",
    onDelete: jest.fn(),
    onCommentUpdate: jest.fn(),
    isMobile: false,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders appointment details", () => {
    render(<AppointmentCard {...defaultProps} />);

    expect(screen.getByText("confirmed")).toBeInTheDocument();
    expect(screen.getByText(/Sarah/)).toBeInTheDocument();
    expect(screen.getByText(/10:00/)).toBeInTheDocument();
    expect(screen.getByText(/60 min/)).toBeInTheDocument();
    expect(screen.getByText(/Manicure, Pedicure/)).toBeInTheDocument();
  });

  it("shows comment text", () => {
    render(<AppointmentCard {...defaultProps} />);

    expect(screen.getByText("Please use gel polish")).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = jest.fn();
    render(<AppointmentCard {...defaultProps} onDelete={onDelete} />);

    const deleteBtn = screen.getByTitle("Cancel appointment");
    await user.click(deleteBtn);

    expect(onDelete).toHaveBeenCalled();
  });

  it("enters comment editing mode", async () => {
    const user = userEvent.setup();
    render(<AppointmentCard {...defaultProps} />);

    const editBtn = screen.getByTitle("Edit comment");
    await user.click(editBtn);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toHaveValue("Please use gel polish");
  });

  it("saves updated comment", async () => {
    const user = userEvent.setup();
    const onCommentUpdate = jest.fn();
    render(<AppointmentCard {...defaultProps} onCommentUpdate={onCommentUpdate} />);

    const editBtn = screen.getByTitle("Edit comment");
    await user.click(editBtn);

    const textarea = screen.getByRole("textbox");
    await user.clear(textarea);
    await user.type(textarea, "New comment");

    await user.click(screen.getByText("Save"));

    expect(onCommentUpdate).toHaveBeenCalledWith(1, "New comment");
  });

  it("cancels comment editing", async () => {
    const user = userEvent.setup();
    const onCommentUpdate = jest.fn();
    render(<AppointmentCard {...defaultProps} onCommentUpdate={onCommentUpdate} />);

    const editBtn = screen.getByTitle("Edit comment");
    await user.click(editBtn);

    await user.click(screen.getByText("Cancel"));

    expect(onCommentUpdate).not.toHaveBeenCalled();
    expect(screen.getByText("Please use gel polish")).toBeInTheDocument();
  });
});
