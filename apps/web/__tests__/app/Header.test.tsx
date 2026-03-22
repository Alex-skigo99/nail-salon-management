import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "@/app/home/_components/Header";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";

jest.mock("next-auth/react");

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));
jest.mock(
  "@/components/LocaleSwitcher",
  () =>
    function LocaleSwitcher() {
      return <div data-testid="locale-switcher">Locale Switcher</div>;
    }
);
jest.mock("@/components/UserMenu", () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));
jest.mock("@/utils/changeLocaleAction", () => ({
  changeLocaleAction: jest.fn(),
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

const translations: Record<string, string> = {
  headerShop: "Shop",
  headerPrices: "Prices",
  headerLocation: "Find Us",
  salonName: "Nails Studio",
  heroBookBtn: "Book Now",
};

const createMockT = (): jest.MockedFunction<(key: string) => string> =>
  jest.fn((key: string) => translations[key] || key) as jest.MockedFunction<(key: string) => string>;

describe("Header", () => {
  beforeEach(() => {
    mockUseTranslations.mockReturnValue(((key: string) => {
      return translations[key] || key;
    }) as any);

    mockUseSession.mockReturnValue({
      data: {
        user: {
          name: "Test User",
          email: "test@example.com",
          role: "USER",
        },
      },
      status: "authenticated",
    } as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Desktop View", () => {
    it("renders salon name link", () => {
      render(<Header t={createMockT()} isMobile={false} />);

      expect(screen.getByText("Nails Studio")).toBeInTheDocument();
    });

    it("renders navigation links in desktop view", () => {
      render(<Header t={createMockT()} isMobile={false} />);

      expect(screen.getByRole("link", { name: "Shop" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Prices" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Find Us" })).toBeInTheDocument();
    });

    it("renders locale switcher in desktop view", () => {
      render(<Header t={createMockT()} isMobile={false} />);

      expect(screen.getByTestId("locale-switcher")).toBeInTheDocument();
    });

    it("renders book button in desktop view", () => {
      render(<Header t={createMockT()} isMobile={false} />);

      expect(screen.getByRole("link", { name: "Book Now" })).toBeInTheDocument();
    });

    it("renders user menu in desktop view", () => {
      render(<Header t={createMockT()} isMobile={false} />);

      expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    });

    it("does not render mobile menu button in desktop view", () => {
      render(<Header t={createMockT()} isMobile={false} />);

      expect(screen.queryByRole("button", { name: "Toggle menu" })).not.toBeInTheDocument();
    });
  });

  describe("Mobile View", () => {
    it("renders menu toggle button in mobile view", () => {
      render(<Header t={createMockT()} isMobile={true} />);

      expect(screen.getByRole("button", { name: "Toggle menu" })).toBeInTheDocument();
    });

    it("renders salon name in mobile header", () => {
      render(<Header t={createMockT()} isMobile={true} />);
      expect(screen.getByText(/Nails Studio/i)).toBeInTheDocument();
    });

    it("toggles mobile menu when button is clicked", async () => {
      const user = userEvent.setup();
      render(<Header t={createMockT()} isMobile={true} />);

      const toggleButton = screen.getByRole("button", { name: "Toggle menu" });
      await user.click(toggleButton);

      expect(screen.getByRole("link", { name: "Shop" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Book Now/i })).toBeInTheDocument();
    });

    it("displays navigation links when menu is open", async () => {
      const user = userEvent.setup();
      render(<Header t={createMockT()} isMobile={true} />);

      const toggleButton = screen.getByRole("button", { name: "Toggle menu" });
      await user.click(toggleButton);

      expect(screen.getByRole("link", { name: "Shop" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Prices" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Find Us" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Toggle menu/i })).toBeInTheDocument();
    });

    it("closes menu when navigation link is clicked", async () => {
      const user = userEvent.setup();
      render(<Header t={createMockT()} isMobile={true} />);
      expect(screen.getByText(/Nails Studio/i)).toBeInTheDocument();
      const toggleButton = screen.getByRole("button", { name: "Toggle menu" });
      await user.click(toggleButton);

      const shopLink = screen.getByRole("link", { name: /Shop/i });
      await user.click(shopLink);

      // Check if menu is closed (navigation links should not be visible)
      expect(screen.queryAllByRole("link", { name: /Shop/i }).length).toBe(0);
    });

    it("renders locale switcher in mobile menu", async () => {
      const user = userEvent.setup();
      render(<Header t={createMockT()} isMobile={true} />);

      const toggleButton = screen.getByRole("button", { name: "Toggle menu" });
      await user.click(toggleButton);

      expect(screen.getByRole("link", { name: /Shop/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Prices/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Find Us/i })).toBeInTheDocument();
      expect(screen.getByTestId("locale-switcher")).toBeInTheDocument();
    });

    it("renders book button in mobile menu", async () => {
      const user = userEvent.setup();

      render(<Header t={createMockT()} isMobile={true} />);

      const toggleButton = screen.getByRole("button", { name: "Toggle menu" });
      await user.click(toggleButton);

      expect(screen.getByTestId("book-btn")).toBeInTheDocument();
    });

    it("does not display user menu in mobile view header", () => {
      render(<Header t={createMockT()} isMobile={true} />);
      // User menu should not be in the visible header initially
      const userMenus = screen.queryAllByTestId("user-menu");
      expect(userMenus.length).toBe(0);
    });
  });

  describe("Navigation Links", () => {
    it("has correct href attributes", () => {
      render(<Header t={createMockT()} isMobile={false} />);

      expect(screen.getByRole("link", { name: "Shop" })).toHaveAttribute("href", "#shop");
      expect(screen.getByRole("link", { name: "Prices" })).toHaveAttribute("href", "#prices");
      expect(screen.getByRole("link", { name: "Find Us" })).toHaveAttribute("href", "#map");
    });

    it("logo has correct href", () => {
      render(<Header t={createMockT()} isMobile={false} />);

      const logoLinks = screen.getAllByRole("link", { name: /Nails Studio/i });
      // At least one should be the logo
      expect(logoLinks.some((link) => link.getAttribute("href") === "#hero")).toBe(true);
      expect(screen.getByRole("link", { name: /Shop/i })).toHaveAttribute("href", "#shop");
      expect(screen.getByRole("link", { name: /Prices/i })).toHaveAttribute("href", "#prices");
      expect(screen.getByRole("link", { name: /Find Us/i })).toHaveAttribute("href", "#map");
    });
  });
});
