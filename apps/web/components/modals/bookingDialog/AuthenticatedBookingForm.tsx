import { Controller, type UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneFormInput } from "@/components/inputs/PhoneFormInput";
import ServicesFormInput, {
  type ServicesInputCount,
  type ServicesOptionsByCategory,
  type ServicesSelectionState,
} from "@/components/inputs/ServicesFormInput";
import { CURRENCY_SYMBOL } from "@/const/currency";

type AuthenticatedBookingFormValues = {
  phone: string;
  rememberPhone: boolean;
  services: string[];
};

type AuthenticatedBookingFormProps = {
  form: UseFormReturn<AuthenticatedBookingFormValues>;
  needsPhone: boolean;
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

export default function AuthenticatedBookingForm({
  form,
  needsPhone,
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
}: AuthenticatedBookingFormProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-pink-100 bg-pink-50/60 p-4 text-sm text-gray-700">
        <p className="font-medium text-gray-900">{t("auth.sectionTitle")}</p>
        <p className="mt-1">{t("auth.sectionDescription")}</p>
      </div>

      {needsPhone && (
        <div className="space-y-3 rounded-xl border border-gray-200 p-4">
          <PhoneFormInput
            control={form.control}
            name="phone"
            id="auth-phone"
            label={t("fields.phone")}
            inputClassName="rounded-xl"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Controller
              name="rememberPhone"
              control={form.control}
              render={({ field }) => (
                <Checkbox checked={field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
              )}
            />
            {t("auth.rememberPhone")}
          </label>
        </div>
      )}

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
    </div>
  );
}
