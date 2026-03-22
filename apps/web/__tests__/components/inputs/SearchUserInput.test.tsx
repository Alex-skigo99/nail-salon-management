import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchUserInput from "@/components/inputs/SearchUserInput";
import { useUsers } from "@/hooks/useUsers";

jest.mock("@/hooks/useUsers");

const mockUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;

const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    phone: "+972-50-1234567",
    email: "john@example.com",
    image: null,
  },
  {
    id: "2",
    name: "Jane Smith",
    phone: "+972-51-7654321",
    email: "jane@example.com",
    image: null,
  },
  {
    id: "3",
    name: "Bob Johnson",
    phone: null,
    email: "bob@example.com",
    image: null,
  },
];

describe("SearchUserInput", () => {
  beforeEach(() => {
    mockUseUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      error: null,
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders label and input", () => {
    const handleChange = jest.fn();
    render(<SearchUserInput value={null} onChange={handleChange} label="Select User" />);

    expect(screen.getByText("Select User")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search by name or phone...")).toBeInTheDocument();
  });

  it("allows user to type in the search input", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SearchUserInput value={null} onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search by name or phone...");
    await user.type(input, "John");

    expect(input).toHaveValue("John");
  });

  it("filters users by name when typing", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SearchUserInput value={null} onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search by name or phone...");
    await user.type(input, "John");
    await waitFor(() => {
      expect(screen.getByText("John Doe - +972-50-1234567")).toBeInTheDocument();
    });
  });

  it("filters users by phone number when typing", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SearchUserInput value={null} onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search by name or phone...");
    await user.type(input, "+972-50");

    await waitFor(() => {
      expect(screen.getByText("John Doe - +972-50-1234567")).toBeInTheDocument();
    });
  });

  it("calls onChange when a user is selected", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SearchUserInput value={null} onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search by name or phone...");
    await user.click(input);
    await waitFor(() => {
      expect(screen.getByText("John Doe - +972-50-1234567")).toBeInTheDocument();
    });

    const userOption = screen.getByText("John Doe - +972-50-1234567");
    await user.click(userOption);

    expect(handleChange).toHaveBeenCalledWith("1");
  });

  it("displays clear button when value is selected", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { rerender } = render(<SearchUserInput value={null} onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search by name or phone...");
    await user.click(input);
    await waitFor(() => {
      expect(screen.getByText("John Doe - +972-50-1234567")).toBeInTheDocument();
    });

    const userOption = screen.getByText("John Doe - +972-50-1234567");
    await user.click(userOption);

    rerender(<SearchUserInput value="1" onChange={handleChange} />);

    const clearButton = screen.getByRole("button");
    expect(clearButton).toBeInTheDocument();
  });

  it("clears selection when clear button is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SearchUserInput value="1" onChange={handleChange} />);

    const clearButton = screen.getByRole("button");
    await user.click(clearButton);

    expect(handleChange).toHaveBeenCalledWith(null);
  });

  it("displays selected user name in input", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    const { rerender } = render(<SearchUserInput value={null} onChange={handleChange} />);

    // First select a user
    const input = screen.getByPlaceholderText("Search by name or phone...");
    await user.click(input);
    await waitFor(() => {
      expect(screen.getByText("John Doe - +972-50-1234567")).toBeInTheDocument();
    });

    const userOption = screen.getByText("John Doe - +972-50-1234567");
    await user.click(userOption);

    rerender(<SearchUserInput value="1" onChange={handleChange} />);

    expect(input).toHaveValue("John Doe - +972-50-1234567");
  });

  it("uses custom placeholder text", () => {
    const handleChange = jest.fn();
    render(<SearchUserInput value={null} onChange={handleChange} placeholder="Type user name..." />);

    expect(screen.getByPlaceholderText("Type user name...")).toBeInTheDocument();
  });

  it("uses custom label text", () => {
    const handleChange = jest.fn();
    render(<SearchUserInput value={null} onChange={handleChange} label="Find Client" />);

    expect(screen.getByText("Find Client")).toBeInTheDocument();
  });

  it("calls onChange with null when input is cleared", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();
    render(<SearchUserInput value={null} onChange={handleChange} />);

    const input = screen.getByPlaceholderText("Search by name or phone...");
    await user.type(input, "John");
    await user.clear(input);

    expect(handleChange).toHaveBeenCalledWith(null);
  });
});
