"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const t = useTranslations("contact");

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{t("pageTitle")}</h1>
        <p className="text-muted-foreground">{t("pageDescription")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("storeLocationsTitle")}</CardTitle>
            <CardDescription>{t("storeLocationsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">{t("storeDowntownName")}</h3>
              <p className="text-muted-foreground text-sm">{t("storeDowntownAddress")}</p>
              <p className="text-muted-foreground text-sm">{t("phoneLabel")} (555) 123-4567</p>
              <p className="text-muted-foreground text-sm">
                {t("hoursLabel")} {t("storeDowntownHours")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">{t("storeUptownName")}</h3>
              <p className="text-muted-foreground text-sm">{t("storeUptownAddress")}</p>
              <p className="text-muted-foreground text-sm">{t("phoneLabel")} (555) 234-5678</p>
              <p className="text-muted-foreground text-sm">
                {t("hoursLabel")} {t("storeUptownHours")}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">{t("storeWestName")}</h3>
              <p className="text-muted-foreground text-sm">{t("storeWestAddress")}</p>
              <p className="text-muted-foreground text-sm">{t("phoneLabel")} (555) 345-6789</p>
              <p className="text-muted-foreground text-sm">
                {t("hoursLabel")} {t("storeWestHours")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("formTitle")}</CardTitle>
            <CardDescription>{t("formDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t("formNameLabel")}</label>
                <Input placeholder={t("formNamePlaceholder")} className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium">{t("formEmailLabel")}</label>
                <Input type="email" placeholder={t("formEmailPlaceholder")} className="mt-2" dir="ltr" />
              </div>
              <div>
                <label className="text-sm font-medium">{t("formMessageLabel")}</label>
                <textarea
                  placeholder={t("formMessagePlaceholder")}
                  className="border-input bg-background mt-2 w-full rounded-md border px-3 py-2"
                  rows={4}
                />
              </div>
              <Button className="w-full">{t("formSendButton")}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
