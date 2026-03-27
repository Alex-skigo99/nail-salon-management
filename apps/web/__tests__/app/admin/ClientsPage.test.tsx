import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientsPage from "@/app/admin/clients/ClientsPage";
import { useUsers } from "@/hooks/useUsers";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/hooks/useUsers");
jest.mock("@/hooks/useMasters", () => ({
  useMasters: () => ({ data: [], isLoading: false }),
}));
jest.mock("@/components/modals/userDataModal/UserDataModal", () => ({
  UserDataModal: ({ open, userId, onEdit }: any) =>
    open ? <div data-testid="user-data-modal">Modal for {userId}</div> : null,
}));
jest.mock("@/components/modals/userCreateUpdateDialog/UserCreateUpdateDialog", () => ({
  UserCreateUpdateDialog: ({ open, userId }: any) =>
    open ? <div data-testid="user-form-dialog">{userId ? `Edit ${userId}` : "Create"}</div> : null,
}));

const mockUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;

const mockUsers = [
  {
    id: "u1",
    name: "Alice",
    email: "alice@test.com",
    phone: "+123",
    role: "USER" as const,
    last_login: null,
    image: null,
    master_id: null,
    created_at: "2026-01-01",
    appts_count: 5,
    last_appts: "2026-03-01",
  },
  {
    id: "u2",
    name: "Bob",
    email: "bob@test.com",
    phone: null,
    role: "ADMIN" as const,
    last_login: null,
    image: null,
    master_id: 1,
    created_at: "2026-02-01",
    appts_count: 0,
    last_appts: null,
  },
];

describe("ClientsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page header and Add User button", () => {
    mockUseUsers.mockReturnValue({ data: [], isLoading: false, error: null } as any);
    render(<ClientsPage />);

    expect(screen.getByText("Clients")).toBeInTheDocument();
    expect(screen.getByText("Add User")).toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseUsers.mockReturnValue({ data: undefined, isLoading: false, error: new Error("fail") } as any);
    render(<ClientsPage />);

    expect(screen.getByText("Failed to load users")).toBeInTheDocument();
  });

  it("renders users in table", () => {
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false, error: null } as any);
    render(<ClientsPage />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("alice@test.com")).toBeInTheDocument();
  });

  it("opens create dialog on Add User click", async () => {
    const user = userEvent.setup();
    mockUseUsers.mockReturnValue({ data: [], isLoading: false, error: null } as any);
    render(<ClientsPage />);

    await user.click(screen.getByText("Add User"));
    expect(screen.getByTestId("user-form-dialog")).toHaveTextContent("Create");
  });

  it("opens view modal when row is clicked", async () => {
    const user = userEvent.setup();
    mockUseUsers.mockReturnValue({ data: mockUsers, isLoading: false, error: null } as any);
    render(<ClientsPage />);

    const aliceRow = screen.getByText("Alice").closest("tr");
    if (aliceRow) await user.click(aliceRow);

    await waitFor(() => {
      expect(screen.getByTestId("user-data-modal")).toHaveTextContent("Modal for u1");
    });
  });
});
