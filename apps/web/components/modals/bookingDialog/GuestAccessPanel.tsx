import Link from "next/link";
import { Button } from "@/components/ui/button";

type GuestAccessPanelProps = {
  onContinueAsGuest: () => void;
  t: (key: string) => string;
};

export default function GuestAccessPanel({ onContinueAsGuest, t }: GuestAccessPanelProps) {
  return (
    <div className="space-y-4 rounded-xl border border-gray-200 p-4">
      <p className="text-sm text-gray-700">{t("guestAccess.description")}</p>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href="/login">{t("guestAccess.login")}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/signup">{t("guestAccess.signup")}</Link>
        </Button>
      </div>

      <div className="border-t border-gray-200 pt-3">
        <Button variant="ghost" className="px-0 text-pink-600 hover:text-pink-700" onClick={onContinueAsGuest}>
          {t("guestAccess.continueWithoutRegistration")}
        </Button>
      </div>
    </div>
  );
}
