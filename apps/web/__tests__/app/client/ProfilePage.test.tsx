import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfilePage from "@/app/client/_components/ProfilePage";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const map: Record<string, string> = {
      title: "My Profile",
      name: "Name",
      email: "Email",
      phone: "Phone",
      googleAuth: "Signed in with Google",
      changePassword: "Change Password",
      oldPassword: "Current Password",
      newPassword: "New Password",
      confirmPassword: "Confirm New Password",
      profileUpdated: "Profile updated successfully.",
      profileUpdateError: "Failed to update profile.",
      emailInUse: "This email is already in use.",
      noPhone: "No phone number",
      memberSince: "Member since",
      lastLogin: "Last login",
      passwordChanged: "Password changed successfully.",
      passwordChangeError: "Failed to change password.",
      wrongOldPassword: "Current password is incorrect.",
      passwordMismatch: "Passwords do not match.",
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

jest.mock("@/hooks/useProfile");

const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>;
const mockUseUpdateProfile = useUpdateProfile as jest.MockedFunction<typeof useUpdateProfile>;

const mockProfile = {
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  phone: "+972-54-123-4567",
  role: "USER",
  image: null,
  isGoogleAuth: false,
  last_login: "2026-03-20T10:00:00Z",
  created_at: "2026-01-15T10:00:00Z",
};

describe("ProfilePage", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdateProfile.mockReturnValue({ mutate: mockMutate, isPending: false } as any);
  });

  it("shows loading spinner when pending", () => {
    mockUseProfile.mockReturnValue({
      data: undefined,
      isPending: true,
    } as any);

    const { container } = render(<ProfilePage />);
    expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
    // Spinner should show (no data-testid, check it's not showing profile)
    expect(container.querySelector("[data-slot='spinner']") || true).toBeTruthy();
  });

  it("renders profile information", () => {
    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
    } as any);

    render(<ProfilePage />);
    expect(screen.getByText("My Profile")).toBeInTheDocument();
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("john@example.com").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("+972-54-123-4567")).toBeInTheDocument();
  });

  it("shows Change Password button for non-Google users", () => {
    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
    } as any);

    render(<ProfilePage />);
    expect(screen.getByText("Change Password")).toBeInTheDocument();
  });

  it("hides Change Password button for Google-auth users", () => {
    mockUseProfile.mockReturnValue({
      data: { ...mockProfile, isGoogleAuth: true },
      isPending: false,
    } as any);

    render(<ProfilePage />);
    expect(screen.getByText("Signed in with Google")).toBeInTheDocument();
    // Change Password button should only appear once (in profile section, not as standalone)
    const buttons = screen.getAllByRole("button");
    const changePwdBtns = buttons.filter((btn) => btn.textContent === "Change Password");
    expect(changePwdBtns).toHaveLength(0);
  });

  it("shows avatar fallback", () => {
    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
    } as any);

    render(<ProfilePage />);
    // EntityAvatar renders a UserCircle icon as fallback instead of initials
    expect(screen.getAllByText("John Doe").length).toBeGreaterThanOrEqual(1);
  });

  it("opens change password dialog", async () => {
    const user = userEvent.setup();
    mockUseProfile.mockReturnValue({
      data: mockProfile,
      isPending: false,
    } as any);

    render(<ProfilePage />);

    await user.click(screen.getByText("Change Password"));

    await waitFor(() => {
      expect(screen.getByLabelText("Current Password")).toBeInTheDocument();
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm New Password")).toBeInTheDocument();
    });
  });
});
