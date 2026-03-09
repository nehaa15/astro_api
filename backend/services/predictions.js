// ═══════════════════════════════════════════════════════════════════════════
// PREDICTIONS ENGINE
// Vedic Astrology + Numerology Deep Reading Generator
// ═══════════════════════════════════════════════════════════════════════════

const {
    RASHI, RASHI_SH, ELEMENTS, PLANETS, BENEFICS, MALEFICS,
    EXALT, DEBIL, RASHI_LD, HOUSE_SIG, KENDRA, TRIKONA, DUSTHANA,
    houseOf, houseRashi, houseLord
} = require('./kundali');

const {
    generateNumerology, MOOLANK_DATA, BHAGYANK_DESC, KARMIC_DEBT, LO_SHU_POSITIONS
} = require('./numerology');

// ═══════════════════════════════════════════════════════════════════════════
// YOGA DETECTION
// ═══════════════════════════════════════════════════════════════════════════
function detectYogas(pos, lr, pih) {
    const yogas = [];
    const H = p => houseOf(pos[p].rashi, lr);
    const HL = h => houseLord(h, lr);

    // Gaja Kesari Yoga
    const jH = H("Jupiter"), mHouse = H("Moon");
    const jmDiff = Math.abs(((jH - mHouse + 12) % 12));
    if ([0, 3, 6, 9].includes(jmDiff) && pos.Jupiter.dig !== "Debilitated") {
        yogas.push({ name: "Gaja Kesari Yoga", type: "benefic", desc: "Jupiter in Kendra from Moon — wisdom, prosperity, and societal respect" });
    }

    // Budha-Aditya Yoga
    if (pos.Sun.rashi === pos.Mercury.rashi) {
        yogas.push({ name: "Budha-Aditya Yoga", type: "benefic", desc: "Sun-Mercury conjunction — sharp intellect, communication mastery, analytical brilliance" });
    }

    // Chandra-Mangal Yoga
    if (pos.Moon.rashi === pos.Mars.rashi) {
        yogas.push({ name: "Chandra-Mangal Yoga", type: "mixed", desc: "Moon-Mars conjunction — fierce entrepreneurial drive, emotional intensity, volatile brilliance" });
    }

    // Gauri Yoga
    if (pos.Moon.rashi === pos.Jupiter.rashi) {
        yogas.push({ name: "Gauri Yoga", type: "benefic", desc: "Moon-Jupiter conjunction — grace, spiritual wisdom, popular respect and goodness of character" });
    }

    // Brahma Yoga
    if (pos.Sun.rashi === pos.Jupiter.rashi) {
        yogas.push({ name: "Brahma Yoga", type: "benefic", desc: "Sun-Jupiter conjunction — dharmic authority, philosophical wisdom, natural command of respect" });
    }

    // Lakshmi-Narayana Yoga
    if (pos.Venus.rashi === pos.Jupiter.rashi) {
        yogas.push({ name: "Lakshmi-Narayana Yoga", type: "benefic", desc: "Venus-Jupiter conjunction — material and spiritual prosperity intertwined" });
    }

    // Kaal Sarpa Dosha
    const norm = v => ((v % 360) + 360) % 360;
    const ra = pos.Rahu.lon, ke = pos.Ketu.lon, span = norm(ke - ra);
    if (PLANETS.filter(p => !["Rahu", "Ketu"].includes(p)).every(p => { const d = norm(pos[p].lon - ra); return d < span; })) {
        yogas.push({ name: "Kaal Sarpa Dosha", type: "malefic", desc: "All planets between Rahu-Ketu — karmic intensity, cyclical obstacles, but potential for dramatic reversals of fate" });
    }

    // Mahapurusha Yogas
    const pmCfg = {
        Mars: { name: "Ruchika", s: [0, 9] },
        Mercury: { name: "Bhadra", s: [2, 5] },
        Jupiter: { name: "Hamsa", s: [3, 8, 11] },
        Venus: { name: "Malavya", s: [1, 6, 11] },
        Saturn: { name: "Shasha", s: [6, 9, 10] }
    };
    for (const [p, c] of Object.entries(pmCfg)) {
        if (c.s.includes(pos[p].rashi) && KENDRA.includes(H(p))) {
            yogas.push({ name: `${c.name} Mahapurusha Yoga`, type: "benefic", desc: `${p} in Kendra in own/exalted sign — one of the five royal configurations described in BPHS` });
        }
    }

    // Raj Yoga
    let rajYoga = false;
    for (const tk of [5, 9]) {
        for (const kn of [4, 7, 10]) {
            const tl = HL(tk), kl = HL(kn);
            if (tl !== kl && (H(tl) === kn || H(kl) === tk || pos[tl].rashi === pos[kl].rashi)) rajYoga = true;
        }
    }
    if (rajYoga) {
        yogas.push({ name: "Raj Yoga", type: "benefic", desc: "Trikona-Kendra lord connection — authority, public recognition, leadership rising above birth circumstances" });
    }

    // Dhana Yoga
    const l2 = H(HL(2)), l11 = H(HL(11));
    if (TRIKONA.includes(l2) || KENDRA.includes(l2) || TRIKONA.includes(l11) || KENDRA.includes(l11)) {
        yogas.push({ name: "Dhana Yoga", type: "benefic", desc: "2nd/11th lords in favorable positions — genuine wealth accumulation over the lifetime" });
    }

    // Vipreet Raj Yoga
    if (DUSTHANA.includes(H(HL(6))) || DUSTHANA.includes(H(HL(8))) || DUSTHANA.includes(H(HL(12)))) {
        yogas.push({ name: "Vipreet Raj Yoga", type: "benefic", desc: "Dusthana lords confined to dusthanas — adversity becomes the source of unexpected power" });
    }

    // Mangal Dosha
    const marsH = H("Mars");
    if ([1, 2, 4, 7, 8, 12].includes(marsH)) {
        yogas.push({ name: "Mangal Dosha", type: "malefic", desc: `Mars in ${marsH}th house — passionate intensity in partnerships, karmic testing through relationships` });
    }

    // Neechabhanga
    for (const p of PLANETS) {
        if (pos[p].dig === "Debilitated") {
            const debilLord = RASHI_LD[DEBIL[p]];
            if (debilLord && (KENDRA.includes(H(debilLord)) || pos[debilLord].dig === "Exalted")) {
                yogas.push({ name: `Neechabhanga Raj Yoga (${p})`, type: "benefic", desc: `${p}'s debilitation is cancelled by its dispositor's strength — weakness transmuted to power` });
            }
        }
    }

    return yogas;
}

// ═══════════════════════════════════════════════════════════════════════════
// SOUL SIGNATURE GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
function generateSoulSignature(pos, lr, name, num) {
    const lagnaDesc = {
        Aries: "a warrior-pioneer soul, born to initiate and lead — your dharma is to be first, to break ground, to act where others hesitate",
        Taurus: "a builder soul grounded in beauty and material mastery — your dharma is to create lasting value, to ground the sublime in physical form",
        Gemini: "a communicator soul gifted with language and dual perception — your dharma is to connect, to synthesize, to translate between worlds",
        Cancer: "a nurturer soul of profound intuition and emotional memory — your dharma is to create home, to hold space, to remember what others forget",
        Leo: "a royal soul born to radiate, create, and lead through dignity — your dharma is to shine genuinely, not for applause but as a natural expression of your solar nature",
        Virgo: "a healer-analyst soul called to serve, perfect, and discern — your dharma is to make things better, one precise intervention at a time",
        Libra: "a diplomat soul seeking justice and balance through relationships — your dharma is to reveal that harmony is not the absence of conflict but its conscious resolution",
        Scorpio: "a transformer soul drawn to hidden truths, depth, and regeneration — your dharma is to die and be reborn as many times as it takes to reach the authentic core",
        Sagittarius: "a philosopher soul pursuing higher truth, wisdom, and freedom — your dharma is to aim the arrow of consciousness as high as it can fly",
        Capricorn: "an architect soul building lasting structures through discipline — your dharma is to demonstrate that patient, principled effort creates more than any shortcut",
        Aquarius: "a visionary soul wired to innovate and serve the collective — your dharma is to live in the future and pull the present toward it",
        Pisces: "a mystic soul dissolving ego toward boundless compassion — your dharma is to remind the world that there is more to existence than what can be seen and measured"
    };

    const moonDesc = {
        Aries: "an impulsive, action-driven, emotionally direct mind — you feel your way by doing, not waiting",
        Taurus: "a stable, comfort-seeking, deeply attached mind — your emotions are slow to arrive but volcanic once there",
        Gemini: "a curious, scattered, perpetually stimulated mind — you feel through thought, a blessing and a restlessness",
        Cancer: "a hyper-sensitive, deeply intuitive, memory-rich mind — you carry every emotional impression like a living archive",
        Leo: "a dramatic, warm-hearted, recognition-hungry mind — your feelings are performances of the self, genuine and theatrical at once",
        Virgo: "an analytical, self-critical, detail-obsessed mind — you worry because you care; the anxiety is love wearing the wrong costume",
        Libra: "a harmony-seeking, relationally dependent, exquisitely fair mind — you feel most yourself in the space between yourself and others",
        Scorpio: "an intense, secretive, obsessive mind carrying volcanic emotional depths — you forgive but never forget, and the ledger is always open",
        Sagittarius: "an optimistic, freedom-loving, philosophically anchored mind — you feel best when moving toward something larger than yourself",
        Capricorn: "a reserved, duty-driven, emotionally controlled mind carrying hidden burdens that would crush others — your stoicism is both armor and prison",
        Aquarius: "a detached, humanitarian, emotionally unconventional mind — you love humanity abstractly and individuals with difficulty",
        Pisces: "a dreamy, boundaryless, compassionate mind that absorbs everything and belongs to nothing — the most psychically permeable of all Moon signs"
    };

    const H = p => houseOf(pos[p].rashi, lr);
    const HL = h => houseLord(h, lr);
    const lagL = HL(1), lagLH = H(lagL);
    const moonRashi = pos.Moon.rashi, moonNak = pos.Moon.nak, ascNak = pos.Ascendant.nak;
    const ketuH = H("Ketu"), rahuH = H("Rahu");
    const mData = MOOLANK_DATA[num.moolank] || MOOLANK_DATA[1];
    const bDesc = BHAGYANK_DESC[num.bhagyank] || BHAGYANK_DESC[1];

    const numAstroSynth = `Numerologically, ${name} carries a Moolank (Psychic Number) of ${num.moolank} — ruled by ${mData.planet}. ${RASHI[lr]} Lagna is ruled by ${lagL}, creating ${lagL === mData.planet ? "a remarkable resonance — the same planetary energy governs both the outer personality and the inner psychic nature, amplifying its qualities to extraordinary levels" : `a complementary interplay between the outer ${lagL} personality and the inner ${mData.planet} psychic nature`}. The Bhagyank (Destiny Number) is ${num.bhagyank}${[11, 22, 33].includes(num.bhagyank) ? " — a Master Number, indicating a soul that has opted for an accelerated, high-stakes evolutionary path" : ""} — ${bDesc.split(".")[0].toLowerCase()}.${num.karmicDebt ? ` The birth date carries Karmic Debt ${num.karmicDebt}: ${KARMIC_DEBT[num.karmicDebt].warning.split(".")[0]}.` : ""}`;

    const loShuLine = `The Lo Shu Grid of this birth date reveals: ${num.missing_nums.length > 0 ? `the numbers ${num.missing_nums.join(", ")} are absent — karmic voids requiring conscious cultivation` : "all numbers present, indicating a broadly equipped soul"}. ${num.repeat_nums.length > 0 ? `Repeated numbers (${num.repeat_nums.map(r => `${r.n}×${r.c}`).join(", ")}) indicate intensified ${num.repeat_nums.map(r => LO_SHU_POSITIONS[r.n]?.plane || "").filter(Boolean).join("/")} plane energy.` : ""} The Thought Plane (1-2-3: ${num.thoughtPlane.length > 0 ? `activated by ${num.thoughtPlane.join(",")}` : "dormant — logic and analysis require deliberate development"}) governs analytical intelligence; the Will Plane (4-5-6: ${num.willPlane.length > 0 ? `active with ${num.willPlane.join(",")}` : "requiring strengthening"}) governs determination; the Action Plane (7-8-9: ${num.actionPlane.length > 0 ? `driven by ${num.actionPlane.join(",")}` : "needing activation"}) governs practical execution.`;

    const soulText = `${name} is ${lagnaDesc[RASHI[lr]] || "a complex soul"}. The Ascendant in ${RASHI[lr]} (${ascNak} Nakshatra, ${ELEMENTS[lr]} element) sets the outer personality and life trajectory. The Lagna lord ${lagL} placed in the ${lagLH}th house directs life's core energy toward ${HOUSE_SIG[lagLH - 1]}. The Moon in ${RASHI[moonRashi]} (${moonNak}) reveals ${moonDesc[RASHI[moonRashi]] || "a complex emotional nature"}. Ketu in the ${ketuH}th house shows deep past-life mastery in ${HOUSE_SIG[ketuH - 1]}, while Rahu's hunger in the ${rahuH}th house (${HOUSE_SIG[rahuH - 1]}) represents the burning karmic desire of this incarnation.\n\n${numAstroSynth}\n\n${loShuLine}`;

    return soulText;
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESENT ANALYSIS GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
function generatePresentAnalysis(pos, lr, pih, asp, das, num, name) {
    const today = new Date();
    const cd = das.find(d => d.start <= today && d.end >= today);
    const nd = das[das.indexOf(cd) + 1];
    const cl = cd?.lord;
    const SHORT_TO_FULL = { Su: "Sun", Mo: "Moon", Ma: "Mars", Me: "Mercury", Ju: "Jupiter", Ve: "Venus", Sa: "Saturn", Ra: "Rahu", Ke: "Ketu" };
    const clFull = cl ? SHORT_TO_FULL[cl] || cl : null;
    const fmt = d => d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });

    const H = p => houseOf(pos[p].rashi, lr);
    const HL = h => houseLord(h, lr);
    const cdH = clFull ? H(clFull) : 1;
    const cdDig = clFull ? pos[clFull]?.dig : "";
    const pyDesc = num.pyTheme[num.personalYear] || "a complex transitional year";

    const hasMal = h => (pih[h] || []).some(p => MALEFICS.includes(p));
    const hasBen = h => (pih[h] || []).some(p => BENEFICS.includes(p));
    const aspMal = h => (asp[h] || []).some(p => MALEFICS.includes(p));
    const h7l = HL(7), h7lH = H(h7l);

    const dashaChars = {
        Su: `stepping into authority, identity, and visibility — the Sun demands that ${name} stop making themselves smaller than they are`,
        Mo: "emotional tides, family dynamics, and the inner world — the Moon period asks that the interior landscape be honored as seriously as the exterior",
        Ma: "decisive action, ambition, courage, and property — Mars does not wait and does not forgive hesitation",
        Me: "communication, commerce, skill development, and networking — the Mercury period rewards precise thinking and strategic relationship cultivation",
        Ju: "expansion, wisdom, grace, and dharmic alignment — the Jupiter period is classically associated with increase in every domain aligned with one's authentic purpose",
        Ve: "beauty, love, creative expression, and the quality of daily life — Venus asks: are you living beautifully, loving fully, creating consistently?",
        Sa: "karma, patience, foundations, and confrontation with what is truly real — Saturn strips away everything inessential and demands that what remains be worthy of it",
        Ra: "ambition beyond conventional maps, identity reinvention, foreign elements, and the specific hunger of the soul's evolutionary edge",
        Ke: "spiritual turning points, detachment, past-life patterns surfacing for integration, and the luminous peace of non-attachment"
    };

    const cdChar = dashaChars[cl] || "multi-domain complexity";

    const presMain = `${name} is currently in the ${cd?.name || "?"} Mahadasha (until ${cd ? fmt(cd.end) : "unknown"}). ${cdChar.replace(`${name}`, name)}. The Dasha lord ${cd?.name} sits in the ${cdH}th house (${HOUSE_SIG[cdH - 1]}) in ${cdDig || "its current"} state — so these themes activate specifically through the lens of ${HOUSE_SIG[cdH - 1]}. Numerologically, ${name} is in a Personal Year ${num.personalYear} — a year of ${pyDesc}. ${nd ? `The ${nd.name} Mahadasha begins ${fmt(nd.start)}, shifting the dominant theme toward ${dashaChars[nd.lord]?.split("—")[0].replace(`${name}`, name) || ""}.` : ""}`;

    const satAsp7 = (asp[7] || []).includes("Saturn");
    const mData = MOOLANK_DATA[num.moolank] || MOOLANK_DATA[1];
    const bDesc = BHAGYANK_DESC[num.bhagyank] || BHAGYANK_DESC[1];

    const present = {};

    present.family = `${hasMal(4) || (asp[4] || []).some(p => ["Saturn", "Rahu"].includes(p)) ? "The 4th house carries active tension — family dynamics may be strained, a parental health situation may require attention, or the domestic environment is in a period of restructuring." : "Benefic 4th house energy creates a currently supportive home environment. Family bonds are either harmonious or actively being strengthened."} Numerologically, Personal Year ${num.personalYear} ${num.personalYear === 6 ? "specifically activates family, home, and responsibility — this is a year where domestic matters deserve and receive primary attention" : "colors the family arena with its specific quality of " + pyDesc.split("—")[0].toLowerCase()}.`;

    const careerActive = clFull === HL(10) || cdH === 10 || cl === "Su" || clFull === HL(1);
    present.career = `${careerActive ? "The current Mahadasha powerfully activates career themes — this is a pivotal professional window. Opportunities for recognition, authority, or significant career movement are live." : cl === "Sa" || cl === "Ra" || cl === "Ke" ? "The " + cd?.name + " Mahadasha brings career transformation rather than linear advancement. Professional direction may be fundamentally questioned." : "Career during the " + cd?.name + " Mahadasha is " + ((cl === "Ju" || cl === "Ve") ? "genuinely favorable — expansion and growth are natural byproducts" : "steady and developmental") + "."} Numerologically, ${num.bhagyank === 1 || num.bhagyank === 8 || num.bhagyank === 22 ? "Bhagyank " + num.bhagyank + " is specifically the executive number — authority, achievement, and professional recognition are literal destiny requirements." : "Personal Year " + num.personalYear + " intersects with the professional sphere."}.`;

    const loveDashaActive = clFull === h7l || cl === "Ve" || cdH === 7;
    present.love = `${loveDashaActive ? "Venus or the 7th lord being activated by the current Dasha makes relationships the primary arena of life right now. A significant romantic development is either underway or imminent." : satAsp7 && (cl === "Sa" || cl === "Ke") ? "Saturn's involvement in the current Dasha creates a serious reckoning in the relationship sphere. What is real in current or potential partnerships will be made unmistakably clear." : "The relationship sector is relatively quiet compared to other life areas in this Dasha — but evolving internally."} Numerologically, Moolank ${num.moolank} as the psychic number governs the emotional nature and relational style: ${mData.love}.`;

    present.finance = `${["Ju", "Ve"].includes(cl) ? "Financial energy is strongly activated. Income streams may multiply; investments have good potential. The equal and opposite risk is overspending at the same rate as earning." : DUSTHANA.includes(cdH) || cl === "Sa" || cl === "Ke" ? "The current Dasha carries financial restriction or unexpected expenses. This is specifically not the period for speculative investment." : "Financial life during the " + cd?.name + " Mahadasha is stable with gradual growth."} Numerologically, ${num.bhagyank === 8 || num.bhagyank === 4 ? "Bhagyank " + num.bhagyank + " carries the specific financial destiny of the disciplined accumulator." : "Personal Year " + num.personalYear + " intersects with finance."}.`;

    present.inner = `${cl === "Ke" || H("Ketu") === 1 || H("Ketu") === 12 ? "Ketu's activation creates a powerful internal pull toward introspection, spiritual questioning, and releasing identities that no longer serve." : cl === "Ju" || H("Jupiter") === 1 ? "Jupiter's activation brings genuine wisdom expansion and inner lightening. Increased faith in life's larger design, natural movement toward teaching or mentoring others." : "The inner world during the " + cd?.name + " Mahadasha reflects that planet's quality — " + cdChar.split(",")[0] + "."} Numerologically, Moolank ${num.moolank}: ${mData.desc.split(".")[0]}.`;

    present.loShuReading = `Lo Shu Grid Analysis — ${name}'s Birth Date Numerological Map: The present numbers (${num.present_nums.join(", ")}) form ${num.thoughtPlane.length === 3 ? "a complete Mental Plane (1-2-3) — exceptional intellectual capacity" : num.thoughtPlane.length > 0 ? "a partial Mental Plane with " + num.thoughtPlane.join(",") + " active" : ""} ${num.willPlane.length === 3 ? ", a complete Will Plane (4-5-6) — extraordinary determination" : num.willPlane.length > 0 ? ", with Will Plane numbers " + num.willPlane.join(",") + " providing determination" : ""} ${num.actionPlane.length === 3 ? ", and a complete Action Plane (7-8-9) — powerful executive energy" : num.actionPlane.length > 0 ? ", and Action Plane numbers " + num.actionPlane.join(",") + " driving practical engagement" : ""}.`;

    present.personalYear = `Personal Year ${num.personalYear} Analysis: ${pyDesc}. This year specifically for ${name}: ${getPersonalYearGuidance(num.personalYear, num, name)}.`;

    return { presMain, present, currentDasha: cd, nextDasha: nd };
}

function getPersonalYearGuidance(py, num, name) {
    const guidance = {
        1: "New beginnings are available. The seeds planted in the first three months of this Personal Year will determine the harvest of the next nine-year cycle. Bold, initiated action is specifically rewarded.",
        2: "Patience is not passivity in a 2 Year — it is the active cultivation of connection, depth, and receptivity. Relationships and partnerships initiated or deepened this year carry unusual longevity.",
        3: "This is a year of legitimate self-expression and social expansion. The creative projects, public communications, and joyful connections initiated in a 3 Year have a quality of effortlessness.",
        4: "The 4 Year is not glamorous but it is foundational. The systems built, the skills deepened, the habits established this year will carry the next four years of the cycle.",
        5: "The 5 Year is the freedom year — the universe is offering breaks from established patterns, unexpected opportunities, and the specific gift of expanded perception through varied experience.",
        6: "The 6 Year organizes around love, beauty, responsibility, and home. Family demands increase; creative and aesthetic projects flourish.",
        7: "The 7 Year asks you to go in. Spiritual deepening, philosophical study, solitary reflection, and genuine rest are not retreats from life but the year's specific agenda.",
        8: "This is the power year — the peak of the nine-year cycle for achievement, financial initiative, and professional authority. The moves made in an 8 Year have ten times the impact.",
        9: "The 9 Year is the great release. What has served its purpose must be completed and relinquished — relationships, projects, beliefs, identities."
    };
    return guidance[py] || "a complex transitional period";
}

// ═══════════════════════════════════════════════════════════════════════════
// PAST REVELATIONS GENERATOR (Simplified)
// ═══════════════════════════════════════════════════════════════════════════
function generatePastRevelations(pos, lr, pih, asp, num, name, birthYr, birthMo, birthDy) {
    const today = new Date();
    const age = today.getFullYear() - birthYr - (today < new Date(today.getFullYear(), birthMo - 1, birthDy) ? 1 : 0);
    const H = p => houseOf(pos[p].rashi, lr);
    const HL = h => houseLord(h, lr);
    const mData = MOOLANK_DATA[num.moolank] || MOOLANK_DATA[1];
    const malInH = h => (pih[h] || []).filter(p => MALEFICS.includes(p));
    const benInH = h => (pih[h] || []).filter(p => BENEFICS.includes(p));

    const past = [];

    // Past 1 - Childhood
    const malIn4 = malInH(4), benIn4 = benInH(4);
    const h4l = HL(4), h4lH = H(h4l);
    if (malIn4.length > 0 || DUSTHANA.includes(h4lH)) {
        past.push({
            title: "A Childhood That Taught You to Build Your Own Inner World",
            body: `The 4th house carries ${malIn4.length > 0 ? malIn4.join(" and ") + " within it" : `its lord ${h4l} in the ${h4lH}th house`}. This is not a configuration of a sheltered, uncomplicated childhood. This creates what might be called an emotionally self-sufficient adult — someone who learned very early that the interior landscape must be tended personally. Numerologically, Moolank ${num.moolank} — ruled by ${mData.planet} — adds its own texture to the childhood landscape.`
        });
    } else {
        past.push({
            title: "A Childhood That Gave You the Roots to Reach Anywhere",
            body: `The 4th house with ${benIn4.length > 0 ? benIn4.join(" and ") + " present" : `its lord ${h4l} in the strong ${h4lH}th house`} indicates a childhood characterized by real warmth, safety, and a mother who saw you. The childhood home was likely a space of beauty, learning, or cultural richness.`
        });
    }

    // Past 2 - Education
    const jupH = H("Jupiter"), merH = H("Mercury"), merDig = pos.Mercury.dig;
    if (merDig === "Exalted" || merDig === "Own Sign" || (TRIKONA.includes(jupH) || KENDRA.includes(jupH))) {
        past.push({
            title: "A Mind That Has Always Been Several Steps Ahead",
            body: `Mercury ${merDig === "Exalted" ? "exalted in Virgo — the pinnacle of analytical precision" : merDig === "Own Sign" ? "in own sign — fully at home in its intellectual gifts" : "well-placed"} in the ${merH}th house indicates a mind that was measurably different from peers from a young age. Teachers likely noticed. Numerologically, Moolank ${num.moolank} adds ${mData.planet === "Mercury" ? "Mercury's own quicksilver intelligence — doubling the mental gifts" : "its own cognitive signature to this profile"}.`
        });
    } else {
        past.push({
            title: "An Intelligence That Deepens With Every Decade",
            body: `Mercury in the ${merH}th house (${RASHI[pos.Mercury.rashi]}) shaped a mind profoundly oriented toward ${HOUSE_SIG[merH - 1]}. Each year of life adds a layer of understanding that the previous year's experience alone could not have produced. By now (age ${age}), there is a depth of understanding in your domain that others find difficult to match.`
        });
    }

    // Past 3 - Siblings
    const malIn3 = malInH(3), benIn3 = benInH(3);
    const h3l = HL(3), h3lH = H(h3l);
    past.push({
        title: malIn3.length > 0 ? "Siblings and Peers — Relationships That Forged You in Fire" : "A Sibling Bond (or Peer Circle) That Became a Lifelong Anchor",
        body: malIn3.length > 0 ?
            `The 3rd house governs siblings, the immediate peer environment, and courage. ${malIn3.length > 0 ? `The presence of ${malIn3.join(" and ")} in the 3rd house creates a competitive sibling or peer dynamic` : `The 3rd lord ${h3l} in the ${h3lH}th house adds friction`}. This early experience of needing to assert and compete produced a specific quality of courage — not the courage that comes from confidence, but the harder, more genuine courage that comes from having survived conflict.` :
            `The 3rd house with ${benIn3.length > 0 ? benIn3.join(" and ") + " present" : `its lord ${h3l} in the strong ${h3lH}th house`} indicates that the sibling relationship or early peer group was a genuine source of support. These early bonds modeled what genuine collaboration and belonging look like.`
    });

    // Past 4 - Father/Fortune
    const malIn9 = malInH(9), sunH = H("Sun"), sunDig = pos.Sun.dig;
    const h9l = HL(9), h9lH = H(h9l);
    past.push({
        title: malIn9.length > 0 || DUSTHANA.includes(h9lH) ? "The Father Wound — and the Self-Made Fortune That Answered It" : "A Protective Father and the Inheritance of Grace",
        body: malIn9.length > 0 || DUSTHANA.includes(h9lH) ?
            `The 9th house — governing father, guru, fortune, and philosophy — carries difficulty in this chart. ${malIn9.length > 0 ? malIn9.join(" and ") + " in the 9th house" : `The 9th lord ${h9l} in the ${h9lH}th house — a dusthana`} is the classical indicator of a father who was either absent, limited, or whose presence created more burden than blessing. Numerologically, ${num.bhagyank === 8 || num.bhagyank === 4 ? `Bhagyank ${num.bhagyank} resonates with this configuration` : "the numerological blueprint confirms that fortune in this chart is self-generated"}.` :
            `Sun ${sunDig === "Exalted" ? "exalted in Aries" : sunDig === "Own Sign" ? "in Leo — in its own regal domain" : "strong"} in the ${sunH}th house indicates a father whose presence was genuinely beneficial. This chart carries what classical texts call innate Bhagya — a quality of fortune that feels almost structural.`
    });

    // Past 5 - Health
    const malIn6 = malInH(6), benIn6 = benInH(6);
    past.push({
        title: malIn6.length > 0 ? "A Body That Has Carried More Than Its Share" : "A Constitution Built for the Long Game",
        body: malIn6.length > 0 ?
            `The 6th house contains ${malIn6.join(" and ")} in ${name}'s chart. The 6th house is one of the Upachaya houses — houses that improve over time. Malefics in the 6th counterintuitively often produce exceptional fighters: people who develop genuine health consciousness. Numerologically, ${mData.body} — the body parts governed by Moolank ${num.moolank}'s ruling planet ${mData.planet} — are particularly worth monitoring.` :
            `Jupiter or Venus in the 6th house, or the 6th lord strongly placed, creates what classical texts call a naturally strong constitution — a body that tends toward resilience, recovers well from illness, and ages with grace.`
    });

    // Add more past revelations (simplified versions)
    past.push({
        title: "Creative Gifts That Define Your Soul's Expression",
        body: `The 5th house — the house of creative intelligence, romance, children, and past-life merit — ${pih[5].length > 0 ? `contains ${pih[5].join(", ")}` : `has its lord ${HL(5)} in the ${H(HL(5))}th house`}. The hidden talent in this chart is almost certainly creative or expressive. Numerologically, ${num.moolank === 3 || num.moolank === 6 ? `Moolank ${num.moolank} doubled down on this creative signature` : "your numerological profile adds specific texture to the creative expression"}.`
    });

    past.push({
        title: "Love Has Been Your Greatest Teacher",
        body: `The 7th house (${RASHI[houseRashi(7, lr)]}) with lord ${HL(7)} in the ${H(HL(7))}th house shapes the relationship story. Every significant partner has held up a specific mirror — reflecting back a particular aspect of ${name}'s unintegrated material. Numerologically, Moolank ${num.moolank}'s relational style — ${mData.love} — is the inner compass for this domain.`
    });

    past.push({
        title: "Career Has Been a Journey of Self-Discovery",
        body: `The 10th house (${RASHI[houseRashi(10, lr)]}) ${pih[10].length > 0 ? `with ${pih[10].join(", ")}` : `with lord ${HL(10)} in the ${H(HL(10))}th house`} indicates a professional life moving progressively toward genuine alignment. Each role, each industry, each professional relationship has added a specific capability. By age ${age}, the professional story reveals a coherent narrative.`
    });

    past.push({
        title: "The Depths You've Explored — Transformation Through Crisis",
        body: `The 8th house (${RASHI[houseRashi(8, lr)]}) governs transformation, the occult, death and rebirth. ${pih[8].length > 0 ? `With ${pih[8].join(", ")} present` : `With its lord ${HL(8)} in the ${H(HL(8))}th house`}, the 8th house themes have been more than theoretical for ${name}. They have been lived. Numerologically, ${num.moolank === 7 ? "Moolank 7 creates a natural resonance with the 8th house's depth" : "your numerological profile intersects with the 8th house's lessons"}.`
    });

    past.push({
        title: `The Karmic Axis: From ${RASHI[pos.Ketu.rashi]} Mastery Toward ${RASHI[pos.Rahu.rashi]} Destiny`,
        body: `The Rahu-Ketu axis is the spine of the soul's evolutionary journey. Ketu in ${RASHI[pos.Ketu.rashi]} (${H("Ketu")}th house) represents deep mastery carried from previous lives. Rahu in ${RASHI[pos.Rahu.rashi]} (${H("Rahu")}th house) is the magnetic north of this lifetime's soul journey — the direction of growth. Numerologically, the Bhagyank ${num.bhagyank} and this Rahu-Ketu axis together form the complete statement of soul purpose.`
    });

    return past;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUTURE PROPHECIES GENERATOR (Simplified)
// ═══════════════════════════════════════════════════════════════════════════
function generateFutureProphecies(pos, lr, pih, asp, das, yogas, num, name, birthYr, birthMo, birthDy) {
    const today = new Date();
    const age = today.getFullYear() - birthYr - (today < new Date(today.getFullYear(), birthMo - 1, birthDy) ? 1 : 0);
    const H = p => houseOf(pos[p].rashi, lr);
    const HL = h => houseLord(h, lr);
    const SHORT_TO_FULL = { Su: "Sun", Mo: "Moon", Ma: "Mars", Me: "Mercury", Ju: "Jupiter", Ve: "Venus", Sa: "Saturn", Ra: "Rahu", Ke: "Ketu" };
    const fmt = d => d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const futureDashas = das.filter(d => d.start > today);
    const mData = MOOLANK_DATA[num.moolank] || MOOLANK_DATA[1];
    const bDesc = BHAGYANK_DESC[num.bhagyank] || BHAGYANK_DESC[1];
    const h10l = HL(10), h7l = HL(7);

    const future = [];

    // Future 1 - Career Peak
    const cDasha = futureDashas.find(d => SHORT_TO_FULL[d.lord] === h10l || H(SHORT_TO_FULL[d.lord] || d.lord) === 10 || d.lord === "Su");
    if (cDasha) {
        const yAway = ((cDasha.start - today) / (365.25 * 86400000)).toFixed(1);
        future.push({
            title: `The Professional Peak — ${cDasha.name} Mahadasha (${fmt(cDasha.start)}, ~${yAway} Years)`,
            body: `The ${cDasha.name} Mahadasha represents the most significant career window visible in this chart's future. ${yogas.some(y => y.name === "Raj Yoga") ? "The Raj Yoga activates fully during this period — authority, recognition, and positions of genuine leadership become not just possible but likely." : "Every indicator points toward professional advancement."} Numerologically, ${num.bhagyank === 1 || num.bhagyank === 8 ? `Bhagyank ${num.bhagyank} is the executive destiny signature` : `Personal Year calculations during this period will create windows of extraordinary professional momentum`}.`
        });
    } else {
        future.push({
            title: "Professional Fulfillment Through Current Development",
            body: `The most potent career activation in the near-term future is not in a future Dasha but in the deepening and completion of the current phase. The professional seeds being planted now will determine the ceiling available in the next career-activating cycle. Numerologically, Bhagyank ${num.bhagyank} promises ${bDesc.split(".")[0].toLowerCase()}.`
        });
    }

    // Future 2 - Partnership
    const vDasha = futureDashas.find(d => d.lord === "Ve");
    const h7Dasha = futureDashas.find(d => SHORT_TO_FULL[d.lord] === h7l);
    const tDasha = [vDasha, h7Dasha].filter(Boolean).sort((a, b) => a.start - b.start)[0];
    if (tDasha) {
        const yAway = ((tDasha.start - today) / (365.25 * 86400000)).toFixed(1);
        future.push({
            title: `Sacred Partnership — The ${tDasha.name} Dasha Union (${fmt(tDasha.start)})`,
            body: `The ${tDasha.name} Mahadasha (${fmt(tDasha.start)}, ~${yAway} years) activates the 7th house with all of its potential. This is the prophecy of a relationship that changes everything. Numerologically, ${num.moolank === 6 || num.moolank === 2 ? `Moolank ${num.moolank} is arriving at its fullest expression during this Dasha` : "the Kua number provides directional guidance for the partner's arrival"}.`
        });
    }

    // Future 3 - Wealth
    const dhana = yogas.some(y => y.name === "Dhana Yoga");
    const wDasha = futureDashas.find(d => ["Ve", "Ju"].includes(d.lord));
    if (dhana && wDasha) {
        const yAway = ((wDasha.start - today) / (365.25 * 86400000)).toFixed(1);
        future.push({
            title: `The Dhana Yoga Activates — Wealth in the ${wDasha.name} Period`,
            body: `The Dhana Yoga in this chart has a specific activation window: the ${wDasha.name} Mahadasha (${fmt(wDasha.start)}, ~${yAway} years). The classical signature of multiple income streams opening, investment vehicles maturing, or a significant upward shift in earning capacity. Numerologically, ${num.bhagyank === 8 || num.bhagyank === 6 ? `Bhagyank ${num.bhagyank} is specifically a wealth-generating destiny signature` : "the preparation done now determines how much this favorable Dasha converts into lasting wealth"}.`
        });
    } else {
        future.push({
            title: "The Architecture of Abundance — Built Systematically",
            body: `The wealth indicators in this chart favor the consistent architect over the spectacular gambler. The financial destiny is real and accessible — the path is through discipline, strategic positioning, and the patient development of income streams. Numerologically, ${num.bhagyank === 4 || num.moolank === 4 || num.bhagyank === 8 ? `Bhagyank/Moolank indicates wealth built through making yourself genuinely indispensable` : "the financial peak in this chart is a late-arriving phenomenon built on solid foundations"}.`
        });
    }

    // Future 4 - Children/Legacy
    future.push({
        title: "Children, Creative Legacy, and the Living Extension of Your Soul",
        body: `The 5th house ${pih[5].length > 0 ? `with ${pih[5].join(", ")}` : `with lord ${HL(5)} in the ${H(HL(5))}th house`} carries the 'Poorva Punya' — the merit inherited from past-life actions. The children or creative works that emerge during a 5th-house-activating Dasha will be the most visible evidence of this chart's overall grace. Numerologically, ${num.moolank === 3 || num.bhagyank === 3 ? `Moolank/Bhagyank 3 is the children and creative legacy number` : "the legacy work matures in the second half of life"}.`
    });

    // Future 5 - Foreign Travel
    const rahuH = H("Rahu");
    future.push({
        title: "Foreign Lands and the Expansion Beyond the Known",
        body: `Rahu in the ${rahuH}th house ${rahuH === 12 ? "directly in the house of foreign countries — foreign connection is structural in this chart" : `creates specific foreign connection potential through the ${HOUSE_SIG[rahuH - 1]} domain`}. The timing: Rahu Mahadasha or any Dasha involving the 12th lord. Numerologically, ${num.bhagyank === 5 ? "Bhagyank 5 is the numerological confirmation — freedom, travel, and varied experience are built into the destiny" : "the Kua number provides specific directional guidance for travel destinations"}.`
    });

    // Future 6 - Spiritual Awakening
    const kDasha = futureDashas.find(d => d.lord === "Ke");
    const jDasha = futureDashas.find(d => d.lord === "Ju");
    if (kDasha) {
        future.push({
            title: `The Great Turning — Ketu Mahadasha (${fmt(kDasha.start)})`,
            body: `Ketu placed in the ${H("Ketu")}th house combined with the upcoming Ketu Mahadasha (${fmt(kDasha.start)}) — this is one of the most spiritually significant periods in a human life. During this period, the external world's ability to satisfy will diminish. This is not depression; it is evolution. Numerologically, ${num.moolank === 7 ? "Moolank 7 creates a soul already oriented toward this journey" : "the teachers, texts, or practices encountered during this period will feel like memory, not new information"}.`
        });
    } else if (jDasha) {
        future.push({
            title: `Jupiter's Grace — Wisdom, Teaching, and Spiritual Expansion`,
            body: `The upcoming Jupiter Mahadasha (${fmt(jDasha.start)}) carries "the period when the guru appears." This means a period when the universe becomes unusually generous with wisdom. Numerologically, ${num.bhagyank === 3 || num.moolank === 3 ? `Moolank/Bhagyank 3 — Jupiter's own frequency — creates a doubled resonance` : "the numerological chart confirms that the wisdom development of this Dasha is one of the most consequential periods"}.`
        });
    }

    // Future 7 - Saturn Cycles
    const satReturn = Math.round(age / 29.5) * 29.5;
    const nextSatReturn = satReturn > age ? satReturn : satReturn + 29.5;
    const yrsToSatReturn = (nextSatReturn - age).toFixed(1);
    future.push({
        title: "Saturn's Major Turning Points — The Architecture of Fate",
        body: `Saturn's next return to its natal position (approximately ${Math.round(nextSatReturn)} years of age, roughly ${yrsToSatReturn} years from now) is one of the three most significant milestone events in any human life. The first Saturn Return (around age 28-30) brings the first real reckoning with adult responsibility. The second (around age 57-59) brings the deeper examination of legacy. Numerologically, Bhagyank ${num.bhagyank} ${num.bhagyank === 8 || num.bhagyank === 4 ? "— specifically Saturn/Rahu-ruled — means these Saturn transits carry the destiny's full weight" : "intersects with Saturn's timing cycles to create specific years of transformation"}.`
    });

    // Future 8 - Personal Year Peaks
    const py8Year = new Date().getFullYear() + (8 - num.personalYear + 9) % 9 || 9;
    const py1Year = new Date().getFullYear() + (1 - num.personalYear + 9) % 9 || 9;
    future.push({
        title: "The Nine-Year Numerological Cycles — Your Peak Years Identified",
        body: `The upcoming year peaks are: Personal Year 1 (new beginnings) arrives in ${py1Year}, and Personal Year 8 (peak achievement and financial power) arrives in ${py8Year}. The years when a favorable astrological Dasha overlaps with a Personal Year 1 or 8 create the highest-intensity opportunity windows in the entire life. For ${name}, Moolank ${num.moolank} — ${mData.planet}-ruled — ${mData.planet === "Sun" || mData.planet === "Mars" ? "means the Personal Year 1 carries particular force" : mData.planet === "Saturn" || mData.planet === "Mercury" ? "means the Personal Year 8 carries particular force" : "creates specific resonance with certain Personal Years"}.`
    });

    // Future 9 - Chart's Unusual Feature
    const ks = yogas.find(y => y.name.includes("Kaal Sarpa"));
    if (ks) {
        future.push({
            title: "The Kaal Sarpa Prophecy — From Great Obstruction to Equally Great Heights",
            body: `The Kaal Sarpa Dosha in this chart carries a prophecy: those born under this configuration experience either extreme obstruction throughout life, or a dramatic sudden reversal from apparent permanent stagnation to remarkable achievement. There will be a specific moment where circumstances that appeared permanently unfavorable undergo a complete and rapid reversal. Numerologically, ${num.bhagyank === 8 || num.bhagyank === 4 ? `Bhagyank ${num.bhagyank} alongside Kaal Sarpa is the signature of one of the most tested and ultimately most indestructible destinies` : "the obstacles are precisely calibrated to produce the specific form of character that the destiny requires"}.`
        });
    } else {
        future.push({
            title: "The Convergence — When All Threads Weave Into Purpose",
            body: `Looking at the arc of ${name}'s Dasha sequence alongside the numerological cycles — there is a specific convergence point visible (likely between ages ${age + 8} and ${age + 15}) when the disparate threads of career, relationships, inner growth, and creative expression weave into a coherent life purpose. The highest expression of this chart — the version of this life that uses all of its gifts — is genuinely, specifically, practically available.`
        });
    }

    // Future 10 - Ultimate Prophecy
    future.push({
        title: "The Final Prophecy — What This Life Is Actually For",
        body: `Reading the entirety of ${name}'s chart through both the Jyotish and numerological lenses, the central message becomes clear: The Lagna lord ${HL(1)} in the ${H(HL(1))}th house, Rahu's hunger in the ${H("Rahu")}th house (${HOUSE_SIG[H("Rahu") - 1]}), the Moon's emotional nature in ${RASHI[pos.Moon.rashi]}, the Bhagyank ${num.bhagyank}'s destiny (${bDesc.split(".")[0].toLowerCase()}), the Moolank ${num.moolank}'s psychic character — all speaking in chorus about a soul that arrived here to fulfill a specific evolutionary purpose. The sense of being where one is supposed to be, doing what one is supposed to do, being who one was always becoming — this is the ultimate promise encoded in ${name}'s chart. It is already in motion.`
    });

    return future;
}

// ═══════════════════════════════════════════════════════════════════════════
// REMEDIES GENERATOR
// ═══════════════════════════════════════════════════════════════════════════
function generateRemedies(pos, lr, pih, asp, yogas, num, name) {
    const remedies = [];
    const H = p => houseOf(pos[p].rashi, lr);
    const HL = h => houseLord(h, lr);
    const lagL = HL(1), lagLDig = pos[lagL].dig;
    const satH = H("Saturn"), satDig = pos.Saturn.dig;
    const rahuH = H("Rahu"), marsH = H("Mars");
    const moonDig = pos.Moon.dig;
    const mData = MOOLANK_DATA[num.moolank] || MOOLANK_DATA[1];
    const mangal = [1, 2, 4, 7, 8, 12].includes(marsH);

    const mantras = {
        Sun: "Om Hraam Hreem Hraum Sah Suryaya Namah (108× at sunrise, facing east, on Sundays)",
        Moon: "Om Shram Shreem Shraum Sah Chandraya Namah (108× on Monday evenings, facing north)",
        Mars: "Om Kraam Kreem Kraum Sah Bhaumaya Namah (108× on Tuesdays, facing south)",
        Mercury: "Om Braam Breem Braum Sah Budhaya Namah (108× on Wednesdays, facing north)",
        Jupiter: "Om Graam Greem Graum Sah Guruve Namah (108× on Thursdays, facing north-east)",
        Venus: "Om Draam Dreem Draum Sah Shukraya Namah (108× on Fridays, facing south-east)",
        Saturn: "Om Praam Preem Praum Sah Shanaischaraya Namah (108× on Saturdays at dusk, facing west)"
    };

    const gems = {
        Aries: "Red Coral (Mars-ruled, copper ring, right ring finger, Tuesday)",
        Taurus: "Diamond or White Sapphire (Venus-ruled, silver or platinum, right middle finger, Friday)",
        Gemini: "Emerald or Green Tourmaline (Mercury-ruled, gold ring, right little finger, Wednesday)",
        Cancer: "Pearl or Moonstone (Moon-ruled, silver ring, right little finger, Monday)",
        Leo: "Ruby or Red Garnet (Sun-ruled, gold ring, right ring finger, Sunday)",
        Virgo: "Emerald or Green Tourmaline (Mercury-ruled, gold ring, right little finger, Wednesday)",
        Libra: "Diamond or White Sapphire (Venus-ruled, silver or platinum, right middle finger, Friday)",
        Scorpio: "Red Coral or Carnelian (Mars-ruled, copper ring, right ring finger, Tuesday)",
        Sagittarius: "Yellow Sapphire or Citrine (Jupiter-ruled, gold ring, right index finger, Thursday)",
        Capricorn: "Blue Sapphire — ONLY after detailed chart verification (Saturn-ruled)",
        Aquarius: "Blue Sapphire — ONLY after detailed chart verification (Saturn-ruled)",
        Pisces: "Yellow Sapphire or Citrine (Jupiter-ruled, gold ring, right index finger, Thursday)"
    };

    // Lagna Lord Remedy
    if (lagLDig === "Debilitated" || lagLDig === "Enemy") {
        remedies.push({
            title: `Strengthen ${lagL} — Your Lagna Lord (Planetary Remedy)`,
            body: `${lagL} as your Lagna lord in ${lagLDig} state reduces vitality and self-confidence. Daily mantra: ${mantras[lagL]}. Numerologically, wearing ${mData.color} on ${mData.day} activates the same planetary energy.`
        });
    }

    // Saturn Propitiation
    if (satDig === "Debilitated" || [1, 4, 7, 12].includes(satH)) {
        remedies.push({
            title: "Saturn Propitiation (Planetary + Karmic Remedy)",
            body: `Serve the elderly, poor, or differently-abled genuinely on Saturdays. Feed black sesame seeds mixed in mustard oil to the underprivileged. Mantra: ${mantras.Saturn}. Wearing dark blue or black on Saturdays. The most powerful Saturn remedy: sustained, patient, honest service without expectation of recognition.`
        });
    }

    // Rahu Pacification
    if ([1, 4, 7, 8, 12].includes(rahuH) || (asp[1] || []).includes("Rahu")) {
        remedies.push({
            title: "Rahu Pacification (Shadow Planet Remedy)",
            body: `Rahu in a sensitive house requires addressing the shadow with consistency. Donate items of mixed quality on Saturdays. Recite "Om Raam Rahave Namah" 108 times during the Saturn hora. The most effective Rahu remedy is behavioral: cultivate radical honesty, avoid all forms of deception.`
        });
    }

    // Mangal Dosha
    if (mangal) {
        remedies.push({
            title: "Mangal Dosha — Mars Pacification",
            body: `Chant ${mantras.Mars}. Visit Hanuman temples on Tuesdays offering red sindoor and red flowers. The single most effective Mars remedy is physical: regular, disciplined, rigorous exercise. Fasting on Tuesdays (consuming only one grain-free meal) is traditional.`
        });
    }

    // Moon Strengthening
    if (moonDig === "Debilitated" || moonDig === "Enemy") {
        remedies.push({
            title: "Moon Strengthening — Mind and Emotional Healing",
            body: `Offer water to the Moon on Purnima nights, reciting ${mantras.Moon}. Sitting near a river or ocean during full moon. Wearing pearl or natural moonstone. Consuming white foods on Mondays. The mother relationship remedy: consciously extending forgiveness for the ways the actual mother was limited.`
        });
    }

    // Missing Numbers Remedy
    if (num.missing_nums.length > 0) {
        const missingRemedies = num.missing_nums.map(n => num.missingDesc[n]).join(" | ");
        remedies.push({
            title: `Lo Shu Grid — Missing Number Remedies (${num.missing_nums.join(", ")})`,
            body: `The numbers absent from your birth date represent karmic voids requiring conscious cultivation: ${missingRemedies} General approach: place the missing number's associated color prominently in your living space; practice activities that develop the missing number's qualities.`
        });
    }

    // Moolank Practice
    remedies.push({
        title: `Moolank ${num.moolank} Daily Practice — ${mData.planet}-Ruled Alignment`,
        body: `As a Moolank ${num.moolank}, your primary numerological alignment practice: wear ${mData.color} specifically on ${mData.day}; work with ${mData.metal} objects; repeat ${mData.mantra} as your primary mantra. Gemstone resonance: ${mData.gem} carried in the left pocket on ${mData.day}. ${mData.shadow.split(",")[0]} is your primary psychological shadow — the specific inner pattern that, when seen and consciously moderated, releases the most life-energy.`
    });

    // Gemstone
    remedies.push({
        title: `Primary Gemstone — ${gems[RASHI[lr]]}`,
        body: `For ${RASHI[lr]} Lagna, the primary supporting gemstone is ${gems[RASHI[lr]]}. This strengthens the Lagna lord and overall chart vitality when worn correctly. CRITICAL: Always verify gemstone suitability with a qualified Jyotishi before purchasing or wearing. The wrong gemstone can produce adverse effects.`
    });

    return remedies;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXPORT FUNCTION
// ═══════════════════════════════════════════════════════════════════════════
function generatePredictions(name, dob, time, place, kundaliData, numerologyData) {
    const { pos, lagna, pih, asp, das } = kundaliData;
    const num = numerologyData;
    const [birthYr, birthMo, birthDy] = dob.split("-").map(Number);

    // Detect yogas
    const yogas = detectYogas(pos, lagna, pih);

    // Generate soul signature
    const soulText = generateSoulSignature(pos, lagna, name, num);

    // Generate present analysis
    const { presMain, present, currentDasha, nextDasha } = generatePresentAnalysis(pos, lagna, pih, asp, das, num, name);

    // Generate past revelations
    const past = generatePastRevelations(pos, lagna, pih, asp, num, name, birthYr, birthMo, birthDy);

    // Generate future prophecies
    const future = generateFutureProphecies(pos, lagna, pih, asp, das, yogas, num, name, birthYr, birthMo, birthDy);

    // Generate remedies
    const remedies = generateRemedies(pos, lagna, pih, asp, yogas, num, name);

    // Calculate age
    const today = new Date();
    const age = today.getFullYear() - birthYr - (today < new Date(today.getFullYear(), birthMo - 1, birthDy) ? 1 : 0);

    return {
        soulText,
        yogas,
        past,
        presMain,
        present,
        future,
        remedies,
        currentDasha,
        nextDasha,
        age,
        num
    };
}

module.exports = {
    generatePredictions,
    detectYogas,
    generateSoulSignature,
    generatePresentAnalysis,
    generatePastRevelations,
    generateFutureProphecies,
    generateRemedies
};
