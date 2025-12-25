import { NextResponse } from "next/server";

let cachedPrice: number | null = null;
let lastFetch = 0;
const CACHE_TTL = 60000; // 1 minute

export async function GET() {
  const now = Date.now();

  // Return cached price if still valid
  if (cachedPrice && now - lastFetch < CACHE_TTL) {
    return NextResponse.json({ price: cachedPrice, cached: true });
  }

  // Try multiple sources for SOL price
  const sources = [
    fetchFromJupiter,
    fetchFromCoinGecko,
    fetchFromBinance,
  ];

  for (const fetchFn of sources) {
    try {
      const price = await fetchFn();
      if (price && price > 0) {
        cachedPrice = price;
        lastFetch = now;
        return NextResponse.json({ price, cached: false });
      }
    } catch {
      continue;
    }
  }

  // Return cached or default
  return NextResponse.json({ 
    price: cachedPrice || 180, 
    cached: true,
    fallback: true 
  });
}

async function fetchFromJupiter(): Promise<number | null> {
  const response = await fetch(
    "https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112",
    { next: { revalidate: 60 } }
  );
  if (!response.ok) return null;
  const data = await response.json();
  return parseFloat(data.data?.["So11111111111111111111111111111111111111112"]?.price) || null;
}

async function fetchFromCoinGecko(): Promise<number | null> {
  const response = await fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd",
    { next: { revalidate: 60 } }
  );
  if (!response.ok) return null;
  const data = await response.json();
  return data.solana?.usd || null;
}

async function fetchFromBinance(): Promise<number | null> {
  const response = await fetch(
    "https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT",
    { next: { revalidate: 60 } }
  );
  if (!response.ok) return null;
  const data = await response.json();
  return parseFloat(data.price) || null;
}
