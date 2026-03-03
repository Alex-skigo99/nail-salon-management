"use client";

import Home from "./Home";
import { useTranslations } from "next-intl";

export default function Dashboard() {
  const t = useTranslations("home");

  return <Home t={t} />;
}
