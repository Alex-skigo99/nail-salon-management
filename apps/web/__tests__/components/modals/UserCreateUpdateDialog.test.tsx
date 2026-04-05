import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserCreateUpdateDialog } from "@/components/modals/userCreateUpdateDialog/UserCreateUpdateDialog";
import { useUser, useCreateUser, useUpdateUser, useDeleteUser } from "@/hooks/useUsers";
import { useMasters } from "@/hooks/useMasters";

// Radix primitives use ResizeObserver
beforeAll(() => {
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/hooks/useUsers");
jest.mock("@/hooks/useMasters");

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockUseCreateUser = useCreateUser as jest.MockedFunction<typeof useCreateUser>;
const mockUseUpdateUser = useUpdateUser as jest.MockedFunction<typeof useUpdateUser>;
const mockUseDeleteUser = useDeleteUser as jest.MockedFunction<typeof useDeleteUser>;
const mockUseMasters = useMasters as jest.MockedFunction<typeof useMasters>;

const mockUser = {
  id: "u1",
  name: "Alice",
  email: "alice@test.com",
  phone: "+123",
  role: "USER" as const,
  last_login: null,
  image: null,
  master_id: 1,
  email_subscribed: false,
  language: "en" as const,
  created_at: "2026-01-15T10:00:00Z",
  master_data: { id: 1, name: "Master A" },
};

describe("UserCreateUpdateDialog", () => {
  const mockCreateMutateAsync = jest.fn().mockResolvedValue({});
  const mockUpdateMutateAsync = jest.fn().mockResolvedValue({});
  const mockDeleteMutateAsync = jest.fn().mockResolvedValue({});

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMasters.mockReturnValue({
      data: [{ id: 1, name: "Master A" }],
      isLoading: false,
    } as any);
    mockUseCreateUser.mockReturnValue({
      mutateAsync: mockCreateMutateAsync,
      isPending: false,
    } as any);
    mockUseUpdateUser.mockReturnValue({
      mutateAsync: mockUpdateMutateAsync,
      isPending: false,
    } as any);
    mockUseDeleteUser.mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    } as any);
  });

  describe("Create mode", () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ data: undefined, isLoading: false } as any);
    });

    it("renders create form with required fields", () => {
      render(<UserCreateUpdateDialog open={true} onOpenChange={jest.fn()} userId={null} />);

      expect(screen.getByRole("heading", { name: "Create User" })).toBeInTheDocument();
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    });

    it("shows validation errors for empty required fields", async () => {
      const user = userEvent.setup();
      render(<UserCreateUpdateDialog open={true} onOpenChange={jest.fn()} userId={null} />);

      await user.click(screen.getByText("Create User", { selector: "button" }));

      await waitFor(() => {
        expect(screen.getByText("Name is required")).toBeInTheDocument();
      });
    });

    it("submits create form with valid data", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      render(<UserCreateUpdateDialog open={true} onOpenChange={onOpenChange} userId={null} />);

      await user.type(screen.getByLabelText("Name"), "New User");
      await user.type(screen.getByLabelText("Email"), "new@test.com");
      await user.type(screen.getByLabelText("Password"), "password123");
      await user.type(screen.getByLabelText("Confirm Password"), "password123");

      await user.click(screen.getByText("Create User", { selector: "button" }));

      await waitFor(() => {
        expect(mockCreateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "New User",
            email: "new@test.com",
            password: "password123",
            role: "USER",
          })
        );
      });
    });
  });

  describe("Update mode", () => {
    beforeEach(() => {
      mockUseUser.mockReturnValue({ data: mockUser, isLoading: false } as any);
    });

    it("renders edit form pre-filled with user data", async () => {
      render(<UserCreateUpdateDialog open={true} onOpenChange={jest.fn()} userId="u1" />);

      await waitFor(() => {
        expect(screen.getByText("Edit User")).toBeInTheDocument();
        expect(screen.getByLabelText("Name")).toHaveValue("Alice");
        expect(screen.getByLabelText("Email")).toHaveValue("alice@test.com");
      });
    });

    it("does not show password fields in update mode by default", () => {
      render(<UserCreateUpdateDialog open={true} onOpenChange={jest.fn()} userId="u1" />);

      expect(screen.queryByLabelText("Password")).not.toBeInTheDocument();
      expect(screen.getByText("Change Password")).toBeInTheDocument();
    });

    it("shows delete button in update mode", () => {
      render(<UserCreateUpdateDialog open={true} onOpenChange={jest.fn()} userId="u1" />);

      expect(screen.getByText("Delete")).toBeInTheDocument();
    });

    it("submits update with null password when not changed", async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      render(<UserCreateUpdateDialog open={true} onOpenChange={onOpenChange} userId="u1" />);

      await waitFor(() => {
        expect(screen.getByLabelText("Name")).toHaveValue("Alice");
      });

      await user.click(screen.getByText("Save Changes"));

      await waitFor(() => {
        expect(mockUpdateMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            id: "u1",
            data: expect.objectContaining({
              password: null,
            }),
          })
        );
      });
    });
  });
});
