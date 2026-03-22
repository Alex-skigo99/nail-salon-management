let _locale = "en";
let _translationsFn = (key) => key;

function useTranslations() {
  return _translationsFn;
}
useTranslations.mockReturnValue = (fn) => {
  _translationsFn = fn;
};

function useLocale() {
  return _locale;
}
useLocale.mockReturnValue = (val) => {
  _locale = val;
};

function useFormatter() {
  return function (value) {
    return value;
  };
}

function NextIntlClientProvider({ children }) {
  return children;
}

exports.useTranslations = useTranslations;
exports.useLocale = useLocale;
exports.useFormatter = useFormatter;
exports.NextIntlClientProvider = NextIntlClientProvider;
