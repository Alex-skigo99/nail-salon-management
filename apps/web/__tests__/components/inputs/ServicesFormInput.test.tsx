import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ServicesFormInput, {
  type ServicesOptionsByCategory,
  type ServicesSelectionState,
} from "@/components/inputs/ServicesFormInput";
import { CURRENCY_SYMBOL } from "@/const/currency";

describe("ServicesFormInput", () => {
  const mockServiceOptions: ServicesOptionsByCategory = {
    manicure: [
      { value: "basic-manicure", label: "Basic Manicure", price: 25, duration_minutes: 30 },
      { value: "gel-manicure", label: "Gel Manicure", price: 45, duration_minutes: 45 },
    ],
    pedicure: [
      { value: "basic-pedicure", label: "Basic Pedicure", price: 35, duration_minutes: 40 },
      { value: "spa-pedicure", label: "Spa Pedicure", price: 65, duration_minutes: 60 },
    ],
    other: [{ value: "nail-art", label: "Nail Art", price: 30, duration_minutes: 20 }],
  };

  const mockInputCount = {
    manicure: 1,
    pedicure: 1,
    other: 1,
  };

  const defaultServicesSelected: ServicesSelectionState = {
    manicure: [""],
    pedicure: [""],
    other: [""],
  };

  it("renders category labels", () => {
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
        labels={{
          manicure: "Manicure Services",
          pedicure: "Pedicure Services",
          other: "Additional Services",
        }}
      />
    );

    expect(screen.getByText("Manicure Services")).toBeInTheDocument();
    expect(screen.getByText("Pedicure Services")).toBeInTheDocument();
    expect(screen.getByText("Additional Services")).toBeInTheDocument();
  });

  it("renders select inputs for each category", () => {
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBeGreaterThanOrEqual(3);
  });

  it("displays default 'None' option in each category", async () => {
    const user = userEvent.setup();
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
        noneLabel="None"
      />
    );

    const firstCombobox = screen.getAllByRole("combobox")[0];
    await user.click(firstCombobox);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: "None" })).toBeInTheDocument();
    });
  });

  it("displays service options when category is opened", async () => {
    const user = userEvent.setup();
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
      />
    );

    const firstCombobox = screen.getAllByRole("combobox")[0];
    await user.click(firstCombobox);

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /Basic Manicure/ })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: /Gel Manicure/ })).toBeInTheDocument();
    });
  });

  it("displays prices when priceShowing is true", async () => {
    const user = userEvent.setup();
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
        priceShowing={true}
      />
    );

    const firstCombobox = screen.getAllByRole("combobox")[0];
    await user.click(firstCombobox);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`\\${CURRENCY_SYMBOL}25`))).toBeInTheDocument();
    });
  });

  it("displays duration when durationShowing is true", async () => {
    const user = userEvent.setup();
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
        durationShowing={true}
      />
    );

    const firstCombobox = screen.getAllByRole("combobox")[0];
    await user.click(firstCombobox);

    await waitFor(() => {
      expect(screen.getByText(/30m/)).toBeInTheDocument();
    });
  });

  it("calls setServicesSelected when service is selected", async () => {
    const user = userEvent.setup();
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
      />
    );

    const firstCombobox = screen.getAllByRole("combobox")[0];
    await user.click(firstCombobox);

    const basicManicureOption = screen.getByRole("option", { name: /Basic Manicure/ });
    await user.click(basicManicureOption);

    expect(handleSetSelected).toHaveBeenCalled();
  });

  it("shows validation error when inputRequired is true and no service selected", () => {
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
        inputRequired={true}
        requiredMessage="You must select at least one service"
      />
    );

    expect(screen.getByText("You must select at least one service")).toBeInTheDocument();
  });

  it("applies custom classes to wrapper", () => {
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    const { container } = render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
        classes={{
          wrapperClassName: "custom-wrapper",
          gridClassName: "custom-grid",
        }}
      />
    );

    const wrapper = container.querySelector(".custom-wrapper");
    expect(wrapper).toBeInTheDocument();
  });

  it("calls setServicesDuration with correct duration", async () => {
    const user = userEvent.setup();
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    const servicesWithSelection: ServicesSelectionState = {
      manicure: ["basic-manicure"],
      pedicure: [""],
      other: [""],
    };

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={servicesWithSelection}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
      />
    );

    await waitFor(() => {
      expect(handleSetDuration).toHaveBeenCalledWith(30);
    });
  });

  it("uses default placeholder text for categories", async () => {
    const user = userEvent.setup();
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={mockInputCount}
        nameInSchema="services"
        servicesSelected={defaultServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
      />
    );

    const firstCombobox = screen.getAllByRole("combobox")[0];
    expect(firstCombobox).toBeInTheDocument();
  });

  it("renders multiple inputs when inputCount is greater than 1", () => {
    const handleSetSelected = jest.fn();
    const handleSetDuration = jest.fn();

    const inputCountMultiple = {
      manicure: 2,
      pedicure: 1,
      other: 1,
    };

    const multipleServicesSelected: ServicesSelectionState = {
      manicure: ["", ""],
      pedicure: [""],
      other: [""],
    };

    render(
      <ServicesFormInput
        serviceOptions={mockServiceOptions}
        inputCountForServices={inputCountMultiple}
        nameInSchema="services"
        servicesSelected={multipleServicesSelected}
        setServicesSelected={handleSetSelected}
        setServicesDuration={handleSetDuration}
      />
    );

    const comboboxes = screen.getAllByRole("combobox");
    expect(comboboxes.length).toBeGreaterThanOrEqual(4);
  });
});
