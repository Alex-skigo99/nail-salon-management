import React from "react";
import { render, screen } from "@testing-library/react";
import AboutSection from "@/app/home/_components/AboutSection";
import { useTranslations } from "next-intl";

jest.mock("next-intl", () => ({
  useTranslations: jest.fn(),
}));
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: any) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
  ),
  CardContent: ({ children, className }: any) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
}));

const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;

const translations: Record<string, string> = {
  aboutTitle: "Why Choose Us",
  aboutSubtitle: "We offer exceptional nail care services",
  aboutCard1Title: "Quality",
  aboutCard1Desc: "Premium quality products",
  aboutCard2Title: "Experience",
  aboutCard2Desc: "Expert technicians",
  aboutCard3Title: "Comfort",
  aboutCard3Desc: "Comfortable seating",
  aboutCard4Title: "Hygiene",
  aboutCard4Desc: "Clean and sanitized",
};

const createMockT = (): jest.MockedFunction<(key: string) => string> =>
  jest.fn((key: string) => translations[key] || key) as jest.MockedFunction<(key: string) => string>;

describe("AboutSection", () => {
  beforeEach(() => {
    mockUseTranslations.mockReturnValue(((key: string) => {
      const translations: Record<string, string> = {
        aboutTitle: "Why Choose Us",
        aboutSubtitle: "We offer exceptional nail care services",
        aboutCard1Title: "Quality",
        aboutCard1Desc: "Premium quality products",
        aboutCard2Title: "Experience",
        aboutCard2Desc: "Expert technicians",
        aboutCard3Title: "Comfort",
        aboutCard3Desc: "Comfortable seating",
        aboutCard4Title: "Hygiene",
        aboutCard4Desc: "Clean and sanitized",
      };
      return translations[key] || key;
    }) as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Desktop View", () => {
    it("renders section title in desktop size", () => {
      const mockT = createMockT();

      const { container } = render(<AboutSection t={mockT} isMobile={false} />);

      const title = screen.getByText("Why Choose Us");
      expect(title).toHaveClass("text-3xl", "lg:text-4xl");
    });

    it("renders 4 cards in desktop grid layout", () => {
      const mockT = createMockT();

      render(<AboutSection t={mockT} isMobile={false} />);

      const cards = screen.getAllByTestId("card");
      expect(cards).toHaveLength(4);
    });

    it("renders cards in 4-column layout on desktop", () => {
      const mockT = createMockT();

      const { container } = render(<AboutSection t={mockT} isMobile={false} />);

      const gridContainer = container.querySelector("div[class*='grid-cols-2 lg:grid-cols-4']");
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe("Mobile View", () => {
    it("renders section title in mobile size", () => {
      const mockT = createMockT();

      const { container } = render(<AboutSection t={mockT} isMobile={true} />);

      const title = screen.getByText("Why Choose Us");
      expect(title).toHaveClass("text-2xl");
    });

    it("renders cards in single-column layout on mobile", () => {
      const mockT = createMockT();

      const { container } = render(<AboutSection t={mockT} isMobile={true} />);

      const gridContainer = container.querySelector("div[class*='grid-cols-1']");
      expect(gridContainer).toBeInTheDocument();
    });

    it("renders all 4 cards in mobile view", () => {
      const mockT = createMockT();

      render(<AboutSection t={mockT} isMobile={true} />);

      const cards = screen.getAllByTestId("card");
      expect(cards).toHaveLength(4);
    });
  });

  describe("Content", () => {
    it("renders section subtitle", () => {
      const mockT = createMockT();

      render(<AboutSection t={mockT} isMobile={false} />);

      expect(screen.getByText("We offer exceptional nail care services")).toBeInTheDocument();
    });

    it("renders all card titles", () => {
      const mockT = createMockT();

      render(<AboutSection t={mockT} isMobile={false} />);

      expect(screen.getByText("Quality")).toBeInTheDocument();
      expect(screen.getByText("Experience")).toBeInTheDocument();
      expect(screen.getByText("Comfort")).toBeInTheDocument();
      expect(screen.getByText("Hygiene")).toBeInTheDocument();
    });

    it("renders all card descriptions", () => {
      const mockT = createMockT();

      render(<AboutSection t={mockT} isMobile={false} />);

      expect(screen.getByText("Premium quality products")).toBeInTheDocument();
      expect(screen.getByText("Expert technicians")).toBeInTheDocument();
      expect(screen.getByText("Comfortable seating")).toBeInTheDocument();
      expect(screen.getByText("Clean and sanitized")).toBeInTheDocument();
    });
  });

  describe("Cards Structure", () => {
    it("each card contains an icon container", () => {
      const mockT = createMockT();

      const { container } = render(<AboutSection t={mockT} isMobile={false} />);

      const iconContainers = container.querySelectorAll("[class*='rounded-2xl']");
      expect(iconContainers.length).toBeGreaterThanOrEqual(4);
    });

    it("cards have proper styling with shadows and hover effects", () => {
      const mockT = createMockT();

      const { container } = render(<AboutSection t={mockT} isMobile={false} />);

      const cards = container.querySelectorAll("[data-testid='card']");
      cards.forEach((card) => {
        expect(card.className).toMatch(/(shadow|hover)/);
      });
    });
  });

  describe("Styling", () => {
    it("has white background", () => {
      const mockT = createMockT();

      const { container } = render(<AboutSection t={mockT} isMobile={false} />);

      const section = container.querySelector("section");
      expect(section).toHaveClass("bg-white");
    });

    it("has proper padding", () => {
      const mockT = createMockT();

      const { container } = render(<AboutSection t={mockT} isMobile={false} />);

      const section = container.querySelector("section");
      expect(section?.className).toMatch(/py-\d+/);
    });
  });
});
