// ═══════════════════════════════════════════════════
// KUNDALI CALCULATION SERVICE
// Vedic Birth Chart Calculations
// ═══════════════════════════════════════════════════

// CONSTANTS
const RASHI = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
const RASHI_SH = ["Ar", "Ta", "Ge", "Ca", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
const ELEMENTS = ["Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water", "Fire", "Earth", "Air", "Water"];
const PLANETS = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
const PLANET_SH = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"];
const NAKS = ["Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishtha", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"];
const NAK_LORDS = ["Ke", "Ve", "Su", "Mo", "Ma", "Ra", "Ju", "Sa", "Me", "Ke", "Ve", "Su", "Mo", "Ma", "Ra", "Ju", "Sa", "Me", "Ke", "Ve", "Su", "Mo", "Ma", "Ra", "Ju", "Sa", "Me"];
const DASHA_Y = { Ke: 7, Ve: 20, Su: 6, Mo: 10, Ma: 7, Ra: 18, Ju: 16, Sa: 19, Me: 17 };
const DASHA_O = ["Ke", "Ve", "Su", "Mo", "Ma", "Ra", "Ju", "Sa", "Me"];
const DASHA_N = { Ke: "Ketu", Ve: "Venus", Su: "Sun", Mo: "Moon", Ma: "Mars", Ra: "Rahu", Ju: "Jupiter", Sa: "Saturn", Me: "Mercury" };
const PCOL = { Sun: "#FF8C00", Moon: "#AAB8C2", Mars: "#E05252", Mercury: "#52A052", Jupiter: "#D4AC0D", Venus: "#E896B8", Saturn: "#8B7AC8", Rahu: "#888", Ketu: "#A0784A" };
const BENEFICS = ["Jupiter", "Venus", "Moon", "Mercury"];
const MALEFICS = ["Saturn", "Mars", "Sun", "Rahu", "Ketu"];
const EXALT = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6, Rahu: 1, Ketu: 7 };
const DEBIL = { Sun: 6, Moon: 7, Mars: 3, Mercury: 11, Jupiter: 9, Venus: 5, Saturn: 0, Rahu: 7, Ketu: 1 };
const OWN = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };
const RASHI_LD = ["Mars", "Venus", "Mercury", "Moon", "Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Saturn", "Jupiter"];
const HOUSE_SIG = ["Self/body/personality", "Wealth/family/speech", "Siblings/courage/short travel", "Mother/home/property", "Children/intellect/romance", "Enemies/health/debts", "Marriage/partnerships", "Death/transformation/occult", "Father/fortune/religion", "Career/status/authority", "Gains/friends/aspirations", "Losses/spirituality/foreign"];
const KENDRA = [1, 4, 7, 10];
const TRIKONA = [1, 5, 9];
const DUSTHANA = [6, 8, 12];

// ═══════════════════════════════════════════════════
// ASTRONOMY CALCULATIONS
// ═══════════════════════════════════════════════════
const r2d = r => r * 180 / Math.PI;
const d2r = d => d * Math.PI / 180;
const norm = v => ((v % 360) + 360) % 360;

function jd(yr, mo, dy, hr) {
    if (mo <= 2) { yr--; mo += 12; }
    const A = Math.floor(yr / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (yr + 4716)) + Math.floor(30.6001 * (mo + 1)) + dy + hr / 24 + B - 1524.5;
}

function ayamsa(J) { return norm(22.46028 + (J - 2415020) * 50.26 / 3600 / 365.25); }
function sid(lon, J) { return norm(lon - ayamsa(J)); }

function sunLon(J) {
    const T = (J - 2451545) / 36525, L0 = 280.46646 + 36000.76983 * T;
    const M = d2r(norm(357.52911 + 35999.05029 * T));
    return norm(L0 + (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M) + 0.000289 * Math.sin(3 * M));
}

function moonLon(J) {
    const T = (J - 2451545) / 36525, L = 218.3165 + 481267.8813 * T;
    const Mm = d2r(norm(134.9634 + 477198.8676 * T)), D = d2r(norm(297.8502 + 445267.1115 * T));
    const F = d2r(norm(93.2721 + 483202.0175 * T)), M = d2r(norm(357.5291 + 35999.0503 * T));
    return norm(L + 6.2888 * Math.sin(Mm) + 1.274 * Math.sin(2 * D - Mm) + 0.6583 * Math.sin(2 * D)
        + 0.2136 * Math.sin(2 * Mm) - 0.1851 * Math.sin(M) - 0.1143 * Math.sin(2 * F)
        + 0.0588 * Math.sin(2 * D - 2 * Mm) + 0.0533 * Math.sin(2 * D + Mm) + 0.0422 * Math.sin(3 * Mm));
}

function pLon(J, p) {
    const T = (J - 2451545) / 36525;
    const C = {
        Mars: [355.433, 19140.2993, 19.373, 10.691, 0.623],
        Mercury: [252.2509, 149472.6746, 174.7948, 23.44, 2.9818],
        Jupiter: [34.3515, 3034.9057, 20.9, 5.5549, 0.1683],
        Venus: [181.9798, 58517.8157, 50.4161, 0.7758, 0.0033],
        Saturn: [50.0774, 1222.1138, 317.02, 6.3585, 0.2204]
    };
    if (!C[p]) return 0;
    const [L0, n, m0, c1, c2] = C[p], M = d2r(norm(m0 + n * T));
    return norm(L0 + n * T + c1 * Math.sin(M) + c2 * Math.sin(2 * M));
}

function rahuLon(J) { const T = (J - 2451545) / 36525; return norm(125.0445 - 1934.1362 * T + 0.0020708 * T * T); }

function ascLon(J, lat, lng) {
    const T = (J - 2451545) / 36525, lst = norm(100.4606184 + 36000.77004 * T + 0.000387933 * T * T + lng);
    const eps = d2r(23.439291111 - 0.013004167 * T), lstR = d2r(lst), latR = d2r(lat);
    return norm(r2d(Math.atan2(-Math.cos(lstR), Math.sin(eps) * Math.tan(latR) + Math.cos(eps) * Math.sin(lstR))));
}

function isRetro(J, p) {
    if (!["Mars", "Mercury", "Jupiter", "Venus", "Saturn"].includes(p)) return false;
    const diff = norm(pLon(J + 2, p) - pLon(J - 2, p));
    return diff > 180;
}

function dignity(p, r) {
    if (EXALT[p] === r) return "Exalted";
    if (DEBIL[p] === r) return "Debilitated";
    if (OWN[p]?.includes(r)) return "Own Sign";
    const FR = { Sun: [3, 8, 0], Moon: [0, 3], Mars: [8, 11, 4], Mercury: [6, 2], Jupiter: [0, 3, 8], Venus: [9, 10, 6], Saturn: [6, 7, 9] };
    const EN = { Sun: [6, 7, 9, 10], Moon: [7], Mars: [1, 2, 5], Mercury: [7, 8], Jupiter: [1, 2, 5, 6], Venus: [3, 4, 8], Saturn: [0, 3, 4] };
    if (FR[p]?.includes(r)) return "Friendly";
    if (EN[p]?.includes(r)) return "Enemy";
    return "Neutral";
}

// ═══════════════════════════════════════════════════
// MAIN CHART CALCULATION
// ═══════════════════════════════════════════════════
function calcChart(yr, mo, dy, hr, min, tz, lat, lng) {
    let utcH = hr + min / 60 - tz, dd = dy, mm = mo, yy = yr;
    if (utcH < 0) { utcH += 24; dd--; } else if (utcH >= 24) { utcH -= 24; dd++; }
    const J = jd(yy, mm, dd, utcH);
    const trops = {
        Sun: sunLon(J), Moon: moonLon(J), Mars: pLon(J, "Mars"), Mercury: pLon(J, "Mercury"),
        Jupiter: pLon(J, "Jupiter"), Venus: pLon(J, "Venus"), Saturn: pLon(J, "Saturn"), Rahu: rahuLon(J)
    };
    trops.Ketu = norm(trops.Rahu + 180);
    const aT = ascLon(J, lat, lng);
    const pos = {};
    for (const [p, t] of Object.entries(trops)) {
        const lon = sid(t, J), r = Math.floor(lon / 30), deg = lon % 30;
        const ni = Math.floor(lon / (360 / 27)), pada = Math.floor((lon % (360 / 27)) / (360 / 27 / 4)) + 1;
        pos[p] = {
            lon, rashi: r, deg, rashiName: RASHI[r], sh: RASHI_SH[r], nak: NAKS[ni], nakIdx: ni, pada,
            retro: ["Rahu", "Ketu"].includes(p) ? true : isRetro(J, p), dig: dignity(p, r)
        };
    }
    const aL = sid(aT, J), aR = Math.floor(aL / 30);
    pos.Ascendant = {
        lon: aL, rashi: aR, deg: aL % 30, rashiName: RASHI[aR], sh: RASHI_SH[aR],
        nak: NAKS[Math.floor(aL / (360 / 27))], nakIdx: Math.floor(aL / (360 / 27)),
        pada: Math.floor((aL % (360 / 27)) / (360 / 27 / 4)) + 1, retro: false, dig: ""
    };
    return { pos, lagna: aR };
}

// ═══════════════════════════════════════════════════
// HOUSE CALCULATIONS
// ═══════════════════════════════════════════════════
function houseOf(pRashi, lagnaRashi) { return ((pRashi - lagnaRashi + 12) % 12) + 1; }
function houseRashi(h, lr) { return (lr + h - 1) % 12; }
function houseLord(h, lr) { return RASHI_LD[houseRashi(h, lr)]; }

function getPIH(pos, lr) {
    const h = {}; for (let i = 1; i <= 12; i++) h[i] = [];
    for (const p of PLANETS) { const ph = houseOf(pos[p].rashi, lr); h[ph].push(p); }
    return h;
}

function getAspects(pos, lr) {
    const asp = {}; for (let i = 1; i <= 12; i++) asp[i] = [];
    for (const p of PLANETS) {
        const h = houseOf(pos[p].rashi, lr);
        const ts = [((h + 5) % 12) + 1];
        if (p === "Mars") { ts.push(((h + 3) % 12) + 1, ((h + 7) % 12) + 1); }
        if (p === "Jupiter") { ts.push(((h + 4) % 12) + 1, ((h + 8) % 12) + 1); }
        if (p === "Saturn") { ts.push(((h + 2) % 12) + 1, ((h + 9) % 12) + 1); }
        if (["Rahu", "Ketu"].includes(p)) { ts.push(((h + 4) % 12) + 1, ((h + 8) % 12) + 1); }
        for (const t of ts) if (!asp[t].includes(p)) asp[t].push(p);
    }
    return asp;
}

// ═══════════════════════════════════════════════════
// DASHA CALCULATIONS
// ═══════════════════════════════════════════════════
function getDashas(pos, yr, mo, dy) {
    const mL = pos.Moon.lon, ni = Math.floor(mL / (360 / 27)), lord = NAK_LORDS[ni];
    const posIn = (mL % (360 / 27)) / (360 / 27), rem = DASHA_Y[lord] * (1 - posIn);
    const addY = (d, y) => { const n = new Date(d); n.setTime(n.getTime() + y * 365.25 * 86400000); return n; };
    const das = [], si = DASHA_O.indexOf(lord);
    let cur = new Date(yr, mo - 1, dy);
    das.push({ lord, name: DASHA_N[lord], yrs: rem, start: new Date(cur), end: addY(cur, rem) });
    cur = addY(cur, rem);
    for (let i = 1; i <= 8; i++) {
        const l = DASHA_O[(si + i) % 9], y = DASHA_Y[l], end = addY(cur, y);
        das.push({ lord: l, name: DASHA_N[l], yrs: y, start: new Date(cur), end });
        cur = end;
    }
    return das;
}

// ═══════════════════════════════════════════════════
// LOCATION DATA
// ═══════════════════════════════════════════════════
const CITIES = {
    mumbai: [19.07, 72.87], delhi: [28.61, 77.20], kolkata: [22.57, 88.36], chennai: [13.08, 80.27],
    bangalore: [12.97, 77.59], hyderabad: [17.38, 78.48], pune: [18.52, 73.85], nashik: [19.99, 73.79],
    ahmedabad: [23.02, 72.57], jaipur: [26.91, 75.78], lucknow: [26.84, 80.94], varanasi: [25.31, 82.97],
    surat: [21.17, 72.83], indore: [22.71, 75.85], bhopal: [23.25, 77.41], chandigarh: [30.73, 76.77],
    amritsar: [31.63, 74.87], patna: [25.59, 85.13], nagpur: [21.14, 79.08], kochi: [9.93, 76.26],
    guwahati: [26.18, 91.74], bhubaneswar: [20.29, 85.82], "new york": [40.71, -74.00],
    "los angeles": [34.05, -118.24], chicago: [41.87, -87.62], london: [51.50, -0.12],
    toronto: [43.65, -79.38], dubai: [25.20, 55.27], singapore: [1.35, 103.81],
    tokyo: [35.67, 139.65], sydney: [-33.86, 151.20], doha: [25.28, 51.51], riyadh: [24.68, 46.72]
};

const TZS = {
    india: 5.5, mumbai: 5.5, delhi: 5.5, kolkata: 5.5, chennai: 5.5, bangalore: 5.5, hyderabad: 5.5,
    pune: 5.5, nashik: 5.5, ahmedabad: 5.5, jaipur: 5.5, lucknow: 5.5, varanasi: 5.5, surat: 5.5,
    indore: 5.5, bhopal: 5.5, chandigarh: 5.5, amritsar: 5.5, patna: 5.5, nagpur: 5.5, kochi: 5.5,
    guwahati: 5.5, bhubaneswar: 5.5, ist: 5.5, "new york": -5, "los angeles": -8, chicago: -6,
    toronto: -5, london: 0, paris: 1, berlin: 1, dubai: 4, singapore: 8, tokyo: 9, sydney: 10,
    doha: 3, riyadh: 3
};

const getCoords = r => { const k = r.toLowerCase(); for (const [n, v] of Object.entries(CITIES)) if (k.includes(n)) return v; return [22, 78]; };
const getTZ = r => { const k = r.toLowerCase(); for (const [n, v] of Object.entries(TZS)) if (k.includes(n)) return v; return 5.5; };

// ═══════════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ═══════════════════════════════════════════════════
function generateKundali(dob, time, place) {
    const [yr, mo, dy] = dob.split("-").map(Number);
    const [hr, min] = time.split(":").map(Number);
    const tz = getTZ(place);
    const [lat, lng] = getCoords(place);

    const { pos, lagna } = calcChart(yr, mo, dy, hr, min, tz, lat, lng);
    const pih = getPIH(pos, lagna);
    const asp = getAspects(pos, lagna);
    const das = getDashas(pos, yr, mo, dy);

    return {
        pos,
        lagna,
        pih,
        asp,
        das,
        constants: {
            RASHI,
            RASHI_SH,
            ELEMENTS,
            PLANETS,
            PLANET_SH,
            NAKS,
            PCOL,
            BENEFICS,
            MALEFICS,
            KENDRA,
            TRIKONA,
            DUSTHANA,
            HOUSE_SIG,
            RASHI_LD
        }
    };
}

module.exports = {
    generateKundali,
    calcChart,
    getPIH,
    getAspects,
    getDashas,
    houseOf,
    houseRashi,
    houseLord,
    getCoords,
    getTZ,
    // Constants
    RASHI,
    RASHI_SH,
    ELEMENTS,
    PLANETS,
    PLANET_SH,
    NAKS,
    NAK_LORDS,
    DASHA_Y,
    DASHA_O,
    DASHA_N,
    PCOL,
    BENEFICS,
    MALEFICS,
    EXALT,
    DEBIL,
    OWN,
    RASHI_LD,
    HOUSE_SIG,
    KENDRA,
    TRIKONA,
    DUSTHANA
};
