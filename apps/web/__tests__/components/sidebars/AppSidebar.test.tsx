import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppSidebar } from "@/components/sidebars/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useIsMobile } from "@/hooks/use-mobile";

jest.mock("next/navigation");
jest.mock("next-intl");
jest.mock("@/hooks/use-mobile");
jest.mock("@/components/UserMenu", () => ({
  UserMenu: () => <div data-testid="user-menu">User Menu</div>,
}));

// suppress known non-actionable console warnings from third-party libs in tests
const _origWarn = console.warn;
const _origError = console.error;
beforeEach(() => {
  jest.spyOn(console, "warn").mockImplementation((...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("Missing `Description` or `aria-describedby")) return;
    return _origWarn.apply(console, args as any);
  });

  jest.spyOn(console, "error").mockImplementation((...args: any[]) => {
    const matches = args.some((a: any) => {
      if (typeof a === "string")
        return a.includes("Not implemented: navigation") || a.includes("Received `true` for a non-boolean attribute");
      if (a && typeof a.message === "string") return a.message.includes("Not implemented: navigation");
      return false;
    });
    if (matches) return;
    return _origError.apply(console, args as any);
  });
});

afterEach(() => {
  (console.warn as jest.Mock).mockRestore();
  (console.error as jest.Mock).mockRestore();
});

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseLocale = useLocale as jest.MockedFunction<typeof useLocale>;
const mockUseTranslations = useTranslations as jest.MockedFunction<typeof useTranslations>;
const mockUseIsMobile = useIsMobile as jest.MockedFunction<typeof useIsMobile>;

describe("AppSidebar", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/admin/calendar");
    mockUseLocale.mockReturnValue("en");
    mockUseIsMobile.mockReturnValue(false);
    mockUseTranslations.mockReturnValue(((key: string) => {
      const translations: Record<string, string> = {
        "appSidebar.calendar": "Calendar",
        "appSidebar.masters": "Masters",
        "appSidebar.services": "Services",
        "appSidebar.home": "Home",
        "appSidebar.title": "Nails Studio",
        "appSidebar.subtitle": "Management",
      };
      return translations[key] || key;
    }) as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Desktop Sidebar", () => {
    it("renders desktop sidebar when not mobile", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      expect(screen.getByTestId("sidebar-title")).toBeInTheDocument();
    });

    it("renders all menu items in desktop view", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      expect(screen.getByRole("link", { name: /Calendar/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Masters/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Services/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Home/i })).toBeInTheDocument();
    });

    it("highlights active menu item based on current pathname", () => {
      mockUsePathname.mockReturnValue("/admin/calendar");
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const calendarLink = screen.getByRole("link", { name: /Calendar/i });
      expect(calendarLink.closest("a")).toHaveClass("bg-accent");
    });

    it("renders different active item when pathname changes", () => {
      mockUsePathname.mockReturnValue("/admin/masters");
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const mastersLink = screen.getByRole("link", { name: /Masters/i });
      expect(mastersLink.closest("a")).toHaveClass("bg-accent");
    });

    it("displays user menu in footer", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    });

    it("has correct href attributes for menu items", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      expect(screen.getByRole("link", { name: /Calendar/i })).toHaveAttribute("href", "/admin/calendar");
      expect(screen.getByRole("link", { name: /Masters/i })).toHaveAttribute("href", "/admin/masters");
      expect(screen.getByRole("link", { name: /Services/i })).toHaveAttribute("href", "/admin/services");
      expect(screen.getByRole("link", { name: /Home/i })).toHaveAttribute("href", "/home");
    });
  });

  describe("Mobile Sidebar", () => {
    beforeEach(() => {
      mockUseIsMobile.mockReturnValue(true);
    });

    it("renders mobile menu button instead of sidebar", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      expect(screen.getByRole("button", { name: "Open menu" })).toBeInTheDocument();
    });

    it("displays title in mobile header", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      expect(screen.getByTestId("sidebar-mobile-title")).toBeInTheDocument();
    });

    it("opens sheet menu when button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("displays menu items in sheet content when opened", async () => {
      const user = userEvent.setup();
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);

      expect(screen.getByRole("link", { name: /Calendar/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Masters/i })).toBeInTheDocument();
    });

    it("closes sheet when menu item is clicked", async () => {
      const user = userEvent.setup();
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);

      const calendarLink = screen.getByRole("link", { name: /Calendar/i });
      await user.click(calendarLink);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("displays user menu in mobile sheet", async () => {
      const user = userEvent.setup();
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const menuButton = screen.getByRole("button", { name: "Open menu" });
      await user.click(menuButton);

      expect(screen.getByTestId("user-menu")).toBeInTheDocument();
    });
  });

  describe("RTL Support", () => {
    it("sets correct sidebar side for RTL locale (right)", () => {
      mockUseLocale.mockReturnValue("he");
      const { container } = render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const sidebar = container.querySelector("[data-side='right']");
      expect(sidebar).toBeInTheDocument();
    });

    it("sets correct sidebar side for LTR locale (left)", () => {
      mockUseLocale.mockReturnValue("en");
      const { container } = render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const sidebar = container.querySelector("[data-side='left']");
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe("Menu Navigation", () => {
    it("renders menu items with correct icons", () => {
      const { container } = render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });

    it("does not highlight non-active menu items", () => {
      mockUsePathname.mockReturnValue("/admin/calendar");
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const mastersLink = screen.getByRole("link", { name: /Masters/i });
      expect(mastersLink.closest("a")).not.toHaveClass("bg-accent");
    });

    it("updates highlighted item when pathname changes", () => {
      const { rerender } = render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      mockUsePathname.mockReturnValue("/admin/masters");
      rerender(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      const mastersLink = screen.getByRole("link", { name: /Masters/i });
      expect(mastersLink.closest("a")).toHaveClass("bg-accent");
    });
  });
});
