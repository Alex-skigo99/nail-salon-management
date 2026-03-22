import { render, screen } from "@testing-library/react";
import HeroSection from "@/app/home/_components/HeroSection";
import { useTranslations } from "next-intl";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // strip non-standard DOM attributes that Next/Image uses (e.g. priority, fill)
    // to avoid React warnings during tests
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { priority, fill, placeholder, ...imgProps } = props || {};
    return <img {...imgProps} />;
  },
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

const translations: Record<string, string> = {
  salonName: "Luxe Nails",
  heroTitle: "Premium Nail Care",
  heroSubtitle: "Exceptional service and beauty",
  heroBookBtn: "Book Appointment",
  heroPricesBtn: "View Prices",
};

const createMockT = (): jest.MockedFunction<(key: string) => string> =>
  jest.fn((key: string) => translations[key] || key) as jest.MockedFunction<(key: string) => string>;

describe("HeroSection", () => {
  beforeEach(() => {
    mockUseTranslations.mockReturnValue(((key: string) => {
      return translations[key] || key;
    }) as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Desktop View", () => {
    it("renders hero section with background image", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={false} />);

      const backgroundImage = container.querySelector("img");
      expect(backgroundImage).toHaveAttribute("src", "/Nail-Salons-1.jpeg");
    });

    it("renders salon name badge", () => {
      render(<HeroSection t={createMockT()} isMobile={false} />);

      expect(screen.getByText("Luxe Nails")).toBeInTheDocument();
    });

    it("renders hero title in desktop size", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={false} />);

      const title = screen.getByText("Premium Nail Care");
      expect(title).toHaveClass("text-5xl", "lg:text-6xl");
    });

    it("renders hero subtitle", () => {
      render(<HeroSection t={createMockT()} isMobile={false} />);

      expect(screen.getByText("Exceptional service and beauty")).toBeInTheDocument();
    });

    it("renders book button", () => {
      render(<HeroSection t={createMockT()} isMobile={false} />);

      expect(screen.getByRole("link", { name: "Book Appointment" })).toBeInTheDocument();
    });

    it("renders prices button", () => {
      render(<HeroSection t={createMockT()} isMobile={false} />);

      expect(screen.getByRole("link", { name: "View Prices" })).toBeInTheDocument();
    });

    it("buttons have correct href attributes", () => {
      render(<HeroSection t={createMockT()} isMobile={false} />);

      expect(screen.getByRole("link", { name: "Book Appointment" })).toHaveAttribute("href", "#schedule");
      expect(screen.getByRole("link", { name: "View Prices" })).toHaveAttribute("href", "#prices");
    });

    it("renders buttons in horizontal layout on desktop", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={false} />);

      const buttonContainer = container.querySelector(".flex.justify-center.gap-4");
      expect(buttonContainer).toBeInTheDocument();
      expect(buttonContainer).not.toHaveClass("flex-col");
    });
  });

  describe("Mobile View", () => {
    it("renders hero title in mobile size", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={true} />);

      const title = screen.getByText("Premium Nail Care");
      expect(title).toHaveClass("text-3xl");
    });

    it("renders subtitle in mobile size", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={true} />);

      const subtitle = screen.getByText("Exceptional service and beauty");
      expect(subtitle).toHaveClass("text-base");
    });

    it("renders buttons in vertical layout on mobile", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={true} />);

      const buttonContainer = container.querySelector(".flex.justify-center.gap-4");
      expect(buttonContainer).toHaveClass("flex-col", "flex-col");
    });

    it("renders all content in mobile view", () => {
      render(<HeroSection t={createMockT()} isMobile={true} />);

      expect(screen.getByText("Luxe Nails")).toBeInTheDocument();
      expect(screen.getByText("Premium Nail Care")).toBeInTheDocument();
      expect(screen.getByText("Exceptional service and beauty")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Book Appointment" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "View Prices" })).toBeInTheDocument();
    });
  });

  describe("Styling and Layout", () => {
    it("has section with hero id", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={false} />);

      const section = container.querySelector("#hero");
      expect(section).toBeInTheDocument();
    });

    it("has relative positioning", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={false} />);

      const section = container.querySelector("#hero");
      expect(section).toHaveClass("relative");
    });

    it("has gradient overlay", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={false} />);

      const overlay = container.querySelector(".absolute.inset-0:nth-child(2)");
      expect(overlay).toBeInTheDocument();
    });

    it("renders background gradient at bottom", () => {
      const { container } = render(<HeroSection t={createMockT()} isMobile={false} />);

      // Check for gradient element at bottom
      const gradients = container.querySelectorAll("[class*='bg-linear']");
      expect(gradients.length).toBeGreaterThan(0);
    });
  });
});
