"use client";
import { useState } from "react";

const STEPS = [
  {
    id: "area",
    label: "📍 エリア",
    question: "どのエリアで探しますか？",
    multi: false,
    options: ["渋谷","新宿","銀座","六本木","恵比寿","表参道","品川","池袋","上野","浅草","丸の内","中目黒","代官山","麻布十番","赤坂"],
  },
  {
    id: "scene",
    label: "🎭 シーン",
    question: "どんなシーンで使いますか？",
    multi: false,
    options: ["接待・ビジネス","デート","女子会","友人と","家族・子連れ","一人飯","二次会","記念日","ランチ","深夜"],
  },
  {
    id: "people",
    label: "👥 人数",
    question: "何名ですか？",
    multi: false,
    options: ["1名","2名","3名","4名","5〜6名","7〜10名","11名以上"],
  },
  {
    id: "budget",
    label: "💴 予算",
    question: "1人あたりの予算は？",
    multi: false,
    options: ["〜2,000円","2,000〜4,000円","4,000〜8,000円","8,000〜15,000円","15,000〜30,000円","30,000円以上"],
  },
  {
    id: "genre",
    label: "🍽 ジャンル",
    question: "料理のジャンルは？（複数可）",
    multi: true,
    options: ["和食","寿司・割烹","焼肉","鉄板焼き","フレンチ","イタリアン","中華","居酒屋","バー","ラーメン","おまかせ"],
  },
];

export default function Home() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<any>({ area:"", scene:"", people:"", budget:"", genre:[] });
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const current = STEPS[step];

  function select(val: string) {
    if (current.multi) {
      setSelections((prev: any) => {
        const arr = prev[current.id];
        return { ...prev, [current.id]: arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val] };
      });
    } else {
      const next = { ...selections, [current.id]: val };
      setSelections(next);
      if (step < STEPS.length - 1) {
        setTimeout(() => setStep(step + 1), 180);
      } else {
        setDone(true);
        startSearch(next);
      }
    }
  }

  function reset() {
    setStep(0);
    setSelections({ area:"", scene:"", people:"", budget:"", genre:[] });
    setResults([]);
    setError("");
    setDone(false);
  }

  async function startSearch(sel: any) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sel),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResults(data.results);
    } catch (e: any) {
      setError("エラーが発生しました: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const summaryItems = STEPS.map(s => {
    const val = selections[s.id];
    const display = Array.isArray(val) ? val.join("・") : val;
    return { label: s.label, val: display };
  }).filter(s => s.val && s.val.length > 0);

  return (
    <main style={{ minHeight:"100vh", background:"#111", color:"#e8e0d0", fontFamily:"sans-serif", paddingBottom:60 }}>
      <div style={{ textAlign:"center", padding:"48px 24px 28px", borderBottom:"1px solid #1e1e1e" }}>
        <div style={{ fontSize:28, color:"#c9a84c", marginBottom:8 }}>◈</div>
        <h1 style={{ fontSize:32, fontWeight:300, letterSpacing:8, margin:"0 0 8px", color:"#f0e8d8" }}>Scene Gourmet</h1>
        <p style={{ fontSize:13, color:"#555", margin:0 }}>シーンを伝えるだけ。AIが最適な一軒を選ぶ。</p>
      </div>

      {summaryItems.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, maxWidth:720, margin:"20px auto 0", padding:"0 16px", alignItems:"center" }}>
          {summaryItems.map(s => (
            <div key={s.label} style={{ background:"#1a1a1a", border:"1px solid #2a2a2a", borderRadius:8, padding:"6px 12px", display:"flex", gap:6 }}>
              <span style={{ fontSize:11, color:"#555" }}>{s.label}</span>
              <span style={{ fontSize:13, color:"#c9a84c", fontWeight:600 }}>{s.val}</span>
            </div>
          ))}
          {done && <button onClick={reset} style={{ marginLeft:"auto", background:"transparent", border:"1px solid #444", borderRadius:8, padding:"6px 14px", color:"#888", fontSize:12, cursor:"pointer" }}>やり直す</button>}
        </div>
      )}

      {!done && (
        <div style={{ maxWidth:600, margin:"32px auto", padding:"0 16px" }}>
          <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:24 }}>
            {STEPS.map((s, i) => (
              <div key={s.id} style={{ width:8, height:8, borderRadius:"50%", background: i <= step ? "#c9a84c" : "#333", transform: i === step ? "scale(1.3)" : "scale(1)", transition:"all 0.3s" }} />
            ))}
          </div>
          <div style={{ background:"#181818", border:"1px solid #252525", borderRadius:18, padding:"28px 24px 24px" }}>
            <div style={{ fontSize:11, color:"#555", letterSpacing:2, marginBottom:6 }}>{step + 1} / {STEPS.length}</div>
            <div style={{ fontSize:20, fontWeight:600, color:"#f0e8d8", marginBottom:20 }}>{current.question}</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(130px, 1fr))", gap:8, marginBottom:16 }}>
              {current.options.map(opt => {
                const isSelected = current.multi ? (selections[current.id]||[]).includes(opt) : selections[current.id] === opt;
                return (
                  <button key={opt} onClick={() => select(opt)} style={{ background: isSelected ? "#1e1800" : "#111", border: isSelected ? "1px solid #c9a84c" : "1px solid #2a2a2a", borderRadius:10, padding:"10px 8px", color: isSelected ? "#c9a84c" : "#aaa", fontSize:13, cursor:"pointer", textAlign:"center" }}>
                    {isSelected && "✓ "}{opt}
                  </button>
                );
              })}
            </div>
            {current.multi && (
              <button onClick={() => { if(step < STEPS.length-1) setStep(step+1); else { setDone(true); startSearch(selections); } }} disabled={(selections[current.id]||[]).length===0} style={{ width:"100%", background:"linear-gradient(135deg,#c9a84c,#a07830)", border:"none", borderRadius:10, padding:"13px", color:"#111", fontSize:14, fontWeight:700, cursor:"pointer", opacity:(selections[current.id]||[]).length===0?0.4:1 }}>
                {step < STEPS.length-1 ? "次へ →" : "🔍 AIで探す"}
              </button>
            )}
            {step > 0 && <button onClick={() => setStep(step-1)} style={{ display:"block", marginTop:12, background:"none", border:"none", color:"#555", fontSize:13, cursor:"pointer", width:"100%" }}>← 戻る</button>}
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign:"center", padding:40 }}>
          <div style={{ fontSize:14, color:"#888" }}>🤖 AIがシーンに合う店を選定中...</div>
        </div>
      )}

      {error && <p style={{ color:"#e05555", textAlign:"center", fontSize:13 }}>{error}</p>}

      {results.length > 0 && (
        <div style={{ maxWidth:720, margin:"0 auto", padding:"0 16px" }}>
          <h2 style={{ fontSize:15, color:"#888", fontWeight:400, margin:"24px 0 16px" }}>
            <span style={{ color:"#c9a84c" }}>{selections.area}</span> × <span style={{ color:"#e8e0d0" }}>{selections.scene}</span>
          </h2>
          {results.map((r, i) => (
            <div key={i} style={{ background:"#181818", border:`1px solid ${i===0?"#c9a84c":"#2a2a2a"}`, borderRadius:14, marginBottom:16, overflow:"hidden" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 20px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                  <span style={{ fontSize:24 }}>{["🥇","🥈","🥉"][i]||`#${i+1}`}</span>
                  <div>
                    <div style={{ fontSize:16, fontWeight:600, color:"#f0e8d8", marginBottom:3 }}>{r.name}</div>
                    <div style={{ fontSize:12, color:"#666" }}><span style={{ color:"#c9a84c" }}>{r.genre}</span> · {r.area} · {r.budget}</div>
                  </div>
                </div>
                <div style={{ textAlign:"center", background:"#111", borderRadius:10, padding:"8px 14px", border:"1px solid #333" }}>
                  <div style={{ fontSize:22, fontWeight:700, color:"#c9a84c" }}>{r.sceneScore}</div>
                  <div style={{ fontSize:10, color:"#666" }}>適合度</div>
                </div>
              </div>
              <div style={{ padding:"0 20px 20px", borderTop:"1px solid #222" }}>
                <div style={{ display:"flex", gap:10, marginTop:16, background:"#111", borderRadius:10, padding:14 }}>
                  <span style={{ fontSize:18 }}>🤖</span>
                  <p style={{ fontSize:13, color:"#c8c0b0", lineHeight:1.7, margin:0 }}>{r.summary}</p>
                </div>
                {r.highlights?.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:14 }}>
                    {r.highlights.map((h: string, j: number) => <span key={j} style={{ background:"#1a2a1a", border:"1px solid #2a4a2a", borderRadius:6, padding:"4px 10px", fontSize:12, color:"#6a9a6a" }}>✓ {h}</span>)}
                  </div>
                )}
                {r.caution && <div style={{ marginTop:10, padding:"8px 12px", background:"#1a1a10", border:"1px solid #3a3a20", borderRadius:6, fontSize:12, color:"#9a9a60" }}>⚠ {r.caution}</div>}
                <div style={{ display:"flex", gap:8, marginTop:16, flexWrap:"wrap" }}>
                  <a href={r.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{ background:"#222", border:"1px solid #333", borderRadius:8, padding:"8px 14px", color:"#aaa", fontSize:12, textDecoration:"none" }}>🗺 Googleマップ</a>
                  <a href={r.tabelogUrl} target="_blank" rel="noopener noreferrer" style={{ background:"#222", border:"1px solid #c9a84c", borderRadius:8, padding:"8px 14px", color:"#c9a84c", fontSize:12, textDecoration:"none" }}>🍽 食べログ</a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
                                                                                                                                                                                                 }
