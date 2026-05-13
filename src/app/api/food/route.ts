import { NextRequest, NextResponse } from "next/server";

const FIELDS = "code,product_name,brands,nutriments,nutriscore_grade,image_small_url,quantity,serving_size";
const UA = "TJHUBApp/1.0 (youjav0421@gmail.com)";

export async function GET(req: NextRequest) {
  const q       = req.nextUrl.searchParams.get("q");
  const barcode = req.nextUrl.searchParams.get("barcode");

  if (barcode) {
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}?fields=${FIELDS}`,
        { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) return NextResponse.json({ error: "Produkt ikke fundet" }, { status: 404 });
      const data = await res.json();
      if (data.status !== 1) return NextResponse.json({ error: "Ukendt stregkode" }, { status: 404 });
      return NextResponse.json({ products: [data.product] });
    } catch {
      return NextResponse.json({ error: "Timeout ved stregkodeopslag" }, { status: 504 });
    }
  }

  if (!q) return NextResponse.json({ error: "Mangler søgeord" }, { status: 400 });

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&json=1&page_size=10&fields=${FIELDS}`,
      { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(12000) }
    );
    if (!res.ok) return NextResponse.json({ error: "Søgning fejlede" }, { status: 500 });
    const data = await res.json();
    const products = (data.products ?? []).filter((p: { product_name?: string }) => p.product_name);
    return NextResponse.json({ products });
  } catch {
    return NextResponse.json({ error: "Timeout — prøv igen" }, { status: 504 });
  }
}
