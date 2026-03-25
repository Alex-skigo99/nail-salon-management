"use client";

import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";

export default function FeedbackPage() {
  const t = useTranslations("clientPage.feedback");

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <MessageSquare className="mb-4 h-12 w-12 text-pink-300" />
      <h2 className="mb-2 text-xl font-semibold">{t("title")}</h2>
      <p className="text-gray-500">{t("comingSoon")}</p>
    </div>
  );
}
