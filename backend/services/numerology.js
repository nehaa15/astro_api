// ═══════════════════════════════════════════════════════════════════════════
// NUMEROLOGY ENGINE — Complete Cheiro / Vedic System
// ═══════════════════════════════════════════════════════════════════════════

function reduceNum(n) {
    // Reduce to single digit but preserve Master Numbers 11,22,33
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
        const s = String(n).split("").reduce((a, d) => a + Number(d), 0);
        if (s === n) break;
        n = s;
    }
    return n;
}

function reduceToSingle(n) {
    while (n > 9) { n = String(n).split("").reduce((a, d) => a + Number(d), 0); }
    return n;
}

const MOOLANK_DATA = {
    1: {
        planet: "Sun", color: "Gold/Orange", day: "Sunday", gem: "Ruby", metal: "Gold",
        mantra: "Om Hraam Hreem Hraum Sah Suryaya Namah",
        traits: "leadership, individuality, ambition, willpower, pioneering spirit, stubbornness when challenged",
        shadow: "ego inflation, domineering tendencies, difficulty accepting help or admitting error",
        career: "CEOs, founders, politicians, military officers, government positions, independent entrepreneurs",
        love: "needs a partner who admires without suffocating — intensity of feeling masked by controlled exterior",
        body: "heart, spine, right eye, vital force",
        desc: "You are ruled by the Sun — the cosmic king, the source of all light. There is something solar about you that others feel before you speak: a quiet authority, a natural assumption of center stage, a presence that draws attention without effort. The Sun does not orbit anyone — and neither, at your core, do you."
    },
    2: {
        planet: "Moon", color: "White/Silver/Cream", day: "Monday", gem: "Pearl/Moonstone", metal: "Silver",
        mantra: "Om Shram Shreem Shraum Sah Chandraya Namah",
        traits: "sensitivity, intuition, diplomacy, receptivity, empathy, artistic sensibility, emotional depth",
        shadow: "mood swings, over-dependence, fear of conflict, difficulty asserting personal needs",
        career: "counselors, nurses, artists, poets, musicians, hospitality, diplomats, social workers",
        love: "love is everything — but tends to feel more than it expresses, creating painful silences",
        body: "stomach, breasts, lymphatic system, emotional body",
        desc: "You are ruled by the Moon — ever-changing, deeply feeling, with tides that move without warning. People feel *safe* with you in a way they can't quite explain. You absorb the emotional atmosphere of every room you enter. This is your extraordinary gift and your heaviest burden."
    },
    3: {
        planet: "Jupiter", color: "Yellow/Gold/Purple", day: "Thursday", gem: "Yellow Sapphire/Citrine", metal: "Gold",
        mantra: "Om Graam Greem Graum Sah Guruve Namah",
        traits: "optimism, expansion, wisdom, teaching, humor, generosity, creative self-expression",
        shadow: "overextension, lack of follow-through, scattered energy, overconfidence",
        career: "teachers, lawyers, judges, writers, entertainers, philosophers, spiritual guides",
        love: "flirtatious and charming — needs a partner who matches intellectual and creative energy",
        body: "liver, thighs, hips, blood circulation",
        desc: "You are ruled by Jupiter — the great expander, the cosmic teacher, the one who makes everything bigger. Your laughter is generous, your ideas are large, and your optimism is genuinely infectious. The universe seems to say 'yes' to you more often than to most."
    },
    4: {
        planet: "Rahu/Uranus", color: "Blue/Grey/Earth tones", day: "Sunday (Rahu day)", gem: "Hessonite Garnet", metal: "Mixed metals",
        mantra: "Om Raam Rahave Namah",
        traits: "practicality, discipline, hard work, unconventionality, rebelliousness, endurance",
        shadow: "stubbornness, isolation, tendency toward sudden disruptions, hidden restlessness",
        career: "engineers, builders, project managers, social reformers, IT professionals, scientists",
        love: "slow to open, but deeply loyal once committed — fears abandonment more than known",
        body: "bones, lower back, nervous system",
        desc: "You are ruled by Rahu — the shadow planet of ambition, disruption, and unconventional paths. On the surface you appear stable, methodical, even predictable. Inside, there is a quiet revolutionary who chafes at anything that feels like a cage — including routines you yourself created."
    },
    5: {
        planet: "Mercury", color: "Green/Grey", day: "Wednesday", gem: "Emerald/Green Tourmaline", metal: "Brass",
        mantra: "Om Braam Breem Braum Sah Budhaya Namah",
        traits: "versatility, wit, communication, adaptability, curiosity, networking, quick thinking",
        shadow: "inconsistency, nervousness, scattered energy, superficiality, restlessness",
        career: "writers, journalists, traders, sales, consultants, brokers, teachers, digital creators",
        love: "needs intellectual stimulation above all — boredom is the real relationship killer",
        body: "nervous system, lungs, arms, tongue",
        desc: "You are ruled by Mercury — the fastest planet, the divine messenger, the trickster-genius. Your mind races ahead of your mouth, which races ahead of your body. You were curious before you were conscious — asking questions before you had the language for answers."
    },
    6: {
        planet: "Venus", color: "Pink/White/Indigo", day: "Friday", gem: "Diamond/White Sapphire", metal: "Silver/Copper",
        mantra: "Om Draam Dreem Draum Sah Shukraya Namah",
        traits: "beauty, love, harmony, creativity, responsibility, service, luxury appreciation",
        shadow: "over-giving, people-pleasing, possessiveness, difficulty with personal boundaries",
        career: "artists, designers, beauticians, healers, musicians, fashion, luxury goods, counselors",
        love: "love is the organizing principle of life — may give too much and expect reciprocity that doesn't come",
        body: "kidneys, lower back, throat, skin",
        desc: "You are ruled by Venus — the planet of love, beauty, and the magnetic pull between souls. You experience life more sensually, more aesthetically, more relationally than most. Every space you inhabit becomes more beautiful. Every person you love becomes more of themselves."
    },
    7: {
        planet: "Ketu/Neptune", color: "Violet/Purple/Pale yellow", day: "Monday (Ketu)", gem: "Cat's Eye", metal: "Mixed/no metal",
        mantra: "Om Kem Ketave Namah",
        traits: "spirituality, mysticism, analysis, introspection, research, solitude, psychic sensitivity",
        shadow: "detachment, aloofness, overthinking, difficulty in material world, hidden anxiety",
        career: "researchers, scientists, philosophers, mystics, healers, psychologists, writers",
        love: "merges completely or not at all — intimacy feels like exposure, solitude feels like home",
        body: "brain, nervous system, intestines, immune system",
        desc: "You are ruled by Ketu and Neptune — the planets of the invisible world. You see what others miss, feel what others suppress, know what hasn't been spoken. This makes you extraordinary in quiet rooms and uncomfortable in loud ones. You arrived here carrying wisdom that predates this body."
    },
    8: {
        planet: "Saturn", color: "Black/Dark Blue/Navy", day: "Saturday", gem: "Blue Sapphire (with caution)", metal: "Iron/Lead",
        mantra: "Om Praam Preem Praum Sah Shanaischaraya Namah",
        traits: "discipline, karma, authority, endurance, transformation through hardship, late blooming",
        shadow: "heaviness, delays, pessimism, karmic weight, difficulty trusting life's goodness",
        career: "businesspeople, politicians, architects, judges, executives, real estate, mining",
        love: "guarded and serious — may experience significant karmic relationships before finding true partnership",
        body: "bones, teeth, knees, skin, chronic conditions",
        desc: "You are ruled by Saturn — the great teacher, the relentless refiner. Your life path is not the easy road, and somewhere deep inside you have always known this. Saturn doesn't punish — it purifies. Everything it takes from you was either not truly yours or was preventing the arrival of something real."
    },
    9: {
        planet: "Mars", color: "Red/Crimson/Orange", day: "Tuesday", gem: "Red Coral", metal: "Copper",
        mantra: "Om Kraam Kreem Kraum Sah Bhaumaya Namah",
        traits: "courage, energy, humanitarianism, passion, leadership, universal compassion, completion",
        shadow: "aggression, impulsiveness, martyrdom, anger, taking on others' burdens compulsively",
        career: "surgeons, military, athletes, activists, emergency services, spiritual teachers, healers",
        love: "loves completely and universally — sometimes loves the idea of love more than specific humans",
        body: "head, blood, muscles, adrenals, reproductive system",
        desc: "You are ruled by Mars — planet of fire, courage, and primal life force. The number 9 in Vedic numerology represents completion, universality, and the energy that contains all other numbers within it. You feel deeply for humanity's suffering in a way that can exhaust you."
    }
};

const BHAGYANK_DESC = {
    1: "Your destiny is to pioneer, to lead, to be first. The universe has structured your life so that you are repeatedly placed in positions requiring individual courage and initiative.",
    2: "Your destiny is to mediate, to harmonize, to build bridges between worlds. You are here to demonstrate that sensitivity is not weakness but the highest form of intelligence.",
    3: "Your destiny is to express, to create, to inspire. The universe needs your voice, your art, your humor, your particular way of making life feel larger and more beautiful.",
    4: "Your destiny is to build — systems, structures, foundations that last. The things you construct will outlive you. This requires patient endurance that most people cannot sustain.",
    5: "Your destiny is to experience, to communicate, to awaken others through your own awakening. Freedom is both your necessity and your gift to the world.",
    6: "Your destiny is to love, to heal, to create beauty and harmony in your sphere of influence. Responsibility comes naturally to you — and is also your most persistent teacher.",
    7: "Your destiny is to seek, to understand, to penetrate the mysteries that others are too distracted to notice. You are here to bring depth to a world that prefers surfaces.",
    8: "Your destiny is power, authority, and material mastery — used in service of something larger than personal gain. Saturn-ruled 8s carry the weight of karma most visibly.",
    9: "Your destiny is completion, universality, and compassionate service. You are the end of a cycle — the point at which individual experience dissolves into universal understanding.",
    11: "Your destiny carries the vibration of the Master Illuminator — 11 is the most psychically charged of all numbers. You are here to uplift, to channel higher consciousness into the world. This comes with exceptional sensitivity and, often, exceptional turbulence.",
    22: "Your destiny vibrates to the Master Builder — 22 is the most materially powerful of master numbers. You have the potential to build systems, institutions, or movements that transform the world at scale.",
    33: "Your destiny is the Master Teacher — the 33 vibration is the rarest and most spiritually demanding. Pure compassionate service, teaching, and healing are your highest calling."
};

const KARMIC_DEBT = {
    13: {
        name: "Karmic Debt 13",
        warning: "The 13 carries the debt of laziness and misuse of creative energy in a previous cycle. This lifetime, work is the medicine — but not compulsive overwork. Rather, disciplined, purposeful effort that actually completes what it begins. Watch the pattern of starting strong and abandoning. The remedy is finishing."
    },
    14: {
        name: "Karmic Debt 14",
        warning: "The 14 carries the debt of freedom misused — irresponsibility, overindulgence of the senses, using freedom to escape rather than to create. This life brings repeated circumstances that demand you develop self-discipline around pleasure, substances, and commitments. The remedy is moderation and commitment to things that genuinely matter."
    },
    16: {
        name: "Karmic Debt 16",
        warning: "The 16 carries the debt of ego — specifically the inflation of the ego that builds beautiful but hollow structures (relationships, identities, belief systems) around an unexamined self. This lifetime brings the repeated pattern of these structures collapsing precisely when they seem most secure. The remedy is radical honesty and the willingness to rebuild from authentic foundations after each fall."
    },
    19: {
        name: "Karmic Debt 19",
        warning: "The 19 carries the debt of power misused — leadership exercised without consideration for others, strength used for domination rather than service. This lifetime, the universe repeatedly places you in positions of genuine power and simultaneously creates conditions that test whether you will use it wisely. The remedy is conscious leadership and genuine humility."
    }
};

const LO_SHU_POSITIONS = {
    1: { plane: "Thought", meaning: "analytical mind, intellect, mental clarity", pos: [6, 7] },
    2: { plane: "Thought", meaning: "intuition, sensitivity, emotional intelligence", pos: [6, 8] },
    3: { plane: "Thought", meaning: "creative thinking, mental agility", pos: [6, 9] },
    4: { plane: "Will", meaning: "practical ability, determination", pos: [5, 7] },
    5: { plane: "Will", meaning: "balance, human experience, central force", pos: [5, 8] },
    6: { plane: "Will", meaning: "creativity and imagination", pos: [5, 9] },
    7: { plane: "Action", meaning: "physical action, sacrificial nature", pos: [4, 7] },
    8: { plane: "Action", meaning: "practical wisdom, administrative ability", pos: [4, 8] },
    9: { plane: "Action", meaning: "ambition, responsibility", pos: [4, 9] }
};

// Lo Shu Grid layout: 4-9-2 / 3-5-7 / 8-1-6
const LO_SHU_GRID = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

// ═══════════════════════════════════════════════════════════════════════════
// MAIN NUMEROLOGY CALCULATION
// ═══════════════════════════════════════════════════════════════════════════
function generateNumerology(name, dob) {
    const [birthYr, birthMo, birthDy] = dob.split("-").map(Number);

    // Moolank (Psychic Number) - birth day only
    const moolankRaw = reduceToSingle(birthDy);
    const moolank = moolankRaw || 9;

    // Bhagyank (Destiny Number) - full DOB
    const bhagyankFull = String(birthDy).split("").concat(String(birthMo).split(""), String(birthYr).split("")).reduce((a, d) => a + Number(d), 0);
    const bhagyank = reduceNum(bhagyankFull);

    // Check raw numbers before reduction for Karmic Debt
    const dayTwoDigit = birthDy;
    const fullRawReduced = () => {
        let s = birthDy + birthMo;
        let y = birthYr;
        while (y > 9) { y = String(y).split("").reduce((a, d) => a + Number(d), 0); }
        s += y;
        if ([13, 14, 16, 19].includes(s)) return s;
        while (s > 9 && ![11, 22, 33].includes(s)) {
            const ns = String(s).split("").reduce((a, d) => a + Number(d), 0);
            if (ns === s) break;
            s = ns;
        }
        return s;
    };
    const rawBeforeReduce = fullRawReduced();
    const karmicDebt = [13, 14, 16, 19].includes(dayTwoDigit) ? dayTwoDigit :
        [13, 14, 16, 19].includes(rawBeforeReduce) ? rawBeforeReduce : null;
    const masterNumber = [11, 22, 33].includes(bhagyank) ? bhagyank :
        [11, 22, 33].includes(moolank) ? moolank : null;

    // Lo Shu Grid - which digits 1-9 appear in DOB
    const dobStr = String(birthDy).padStart(2, "0") + String(birthMo).padStart(2, "0") + String(birthYr);
    const gridCount = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (const ch of dobStr) { const d = Number(ch); if (d >= 1 && d <= 9) gridCount[d]++; }
    const present_nums = Object.entries(gridCount).filter(([, c]) => c > 0).map(([n]) => Number(n));
    const missing_nums = Object.entries(gridCount).filter(([, c]) => c === 0).map(([n]) => Number(n));
    const repeat_nums = Object.entries(gridCount).filter(([, c]) => c > 1).map(([n, c]) => ({ n: Number(n), c }));

    // Planes analysis
    const thoughtPlane = [1, 2, 3].filter(n => gridCount[n] > 0);
    const willPlane = [4, 5, 6].filter(n => gridCount[n] > 0);
    const actionPlane = [7, 8, 9].filter(n => gridCount[n] > 0);
    const mentalCol = [3, 6, 9].filter(n => gridCount[n] > 0);
    const practicalCol = [1, 4, 7].filter(n => gridCount[n] > 0);

    // Personal Year
    const curYear = new Date().getFullYear();
    const personalYearRaw = birthDy + birthMo + curYear;
    const personalYear = reduceToSingle(personalYearRaw);
    const pyTheme = {
        1: "New beginnings — planting seeds, launching initiatives, establishing new identity",
        2: "Patience and partnership — relationships deepen, cooperation required, inner work prioritized",
        3: "Creative expression and joy — communication, social expansion, artistic projects flourish",
        4: "Hard work and foundation-building — discipline rewarded, no shortcuts, systems built",
        5: "Freedom and change — major life shifts, travel, breaking old patterns, unexpected opportunities",
        6: "Love, responsibility, and home — family, commitment, healing relationships, beauty creation",
        7: "Introspection and spiritual deepening — retreat, study, inner knowledge, mystical experiences",
        8: "Power and material achievement — career peak, financial moves, authority claimed",
        9: "Completion and release — ending cycles, letting go, clearing space for the new"
    };

    // Kua Number
    const yy = birthYr % 100;
    const yySum = String(yy).split("").reduce((a, d) => a + Number(d), 0);
    const kuaMale = reduceToSingle(10 - yySum) || 9;
    const kuaFemale = reduceToSingle(yySum + 5) || 9;

    // Missing number interpretations
    const missingDesc = {
        1: "Missing 1: Difficulty with self-assertion and leadership. May defer to others, struggle with confidence, or have parents who undermined individuality. Remedy: wear gold/orange on Sundays, light a lamp at sunrise.",
        2: "Missing 2: Emotional sensitivity underdeveloped — may appear cold or struggle to receive love and cooperation. Remedy: wear white on Mondays, meditate near water.",
        3: "Missing 3: Limited creative self-expression or difficulty communicating joy. May have had a childhood where playfulness was discouraged. Remedy: yellow clothes on Thursdays, creative hobbies.",
        4: "Missing 4: Lack of practical groundedness — difficulty completing projects, building systems, or maintaining routines. Remedy: earth-tone colors, manual craftsmanship.",
        5: "Missing 5: Resistance to change and new experience — may be rigid, fearful of the unfamiliar, or over-cautious. Remedy: travel, green colors, breaking one routine weekly.",
        6: "Missing 6: Difficulty accepting love and responsibility. Possible wound around family or home. Remedy: pink or white in home décor, Friday rituals of gratitude.",
        7: "Missing 7: Lack of introspection or spiritual connection — may be entirely externally driven with no inner life. Remedy: purple candles, 10 minutes daily silence.",
        8: "Missing 8: Challenges with financial authority, material management, or executive function. Remedy: dark blue or black on Saturdays, iron or steel objects in home.",
        9: "Missing 9: Compassion blocked or difficulty completing cycles — may be self-centered or leave things unfinished. Remedy: red color therapy, Tuesday service to others."
    };

    const repeatingDesc = {
        1: "Repeated 1s: Solar energy amplified — extraordinary willpower and potential for leadership, but must guard against authoritarian tendencies and isolation.",
        2: "Repeated 2s: Lunar sensitivity amplified — heightened intuition and empathy, but emotional overwhelm and co-dependency are real risks.",
        3: "Repeated 3s: Jovian expansiveness — exceptional creative potential and social gifts, but scattered energy and overextension are the shadows.",
        4: "Repeated 4s: Rahu energy intensified — unusual life path, sudden disruptions and breakthroughs, possible genius expressed through unconventional means.",
        5: "Repeated 5s: Mercury amplified — exceptional mental agility and communication gifts, but nervous exhaustion and commitment issues.",
        6: "Repeated 6s: Venus intensified — deep capacity for love and beauty, but boundary issues and over-responsibility for others.",
        7: "Repeated 7s: Ketu energy — profound spiritual gifts, possibly psychic, but extreme isolation tendency and detachment from ordinary life.",
        8: "Repeated 8s: Saturn intensified — rare capacity for sustained discipline and authority, but heaviness, delays, and karmic weight are magnified.",
        9: "Repeated 9s: Mars amplified — extraordinary compassion and completion energy, but anger, martyrdom, and burnout."
    };

    return {
        moolank,
        bhagyank,
        karmicDebt,
        masterNumber,
        gridCount,
        present_nums,
        missing_nums,
        repeat_nums,
        thoughtPlane,
        willPlane,
        actionPlane,
        mentalCol,
        practicalCol,
        personalYear,
        pyTheme,
        kuaMale,
        kuaFemale,
        missingDesc,
        repeatingDesc,
        moolankData: MOOLANK_DATA[moolank],
        bhagyankDesc: BHAGYANK_DESC[bhagyank] || BHAGYANK_DESC[1],
        karmicDebtData: karmicDebt ? KARMIC_DEBT[karmicDebt] : null,
        masterNumberDesc: masterNumber ? BHAGYANK_DESC[masterNumber] : null
    };
}

module.exports = {
    generateNumerology,
    reduceNum,
    reduceToSingle,
    MOOLANK_DATA,
    BHAGYANK_DESC,
    KARMIC_DEBT,
    LO_SHU_POSITIONS,
    LO_SHU_GRID
};
