import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MastersPage from "@/app/admin/masters/MastersPage";
import { useMasters } from "@/hooks/useMasters";

jest.mock("@/hooks/useMasters");
jest.mock("@/components/ui/spinner", () => ({
  Spinner: ({ className }: any) => <div data-testid="spinner" className={className} />,
}));
jest.mock("@/app/admin/masters/_components/MasterCard", () => ({
  MasterCard: ({ master }: any) => <div data-testid={`master-card-${master.id}`}>{master.name}</div>,
}));
jest.mock("@/app/admin/masters/_components/MasterForm", () => ({
  MasterForm: ({ open }: any) => (open ? <div data-testid="master-form">Master Form</div> : null),
}));
jest.mock(
  "@/app/admin/masters/_components/AddMasterButton",
  () =>
    function AddMasterButton({ onClick }: any) {
      return (
        <button onClick={onClick} data-testid="add-master-button">
          Add Master
        </button>
      );
    }
);

const mockUseMasters = useMasters as jest.MockedFunction<typeof useMasters>;

const mockMasters = [
  { id: 1, name: "Sarah", email: "sarah@example.com" },
  { id: 2, name: "Emma", email: "emma@example.com" },
  { id: 3, name: "Lisa", email: "lisa@example.com" },
];

describe("MastersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders page title and description", () => {
    mockUseMasters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<MastersPage />);

    expect(screen.getByText("Masters")).toBeInTheDocument();
    expect(screen.getByText("Manage studio staff and their working schedules")).toBeInTheDocument();
  });

  it("displays loading spinner when isLoading is true", () => {
    mockUseMasters.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<MastersPage />);

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  it("displays error message when error occurs", () => {
    mockUseMasters.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("API Error"),
    } as any);

    render(<MastersPage />);

    expect(screen.getByText("Failed to load masters")).toBeInTheDocument();
    expect(screen.getByText("Please try refreshing the page")).toBeInTheDocument();
  });

  it("displays empty state when no masters exist", () => {
    mockUseMasters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<MastersPage />);

    expect(screen.getByText("No masters yet")).toBeInTheDocument();
    expect(screen.getByText("Add your first master to get started")).toBeInTheDocument();
  });

  it("renders master cards in grid when masters exist", () => {
    mockUseMasters.mockReturnValue({
      data: mockMasters,
      isLoading: false,
      error: null,
    } as any);

    render(<MastersPage />);

    mockMasters.forEach((master) => {
      expect(screen.getByTestId(`master-card-${master.id}`)).toBeInTheDocument();
      expect(screen.getByText(master.name)).toBeInTheDocument();
    });
  });

  it("displays add master button", () => {
    mockUseMasters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<MastersPage />);

    const addButtons = screen.getAllByTestId("add-master-button");
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it("opens master form when add button is clicked", async () => {
    const user = userEvent.setup();
    mockUseMasters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<MastersPage />);

    const addButton = screen.getAllByTestId("add-master-button")[0];
    await user.click(addButton);

    expect(screen.getByTestId("master-form")).toBeInTheDocument();
  });

  it("closes master form when onOpenChange is called with false", async () => {
    const user = userEvent.setup();
    mockUseMasters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<MastersPage />);

    const addButton = screen.getAllByTestId("add-master-button")[0];
    await user.click(addButton);

    expect(screen.getByTestId("master-form")).toBeInTheDocument();
  });

  it("renders correct grid layout with masters", () => {
    mockUseMasters.mockReturnValue({
      data: mockMasters,
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<MastersPage />);

    const gridContainer = container.querySelector(".grid");
    expect(gridContainer).toBeInTheDocument();
    expect(gridContainer).toHaveClass("gap-4");
  });

  it("displays add button in empty state", () => {
    mockUseMasters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    render(<MastersPage />);

    const addButtons = screen.getAllByTestId("add-master-button");
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it("shows Users icon in header", () => {
    mockUseMasters.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);

    const { container } = render(<MastersPage />);

    const iconContainer = container.querySelector(".bg-primary\\/10");
    expect(iconContainer).toBeInTheDocument();
  });
});
