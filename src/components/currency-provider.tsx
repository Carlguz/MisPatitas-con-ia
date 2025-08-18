"use client"

import React, { ReactNode } from "react"
import { useCurrency, Currency } from "@/hooks/use-currency"

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convert: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number
  format: (amount: number, currencyCode?: Currency) => string
  formatDual: (amount: number) => string
  toggleCurrency: () => void
  getSymbol: (currencyCode?: Currency) => string
}

export const CurrencyContext = React.createContext<CurrencyContextType | undefined>(undefined)

interface CurrencyProviderProps {
  children: ReactNode
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const currencyHook = useCurrency()

  return (
    <CurrencyContext.Provider value={currencyHook}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrencyContext() {
  const context = React.useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrencyContext must be used within a CurrencyProvider")
  }
  return context
}