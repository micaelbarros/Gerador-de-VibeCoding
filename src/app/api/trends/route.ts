import { NextRequest, NextResponse } from "next/server";
import { getTrendSignals } from "@/lib/trends";
import { NicheId, TrendSource } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get("refresh") === "true";
    const niche = (searchParams.get("niche") || "all") as NicheId;
    const source = searchParams.get("source") as TrendSource | null;

    const feed = await getTrendSignals(refresh);

    let filtered = feed.signals;
    if (niche && niche !== "all") {
      filtered = filtered.filter((s) => s.niches.includes(niche));
    }
    if (source) {
      filtered = filtered.filter((s) => s.source === source);
    }

    return NextResponse.json({
      ...feed,
      signals: filtered,
      totalCount: feed.signals.length,
    });
  } catch (error) {
    console.error("Error in GET /api/trends:", error);
    return NextResponse.json(
      { error: "Falha ao coletar sinais de tendência." },
      { status: 500 }
    );
  }
}
