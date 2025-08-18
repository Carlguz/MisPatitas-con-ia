"use client"

import { useState, useEffect } from "react"

export type Currency = "PEN" | "USD"

interface CurrencyRates {
  PEN_TO_USD: number
  USD_TO_PEN: number
}

// Tasas de cambio aproximadas (en producción, estas deberían venir de una API)
const DEFAULT_RATES: CurrencyRates = {
  PEN_TO_USD: 0.27, // 1 PEN = 0.27 USD (aproximado)
  USD_TO_PEN: 3.70  // 1 USD = 3.70 PEN (aproximado)
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>("PEN")
  const [rates, setRates] = useState<CurrencyRates>(DEFAULT_RATES)
  const [loading, setLoading] = useState(false)

  // Función para convertir moneda
  const convert = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount
    
    if (fromCurrency === "PEN" && toCurrency === "USD") {
      return amount * rates.PEN_TO_USD
    }
    
    if (fromCurrency === "USD" && toCurrency === "PEN") {
      return amount * rates.USD_TO_PEN
    }
    
    return amount
  }

  // Función para formatear moneda
  const format = (amount: number, currencyCode: Currency = currency): string => {
    const convertedAmount = convert(amount, "PEN", currencyCode)
    
    return new Intl.NumberFormat(currencyCode === "PEN" ? "es-PE" : "en-US", {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(convertedAmount)
  }

  // Función para formatear moneda mostrando ambas
  const formatDual = (amount: number): string => {
    const penAmount = convert(amount, "PEN", "PEN")
    const usdAmount = convert(amount, "PEN", "USD")
    
    return `S/. ${penAmount.toFixed(2)} / $${usdAmount.toFixed(2)}`
  }

  // Función para cambiar la moneda
  const toggleCurrency = () => {
    setCurrency(prev => prev === "PEN" ? "USD" : "PEN")
  }

  // Función para obtener el símbolo de la moneda
  const getSymbol = (currencyCode: Currency = currency): string => {
    return currencyCode === "PEN" ? "S/." : "$"
  }

  return {
    currency,
    setCurrency,
    convert,
    format,
    formatDual,
    toggleCurrency,
    getSymbol,
    rates,
    loading
  }
}