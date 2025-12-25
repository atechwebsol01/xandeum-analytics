import { NextResponse } from "next/server";

// XAND token mint address on Solana
const XAND_MINT = "XANDnSwSXpZHL8f2fvqJZCYyaKpGGPo6aNDawfjtdgP";

// Cache for token data
let cachedData: {
  price: number;
  price_change_24h: number;
  market_cap: number;
  volume_24h: number;
  liquidity: number;
  fdv: number;
} | null = null;
let lastFetch = 0;
const CACHE_TTL = 60000; // 1 minute

async function fetchFromJupiter(): Promise<typeof cachedData> {
  try {
    // Jupiter Price API v2
    const response = await fetch(
      `https://api.jup.ag/price/v2?ids=${XAND_MINT}&showExtraInfo=true`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`Jupiter API error: ${response.status}`);
    }

    const data = await response.json();
    const tokenData = data.data?.[XAND_MINT];

    if (tokenData) {
      return {
        price: parseFloat(tokenData.price) || 0,
        price_change_24h: parseFloat(tokenData.extraInfo?.quotedPrice?.priceChange24h) || 0,
        market_cap: parseFloat(tokenData.extraInfo?.marketCap) || 0,
        volume_24h: parseFloat(tokenData.extraInfo?.volume24h) || 0,
        liquidity: parseFloat(tokenData.extraInfo?.depth?.buyPriceImpactRatio?.depth) || 0,
        fdv: parseFloat(tokenData.extraInfo?.fdv) || 0,
      };
    }
  } catch {
    // Jupiter API failed
  }
  return null;
}

async function fetchFromDexScreener(): Promise<typeof cachedData> {
  try {
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${XAND_MINT}`,
      {
        headers: { "Accept": "application/json" },
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`);
    }

    const data = await response.json();
    const pair = data.pairs?.[0];

    if (pair) {
      return {
        price: parseFloat(pair.priceUsd) || 0,
        price_change_24h: parseFloat(pair.priceChange?.h24) || 0,
        market_cap: parseFloat(pair.marketCap) || parseFloat(pair.fdv) || 0,
        volume_24h: parseFloat(pair.volume?.h24) || 0,
        liquidity: parseFloat(pair.liquidity?.usd) || 0,
        fdv: parseFloat(pair.fdv) || 0,
      };
    }
  } catch {
    // DexScreener API failed
  }
  return null;
}

export async function GET() {
  try {
    const now = Date.now();

    // Return cached data if still valid
    if (cachedData && now - lastFetch < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        cached: true,
      });
    }

    // Try Jupiter first, then DexScreener
    let tokenData = await fetchFromJupiter();
    
    if (!tokenData || tokenData.price === 0) {
      tokenData = await fetchFromDexScreener();
    }

    if (tokenData && tokenData.price > 0) {
      cachedData = tokenData;
      lastFetch = now;

      return NextResponse.json({
        success: true,
        data: tokenData,
        cached: false,
      });
    }

    // Return mock data if both APIs fail (for development/demo)
    const mockData = {
      price: 0.000042,
      price_change_24h: 5.23,
      market_cap: 4200000,
      volume_24h: 125000,
      liquidity: 85000,
      fdv: 42000000,
    };

    return NextResponse.json({
      success: true,
      data: cachedData || mockData,
      cached: true,
      note: "Using cached/fallback data",
    });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch token data",
      },
      { status: 500 }
    );
  }
}
