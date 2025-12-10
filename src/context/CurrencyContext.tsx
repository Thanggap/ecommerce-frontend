import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Supported currencies
export type CurrencyCode = "USD" | "VND";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  locale: string;
  rate: number; // Rate relative to USD (base currency in DB)
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: "USD",
    symbol: "$",
    locale: "en-US",
    rate: 1,
  },
  VND: {
    code: "VND",
    symbol: "₫",
    locale: "vi-VN",
    rate: 25000, // 1 USD = ~25,000 VND (approximate)
  },
};

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (priceInUSD: number) => string;
  convertPrice: (priceInUSD: number) => number;
  config: CurrencyConfig;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "USD",
  setCurrency: () => {},
  formatPrice: (price) => `$${price}`,
  convertPrice: (price) => price,
  config: CURRENCIES.USD,
});

export const useCurrency = () => useContext(CurrencyContext);

interface CurrencyProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = "preferred_currency";

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    // Load from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === "USD" || saved === "VND")) {
      return saved;
    }
    return "USD";
  });

  const config = CURRENCIES[currency];

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, currency);
  }, [currency]);

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
  };

  /**
   * Convert price from USD (base) to selected currency
   */
  const convertPrice = (priceInUSD: number): number => {
    return priceInUSD * config.rate;
  };

  /**
   * Format price in selected currency with proper locale formatting
   */
  const formatPrice = (priceInUSD: number): string => {
    const converted = convertPrice(priceInUSD);
    
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: config.code === "VND" ? 0 : 2,
      maximumFractionDigits: config.code === "VND" ? 0 : 2,
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        convertPrice,
        config,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyContext;
