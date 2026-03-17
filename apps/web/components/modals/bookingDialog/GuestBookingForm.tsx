import { type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneFormInput } from "@/components/inputs/PhoneFormInput";
import ServicesFormInput, {
  type ServicesInputCount,
  type ServicesOptionsByCategory,
  type ServicesSelectionState,
} from "@/components/inputs/ServicesFormInput";
import { CURRENCY_SYMBOL } from "@/const/currency";

type GuestBookingFormValues = {
  userName: string;
  phone: string;
  services: string[];
  comments?: string;
};

type GuestBookingFormProps = {
  form: UseFormReturn<GuestBookingFormValues>;
  serviceOptions: ServicesOptionsByCategory;
  inputCountForServices: ServicesInputCount;
  servicesSelected: ServicesSelectionState;
  setServicesSelected: (value: ServicesSelectionState) => void;
  setValueBySchemaName: (nameInSchema: string, value: string[]) => void;
  setServicesDuration: (value: number) => void;
  setServicesPrice: (value: number) => void;
  totalDuration: number;
  totalPrice: number;
  t: (key: string) => string;
};

export default function GuestBookingForm({
  form,
  serviceOptions,
  inputCountForServices,
  servicesSelected,
  setServicesSelected,
  setValueBySchemaName,
  setServicesDuration,
  setServicesPrice,
  totalDuration,
  totalPrice,
  t,
}: GuestBookingFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="guest-name">{t("fields.clientName")}</Label>
        <Input
          id="guest-name"
          placeholder={t("fields.clientNamePlaceholder")}
          {...form.register("userName")}
          className="rounded-xl"
        />
      </div>

      <PhoneFormInput
        control={form.control}
        name="phone"
        id="guest-phone"
        label={t("fields.phone")}
        inputClassName="rounded-xl"
      />

      <ServicesFormInput
        serviceOptions={serviceOptions}
        inputCountForServices={inputCountForServices}
        inputRequired
        nameInSchema="services"
        priceShowing
        durationShowing
        servicesSelected={servicesSelected}
        setServicesSelected={setServicesSelected}
        setValueBySchemaName={setValueBySchemaName}
        setServicesDuration={setServicesDuration}
        setServicesPrice={setServicesPrice}
        labels={{
          manicure: t("fields.manicureService"),
          pedicure: t("fields.pedicureService"),
          other: t("fields.otherService"),
        }}
        placeholders={{
          manicure: t("fields.manicurePlaceholder"),
          pedicure: t("fields.pedicurePlaceholder"),
          other: t("fields.otherPlaceholder"),
        }}
        noneLabel={t("fields.none")}
        requiredMessage={t("validation.oneServiceRequired")}
      />

      <div className="rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-700">
        {t("summary.duration")}: <span className="font-semibold text-gray-900">{totalDuration} min</span> ·{" "}
        {t("summary.price")}:{" "}
        <span className="font-semibold text-gray-900">
          {CURRENCY_SYMBOL}
          {totalPrice.toFixed(2)}
        </span>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="guest-comments">{t("fields.comments")}</Label>
        <Textarea
          id="guest-comments"
          rows={3}
          placeholder={t("fields.commentsPlaceholder")}
          {...form.register("comments")}
        />
      </div>

      {form.formState.errors.userName && (
        <p className="text-sm text-red-600">{form.formState.errors.userName.message}</p>
      )}
    </div>
  );
}
