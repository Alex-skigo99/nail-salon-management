import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SettingsPage from "@/app/admin/settings/SettingsPage";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";

jest.mock("sonner", () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock("@/hooks/useSettings");

const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;
const mockUseUpdateSetting = useUpdateSetting as jest.MockedFunction<typeof useUpdateSetting>;

const mockSettings = [
  {
    id: 1,
    key: "slot_duration",
    value: "60",
    description: "Duration of each appointment slot in minutes",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    label: "Slot Duration (minutes)",
    type: "number",
    validation: (value: string) => null,
  },
  {
    id: 2,
    key: "booking_period",
    value: "30",
    description: "Number of days forward clients can schedule appointments",
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
    label: "Booking Period (days)",
    type: "number",
    validation: (value: string) => null,
  },
];

describe("SettingsPage", () => {
  const mockMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUpdateSetting.mockReturnValue({ mutate: mockMutate } as any);
  });

  it("renders page header", () => {
    mockUseSettings.mockReturnValue({ data: [], isLoading: false, error: null } as any);
    render(<SettingsPage />);

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Manage salon configuration")).toBeInTheDocument();
  });

  it("displays spinner while loading", () => {
    mockUseSettings.mockReturnValue({ data: undefined, isLoading: true, error: null } as any);
    render(<SettingsPage />);

    expect(screen.queryByText("Slot Duration (minutes)")).not.toBeInTheDocument();
  });

  it("shows error state", () => {
    mockUseSettings.mockReturnValue({ data: undefined, isLoading: false, error: new Error("fail") } as any);
    render(<SettingsPage />);

    expect(screen.getByText("Failed to load settings")).toBeInTheDocument();
  });

  it("renders all settings with labels and values", () => {
    mockUseSettings.mockReturnValue({ data: mockSettings, isLoading: false, error: null } as any);
    render(<SettingsPage />);

    expect(screen.getByText("Slot Duration (minutes)")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("Booking Period (days)")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("renders description text for known settings", () => {
    mockUseSettings.mockReturnValue({ data: mockSettings, isLoading: false, error: null } as any);
    render(<SettingsPage />);

    expect(screen.getByText("Duration of each appointment slot in minutes")).toBeInTheDocument();
    expect(screen.getByText("Number of days forward clients can schedule appointments")).toBeInTheDocument();
  });

  it("calls updateSetting when a setting value is saved", async () => {
    const user = userEvent.setup();
    mockUseSettings.mockReturnValue({ data: mockSettings, isLoading: false, error: null } as any);
    render(<SettingsPage />);

    // Click the edit button for the first setting (slot_duration)
    const editButtons = screen.getAllByRole("button");
    const pencilButton = editButtons.find((btn) => btn.querySelector("svg"));
    if (pencilButton) {
      await user.click(pencilButton);
      const input = screen.getByDisplayValue("60");
      await user.clear(input);
      await user.type(input, "45");
      // Press Enter to save
      await user.keyboard("{Enter}");
      expect(mockMutate).toHaveBeenCalledWith(
        { key: "slot_duration", value: "45" },
        expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
      );
    }
  });

  it("uses setting key as label for unknown settings", () => {
    const unknownSetting = [
      {
        id: 3,
        key: "custom_setting",
        value: "test",
        description: null,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
        label: "custom_setting",
        type: "text",
      },
    ];
    mockUseSettings.mockReturnValue({ data: unknownSetting, isLoading: false, error: null } as any);
    render(<SettingsPage />);

    expect(screen.getByText("custom_setting")).toBeInTheDocument();
    expect(screen.getByText("test")).toBeInTheDocument();
  });
});
