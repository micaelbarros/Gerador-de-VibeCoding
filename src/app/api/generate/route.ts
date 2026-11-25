import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getTrendSignals } from "@/lib/trends";
import { generateVibeBlueprint } from "@/lib/generator";

export const dynamic = "force-dynamic";

const generateRequestSchema = z.object({
  mode: z.enum(["money", "hackathon", "study", "challenge"]).default("money"),
  niche: z
    .enum([
      "all",
      "education",
      "health",
      "finance",
      "productivity",
      "devtools",
      "ecommerce",
      "creators",
      "local",
      "entertainment",
      "sustainability",
    ])
    .default("all"),
  format: z
    .enum(["any", "webapp", "extension", "bot", "ai-agent", "mobile", "cli"])
    .default("any"),
  timeframe: z.enum(["2h", "1d", "48h", "1w"]).default("48h"),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("intermediate"),
  audience: z.enum(["any", "b2c", "b2b", "creators", "devs"]).default("any"),
  focusTrendId: z.string().optional(),
  excludeTrendIds: z.array(z.string()).optional(),
  pivot: z.enum(["simpler", "b2b", "extension", "monetize"]).optional(),
  previousTitle: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = generateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Parâmetros inválidos.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const feed = await getTrendSignals(false);
    const blueprint = await generateVibeBlueprint(parsed.data, feed.signals);

    return NextResponse.json({
      blueprint,
      meta: {
        liveCount: feed.liveCount,
        sourcesActive: feed.sourcesActive,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/generate:", error);
    return NextResponse.json(
      { error: "Falha ao gerar o Vibe Blueprint." },
      { status: 500 }
    );
  }
}
