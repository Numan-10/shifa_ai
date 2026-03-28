import { NextRequest, NextResponse } from "next/server";

type SearchResult = {
  title?: string;
  url?: string;
  displayedUrl?: string;
  description?: string;
};

type PriceItem = {
  store: string;
  price: string;
  generic: boolean;
  available: boolean;
  url?: string;
};

const APIFY_ACTOR_URL =
  "https://api.apify.com/v2/acts/apify~google-search-scraper/run-sync-get-dataset-items";

const STORE_MATCHERS = [
  { match: "1mg.com", store: "1mg" },
  { match: "netmeds.com", store: "Netmeds" },
  { match: "pharmeasy.in", store: "PharmEasy" },
  { match: "apollopharmacy.in", store: "Apollo Pharmacy" },
  { match: "apollo247.com", store: "Apollo Pharmacy" },
] as const;

const PRICE_PATTERN = /(\u20B9\s?\d+(?:,\d{3})*(?:\.\d+)?)/;

export async function POST(req: NextRequest) {
  try {
    const { medicineName } = (await req.json()) as { medicineName?: string };
    const normalizedName = medicineName?.trim();

    if (!normalizedName) {
      return NextResponse.json(
        { error: "Medicine name is required." },
        { status: 400 },
      );
    }

    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "Apify API token is not configured." },
        { status: 500 },
      );
    }

    const response = await fetch(
      `${APIFY_ACTOR_URL}?token=${encodeURIComponent(token)}&format=json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          queries: `${normalizedName} price 1mg netmeds pharmeasy apollo pharmacy`,
          maxPagesPerQuery: 1,
          countryCode: "IN",
          languageCode: "en",
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Apify request failed with status ${response.status}.` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as unknown;
    const datasetItems = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { value?: unknown[] })?.value)
        ? (payload as { value: unknown[] }).value
        : [];

    const firstItem = datasetItems[0] as
      | { organicResults?: SearchResult[] }
      | undefined;
    const prices = extractPrices(firstItem?.organicResults ?? []);

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("[Prices API] Unexpected error", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine prices." },
      { status: 500 },
    );
  }
}

function extractPrices(results: SearchResult[]): PriceItem[] {
  const seenStores = new Set<string>();
  const prices: PriceItem[] = [];

  for (const result of results) {
    const storeName = inferStoreName(result.url);
    if (!storeName || seenStores.has(storeName)) {
      continue;
    }

    const priceMatch =
      result.description?.match(PRICE_PATTERN) ??
      result.title?.match(PRICE_PATTERN);

    if (!priceMatch?.[1]) {
      continue;
    }

    seenStores.add(storeName);
    prices.push({
      store: storeName,
      price: priceMatch[1].replace(/\s+/g, ""),
      generic: /generic|alternative/i.test(
        `${result.title ?? ""} ${result.description ?? ""}`,
      ),
      available: true,
      url: result.url,
    });

    if (prices.length >= 4) {
      break;
    }
  }

  return prices;
}

function inferStoreName(url?: string) {
  if (!url) {
    return null;
  }

  const normalizedUrl = url.toLowerCase();
  const match = STORE_MATCHERS.find((store) =>
    normalizedUrl.includes(store.match),
  );
  return match?.store ?? null;
}
