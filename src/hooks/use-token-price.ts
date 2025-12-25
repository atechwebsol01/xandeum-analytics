"use client";

import { useQuery } from "@tanstack/react-query";

interface TokenPriceData {
  price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  liquidity: number;
  fdv: number;
}

interface TokenPriceSuccessResponse {
  success: true;
  data: TokenPriceData;
  cached?: boolean;
}

interface TokenPriceErrorResponse {
  success: false;
  error: string;
}

type TokenPriceResponse = TokenPriceSuccessResponse | TokenPriceErrorResponse;

async function fetchTokenPrice(): Promise<TokenPriceResponse> {
  try {
    const response = await fetch("/api/token-price");
    if (!response.ok) {
      throw new Error("Failed to fetch token price");
    }
    return await response.json();
  } catch {
    return {
      success: false,
      error: "Failed to fetch token price",
    };
  }
}

export function useTokenPrice() {
  return useQuery<TokenPriceResponse>({
    queryKey: ["token-price"],
    queryFn: fetchTokenPrice,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}
