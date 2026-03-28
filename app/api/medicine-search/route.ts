import { NextRequest, NextResponse } from "next/server";

type ExaSearchResult = {
  title?: string;
  url?: string;
  text?: string;
};

const TRUSTED_MEDICINE_DOMAINS = [
  "drugs.com",
  "medlineplus.gov",
  "nhs.uk",
  "mayoclinic.org",
  "webmd.com",
  "clevelandclinic.org",
  "1mg.com",
  "netmeds.com",
] as const;

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

    const exaApiKey = process.env.EXA_API_KEY;
    if (!exaApiKey) {
      return NextResponse.json(
        { error: "Exa API key is not configured." },
        { status: 500 },
      );
    }

    const response = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": exaApiKey,
      },
      cache: "no-store",
      body: JSON.stringify({
        query: `${normalizedName} medicine uses dosage side effects precautions`,
        type: "auto",
        numResults: 5,
        includeDomains: [...TRUSTED_MEDICINE_DOMAINS],
        text: true,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Exa request failed with status ${response.status}.` },
        { status: 502 },
      );
    }

    const payload = (await response.json()) as {
      results?: ExaSearchResult[];
    };

    const sources = (payload.results ?? [])
      .filter((result) => result.title && result.url)
      .map((result) => ({
        title: result.title!,
        url: result.url!,
        domain: getDomainLabel(result.url!),
        snippet: truncateText(result.text),
      }));

    return NextResponse.json({ sources });
  } catch (error) {
    console.error("[Medicine Search API] Unexpected error", error);
    return NextResponse.json(
      { error: "Failed to fetch medicine sources." },
      { status: 500 },
    );
  }
}

function truncateText(text?: string) {
  if (!text) {
    return "";
  }

  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > 220
    ? `${normalized.slice(0, 217).trimEnd()}...`
    : normalized;
}

function getDomainLabel(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
