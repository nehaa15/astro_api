import { useState } from "react";

// ═══════════════════════════════════════════════════════════════════════════
// API CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════
const API_URL = "https://astro-api-4b5p.onrender.com";
const API_KEY = "astro-api-key-2024";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS FOR UI RENDERING (kept minimal for display purposes)
// ═══════════════════════════════════════════════════════════════════════════
const RASHI = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const RASHI_SH = ["Ar", "Ta", "Ge", "Ca", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const PLANET_SH = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"];
const PCOL = { Sun: "#FFD700", Moon: "#B8C8D8", Mars: "#E05252", Mercury: "#52C052", Jupiter: "#F0A050", Venus: "#E090B0", Saturn: "#6080B0", Rahu: "#A066A0", Ketu: "#809090", Ascendant: "#FF6B35" };

const MOOLANK_DATA = {
  1: { planet: "Sun", desc: "The natural leader and individualist. Solar energy brings creative force, ambition, and the drive to stand out.", traits: "Leadership, creativity, independence, ambition", shadow: "ego, arrogance, loneliness", career: "Executive, entrepreneur, politics", love: "Seeks admiration, needs supportive partner", body: "Heart, eyes, spine", day: "Sunday", gem: "Ruby", color: "Gold/Orange", metal: "Gold" },
  2: { planet: "Moon", desc: "The sensitive diplomat ruled by lunar tides. Natural mediators with deep emotional intelligence and intuition.", traits: "Cooperation, sensitivity, diplomacy, intuition", shadow: "indecision, over-sensitivity, dependency", career: "Counseling, art, partnerships", love: "Seeks harmony and deep emotional bond", body: "Stomach, fluids, left eye", day: "Monday", gem: "Pearl", color: "White/Cream", metal: "Silver" },
  3: { planet: "Jupiter", desc: "The creative communicator blessed by Jupiter's expansion. Natural entertainers with gifts in expression and joy.", traits: "Expression, creativity, optimism, charm", shadow: "superficiality, scattered energy", career: "Writing, acting, teaching, marketing", love: "Playful, needs mental stimulation", body: "Liver, hips, arterial system", day: "Thursday", gem: "Yellow Sapphire", color: "Yellow/Purple", metal: "Gold" },
  4: { planet: "Rahu/Uranus", desc: "The builder and rebel — unconventional yet methodical. Creates lasting structures while breaking outdated patterns.", traits: "Stability, hard work, practicality, rebellion", shadow: "rigidity, pessimism, sudden upheavals", career: "Engineering, real estate, tech innovation", love: "Loyal but needs freedom", body: "Legs, bones, nervous system", day: "Saturday", gem: "Hessonite", color: "Blue/Grey", metal: "Lead" },
  5: { planet: "Mercury", desc: "The freedom-seeker ruled by Mercury's motion. Drawn to variety, travel, and constant intellectual stimulation.", traits: "Freedom, versatility, adventure, communication", shadow: "restlessness, inconsistency, excess", career: "Travel, sales, media, entrepreneurship", love: "Needs excitement and independence", body: "Lungs, nervous system, arms", day: "Wednesday", gem: "Emerald", color: "Green/Turquoise", metal: "Bronze" },
  6: { planet: "Venus", desc: "The nurturer and artist ruled by Venus's beauty. Natural caretakers who create harmony and aesthetic refinement.", traits: "Love, responsibility, beauty, service", shadow: "worry, perfectionism, martyrdom", career: "Healing, design, hospitality", love: "Devoted, needs appreciation", body: "Throat, kidneys, reproductive system", day: "Friday", gem: "Diamond", color: "Pink/Blue", metal: "Copper" },
  7: { planet: "Ketu/Neptune", desc: "The mystic and analyst — drawn to both solitude and depth. Natural researchers with spiritual inclination and occult sensitivity.", traits: "Spirituality, analysis, introspection, wisdom", shadow: "isolation, skepticism, escapism", career: "Research, spirituality, psychology", love: "Needs solitude and deep connection", body: "Head, pineal gland", day: "Monday", gem: "Cat's Eye", color: "White/Violet", metal: "Lead" },
  8: { planet: "Saturn", desc: "The power-seeker bearing Saturn's weight. Ultimate potential for material success through discipline and karmic lessons.", traits: "Power, material success, discipline, karma", shadow: "ruthlessness, workaholism, loneliness", career: "Finance, politics, large enterprises", love: "Protective, may seem distant", body: "Bones, teeth, knees", day: "Saturday", gem: "Blue Sapphire", color: "Black/Dark Blue", metal: "Iron" },
  9: { planet: "Mars", desc: "The humanitarian warrior fueled by Mars's fire. Combines idealism with action, serving larger causes with courage.", traits: "Humanitarianism, courage, completion, wisdom", shadow: "impatience, aggression, emotional volatility", career: "Military, social reform, medicine", love: "Passionate, needs meaningful purpose", body: "Blood, musculature, head", day: "Tuesday", gem: "Red Coral", color: "Red/Crimson", metal: "Iron" }
};

const KARMIC_DEBT = {
  13: { name: "Debt of Laziness", warning: "The 13 Karmic Debt indicates past-life laziness and taking shortcuts. May face repeated career setbacks until hard work and discipline are embraced." },
  14: { name: "Debt of Control", warning: "The 14 Karmic Debt signals past-life abuse of freedom or sensory excess. May struggle with addiction, commitment, or impulsive behavior until moderation is mastered." },
  16: { name: "Debt of the Fallen Ego", warning: "The 16 Karmic Debt represents the most serious pattern — karmic fall from prominence due to ego. May experience dramatic rises and falls, relationship collapses, until humility is developed." },
  19: { name: "Debt of Self-Abuse", warning: "The 19 Karmic Debt signals past-life abuse of power or position. May feel isolated, unsupported, until learning interdependence and using power for others." }
};

const BHAGYANK_DESC = {
  1: "Independent leader destiny. Life will demand that you actualize your unique identity without relying on others. Authority, innovation, and originality are your karmic requirements.",
  2: "Partnership and cooperation destiny. Life will teach through relationships, diplomacy, and the art of supporting others while developing your own subtle strength.",
  3: "Creative expression destiny. Joy, communication, and artistic output are not optional — they are your karmic assignments. Suppressing creativity creates stagnation.",
  4: "Builder and stabilizer destiny. Your karma is to create lasting structures — in work, family, or society. Discipline is not punishment but your specific path to freedom.",
  5: "Freedom and change destiny. Your soul contracted for variety, travel, and the breaking of limiting patterns. Settling too early creates restlessness.",
  6: "Responsibility and love destiny. Home, family, and service are your karmic assignments. The 6 is called the 'Mother Number' — nurturing is your soul's work.",
  7: "Seeker and analyst destiny. Your karma requires periods of solitude, study, and the development of inner wisdom. Spiritual understanding is not optional.",
  8: "Power and material mastery destiny. The 8 is the CEO number — large-scale achievement, wealth, and authority are your karmic territory. Great success or dramatic struggle.",
  9: "Humanitarian and completion destiny. Your soul contracted to serve larger causes and to complete major karmic cycles. Personal ambition alone will feel empty.",
  11: "The Master Intuitive. Double 1 energy creates the spiritual messenger and visionary. High nervous sensitivity, profound intuition, but requires grounding. You carry light for others.",
  22: "The Master Builder. The most powerful destiny number — capable of manifesting the visionary into concrete reality on a global scale. Immense potential and immense responsibility.",
  33: "The Master Teacher. The rarest and most spiritually advanced destiny. Complete dedication to healing, teaching, and transforming human consciousness."
};

// ═══════════════════════════════════════════════════════════════════════════
// CHART SVG COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
function ChartSVG({ pih, lr, pos }) {
  const SZ = 340, C = SZ / 2, d = 115;
  const HC = [[C, C - d], [C + d, C - d * .57], [C + d, C + d * .57], [C, C + d], [C - d, C + d * .57], [C - d, C - d * .57], [C, C - d / 2], [C + d / 2, C - d / 4], [C + d / 2, C + d / 4], [C, C + d / 2], [C - d / 2, C + d / 4], [C - d / 2, C - d / 4]];
  const HO = [[0, -1], [1, -.5], [1, .5], [0, 1], [-1, .5], [-1, -.5], [0, -.5], [.5, -.25], [.5, .25], [0, .5], [-.5, .25], [-.5, -.25]];
  const houseOf = (r) => ((r - lr + 12) % 12) + 1;
  return (
    <svg viewBox={`0 0 ${SZ} ${SZ}`} style={{ width: "320px", maxWidth: "100%", filter: "drop-shadow(0 0 15px rgba(100,30,0,0.3))" }}>
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#150800" /><stop offset="100%" stopColor="#0a0400" /></linearGradient>
        <linearGradient id="stroke" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6a3008" /><stop offset="100%" stopColor="#a06020" /></linearGradient>
      </defs>
      <rect width={SZ} height={SZ} fill="url(#bg)" rx="8" />
      {/* Outer diamond */}
      <polygon points={`${C},10 ${SZ - 10},${C} ${C},${SZ - 10} 10,${C}`} fill="none" stroke="url(#stroke)" strokeWidth="2" />
      {/* Inner diamond */}
      <polygon points={`${C},${C - d} ${C + d},${C} ${C},${C + d} ${C - d},${C}`} fill="none" stroke="url(#stroke)" strokeWidth="1.5" />
      {/* Division lines */}
      <line x1={C} y1="10" x2={C - d} y2={C} stroke="#4a1a01" strokeWidth="0.8" />
      <line x1={C} y1="10" x2={C + d} y2={C} stroke="#4a1a01" strokeWidth="0.8" />
      <line x1={SZ - 10} y1={C} x2={C} y2={C - d} stroke="#4a1a01" strokeWidth="0.8" />
      <line x1={SZ - 10} y1={C} x2={C} y2={C + d} stroke="#4a1a01" strokeWidth="0.8" />
      <line x1={C} y1={SZ - 10} x2={C + d} y2={C} stroke="#4a1a01" strokeWidth="0.8" />
      <line x1={C} y1={SZ - 10} x2={C - d} y2={C} stroke="#4a1a01" strokeWidth="0.8" />
      <line x1="10" y1={C} x2={C} y2={C + d} stroke="#4a1a01" strokeWidth="0.8" />
      <line x1="10" y1={C} x2={C} y2={C - d} stroke="#4a1a01" strokeWidth="0.8" />
      {/* House numbers */}
      {HC.map((p, i) => <text key={`h${i}`} x={p[0]} y={p[1] + 4} textAnchor="middle" fill="#2a1001" fontSize="11" fontFamily="'Cinzel',serif">{i + 1}</text>)}
      {/* Rashi labels */}
      {HC.map((p, i) => <text key={`r${i}`} x={p[0] + HO[i][0] * 30} y={p[1] + HO[i][1] * 15} textAnchor="middle" fill="#5a3010" fontSize="8" fontFamily="'Cinzel',serif">{RASHI_SH[(lr + i) % 12]}</text>)}
      {/* Planets */}
      {PLANETS.map((pl) => {
        const h = houseOf(pos[pl].rashi);
        const idx = (pih[h] || []).indexOf(pl);
        const px = HC[h - 1][0] + HO[h - 1][0] * (25 + idx * 16);
        const py = HC[h - 1][1] + HO[h - 1][1] * 30 - 3;
        return <text key={pl} x={px} y={py} textAnchor="middle" fill={PCOL[pl]} fontSize="12" fontWeight="bold" fontFamily="'Cinzel',serif">{PLANET_SH[PLANETS.indexOf(pl)]}{pos[pl].retro ? "ᴿ" : ""}</text>;
      })}
      {/* Ascendant marker */}
      <text x={HC[0][0] + HO[0][0] * 45} y={HC[0][1] + HO[0][1] * 30} textAnchor="middle" fill="#FF6B35" fontSize="10" fontWeight="bold">Asc</text>
    </svg>
  );
}

// Helper function for house calculations
const houseOf = (rashi, lagna) => ((rashi - lagna + 12) % 12) + 1;
const houseRashi = (h, lr) => (lr + h - 1) % 12;

// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [form, setForm] = useState({ name: "", date: "", time: "", region: "" });
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("chart");
  const [openPast, setOpenPast] = useState(null);
  const [openFuture, setOpenFuture] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  // ═══════════════════════════════════════════════════════════════════════════
  // API CALL TO GENERATE REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  const go = async () => {
    setErr(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/generate-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY
        },
        body: JSON.stringify({
          name: form.name,
          dob: form.date,
          time: form.time,
          place: form.region
        })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to generate report");
      }

      // Map API response to expected data structure
      const { kundali, numerology, predictions } = result.report;

      setData({
        pos: kundali.pos,
        lagna: kundali.lagna,
        pih: kundali.pih,
        asp: kundali.asp,
        das: kundali.das.map(d => ({
          ...d,
          start: new Date(d.start),
          end: new Date(d.end)
        })),
        pred: {
          soulText: predictions.soulText,
          yogas: predictions.yogas,
          past: predictions.past,
          presMain: predictions.presMain,
          present: predictions.present,
          future: predictions.future,
          remedies: predictions.remedies,
          num: numerology
        },
        form: { ...form }
      });
      setTab("chart");

    } catch (e) {
      console.error("API Error:", e);
      setErr("Error: " + e.message + ". Make sure the backend server is running (npm start in backend folder).");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date();
  const cd = data?.das.find(d => d.start <= today && d.end >= today);
  const pred = data?.pred;
  const fmt = d => d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", background: "#080300", color: "#E8D5C0", fontFamily: "'EB Garamond',Georgia,serif", backgroundImage: "radial-gradient(ellipse at 10% 0%,rgba(100,20,0,0.3) 0%,transparent 50%),radial-gradient(ellipse at 90% 100%,rgba(80,40,0,0.2) 0%,transparent 50%)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:#080300;}::-webkit-scrollbar-thumb{background:#7a3a0a;border-radius:3px;}
        input{background:rgba(255,150,30,0.06)!important;border:1px solid #5a2a05!important;color:#E8D5C0!important;border-radius:6px;padding:10px 14px;width:100%;font-family:inherit;font-size:1rem;outline:none;transition:border-color 0.2s;}
        input:focus{border-color:#FFD700!important;}input::placeholder{color:#6a4a20!important;}
        .tb{background:none;border:1px solid #4a1a01;color:#b87a20;padding:6px 14px;cursor:pointer;font-family:'Cinzel',serif;font-size:0.68rem;letter-spacing:0.08em;border-radius:4px;transition:all 0.2s;}
        .tb.on{background:rgba(100,15,0,0.6);border-color:#FFD700;color:#FFD700;}
        .tb:hover:not(.on){border-color:#b87a20;}
        @keyframes fd{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{text-shadow:0 0 8px rgba(255,215,0,0.3)}50%{text-shadow:0 0 20px rgba(255,215,0,0.7)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .cd{background:rgba(255,100,0,0.04);border:1px solid #2a1001;border-radius:7px;padding:0.9rem;}
        .cd.ben{background:rgba(30,80,30,0.1);border-color:#1a3a10;}
        .cd.mal{background:rgba(80,20,20,0.12);border-color:#3a1010;}
        .cd.mix{background:rgba(80,60,10,0.1);border-color:#3a2a05;}
        .xp{cursor:pointer;border:1px solid #2a1001;border-radius:7px;padding:0.85rem 1rem;margin:0.45rem 0;transition:all 0.2s;background:rgba(255,100,0,0.02);}
        .xp:hover{border-color:#b87a20;background:rgba(255,100,0,0.06);}
        .xp.op{border-color:#FFD700;background:rgba(255,215,0,0.04);}
        .pr{transition:background 0.15s;}.pr:hover{background:rgba(255,100,0,0.07)!important;}
        .loader{width:24px;height:24px;border:3px solid #2a1001;border-top-color:#FFD700;border-radius:50%;animation:spin 0.8s linear infinite;display:inline-block;margin-right:8px;vertical-align:middle;}
        html,body{margin:0;padding:0;width:100%;overflow-x:hidden;}
        table{display:block;overflow-x:auto;-webkit-overflow-scrolling:touch;}
        @media(max-width:768px){
          .tb{padding:5px 8px;font-size:0.6rem;letter-spacing:0.04em;}
          .cd{padding:0.65rem;}
          .xp{padding:0.6rem 0.7rem;}
        }
        @media(max-width:480px){
          .tb{padding:4px 6px;font-size:0.55rem;}
        }
      `}</style>

      {/* HEADER */}
      <div style={{ textAlign: "center", padding: "1.8rem 1rem 1rem", borderBottom: "1px solid #1e0800" }}>
        <div style={{ color: "#7a3a0a", fontSize: "1.4rem", letterSpacing: "0.6em" }}>✦ ॐ ✦</div>
        <h1 style={{ fontFamily: "'Cinzel Decorative',serif", fontSize: "clamp(1.2rem,3vw,2rem)", color: "#FFD700", margin: "0.2rem 0", fontWeight: 700, animation: "glow 4s ease-in-out infinite" }}>जन्म कुंडली</h1>
        <div style={{ fontFamily: "'Cinzel',serif", color: "#7a5010", fontSize: "0.65rem", letterSpacing: "0.25em" }}>VEDIC BIRTH CHART · CLASSICAL DEEP READING · API POWERED</div>
      </div>

      <div style={{ width: "100%", margin: "0 auto", padding: "1.2rem clamp(0.5rem, 3vw, 2.5rem)" }}>

        {/* FORM */}
        {!data && (
          <div style={{ maxWidth: "560px", margin: "0 auto", animation: "fd 0.5s ease" }}>
            <div style={{ border: "1px solid #2a1001", borderRadius: "10px", padding: "1.6rem", background: "rgba(255,100,0,0.02)" }}>
              <div style={{ textAlign: "center", fontFamily: "'Cinzel',serif", color: "#b87a20", fontSize: "0.75rem", letterSpacing: "0.15em", marginBottom: "1.2rem" }}>ENTER BIRTH DETAILS</div>
              <div style={{ display: "grid", gap: "0.8rem" }}>
                <div><div style={{ color: "#6a4010", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.3rem", fontFamily: "'Cinzel',serif" }}>FULL NAME</div><input placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={loading} /></div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.7rem" }}>
                  <div><div style={{ color: "#6a4010", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.3rem", fontFamily: "'Cinzel',serif" }}>DATE OF BIRTH</div><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} disabled={loading} /></div>
                  <div><div style={{ color: "#6a4010", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.3rem", fontFamily: "'Cinzel',serif" }}>TIME OF BIRTH</div><input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} disabled={loading} /></div>
                </div>
                <div><div style={{ color: "#6a4010", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.3rem", fontFamily: "'Cinzel',serif" }}>BIRTH CITY</div><input placeholder="e.g. Mumbai, Delhi, London, Dubai..." value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} disabled={loading} /></div>
              </div>
              <button onClick={go} disabled={!form.name || !form.date || !form.time || !form.region || loading}
                style={{ width: "100%", marginTop: "1.2rem", padding: "12px", background: "linear-gradient(135deg,#6b0000,#a87010)", border: "1px solid #FFD700", color: "#FFD700", borderRadius: "6px", cursor: "pointer", fontFamily: "'Cinzel',serif", fontSize: "0.78rem", letterSpacing: "0.2em", fontWeight: 700, opacity: (!form.name || !form.date || !form.time || !form.region || loading) ? 0.4 : 1, transition: "opacity 0.2s" }}>
                {loading ? <><span className="loader"></span>CALCULATING...</> : "✦ CAST MY KUNDALI ✦"}
              </button>
              <p style={{ color: "#2a1505", fontSize: "0.62rem", textAlign: "center", marginTop: "0.6rem" }}>Powered by Vedic Astrology API · Classical Rules · Secure</p>
              {err && <p style={{ color: "#E05252", fontSize: "0.72rem", textAlign: "center", marginTop: "0.5rem", padding: "0.4rem", background: "rgba(200,0,0,0.1)", borderRadius: "4px" }}>{err}</p>}
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {data && (
          <div style={{ animation: "fd 0.4s ease" }}>
            {/* Header strip */}
            <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", flexWrap: "wrap", padding: "0.7rem 1rem", border: "1px solid #2a1001", borderRadius: "7px", background: "rgba(255,100,0,0.03)", marginBottom: "0.9rem" }}>
              <div>
                <div style={{ fontFamily: "'Cinzel',serif", fontSize: "1rem", color: "#FFD700", fontWeight: 700 }}>{data.form.name}</div>
                <div style={{ color: "#7a5010", fontSize: "0.68rem" }}>{data.form.date} · {data.form.time} · {data.form.region}</div>
              </div>
              <div style={{ display: "flex", gap: "1rem", marginLeft: "auto", flexWrap: "wrap" }}>
                {[["Lagna", RASHI[data.lagna]], ["Moon", data.pos.Moon.rashiName], ["Dasha", cd?.name || "—"]].map(([k, v]) => (
                  <div key={k} style={{ textAlign: "center" }}>
                    <div style={{ color: "#5a3a0a", fontSize: "0.58rem", letterSpacing: "0.1em", fontFamily: "'Cinzel',serif" }}>{k}</div>
                    <div style={{ color: "#DEB887", fontSize: "0.78rem", fontFamily: "'Cinzel',serif" }}>{v}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setData(null); setTab("chart"); }} style={{ background: "none", border: "1px solid #2a1001", color: "#5a3010", padding: "3px 9px", borderRadius: "4px", cursor: "pointer", fontSize: "0.62rem", fontFamily: "'Cinzel',serif" }}>↩</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.9rem" }}>
              {[["chart", "🪐 Chart"], ["planets", "⭐ Planets"], ["yogas", "⚡ Yogas"], ["dasha", "📅 Dasha"], ["past", "🔮 Past (10)"], ["present", "⚡ Present"], ["future", "🌟 Future (10)"], ["numerology", "🔢 Numerology"], ["remedies", "🙏 Remedies"]].map(([id, label]) => (
                <button key={id} className={`tb ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>{label}</button>
              ))}
            </div>

            {/* CHART */}
            {tab === "chart" && (
              <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
                <ChartSVG pih={data.pih} lr={data.lagna} pos={data.pos} />
                <div style={{ flex: 1, minWidth: "260px" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#b87a20", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>SOUL SIGNATURE</div>
                  <p style={{ color: "#D4C0A0", fontSize: "0.83rem", lineHeight: 1.8, marginBottom: "1rem", borderLeft: "2px solid #7a3a0a", paddingLeft: "0.8rem" }}>{pred.soulText}</p>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#b87a20", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.4rem" }}>HOUSES</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2px" }}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                      <div key={h} style={{ display: "flex", gap: "0.4rem", fontSize: "0.7rem", padding: "2px 0", borderBottom: "1px solid rgba(50,20,0,0.3)" }}>
                        <span style={{ color: "#7a4a10", fontFamily: "'Cinzel',serif", minWidth: "20px" }}>H{h}</span>
                        <span style={{ color: "#555", fontSize: "0.62rem", minWidth: "22px" }}>{RASHI_SH[(data.lagna + h - 1) % 12]}</span>
                        <span style={{ color: data.pih[h].length ? "#DEB887" : "#333" }}>
                          {data.pih[h].map(p => `${PLANET_SH[PLANETS.indexOf(p)]}${data.pos[p].retro ? "ᴿ" : ""}`).join(" ") || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PLANETS */}
            {tab === "planets" && (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.77rem" }}>
                <thead><tr style={{ background: "rgba(80,15,0,0.3)" }}>
                  {["Planet", "House", "Rashi", "Deg", "Nakshatra", "Pada", "Dignity", "R"].map(h => (
                    <th key={h} style={{ padding: "5px 7px", color: "#b87a20", fontFamily: "'Cinzel',serif", fontSize: "0.62rem", textAlign: "left", borderBottom: "1px solid #2a1001" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {PLANETS.map(p => {
                    const d = data.pos[p], h = houseOf(d.rashi, data.lagna);
                    return (<tr key={p} className="pr" style={{ borderBottom: "1px solid rgba(30,10,0,0.5)" }}>
                      <td style={{ padding: "4px 7px", color: PCOL[p], fontWeight: "bold" }}>{p}</td>
                      <td style={{ padding: "4px 7px", color: "#777" }}>{h}</td>
                      <td style={{ padding: "4px 7px", color: "#DEB887" }}>{d.rashiName}</td>
                      <td style={{ padding: "4px 7px", color: "#999" }}>{d.deg.toFixed(1)}°</td>
                      <td style={{ padding: "4px 7px", color: "#bbb", fontSize: "0.7rem" }}>{d.nak}</td>
                      <td style={{ padding: "4px 7px", color: "#777" }}>{d.pada}</td>
                      <td style={{ padding: "4px 7px", color: d.dig === "Exalted" ? "#FFD700" : d.dig === "Debilitated" ? "#E05252" : d.dig === "Own Sign" ? "#52C052" : d.dig === "Friendly" ? "#52A0C0" : "#666", fontSize: "0.68rem" }}>{d.dig}</td>
                      <td style={{ padding: "4px 7px", color: "#E05252", fontSize: "0.68rem" }}>{d.retro ? "R" : ""}</td>
                    </tr>);
                  })}
                  <tr style={{ borderTop: "2px solid #6a3008", background: "rgba(80,20,0,0.2)" }}>
                    <td style={{ padding: "4px 7px", color: "#FF6B35", fontWeight: "bold" }} colSpan={2}>Ascendant</td>
                    <td style={{ padding: "4px 7px", color: "#DEB887" }}>{data.pos.Ascendant.rashiName}</td>
                    <td style={{ padding: "4px 7px", color: "#999" }}>{data.pos.Ascendant.deg.toFixed(1)}°</td>
                    <td style={{ padding: "4px 7px", color: "#bbb", fontSize: "0.7rem" }}>{data.pos.Ascendant.nak}</td>
                    <td style={{ padding: "4px 7px", color: "#777" }}>{data.pos.Ascendant.pada}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* YOGAS */}
            {tab === "yogas" && (
              <div>
                <p style={{ color: "#6a4010", fontSize: "0.73rem", marginBottom: "0.7rem", fontStyle: "italic" }}>Yogas detected using classical BPHS rules — each modifies the chart's results significantly.</p>
                {pred.yogas.length === 0 && <p style={{ color: "#444" }}>No major algorithmic yogas detected. See planets tab for individual dignities.</p>}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "0.6rem" }}>
                  {pred.yogas.map((y, i) => (
                    <div key={i} className={`cd ${y.type === "benefic" ? "ben" : y.type === "malefic" ? "mal" : "mix"}`}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.3rem" }}>
                        <span>{y.type === "benefic" ? "✦" : y.type === "malefic" ? "⚠" : "◈"}</span>
                        <span style={{ fontFamily: "'Cinzel',serif", color: y.type === "benefic" ? "#6aCC6a" : y.type === "malefic" ? "#E06060" : "#DEB887", fontSize: "0.72rem", fontWeight: 700 }}>{y.name}</span>
                      </div>
                      <p style={{ color: "#9a7a4a", fontSize: "0.72rem", lineHeight: 1.5, margin: 0 }}>{y.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DASHA */}
            {tab === "dasha" && (
              <div>
                <p style={{ color: "#6a4010", fontSize: "0.73rem", marginBottom: "0.7rem", fontStyle: "italic" }}>Vimshottari Dasha — 120-year cycle from Moon's Nakshatra lord at birth.</p>
                <div style={{ display: "grid", gap: "0.3rem" }}>
                  {data.das.map((d, i) => {
                    const iC = d.start <= today && d.end >= today, pct = iC ? Math.min(100, ((today - d.start) / (d.end - d.start)) * 100) : 0;
                    return (<div key={i} style={{ padding: "8px 11px", border: `1px solid ${iC ? "#FFD700" : "#1e0800"}`, borderRadius: "5px", background: iC ? "rgba(80,15,0,0.3)" : "rgba(255,80,0,0.02)", position: "relative", overflow: "hidden" }}>
                      {iC && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: "rgba(255,130,0,0.07)" }} />}
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center", position: "relative" }}>
                        <div style={{ width: "70px", fontFamily: "'Cinzel',serif", color: iC ? "#FFD700" : "#b87a20", fontWeight: iC ? 700 : 400, fontSize: "0.76rem" }}>{d.name}{iC && <span style={{ marginLeft: "4px", color: "#FF6B35", fontSize: "0.58rem" }}>▶</span>}</div>
                        <div style={{ color: "#777", fontSize: "0.7rem", flex: 1 }}>{fmt(d.start)} → {fmt(d.end)}</div>
                        <div style={{ color: "#4a2a08", fontSize: "0.65rem" }}>{Math.round(d.yrs)}y</div>
                      </div>
                    </div>);
                  })}
                </div>
              </div>
            )}

            {/* PAST */}
            {tab === "past" && (
              <div>
                <div style={{ padding: "0.75rem 0.9rem", border: "1px solid #2a1001", borderRadius: "7px", background: "rgba(255,80,0,0.02)", marginBottom: "0.8rem" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#b87a20", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.35rem" }}>🔮 10 DEEP REVELATIONS FROM YOUR PAST</div>
                  <p style={{ color: "#7a5020", fontSize: "0.76rem", lineHeight: 1.6 }}>Derived entirely from classical Vedic rules — planetary dignities, house placements, aspects, yogas, and Nakshatra analysis. Zero generic statements — every insight is traceable to a specific feature of this chart.</p>
                </div>
                {pred.past.map((p, i) => (
                  <div key={i} className={`xp ${openPast === i ? "op" : ""}`} onClick={() => setOpenPast(openPast === i ? null : i)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                      <div style={{ fontFamily: "'Cinzel',serif", color: "#FFD700", fontSize: "0.9rem", minWidth: "24px", textAlign: "center", fontWeight: 700 }}>{i + 1}</div>
                      <div style={{ fontFamily: "'Cinzel',serif", color: openPast === i ? "#FFD700" : "#DEB887", fontSize: "0.8rem", fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{p.title}</div>
                      <div style={{ color: "#6a4010", fontSize: "0.7rem" }}>{openPast === i ? "▲" : "▼"}</div>
                    </div>
                    {openPast === i && (
                      <div style={{ marginTop: "0.7rem", paddingTop: "0.7rem", borderTop: "1px solid #2a1001", animation: "fd 0.25s ease" }}>
                        <p style={{ color: "#D4B880", fontSize: "0.84rem", lineHeight: 1.85 }}>{p.body}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PRESENT */}
            {tab === "present" && (
              <div>
                <div style={{ padding: "0.8rem 0.9rem", border: "1px solid #2a1001", borderRadius: "7px", marginBottom: "0.8rem", background: "rgba(255,80,0,0.02)" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#b87a20", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.45rem" }}>⚡ CURRENT LIFE — {cd?.name?.toUpperCase()} MAHADASHA ANALYSIS</div>
                  <p style={{ color: "#D4B880", fontSize: "0.84rem", lineHeight: 1.8 }}>{pred.presMain}</p>
                </div>
                {[["🏠 Family & Home", pred.present.family], ["💼 Career & Status", pred.present.career], ["❤️ Love & Relationships", pred.present.love], ["💰 Finance & Wealth", pred.present.finance], ["🧘 Inner World", pred.present.inner], ["🔲 Lo Shu Grid Analysis", pred.present.loShuReading], ["📆 Personal Year Forecast", pred.present.personalYear]].map(([label, text]) => (
                  <div key={label} className="cd" style={{ marginBottom: "0.55rem" }}>
                    <div style={{ fontFamily: "'Cinzel',serif", color: "#DEB887", fontSize: "0.72rem", marginBottom: "0.45rem", fontWeight: 600 }}>{label}</div>
                    <p style={{ color: "#C8A878", fontSize: "0.82rem", lineHeight: 1.8 }}>{text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* FUTURE */}
            {tab === "future" && (
              <div>
                <div style={{ padding: "0.75rem 0.9rem", border: "1px solid #2a1001", borderRadius: "7px", background: "rgba(255,80,0,0.02)", marginBottom: "0.8rem" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#b87a20", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.35rem" }}>🌟 10 PROPHECIES FOR YOUR FUTURE</div>
                  <p style={{ color: "#7a5020", fontSize: "0.76rem", lineHeight: 1.6 }}>Each prophecy is anchored to an upcoming Dasha period or classical yoga activation — with specific timing. These are derived from this chart's unique planetary architecture, not generic statements.</p>
                </div>
                {pred.future.map((f, i) => (
                  <div key={i} className={`xp ${openFuture === i ? "op" : ""}`} onClick={() => setOpenFuture(openFuture === i ? null : i)}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                      <div style={{ fontFamily: "'Cinzel Decorative',serif", color: "#FFD700", fontSize: "0.85rem", minWidth: "24px", textAlign: "center" }}>{["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][i]}</div>
                      <div style={{ fontFamily: "'Cinzel',serif", color: openFuture === i ? "#FFD700" : "#DEB887", fontSize: "0.8rem", fontWeight: 600, flex: 1, lineHeight: 1.4 }}>{f.title}</div>
                      <div style={{ color: "#6a4010", fontSize: "0.7rem" }}>{openFuture === i ? "▲" : "▼"}</div>
                    </div>
                    {openFuture === i && (
                      <div style={{ marginTop: "0.7rem", paddingTop: "0.7rem", borderTop: "1px solid #2a1001", animation: "fd 0.25s ease" }}>
                        <p style={{ color: "#D4B880", fontSize: "0.84rem", lineHeight: 1.85 }}>{f.body}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* NUMEROLOGY */}
            {tab === "numerology" && (
              <div style={{ animation: "fd 0.4s ease" }}>
                <div style={{ padding: "0.75rem 0.9rem", border: "1px solid #2a1001", borderRadius: "7px", background: "rgba(255,80,0,0.02)", marginBottom: "0.8rem" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#b87a20", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.35rem" }}>🔢 NUMEROLOGY DEEP READING</div>
                  <p style={{ color: "#7a5020", fontSize: "0.76rem", lineHeight: 1.6 }}>Vedic numerology (Ank Jyotish) — Cheiro system integrated with Lo Shu Grid, Kua number, Karmic Debt, and Personal Year analysis.</p>
                </div>
                {/* Moolank & Bhagyank */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem", marginBottom: "0.6rem" }}>
                  {[
                    { label: "Moolank (Psychic №)", value: pred.num.moolank, sub: `Ruled by ${MOOLANK_DATA[pred.num.moolank]?.planet || "—"}` },
                    { label: "Bhagyank (Destiny №)", value: pred.num.bhagyank, sub: pred.num.masterNumber ? `✦ Master Number ${pred.num.masterNumber}` : pred.num.karmicDebt ? `⚠ Karmic Debt ${pred.num.karmicDebt}` : `Life Path` },
                    { label: "Personal Year", value: pred.num.personalYear, sub: `${new Date().getFullYear()} vibration` },
                    { label: "Kua (M / F)", value: `${pred.num.kuaMale} / ${pred.num.kuaFemale}`, sub: "Feng Shui luck direction" },
                  ].map(({ label, value, sub }) => (
                    <div key={label} style={{ border: "1px solid #2a1001", borderRadius: "7px", padding: "0.8rem", background: "rgba(255,100,0,0.03)", textAlign: "center" }}>
                      <div style={{ color: "#5a3a0a", fontSize: "0.58rem", letterSpacing: "0.1em", fontFamily: "'Cinzel',serif", marginBottom: "0.3rem" }}>{label}</div>
                      <div style={{ fontFamily: "'Cinzel Decorative',serif", color: "#FFD700", fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>{value}</div>
                      <div style={{ color: "#7a5020", fontSize: "0.62rem", marginTop: "0.25rem" }}>{sub}</div>
                    </div>
                  ))}
                </div>
                {/* Moolank deep desc */}
                <div className="cd" style={{ marginBottom: "0.55rem" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#DEB887", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.4rem" }}>✦ Moolank {pred.num.moolank} — {MOOLANK_DATA[pred.num.moolank]?.planet}-Ruled Psychic Nature</div>
                  <p style={{ color: "#C8A878", fontSize: "0.82rem", lineHeight: 1.8 }}>{MOOLANK_DATA[pred.num.moolank]?.desc}</p>
                  <div style={{ marginTop: "0.6rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem", fontSize: "0.73rem" }}>
                    {[["Core Traits", MOOLANK_DATA[pred.num.moolank]?.traits], ["Shadow", MOOLANK_DATA[pred.num.moolank]?.shadow], ["Career Paths", MOOLANK_DATA[pred.num.moolank]?.career], ["Love Style", MOOLANK_DATA[pred.num.moolank]?.love], ["Body Areas", MOOLANK_DATA[pred.num.moolank]?.body], ["Lucky Day", MOOLANK_DATA[pred.num.moolank]?.day + " · " + MOOLANK_DATA[pred.num.moolank]?.gem]].map(([k, v]) => (
                      <div key={k} style={{ padding: "0.4rem 0.6rem", background: "rgba(0,0,0,0.15)", borderRadius: "4px", border: "1px solid #1a0800" }}>
                        <div style={{ color: "#7a5020", fontSize: "0.58rem", letterSpacing: "0.08em", fontFamily: "'Cinzel',serif", marginBottom: "0.2rem" }}>{k}</div>
                        <div style={{ color: "#C8A878", lineHeight: 1.5 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Lo Shu Grid */}
                <div className="cd" style={{ marginBottom: "0.55rem" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#DEB887", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.5rem" }}>🔲 Lo Shu Grid — Birth Date Blueprint</div>
                  <div style={{ display: "flex", gap: "1.2rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                    <div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,42px)", gap: "3px", marginBottom: "0.5rem" }}>
                        {[[4, 9, 2], [3, 5, 7], [8, 1, 6]].map((row, ri) => row.map((n, ci) => {
                          const cnt = pred.num.gridCount[n] || 0;
                          return (<div key={`${ri}-${ci}`} style={{ width: "42px", height: "42px", border: `1px solid ${cnt > 0 ? "#b87a20" : "#2a1001"}`, borderRadius: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: cnt > 0 ? "rgba(255,150,0,0.08)" : "rgba(0,0,0,0.2)" }}>
                            <div style={{ fontFamily: "'Cinzel',serif", color: cnt > 1 ? "#FFD700" : cnt === 1 ? "#DEB887" : "#2a1001", fontSize: "1rem", fontWeight: 700, lineHeight: 1 }}>{n}</div>
                            {cnt > 0 && <div style={{ color: "#7a5020", fontSize: "0.5rem" }}>{Array(cnt).fill("·").join("")}</div>}
                          </div>);
                        }))}
                      </div>
                      <div style={{ fontSize: "0.6rem", color: "#5a3010", textAlign: "center" }}>4-9-2 / 3-5-7 / 8-1-6</div>
                    </div>
                    <div style={{ flex: 1, minWidth: "160px" }}>
                      {pred.num.missing_nums.length > 0 && <div style={{ marginBottom: "0.4rem" }}><span style={{ color: "#E05252", fontSize: "0.65rem", fontFamily: "'Cinzel',serif" }}>Missing: </span><span style={{ color: "#C8A878", fontSize: "0.72rem" }}>{pred.num.missing_nums.join(", ")}</span></div>}
                      {pred.num.repeat_nums.length > 0 && <div style={{ marginBottom: "0.4rem" }}><span style={{ color: "#FFD700", fontSize: "0.65rem", fontFamily: "'Cinzel',serif" }}>Repeated: </span><span style={{ color: "#C8A878", fontSize: "0.72rem" }}>{pred.num.repeat_nums.map(r => `${r.n}×${r.c}`).join(", ")}</span></div>}
                      <div style={{ fontSize: "0.65rem", lineHeight: 1.7, color: "#C8A878" }}>{pred.present.loShuReading}</div>
                    </div>
                  </div>
                </div>
                {/* Karmic Debt / Master Number */}
                {(pred.num.karmicDebt || pred.num.masterNumber) && (
                  <div className={`cd ${pred.num.masterNumber ? "ben" : "mal"}`} style={{ marginBottom: "0.55rem" }}>
                    <div style={{ fontFamily: "'Cinzel',serif", color: pred.num.masterNumber ? "#90EE90" : "#FF9999", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                      {pred.num.masterNumber ? `✦ Master Number ${pred.num.masterNumber} — High-Voltage Destiny` : `⚠ Karmic Debt ${pred.num.karmicDebt} — ${KARMIC_DEBT[pred.num.karmicDebt]?.name}`}
                    </div>
                    <p style={{ color: "#C8A878", fontSize: "0.82rem", lineHeight: 1.8 }}>{pred.num.masterNumber ? BHAGYANK_DESC[pred.num.masterNumber] : KARMIC_DEBT[pred.num.karmicDebt]?.warning}</p>
                  </div>
                )}
                {/* Personal Year detail */}
                <div className="cd" style={{ marginBottom: "0.55rem" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#DEB887", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.4rem" }}>📆 Personal Year {pred.num.personalYear} — {new Date().getFullYear()}</div>
                  <p style={{ color: "#C8A878", fontSize: "0.82rem", lineHeight: 1.8 }}>{pred.present.personalYear}</p>
                </div>
                {/* Bhagyank */}
                <div className="cd">
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#DEB887", fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.4rem" }}>✦ Bhagyank {pred.num.bhagyank} — Destiny Path</div>
                  <p style={{ color: "#C8A878", fontSize: "0.82rem", lineHeight: 1.8 }}>{BHAGYANK_DESC[pred.num.bhagyank] || BHAGYANK_DESC[1]}</p>
                </div>
              </div>
            )}

            {/* REMEDIES */}
            {tab === "remedies" && (
              <div>
                <div style={{ padding: "0.75rem 0.9rem", border: "1px solid #2a1001", borderRadius: "7px", background: "rgba(255,80,0,0.02)", marginBottom: "0.8rem" }}>
                  <div style={{ fontFamily: "'Cinzel',serif", color: "#b87a20", fontSize: "0.65rem", letterSpacing: "0.1em", marginBottom: "0.35rem" }}>🙏 VEDIC REMEDIES — SPECIFIC TO THIS CHART</div>
                  <p style={{ color: "#7a5020", fontSize: "0.76rem", lineHeight: 1.6 }}>Remedies target the specific planetary weaknesses detected in this chart using classical Vedic methods.</p>
                </div>
                {pred.remedies.map((r, i) => (
                  <div key={i} className="cd" style={{ marginBottom: "0.55rem" }}>
                    <div style={{ fontFamily: "'Cinzel',serif", color: "#DEB887", fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.45rem" }}>✦ {r.title}</div>
                    <p style={{ color: "#C8A878", fontSize: "0.82rem", lineHeight: 1.8 }}>{r.body}</p>
                  </div>
                ))}
                <div className="cd" style={{ marginTop: "0.7rem", background: "rgba(0,0,0,0.2)", borderColor: "#1a0800" }}>
                  <p style={{ color: "#4a2808", fontSize: "0.7rem", lineHeight: 1.7, fontStyle: "italic" }}>⚠ Disclaimer: These predictions are based on classical Vedic textual rules and should be used as one perspective for self-understanding. Consult a qualified Jyotishi for major life decisions. Gemstone recommendations require in-person expert consultation — incorrect gemstones can produce adverse effects.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
