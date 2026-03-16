import { NextRequest, NextResponse } from "next/server";
import {
  searchSerpApi,
  searchProshop,
  searchKomplett,
  searchPower,
  searchDba,
  ProductResult,
} from "@/lib/scrapers";

export interface SearchResponse {
  query: string;
  cheapest: ProductResult | null;
  byStore: {
    storeId: string;
    storeName: string;
    cheapest: ProductResult | null;
    results: ProductResult[];
    error?: string;
  }[];
  allResults: ProductResult[];
  totalFound: number;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.trim().length < 2) {
    return NextResponse.json({ error: "Query too short" }, { status: 400 });
  }

  const storeConfigs = [
    { id: "google_shopping", name: "Google Shopping", fn: searchSerpApi },
    { id: "proshop", name: "Proshop.dk", fn: searchProshop },
    { id: "komplett", name: "Komplett.dk", fn: searchKomplett },
    { id: "power", name: "Power.dk", fn: searchPower },
    { id: "dba", name: "DBA.dk", fn: searchDba },
  ];

  const storeResults = await Promise.allSettled(
    storeConfigs.map((s) => s.fn(query))
  );

  const byStore = storeConfigs.map((store, i) => {
    const outcome = storeResults[i];
    if (outcome.status === "fulfilled") {
      const results = outcome.value;
      return {
        storeId: store.id,
        storeName: store.name,
        cheapest: results[0] || null,
        results: results.slice(0, 5),
      };
    }
    return {
      storeId: store.id,
      storeName: store.name,
      cheapest: null,
      results: [],
      error: "Failed to fetch",
    };
  });

  const allResults: ProductResult[] = byStore
    .flatMap((s) => s.results)
    .sort((a, b) => a.price - b.price);

  const cheapest = allResults[0] || null;

  const response: SearchResponse = {
    query,
    cheapest,
    byStore,
    allResults: allResults.slice(0, 30),
    totalFound: allResults.length,
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=600",
    },
  });
}
