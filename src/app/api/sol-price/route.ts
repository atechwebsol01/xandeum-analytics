import { NextResponse } from "next/server";

let cachedPrice: number | null = null;
let lastFetch = 0;
const CACHE_TTL = 30000; // 30 seconds

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const now = Date.now();

  // Return cached price if still valid
  if (cachedPrice && cachedPrice > 0 && now - lastFetch < CACHE_TTL) {
    return NextResponse.json({ price: cachedPrice, cached: true });
  }

  // Use CoinGecko - it works reliably
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
      { 
        cache: "no-store",
        headers: {
          "Accept": "application/json",
        }
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      const price = data?.solana?.usd;
      
      if (price && price > 0) {
        cachedPrice = price;
        lastFetch = now;
        return NextResponse.json({ price, cached: false });
      }
    }
  } catch {
    // CoinGecko failed
  }

  // Return cached or fetch from DexScreener as backup
  try {
    const response = await fetch(
      "https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112",
      { cache: "no-store" }
    );
    
    if (response.ok) {
      const data = await response.json();
      const price = parseFloat(data?.pairs?.[0]?.priceUsd);
      
      if (price && price > 0) {
        cachedPrice = price;
        lastFetch = now;
        return NextResponse.json({ price, cached: false });
      }
    }
  } catch {
    // DexScreener failed
  }

  // Return cached price or error (NO fake fallback)
  if (cachedPrice && cachedPrice > 0) {
    return NextResponse.json({ 
      price: cachedPrice,
      cached: true,
      stale: true
    });
  }

  // No price available - return error
  return NextResponse.json({ 
    price: null,
    error: "Unable to fetch SOL price"
  }, { status: 503 });
}
