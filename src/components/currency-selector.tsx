"use client"

import { Button } from "@/components/ui/button"
import { useCurrency } from "@/hooks/use-currency"
import { DollarSign, Coins } from "lucide-react"

export function CurrencySelector() {
  const { currency, toggleCurrency, getSymbol } = useCurrency()

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleCurrency}
      className="flex items-center gap-2"
    >
      {currency === "PEN" ? (
        <>
          <Coins className="h-4 w-4" />
          <span className="font-medium">S/.</span>
        </>
      ) : (
        <>
          <DollarSign className="h-4 w-4" />
          <span className="font-medium">$</span>
        </>
      )}
      <span className="text-xs text-gray-500">
        ({currency === "PEN" ? "Soles" : "Dólares"})
      </span>
    </Button>
  )
}