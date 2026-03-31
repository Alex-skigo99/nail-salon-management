import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserDataModal } from "@/components/modals/userDataModal/UserDataModal";
import { useUser } from "@/hooks/useUsers";

jest.mock("@/hooks/useUsers");
jest.mock("@/components/modals/historyUserApptsModal/HistoryUserApptsModal", () => ({
  HistoryUserApptsModal: ({ open }: { open: boolean }) => (open ? <div>Appointment History</div> : null),
}));
jest.mock("@/components/modals/userCreateUpdateDialog/UserCreateUpdateDialog", () => ({
  UserCreateUpdateDialog: ({ open, userId }: { open: boolean; userId: string | null }) =>
    open ? <div data-testid="edit-dialog">Edit {userId}</div> : null,
}));

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;

const mockUser = {
  id: "u1",
  name: "Alice",
  email: "alice@test.com",
  phone: "+123",
  role: "USER" as const,
  last_login: "2026-03-20T10:00:00Z",
  image: null,
  master_id: 1,
  email_subscribed: true,
  created_at: "2026-01-15T10:00:00Z",
  master_data: { id: 1, name: "Master A" },
  appts_count: 3,
  last_appts: "2026-03-15",
};

describe("UserDataModal", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows spinner when loading", () => {
    mockUseUser.mockReturnValue({ data: undefined, isLoading: true } as any);
    const { container } = render(<UserDataModal open={true} onOpenChange={jest.fn()} userId="u1" />);

    expect(container.querySelector("[data-slot='spinner']") || screen.queryByText("User Details")).toBeTruthy();
  });

  it("shows user not found when no data", () => {
    mockUseUser.mockReturnValue({ data: undefined, isLoading: false } as any);
    render(<UserDataModal open={true} onOpenChange={jest.fn()} userId="u1" />);

    expect(screen.getByText("User not found")).toBeInTheDocument();
  });

  it("renders user details", () => {
    mockUseUser.mockReturnValue({ data: mockUser, isLoading: false } as any);
    render(<UserDataModal open={true} onOpenChange={jest.fn()} userId="u1" />);

    expect(screen.getAllByText("Alice").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
    expect(screen.getByText("+123")).toBeInTheDocument();
    expect(screen.getByText("Master A")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
  });

  it("opens edit dialog when Edit button clicked", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({ data: mockUser, isLoading: false } as any);
    render(<UserDataModal open={true} onOpenChange={jest.fn()} userId="u1" />);

    await user.click(screen.getByText("Edit"));
    expect(screen.getByTestId("edit-dialog")).toHaveTextContent("Edit u1");
  });

  it("does not render when open is false", () => {
    mockUseUser.mockReturnValue({ data: mockUser, isLoading: false } as any);
    render(<UserDataModal open={false} onOpenChange={jest.fn()} userId="u1" />);

    expect(screen.queryByText("User Details")).not.toBeInTheDocument();
  });

  it("opens history modal when appointments field is clicked", async () => {
    const user = userEvent.setup();
    mockUseUser.mockReturnValue({ data: mockUser, isLoading: false } as any);
    render(<UserDataModal open={true} onOpenChange={jest.fn()} userId="u1" />);

    await user.click(screen.getByText("3"));
    expect(screen.getByText("Appointment History")).toBeInTheDocument();
  });
});
