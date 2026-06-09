import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const sel = await req.json();
  const genre = sel.genre?.join("・") || "指定なし";

  const prompt = `東京グルメのAIです。以下の条件に合う実在レストランを3件提案してください。

条件: ${sel.area} / ${sel.scene} / ${sel.people} / ${sel.budget} / ジャンル:${genre}

以下のJSON配列のみで回答（説明不要）:
[{"name":"店名","genre":"ジャンル","area":"最寄り駅","sceneScore":90,"budget":"予算感","summary":"理由2文","highlights":["特徴1","特徴2","特徴3"],"caution":null,"tabelogName":"食べログ検索名","googleMapsName":"マップ検索名"}]`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await res.json();
    const raw = data.content?.map((c: any) => c.text || "").join("") || "";
    const ranked = JSON.parse(raw.replace(/```json|```/g, "").trim());

    const results = ranked.map((r: any) => ({
      ...r,
      tabelogUrl: `https://tabelog.com/rst/search/keyword=${encodeURIComponent(r.tabelogName || r.name)}/`,
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent((r.googleMapsName || r.name) + " " + sel.area)}`,
    }));

    return NextResponse.json({ results });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
