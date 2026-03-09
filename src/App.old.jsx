import { useState } from "react";

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const RASHI   = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const RASHI_SH= ["Ar","Ta","Ge","Ca","Le","Vi","Li","Sc","Sg","Cp","Aq","Pi"];
const ELEMENTS= ["Fire","Earth","Air","Water","Fire","Earth","Air","Water","Fire","Earth","Air","Water"];
const PLANETS = ["Sun","Moon","Mars","Mercury","Jupiter","Venus","Saturn","Rahu","Ketu"];
const PLANET_SH=["Su","Mo","Ma","Me","Ju","Ve","Sa","Ra","Ke"];
const NAKS    = ["Ashwini","Bharani","Krittika","Rohini","Mrigashira","Ardra","Punarvasu","Pushya","Ashlesha","Magha","Purva Phalguni","Uttara Phalguni","Hasta","Chitra","Swati","Vishakha","Anuradha","Jyeshtha","Mula","Purva Ashadha","Uttara Ashadha","Shravana","Dhanishtha","Shatabhisha","Purva Bhadrapada","Uttara Bhadrapada","Revati"];
const NAK_LORDS=["Ke","Ve","Su","Mo","Ma","Ra","Ju","Sa","Me","Ke","Ve","Su","Mo","Ma","Ra","Ju","Sa","Me","Ke","Ve","Su","Mo","Ma","Ra","Ju","Sa","Me"];
const DASHA_Y = {Ke:7,Ve:20,Su:6,Mo:10,Ma:7,Ra:18,Ju:16,Sa:19,Me:17};
const DASHA_O = ["Ke","Ve","Su","Mo","Ma","Ra","Ju","Sa","Me"];
const DASHA_N = {Ke:"Ketu",Ve:"Venus",Su:"Sun",Mo:"Moon",Ma:"Mars",Ra:"Rahu",Ju:"Jupiter",Sa:"Saturn",Me:"Mercury"};
const PCOL    = {Sun:"#FF8C00",Moon:"#AAB8C2",Mars:"#E05252",Mercury:"#52A052",Jupiter:"#D4AC0D",Venus:"#E896B8",Saturn:"#8B7AC8",Rahu:"#888",Ketu:"#A0784A"};
const BENEFICS= ["Jupiter","Venus","Moon","Mercury"];
const MALEFICS = ["Saturn","Mars","Sun","Rahu","Ketu"];
const EXALT   = {Sun:0,Moon:1,Mars:9,Mercury:5,Jupiter:3,Venus:11,Saturn:6,Rahu:1,Ketu:7};
const DEBIL   = {Sun:6,Moon:7,Mars:3,Mercury:11,Jupiter:9,Venus:5,Saturn:0,Rahu:7,Ketu:1};
const OWN     = {Sun:[4],Moon:[3],Mars:[0,7],Mercury:[2,5],Jupiter:[8,11],Venus:[1,6],Saturn:[9,10]};
const RASHI_LD= ["Mars","Venus","Mercury","Moon","Sun","Mercury","Venus","Mars","Jupiter","Saturn","Saturn","Jupiter"];
const HOUSE_SIG=["Self/body/personality","Wealth/family/speech","Siblings/courage/short travel","Mother/home/property","Children/intellect/romance","Enemies/health/debts","Marriage/partnerships","Death/transformation/occult","Father/fortune/religion","Career/status/authority","Gains/friends/aspirations","Losses/spirituality/foreign"];
const KENDRA  = [1,4,7,10];
const TRIKONA = [1,5,9];
const DUSTHANA= [6,8,12];

// ═══════════════════════════════════════════════════
// ASTRONOMY
// ═══════════════════════════════════════════════════
const r2d = r => r * 180 / Math.PI;
const d2r = d => d * Math.PI / 180;
const norm= v => ((v%360)+360)%360;

function jd(yr,mo,dy,hr){
  if(mo<=2){yr--;mo+=12;}
  const A=Math.floor(yr/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(yr+4716))+Math.floor(30.6001*(mo+1))+dy+hr/24+B-1524.5;
}
function ayamsa(J){return norm(22.46028+(J-2415020)*50.26/3600/365.25);}
function sid(lon,J){return norm(lon-ayamsa(J));}

function sunLon(J){
  const T=(J-2451545)/36525,L0=280.46646+36000.76983*T;
  const M=d2r(norm(357.52911+35999.05029*T));
  return norm(L0+(1.914602-0.004817*T)*Math.sin(M)+0.019993*Math.sin(2*M)+0.000289*Math.sin(3*M));
}
function moonLon(J){
  const T=(J-2451545)/36525,L=218.3165+481267.8813*T;
  const Mm=d2r(norm(134.9634+477198.8676*T)),D=d2r(norm(297.8502+445267.1115*T));
  const F=d2r(norm(93.2721+483202.0175*T)),M=d2r(norm(357.5291+35999.0503*T));
  return norm(L+6.2888*Math.sin(Mm)+1.274*Math.sin(2*D-Mm)+0.6583*Math.sin(2*D)
    +0.2136*Math.sin(2*Mm)-0.1851*Math.sin(M)-0.1143*Math.sin(2*F)
    +0.0588*Math.sin(2*D-2*Mm)+0.0533*Math.sin(2*D+Mm)+0.0422*Math.sin(3*Mm));
}
function pLon(J,p){
  const T=(J-2451545)/36525;
  const C={Mars:[355.433,19140.2993,19.373,10.691,0.623],Mercury:[252.2509,149472.6746,174.7948,23.44,2.9818],
    Jupiter:[34.3515,3034.9057,20.9,5.5549,0.1683],Venus:[181.9798,58517.8157,50.4161,0.7758,0.0033],
    Saturn:[50.0774,1222.1138,317.02,6.3585,0.2204]};
  if(!C[p])return 0;
  const[L0,n,m0,c1,c2]=C[p],M=d2r(norm(m0+n*T));
  return norm(L0+n*T+c1*Math.sin(M)+c2*Math.sin(2*M));
}
function rahuLon(J){const T=(J-2451545)/36525;return norm(125.0445-1934.1362*T+0.0020708*T*T);}
function ascLon(J,lat,lng){
  const T=(J-2451545)/36525,lst=norm(100.4606184+36000.77004*T+0.000387933*T*T+lng);
  const eps=d2r(23.439291111-0.013004167*T),lstR=d2r(lst),latR=d2r(lat);
  return norm(r2d(Math.atan2(-Math.cos(lstR),Math.sin(eps)*Math.tan(latR)+Math.cos(eps)*Math.sin(lstR))));
}
function isRetro(J,p){
  if(!["Mars","Mercury","Jupiter","Venus","Saturn"].includes(p))return false;
  const diff=norm(pLon(J+2,p)-pLon(J-2,p));
  return diff>180;
}
function dignity(p,r){
  if(EXALT[p]===r)return"Exalted";
  if(DEBIL[p]===r)return"Debilitated";
  if(OWN[p]?.includes(r))return"Own Sign";
  const FR={Sun:[3,8,0],Moon:[0,3],Mars:[8,11,4],Mercury:[6,2],Jupiter:[0,3,8],Venus:[9,10,6],Saturn:[6,7,9]};
  const EN={Sun:[6,7,9,10],Moon:[7],Mars:[1,2,5],Mercury:[7,8],Jupiter:[1,2,5,6],Venus:[3,4,8],Saturn:[0,3,4]};
  if(FR[p]?.includes(r))return"Friendly";
  if(EN[p]?.includes(r))return"Enemy";
  return"Neutral";
}

function calcChart(yr,mo,dy,hr,min,tz,lat,lng){
  let utcH=hr+min/60-tz,dd=dy,mm=mo,yy=yr;
  if(utcH<0){utcH+=24;dd--;}else if(utcH>=24){utcH-=24;dd++;}
  const J=jd(yy,mm,dd,utcH);
  const trops={Sun:sunLon(J),Moon:moonLon(J),Mars:pLon(J,"Mars"),Mercury:pLon(J,"Mercury"),
    Jupiter:pLon(J,"Jupiter"),Venus:pLon(J,"Venus"),Saturn:pLon(J,"Saturn"),Rahu:rahuLon(J)};
  trops.Ketu=norm(trops.Rahu+180);
  const aT=ascLon(J,lat,lng);
  const pos={};
  for(const[p,t]of Object.entries(trops)){
    const lon=sid(t,J),r=Math.floor(lon/30),deg=lon%30;
    const ni=Math.floor(lon/(360/27)),pada=Math.floor((lon%(360/27))/(360/27/4))+1;
    pos[p]={lon,rashi:r,deg,rashiName:RASHI[r],sh:RASHI_SH[r],nak:NAKS[ni],nakIdx:ni,pada,
      retro:["Rahu","Ketu"].includes(p)?true:isRetro(J,p),dig:dignity(p,r)};
  }
  const aL=sid(aT,J),aR=Math.floor(aL/30);
  pos.Ascendant={lon:aL,rashi:aR,deg:aL%30,rashiName:RASHI[aR],sh:RASHI_SH[aR],
    nak:NAKS[Math.floor(aL/(360/27))],nakIdx:Math.floor(aL/(360/27)),
    pada:Math.floor((aL%(360/27))/(360/27/4))+1,retro:false,dig:""};
  return{pos,lagna:aR};
}

function houseOf(pRashi,lagnaRashi){return((pRashi-lagnaRashi+12)%12)+1;}
function houseRashi(h,lr){return(lr+h-1)%12;}
function houseLord(h,lr){return RASHI_LD[houseRashi(h,lr)];}

function getPIH(pos,lr){
  const h={};for(let i=1;i<=12;i++)h[i]=[];
  for(const p of PLANETS){const ph=houseOf(pos[p].rashi,lr);h[ph].push(p);}
  return h;
}

function getAspects(pos,lr){
  const asp={};for(let i=1;i<=12;i++)asp[i]=[];
  for(const p of PLANETS){
    const h=houseOf(pos[p].rashi,lr);
    const ts=[((h+5)%12)+1];
    if(p==="Mars"){ts.push(((h+3)%12)+1,((h+7)%12)+1);}
    if(p==="Jupiter"){ts.push(((h+4)%12)+1,((h+8)%12)+1);}
    if(p==="Saturn"){ts.push(((h+2)%12)+1,((h+9)%12)+1);}
    if(["Rahu","Ketu"].includes(p)){ts.push(((h+4)%12)+1,((h+8)%12)+1);}
    for(const t of ts)if(!asp[t].includes(p))asp[t].push(p);
  }
  return asp;
}

function getDashas(pos,yr,mo,dy){
  const mL=pos.Moon.lon,ni=Math.floor(mL/(360/27)),lord=NAK_LORDS[ni];
  const posIn=(mL%(360/27))/(360/27),rem=DASHA_Y[lord]*(1-posIn);
  const addY=(d,y)=>{const n=new Date(d);n.setTime(n.getTime()+y*365.25*86400000);return n;};
  const das=[],si=DASHA_O.indexOf(lord);
  let cur=new Date(yr,mo-1,dy);
  das.push({lord,name:DASHA_N[lord],yrs:rem,start:new Date(cur),end:addY(cur,rem)});
  cur=addY(cur,rem);
  for(let i=1;i<=8;i++){
    const l=DASHA_O[(si+i)%9],y=DASHA_Y[l],end=addY(cur,y);
    das.push({lord:l,name:DASHA_N[l],yrs:y,start:new Date(cur),end});
    cur=end;
  }
  return das;
}

// ═══════════════════════════════════════════════════
// NUMEROLOGY + PREDICTION ENGINE
// ═══════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// NUMEROLOGY ENGINE — Complete Cheiro / Vedic System
// ═══════════════════════════════════════════════════════════════════════════

function reduceNum(n){
  // Reduce to single digit but preserve Master Numbers 11,22,33
  while(n>9&&n!==11&&n!==22&&n!==33){
    const s=String(n).split("").reduce((a,d)=>a+Number(d),0);
    if(s===n)break;
    n=s;
  }
  return n;
}
function reduceToSingle(n){
  while(n>9){n=String(n).split("").reduce((a,d)=>a+Number(d),0);}
  return n;
}

const MOOLANK_DATA={
  1:{planet:"Sun",color:"Gold/Orange",day:"Sunday",gem:"Ruby",metal:"Gold",mantra:"Om Hraam Hreem Hraum Sah Suryaya Namah",
    traits:"leadership, individuality, ambition, willpower, pioneering spirit, stubbornness when challenged",
    shadow:"ego inflation, domineering tendencies, difficulty accepting help or admitting error",
    career:"CEOs, founders, politicians, military officers, government positions, independent entrepreneurs",
    love:"needs a partner who admires without suffocating — intensity of feeling masked by controlled exterior",
    body:"heart, spine, right eye, vital force",
    desc:"You are ruled by the Sun — the cosmic king, the source of all light. There is something solar about you that others feel before you speak: a quiet authority, a natural assumption of center stage, a presence that draws attention without effort. The Sun does not orbit anyone — and neither, at your core, do you."},
  2:{planet:"Moon",color:"White/Silver/Cream",day:"Monday",gem:"Pearl/Moonstone",metal:"Silver",mantra:"Om Shram Shreem Shraum Sah Chandraya Namah",
    traits:"sensitivity, intuition, diplomacy, receptivity, empathy, artistic sensibility, emotional depth",
    shadow:"mood swings, over-dependence, fear of conflict, difficulty asserting personal needs",
    career:"counselors, nurses, artists, poets, musicians, hospitality, diplomats, social workers",
    love:"love is everything — but tends to feel more than it expresses, creating painful silences",
    body:"stomach, breasts, lymphatic system, emotional body",
    desc:"You are ruled by the Moon — ever-changing, deeply feeling, with tides that move without warning. People feel *safe* with you in a way they can't quite explain. You absorb the emotional atmosphere of every room you enter. This is your extraordinary gift and your heaviest burden."},
  3:{planet:"Jupiter",color:"Yellow/Gold/Purple",day:"Thursday",gem:"Yellow Sapphire/Citrine",metal:"Gold",mantra:"Om Graam Greem Graum Sah Guruve Namah",
    traits:"optimism, expansion, wisdom, teaching, humor, generosity, creative self-expression",
    shadow:"overextension, lack of follow-through, scattered energy, overconfidence",
    career:"teachers, lawyers, judges, writers, entertainers, philosophers, spiritual guides",
    love:"flirtatious and charming — needs a partner who matches intellectual and creative energy",
    body:"liver, thighs, hips, blood circulation",
    desc:"You are ruled by Jupiter — the great expander, the cosmic teacher, the one who makes everything bigger. Your laughter is generous, your ideas are large, and your optimism is genuinely infectious. The universe seems to say 'yes' to you more often than to most."},
  4:{planet:"Rahu/Uranus",color:"Blue/Grey/Earth tones",day:"Sunday (Rahu day)",gem:"Hessonite Garnet",metal:"Mixed metals",mantra:"Om Raam Rahave Namah",
    traits:"practicality, discipline, hard work, unconventionality, rebelliousness, endurance",
    shadow:"stubbornness, isolation, tendency toward sudden disruptions, hidden restlessness",
    career:"engineers, builders, project managers, social reformers, IT professionals, scientists",
    love:"slow to open, but deeply loyal once committed — fears abandonment more than known",
    body:"bones, lower back, nervous system",
    desc:"You are ruled by Rahu — the shadow planet of ambition, disruption, and unconventional paths. On the surface you appear stable, methodical, even predictable. Inside, there is a quiet revolutionary who chafes at anything that feels like a cage — including routines you yourself created."},
  5:{planet:"Mercury",color:"Green/Grey",day:"Wednesday",gem:"Emerald/Green Tourmaline",metal:"Brass",mantra:"Om Braam Breem Braum Sah Budhaya Namah",
    traits:"versatility, wit, communication, adaptability, curiosity, networking, quick thinking",
    shadow:"inconsistency, nervousness, scattered energy, superficiality, restlessness",
    career:"writers, journalists, traders, sales, consultants, brokers, teachers, digital creators",
    love:"needs intellectual stimulation above all — boredom is the real relationship killer",
    body:"nervous system, lungs, arms, tongue",
    desc:"You are ruled by Mercury — the fastest planet, the divine messenger, the trickster-genius. Your mind races ahead of your mouth, which races ahead of your body. You were curious before you were conscious — asking questions before you had the language for answers."},
  6:{planet:"Venus",color:"Pink/White/Indigo",day:"Friday",gem:"Diamond/White Sapphire",metal:"Silver/Copper",mantra:"Om Draam Dreem Draum Sah Shukraya Namah",
    traits:"beauty, love, harmony, creativity, responsibility, service, luxury appreciation",
    shadow:"over-giving, people-pleasing, possessiveness, difficulty with personal boundaries",
    career:"artists, designers, beauticians, healers, musicians, fashion, luxury goods, counselors",
    love:"love is the organizing principle of life — may give too much and expect reciprocity that doesn't come",
    body:"kidneys, lower back, throat, skin",
    desc:"You are ruled by Venus — the planet of love, beauty, and the magnetic pull between souls. You experience life more sensually, more aesthetically, more relationally than most. Every space you inhabit becomes more beautiful. Every person you love becomes more of themselves."},
  7:{planet:"Ketu/Neptune",color:"Violet/Purple/Pale yellow",day:"Monday (Ketu)",gem:"Cat's Eye",metal:"Mixed/no metal",mantra:"Om Kem Ketave Namah",
    traits:"spirituality, mysticism, analysis, introspection, research, solitude, psychic sensitivity",
    shadow:"detachment, aloofness, overthinking, difficulty in material world, hidden anxiety",
    career:"researchers, scientists, philosophers, mystics, healers, psychologists, writers",
    love:"merges completely or not at all — intimacy feels like exposure, solitude feels like home",
    body:"brain, nervous system, intestines, immune system",
    desc:"You are ruled by Ketu and Neptune — the planets of the invisible world. You see what others miss, feel what others suppress, know what hasn't been spoken. This makes you extraordinary in quiet rooms and uncomfortable in loud ones. You arrived here carrying wisdom that predates this body."},
  8:{planet:"Saturn",color:"Black/Dark Blue/Navy",day:"Saturday",gem:"Blue Sapphire (with caution)",metal:"Iron/Lead",mantra:"Om Praam Preem Praum Sah Shanaischaraya Namah",
    traits:"discipline, karma, authority, endurance, transformation through hardship, late blooming",
    shadow:"heaviness, delays, pessimism, karmic weight, difficulty trusting life's goodness",
    career:"businesspeople, politicians, architects, judges, executives, real estate, mining",
    love:"guarded and serious — may experience significant karmic relationships before finding true partnership",
    body:"bones, teeth, knees, skin, chronic conditions",
    desc:"You are ruled by Saturn — the great teacher, the relentless refiner. Your life path is not the easy road, and somewhere deep inside you have always known this. Saturn doesn't punish — it purifies. Everything it takes from you was either not truly yours or was preventing the arrival of something real."},
  9:{planet:"Mars",color:"Red/Crimson/Orange",day:"Tuesday",gem:"Red Coral",metal:"Copper",mantra:"Om Kraam Kreem Kraum Sah Bhaumaya Namah",
    traits:"courage, energy, humanitarianism, passion, leadership, universal compassion, completion",
    shadow:"aggression, impulsiveness, martyrdom, anger, taking on others' burdens compulsively",
    career:"surgeons, military, athletes, activists, emergency services, spiritual teachers, healers",
    love:"loves completely and universally — sometimes loves the idea of love more than specific humans",
    body:"head, blood, muscles, adrenals, reproductive system",
    desc:"You are ruled by Mars — planet of fire, courage, and primal life force. The number 9 in Vedic numerology represents completion, universality, and the energy that contains all other numbers within it. You feel deeply for humanity's suffering in a way that can exhaust you."}
};

const BHAGYANK_DESC={
  1:"Your destiny is to pioneer, to lead, to be first. The universe has structured your life so that you are repeatedly placed in positions requiring individual courage and initiative.",
  2:"Your destiny is to mediate, to harmonize, to build bridges between worlds. You are here to demonstrate that sensitivity is not weakness but the highest form of intelligence.",
  3:"Your destiny is to express, to create, to inspire. The universe needs your voice, your art, your humor, your particular way of making life feel larger and more beautiful.",
  4:"Your destiny is to build — systems, structures, foundations that last. The things you construct will outlive you. This requires patient endurance that most people cannot sustain.",
  5:"Your destiny is to experience, to communicate, to awaken others through your own awakening. Freedom is both your necessity and your gift to the world.",
  6:"Your destiny is to love, to heal, to create beauty and harmony in your sphere of influence. Responsibility comes naturally to you — and is also your most persistent teacher.",
  7:"Your destiny is to seek, to understand, to penetrate the mysteries that others are too distracted to notice. You are here to bring depth to a world that prefers surfaces.",
  8:"Your destiny is power, authority, and material mastery — used in service of something larger than personal gain. Saturn-ruled 8s carry the weight of karma most visibly.",
  9:"Your destiny is completion, universality, and compassionate service. You are the end of a cycle — the point at which individual experience dissolves into universal understanding.",
  11:"Your destiny carries the vibration of the Master Illuminator — 11 is the most psychically charged of all numbers. You are here to uplift, to channel higher consciousness into the world. This comes with exceptional sensitivity and, often, exceptional turbulence.",
  22:"Your destiny vibrates to the Master Builder — 22 is the most materially powerful of master numbers. You have the potential to build systems, institutions, or movements that transform the world at scale.",
  33:"Your destiny is the Master Teacher — the 33 vibration is the rarest and most spiritually demanding. Pure compassionate service, teaching, and healing are your highest calling."
};

const KARMIC_DEBT={
  13:{name:"Karmic Debt 13",warning:"The 13 carries the debt of laziness and misuse of creative energy in a previous cycle. This lifetime, work is the medicine — but not compulsive overwork. Rather, disciplined, purposeful effort that actually completes what it begins. Watch the pattern of starting strong and abandoning. The remedy is finishing."},
  14:{name:"Karmic Debt 14",warning:"The 14 carries the debt of freedom misused — irresponsibility, overindulgence of the senses, using freedom to escape rather than to create. This life brings repeated circumstances that demand you develop self-discipline around pleasure, substances, and commitments. The remedy is moderation and commitment to things that genuinely matter."},
  16:{name:"Karmic Debt 16",warning:"The 16 carries the debt of ego — specifically the inflation of the ego that builds beautiful but hollow structures (relationships, identities, belief systems) around an unexamined self. This lifetime brings the repeated pattern of these structures collapsing precisely when they seem most secure. The remedy is radical honesty and the willingness to rebuild from authentic foundations after each fall."},
  19:{name:"Karmic Debt 19",warning:"The 19 carries the debt of power misused — leadership exercised without consideration for others, strength used for domination rather than service. This lifetime, the universe repeatedly places you in positions of genuine power and simultaneously creates conditions that test whether you will use it wisely. The remedy is conscious leadership and genuine humility."}
};

const LO_SHU_POSITIONS={
  1:{plane:"Thought",meaning:"analytical mind, intellect, mental clarity",pos:[6,7]},// bottom-left
  2:{plane:"Thought",meaning:"intuition, sensitivity, emotional intelligence",pos:[6,8]},
  3:{plane:"Thought",meaning:"creative thinking, mental agility",pos:[6,9]},
  4:{plane:"Will",meaning:"practical ability, determination",pos:[5,7]},
  5:{plane:"Will",meaning:"balance, human experience, central force",pos:[5,8]},
  6:{plane:"Will",meaning:"creativity and imagination",pos:[5,9]},
  7:{plane:"Action",meaning:"physical action, sacrificial nature",pos:[4,7]},
  8:{plane:"Action",meaning:"practical wisdom, administrative ability",pos:[4,8]},
  9:{plane:"Action",meaning:"ambition, responsibility",pos:[4,9]}
};

// Lo Shu Grid layout: 4-9-2 / 3-5-7 / 8-1-6
const LO_SHU_GRID=[[4,9,2],[3,5,7],[8,1,6]];

function calcNumerology(birthYr,birthMo,birthDy){
  // Moolank (Psychic Number) - birth day only
  const moolankRaw=reduceToSingle(birthDy);
  const moolank=moolankRaw||9;

  // Bhagyank (Destiny Number) - full DOB
  const dobSum=birthDy+birthMo+birthYr;
  const bhagyankFull=String(birthDy).split("").concat(String(birthMo).split(""),String(birthYr).split("")).reduce((a,d)=>a+Number(d),0);
  const bhagyank=reduceNum(bhagyankFull);

  // Check raw numbers before reduction for Karmic Debt
  const dayTwoDigit=birthDy;
  const fullRawReduced=()=>{
    // reduce step by step to catch 13,14,16,19
    let s=birthDy+birthMo;
    let y=birthYr;while(y>9){y=String(y).split("").reduce((a,d)=>a+Number(d),0);}
    s+=y;
    if([13,14,16,19].includes(s))return s;
    while(s>9&&![11,22,33].includes(s)){const ns=String(s).split("").reduce((a,d)=>a+Number(d),0);if(ns===s)break;s=ns;}
    return s;
  };
  const rawBeforeReduce=fullRawReduced();
  const karmicDebt=[13,14,16,19].includes(dayTwoDigit)?dayTwoDigit:
    [13,14,16,19].includes(rawBeforeReduce)?rawBeforeReduce:null;
  const masterNumber=[11,22,33].includes(bhagyank)?bhagyank:
    [11,22,33].includes(moolank)?moolank:null;

  // Lo Shu Grid - which digits 1-9 appear in DOB
  const dobStr=String(birthDy).padStart(2,"0")+String(birthMo).padStart(2,"0")+String(birthYr);
  const gridCount={1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0};
  for(const ch of dobStr){const d=Number(ch);if(d>=1&&d<=9)gridCount[d]++;}
  const present_nums=Object.entries(gridCount).filter(([,c])=>c>0).map(([n])=>Number(n));
  const missing_nums=Object.entries(gridCount).filter(([,c])=>c===0).map(([n])=>Number(n));
  const repeat_nums=Object.entries(gridCount).filter(([,c])=>c>1).map(([n,c])=>({n:Number(n),c}));

  // Planes analysis
  const thoughtPlane=[1,2,3].filter(n=>gridCount[n]>0);
  const willPlane=[4,5,6].filter(n=>gridCount[n]>0);
  const actionPlane=[7,8,9].filter(n=>gridCount[n]>0);
  const mentalCol=[3,6,9].filter(n=>gridCount[n]>0); // right column
  const practicalCol=[1,4,7].filter(n=>gridCount[n]>0); // left column

  // Personal Year
  const curYear=new Date().getFullYear();
  const personalYearRaw=birthDy+birthMo+curYear;
  const personalYear=reduceToSingle(personalYearRaw);
  const pyTheme={
    1:"New beginnings — planting seeds, launching initiatives, establishing new identity",
    2:"Patience and partnership — relationships deepen, cooperation required, inner work prioritized",
    3:"Creative expression and joy — communication, social expansion, artistic projects flourish",
    4:"Hard work and foundation-building — discipline rewarded, no shortcuts, systems built",
    5:"Freedom and change — major life shifts, travel, breaking old patterns, unexpected opportunities",
    6:"Love, responsibility, and home — family, commitment, healing relationships, beauty creation",
    7:"Introspection and spiritual deepening — retreat, study, inner knowledge, mystical experiences",
    8:"Power and material achievement — career peak, financial moves, authority claimed",
    9:"Completion and release — ending cycles, letting go, clearing space for the new"
  };

  // Kua Number (needs gender - we'll compute both and note)
  // Male: 10 - last two digits of birth year (if sum > 9, reduce again)
  const yy=birthYr%100;
  const yySum=String(yy).split("").reduce((a,d)=>a+Number(d),0);
  const kuaMale=reduceToSingle(10-yySum)||9; // if result is 0, it's 9
  const kuaFemale=reduceToSingle(yySum+5)||9;

  // Missing number interpretations
  const missingDesc={
    1:"Missing 1: Difficulty with self-assertion and leadership. May defer to others, struggle with confidence, or have parents who undermined individuality. Remedy: wear gold/orange on Sundays, light a lamp at sunrise.",
    2:"Missing 2: Emotional sensitivity underdeveloped — may appear cold or struggle to receive love and cooperation. Remedy: wear white on Mondays, meditate near water.",
    3:"Missing 3: Limited creative self-expression or difficulty communicating joy. May have had a childhood where playfulness was discouraged. Remedy: yellow clothes on Thursdays, creative hobbies.",
    4:"Missing 4: Lack of practical groundedness — difficulty completing projects, building systems, or maintaining routines. Remedy: earth-tone colors, manual craftsmanship.",
    5:"Missing 5: Resistance to change and new experience — may be rigid, fearful of the unfamiliar, or over-cautious. Remedy: travel, green colors, breaking one routine weekly.",
    6:"Missing 6: Difficulty accepting love and responsibility. Possible wound around family or home. Remedy: pink or white in home décor, Friday rituals of gratitude.",
    7:"Missing 7: Lack of introspection or spiritual connection — may be entirely externally driven with no inner life. Remedy: purple candles, 10 minutes daily silence.",
    8:"Missing 8: Challenges with financial authority, material management, or executive function. Remedy: dark blue or black on Saturdays, iron or steel objects in home.",
    9:"Missing 9: Compassion blocked or difficulty completing cycles — may be self-centered or leave things unfinished. Remedy: red color therapy, Tuesday service to others."
  };

  const repeatingDesc={
    1:"Repeated 1s: Solar energy amplified — extraordinary willpower and potential for leadership, but must guard against authoritarian tendencies and isolation.",
    2:"Repeated 2s: Lunar sensitivity amplified — heightened intuition and empathy, but emotional overwhelm and co-dependency are real risks.",
    3:"Repeated 3s: Jovian expansiveness — exceptional creative potential and social gifts, but scattered energy and overextension are the shadows.",
    4:"Repeated 4s: Rahu energy intensified — unusual life path, sudden disruptions and breakthroughs, possible genius expressed through unconventional means.",
    5:"Repeated 5s: Mercury amplified — exceptional mental agility and communication gifts, but nervous exhaustion and commitment issues.",
    6:"Repeated 6s: Venus intensified — deep capacity for love and beauty, but boundary issues and over-responsibility for others.",
    7:"Repeated 7s: Ketu energy — profound spiritual gifts, possibly psychic, but extreme isolation tendency and detachment from ordinary life.",
    8:"Repeated 8s: Saturn intensified — rare capacity for sustained discipline and authority, but heaviness, delays, and karmic weight are magnified.",
    9:"Repeated 9s: Mars amplified — extraordinary compassion and completion energy, but anger, martyrdom, and burnout."
  };

  return{moolank,bhagyank,karmicDebt,masterNumber,gridCount,present_nums,missing_nums,
    repeat_nums,thoughtPlane,willPlane,actionPlane,personalYear,pyTheme,kuaMale,kuaFemale,
    missingDesc,repeatingDesc};
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PREDICTION ENGINE
// ═══════════════════════════════════════════════════════════════════════════
function buildPredictions(pos,lr,pih,asp,dashas,birthYr,birthMo,birthDy,name){
  const today=new Date();
  const age=today.getFullYear()-birthYr-(today<new Date(today.getFullYear(),birthMo-1,birthDy)?1:0);
  const H  =p=>houseOf(pos[p].rashi,lr);
  const HL =h=>houseLord(h,lr);
  const HR =h=>houseRashi(h,lr);
  const cd =dashas.find(d=>d.start<=today&&d.end>=today);
  const nd =dashas[dashas.indexOf(cd)+1];
  const cl =cd?.lord;
  const S2F={Su:"Sun",Mo:"Moon",Ma:"Mars",Me:"Mercury",Ju:"Jupiter",Ve:"Venus",Sa:"Saturn",Ra:"Rahu",Ke:"Ketu"};
  const clFull=cl?S2F[cl]||cl:null;
  const fmt=d=>d.toLocaleDateString("en-IN",{month:"long",year:"numeric"});

  const hasMal=h=>(pih[h]||[]).some(p=>MALEFICS.includes(p));
  const aspMal=h=>(asp[h]||[]).some(p=>MALEFICS.includes(p));
  const aspBen=h=>(asp[h]||[]).some(p=>BENEFICS.includes(p));
  const malInH=h=>(pih[h]||[]).filter(p=>MALEFICS.includes(p));
  const benInH=h=>(pih[h]||[]).filter(p=>BENEFICS.includes(p));
  const planetsIn=h=>(pih[h]||[]).join(", ");
  const hSig=h=>HOUSE_SIG[h-1]||"";
  const rName=r=>RASHI[r]||"";
  const elem=r=>ELEMENTS[r]||"";
  const joinAnd=arr=>arr.join(" and ");

  // Numerology
  const num=calcNumerology(birthYr,birthMo,birthDy);
  const mData=MOOLANK_DATA[num.moolank]||MOOLANK_DATA[1];
  const bDesc=BHAGYANK_DESC[num.bhagyank]||BHAGYANK_DESC[1];
  const pyDesc=num.pyTheme[num.personalYear]||"a transitional year";

  // Yogas
  const yogas=[];
  const jH=H("Jupiter"),mHouse=H("Moon"),jmDiff=Math.abs(((jH-mHouse+12)%12));
  if([0,3,6,9].includes(jmDiff)&&pos.Jupiter.dig!=="Debilitated")yogas.push({name:"Gaja Kesari Yoga",type:"benefic",desc:"Jupiter in Kendra from Moon — wisdom, prosperity, and societal respect"});
  if(pos.Sun.rashi===pos.Mercury.rashi)yogas.push({name:"Budha-Aditya Yoga",type:"benefic",desc:"Sun-Mercury conjunction — sharp intellect, communication mastery, analytical brilliance"});
  if(pos.Moon.rashi===pos.Mars.rashi)yogas.push({name:"Chandra-Mangal Yoga",type:"mixed",desc:"Moon-Mars conjunction — fierce entrepreneurial drive, emotional intensity, volatile brilliance"});
  if(pos.Moon.rashi===pos.Jupiter.rashi)yogas.push({name:"Gauri Yoga",type:"benefic",desc:"Moon-Jupiter conjunction — grace, spiritual wisdom, popular respect"});
  if(pos.Sun.rashi===pos.Jupiter.rashi)yogas.push({name:"Brahma Yoga",type:"benefic",desc:"Sun-Jupiter conjunction — dharmic authority, philosophical wisdom"});
  if(pos.Venus.rashi===pos.Jupiter.rashi)yogas.push({name:"Lakshmi-Narayana Yoga",type:"benefic",desc:"Venus-Jupiter conjunction — material and spiritual prosperity intertwined"});
  const ra=pos.Rahu.lon,ke=pos.Ketu.lon,span=norm(ke-ra);
  if(PLANETS.filter(p=>!["Rahu","Ketu"].includes(p)).every(p=>{const d=norm(pos[p].lon-ra);return d<span;}))
    yogas.push({name:"Kaal Sarpa Dosha",type:"malefic",desc:"All planets between Rahu-Ketu — karmic intensity, cyclical obstacles, dramatic reversals of fate"});
  const pmCfg={Mars:{name:"Ruchika",s:[0,9]},Mercury:{name:"Bhadra",s:[2,5]},Jupiter:{name:"Hamsa",s:[3,8,11]},Venus:{name:"Malavya",s:[1,6,11]},Saturn:{name:"Shasha",s:[6,9,10]}};
  for(const[p,c]of Object.entries(pmCfg))if(c.s.includes(pos[p].rashi)&&KENDRA.includes(H(p)))yogas.push({name:c.name+" Mahapurusha Yoga",type:"benefic",desc:p+" in Kendra in own/exalted sign — one of the five royal configurations described in BPHS"});
  let rajYoga=false;
  for(const tk of[5,9])for(const kn of[4,7,10]){const tl=HL(tk),kl=HL(kn);if(tl!==kl&&(H(tl)===kn||H(kl)===tk||pos[tl].rashi===pos[kl].rashi))rajYoga=true;}
  if(rajYoga)yogas.push({name:"Raj Yoga",type:"benefic",desc:"Trikona-Kendra lord connection — authority, public recognition, leadership rising above birth circumstances"});
  if(TRIKONA.includes(H(HL(2)))||KENDRA.includes(H(HL(2)))||TRIKONA.includes(H(HL(11)))||KENDRA.includes(H(HL(11))))yogas.push({name:"Dhana Yoga",type:"benefic",desc:"2nd/11th lords in favorable positions — genuine wealth accumulation over the lifetime"});
  if(DUSTHANA.includes(H(HL(6)))||DUSTHANA.includes(H(HL(8)))||DUSTHANA.includes(H(HL(12))))yogas.push({name:"Vipreet Raj Yoga",type:"benefic",desc:"Dusthana lords confined to dusthanas — adversity becomes the source of unexpected power"});
  const marsH=H("Mars"),mangal=[1,2,4,7,8,12].includes(marsH);
  if(mangal)yogas.push({name:"Mangal Dosha",type:"malefic",desc:"Mars in "+marsH+"th house — passionate intensity in partnerships, karmic testing through relationships"});
  for(const p of PLANETS){
    if(pos[p].dig==="Debilitated"){
      const debilLord=RASHI_LD[DEBIL[p]];
      if(debilLord&&(KENDRA.includes(H(debilLord))||pos[debilLord].dig==="Exalted"))
        yogas.push({name:"Neechabhanga Raj Yoga ("+p+")",type:"benefic",desc:p+"'s debilitation cancelled by dispositor — weakness transmuted to power"});
    }
  }

  // House lords / positions
  const h3l=HL(3),h3lH=H(h3l),h4l=HL(4),h4lH=H(h4l);
  const h5l=HL(5),h5lH=H(h5l),h6l=HL(6),h6lH=H(h6l);
  const h7l=HL(7),h7lH=H(h7l),h8l=HL(8),h8lH=H(h8l);
  const h9l=HL(9),h9lH=H(h9l),h10l=HL(10),h10lH=H(h10l);
  const h11l=HL(11),h12l=HL(12),h12lH=H(h12l);
  const lagL=HL(1),lagLH=H(lagL),lagLDig=pos[lagL]?.dig||"";
  const satH=H("Saturn"),venH=H("Venus"),merH=H("Mercury"),jupH=H("Jupiter");
  const rahuH=H("Rahu"),ketuH=H("Ketu"),sunH=H("Sun");
  const moonRashi=pos.Moon.rashi,moonNak=pos.Moon.nak,ascNak=pos.Ascendant.nak;
  const moonDig=pos.Moon.dig,jupDig=pos.Jupiter.dig,satDig=pos.Saturn.dig;
  const marsDig=pos.Mars.dig,venDig=pos.Venus.dig,merDig=pos.Mercury.dig,sunDig=pos.Sun.dig;
  const satAsp7=(asp[7]||[]).includes("Saturn"),marsAsp7=(asp[7]||[]).includes("Mars");
  const jupAsp7=(asp[7]||[]).includes("Jupiter"),jupAsp4=(asp[4]||[]).includes("Jupiter");
  const futureDashas=dashas.filter(d=>d.start>today);
  const cdH=clFull?H(clFull):1;
  const cdDig=clFull?pos[clFull]?.dig||"":"";
  const moonDescMap={Aries:"impulsive, action-driven, emotionally direct",Taurus:"stable, comfort-seeking, deeply attached to security",Gemini:"curious, scattered, craving mental stimulation",Cancer:"hyper-sensitive, deeply intuitive, tied to home",Leo:"dramatic, warm-hearted, needing recognition",Virgo:"analytical, anxious, prone to over-thinking",Libra:"relationally dependent, seeking harmony",Scorpio:"intense, secretive, carrying volcanic emotional depths",Sagittarius:"optimistic, freedom-loving, philosophically oriented",Capricorn:"reserved, carrying hidden burdens, slow to trust",Aquarius:"detached, humanitarian, emotionally unconventional",Pisces:"dreamy, compassionate, boundary-dissolving"};

  // Soul text helpers (no nested backticks)
  const lagnaDescMap={Aries:"a warrior-pioneer soul born to initiate and lead",Taurus:"a builder soul grounded in beauty and material mastery",Gemini:"a communicator soul gifted with language and dual perception",Cancer:"a nurturer soul of profound intuition and emotional memory",Leo:"a royal soul born to radiate, create, and lead through dignity",Virgo:"a healer-analyst soul called to serve and discern",Libra:"a diplomat soul seeking justice through relationships",Scorpio:"a transformer soul drawn to hidden truths and depth",Sagittarius:"a philosopher soul pursuing higher wisdom and freedom",Capricorn:"an architect soul building lasting structures through discipline",Aquarius:"a visionary soul wired to innovate and serve the collective",Pisces:"a mystic soul dissolving ego toward boundless compassion"};
  const numResonance=lagL===mData.planet?"a remarkable resonance — the same planetary energy governs both outer personality and inner psychic nature":"a complementary interplay between the outer "+lagL+" personality and inner "+mData.planet+" psychic nature";
  const numMasterTag=[11,22,33].includes(num.bhagyank)?" — a Master Number, indicating an accelerated evolutionary path":"";
  const numKarmaTag=num.karmicDebt?" The birth date carries Karmic Debt "+num.karmicDebt+": "+KARMIC_DEBT[num.karmicDebt].warning.split(".")[0]+".":"";
  const numAstroSynth="Numerologically, "+name+" carries Moolank "+num.moolank+" — ruled by "+mData.planet+". "+rName(lr)+" Lagna is ruled by "+lagL+", creating "+numResonance+". Bhagyank is "+num.bhagyank+numMasterTag+" — "+bDesc.split(".")[0].toLowerCase()+"."+numKarmaTag;
  const loShuMissing=num.missing_nums.length>0?"the numbers "+num.missing_nums.join(", ")+" are absent — karmic voids requiring conscious cultivation":"all numbers present — a broadly equipped soul";
  const loShuRepeat=num.repeat_nums.length>0?" Repeated: "+num.repeat_nums.map(r=>r.n+"×"+r.c).join(", ")+" — intensified energy.":"";
  const loShuLine="Lo Shu Grid: "+loShuMissing+"."+loShuRepeat+" Thought Plane (1-2-3): "+(num.thoughtPlane.length>0?"active ("+num.thoughtPlane.join(",")+")" : "dormant")+". Will Plane (4-5-6): "+(num.willPlane.length>0?"active ("+num.willPlane.join(",")+")" : "absent")+". Action Plane (7-8-9): "+(num.actionPlane.length>0?"active ("+num.actionPlane.join(",")+")" : "absent")+".";
  const soulText=name+" is "+(lagnaDescMap[rName(lr)]||"a complex soul")+". Lagna in "+rName(lr)+" ("+ascNak+", "+elem(lr)+" element). Lagna lord "+lagL+" in "+lagLH+"th house — "+hSig(lagLH)+". Moon in "+rName(moonRashi)+" ("+moonNak+") — "+(moonDescMap[rName(moonRashi)]||"complex emotional nature")+". Ketu in "+ketuH+"th house: past mastery in "+hSig(ketuH)+". Rahu in "+rahuH+"th house: karmic hunger for "+hSig(rahuH)+".\n\n"+numAstroSynth+"\n\n"+loShuLine;

  // ── 10 PAST REVELATIONS ──────────────────────────────────
  const past=[];

  // Past 1 — Childhood & Mother
  {
    const malIn4=malInH(4),benIn4=benInH(4);
    const satAsp4=(asp[4]||[]).includes("Saturn"),rahuAsp4=(asp[4]||[]).includes("Rahu");
    let title,body;
    if(malIn4.length>0||DUSTHANA.includes(h4lH)||satAsp4||rahuAsp4){
      title="A Childhood That Taught You to Build Your Own Inner World";
      const malSrc=malIn4.length>0?joinAnd(malIn4)+" in the 4th house":DUSTHANA.includes(h4lH)?"The 4th lord "+h4l+" in the "+h4lH+"th house (dusthana)":"Malefic aspects on the 4th house";
      const satPart=satAsp4?" Saturn's aspect on the 4th house indicates a home where love was expressed through duty rather than warmth — where discipline arrived more reliably than affection.":"";
      const rahuPart=rahuAsp4?" Rahu's aspect introduces instability or foreignness into the early environment — frequent moves, an unconventional family structure, or a mother navigating unusual circumstances.":"";
      const numPart=num.moolank===6||num.moolank===2?" Moolank "+num.moolank+" intensifies the longing for home and belonging, making the early disruptions feel particularly personal.":"";
      const loShuPart=num.missing_nums.includes(2)?" The missing 2 in your Lo Shu Grid confirms a karmic deficit around emotional receptivity — learning to receive love requires conscious cultivation.":num.missing_nums.includes(6)?" The missing 6 in your Lo Shu Grid indicates a karmic wound around home — the soul arrived with an incomplete template for family belonging.":"";
      body=malSrc+" creates an emotionally challenging early environment."+satPart+rahuPart+" Those with such 4th houses develop extraordinary emotional resilience precisely because they could not depend on external security. The gifts are real: independence, self-reliance, and a capacity for self-regulation others develop only through years of therapy. The shadow is an invisible difficulty accepting comfort — a part that reflexively prepares to lose what it loves."+numPart+loShuPart;
    }else if(benIn4.length>0||jupAsp4||TRIKONA.includes(h4lH)||KENDRA.includes(h4lH)){
      title="A Childhood That Gave You the Roots to Reach Anywhere";
      const benSrc=benIn4.length>0?"The presence of "+joinAnd(benIn4)+" in the 4th house":jupAsp4?"Jupiter's expansive and protective aspect on the 4th house":"The 4th lord "+h4l+" in the strong "+h4lH+"th house";
      const loShuPart=num.present_nums.includes(6)?" The presence of 6 in your Lo Shu Grid reinforces this — a natural instinct toward creating beauty and belonging in every environment you inhabit.":"";
      body=benSrc+" indicates a childhood characterized by genuine warmth, safety, and a mother who made you feel worth seeing. The childhood home was likely a space of beauty, learning, or cultural richness — where curiosity was welcomed and you were given permission to become who you were."+loShuPart+" This early security becomes the invisible bedrock under all future achievements.";
    }else{
      title="A Childhood of Paradoxes — Where Love and Complexity Coexisted";
      body="The 4th lord "+h4l+" in the "+h4lH+"th house channels the mother archetype through "+hSig(h4lH)+". There were moments of genuine warmth alternating with emotional ambiguity — a parent who tried and sometimes fell short. This complexity shaped a particular quality in "+name+": the ability to hold contradictions without requiring resolution. Numerologically, Moolank "+num.moolank+"'s quality of "+mData.traits.split(",")[0]+" resonates — both the childhood and the psychic number point toward the same developmental work.";
    }
    past.push({title,body});
  }

  // Past 2 — Education & Mind
  {
    let title,body;
    const jupGood=TRIKONA.includes(jupH)||KENDRA.includes(jupH);
    const h5mal=malInH(5).length>0,budhaAditya=pos.Sun.rashi===pos.Mercury.rashi;
    if(merDig==="Exalted"||merDig==="Own Sign"||(jupGood&&!h5mal)||budhaAditya){
      title="A Mind That Has Always Been Several Steps Ahead";
      const merStatus=merDig==="Exalted"?"exalted — at the pinnacle of analytical precision":merDig==="Own Sign"?"in own sign — fully at home in its intellectual gifts":budhaAditya?"in Budha-Aditya Yoga with the Sun — one of the most powerful combinations for intellectual authority":"well-placed";
      const btaPart=budhaAditya?" The Budha-Aditya Yoga produces minds that find the organizing principle and the central insight that makes everything else make sense.":"";
      const numPart=mData.planet==="Mercury"?" Moolank "+num.moolank+" doubles the mental gifts.":mData.planet==="Jupiter"?" Moolank "+num.moolank+" adds expansive synthesizing wisdom.":"";
      const loShuPart=num.present_nums.includes(3)?" The 3 in your Lo Shu Grid activates the Thought Plane's creative column — genuine creative intelligence alongside analytical ability.":"";
      body="Mercury "+merStatus+" in the "+merH+"th house indicates a mind that stood out from a young age."+btaPart+" There is a specific intellectual domain where "+name+" consistently operates at a level others must work hard to approach."+numPart+loShuPart;
    }else if(h5mal||merDig==="Debilitated"||merDig==="Enemy"){
      title="The Mind That Had to Fight for Its Own Recognition";
      const chalDesc=h5mal?"Malefic energy in the 5th house ("+joinAnd(malInH(5))+")":merDig==="Debilitated"?"Mercury debilitated in Pisces":"Mercury in "+merDig+" state";
      const piPart=merDig==="Debilitated"?" Debilitated Mercury in Pisces often produces exceptional intuitive intelligence — the right brain flourishes when the left brain's dominance is disrupted.":"";
      const loShuPart=num.missing_nums.includes(3)?" The missing 3 confirms this — creative expression and intellectual confidence are specifically flagged as karmic development areas.":num.missing_nums.includes(5)?" The missing 5 suggests learning through varied experience — rather than formal study — is the soul's designed educational path.":"";
      body=chalDesc+" created friction in the conventional educational environment. This is intellectual divergence, not limitation. The real intellectual flowering happens outside institutions."+piPart+loShuPart;
    }else{
      title="An Intelligence That Deepens With Every Decade";
      const numPart=num.moolank===num.bhagyank?"a doubled cognitive signature — psychic and destiny numbers aligned, making intellectual development unusually coherent":"a productive tension between the psychic mind's preferred mode and the destiny's broader learning agenda";
      const tpFull=num.present_nums.includes(1)&&num.present_nums.includes(2)&&num.present_nums.includes(3)?" The complete Thought Plane (1-2-3) means all three modes of intelligence — analytical, intuitive, and creative — are available.":"";
      body="Mercury in the "+merH+"th house ("+rName(pos.Mercury.rashi)+") shaped a mind oriented toward "+hSig(merH)+". The real intellectual awakening came through life experience rather than formal study. Numerologically, Moolank "+num.moolank+" and Bhagyank "+num.bhagyank+" point toward "+numPart+"."+tpFull;
    }
    past.push({title,body});
  }

  // Past 3 — Siblings & Peers
  {
    let title,body;
    const malIn3=malInH(3),benIn3=benInH(3),marsIn3=(pih[3]||[]).includes("Mars");
    if(marsIn3||malIn3.length>0||DUSTHANA.includes(h3lH)){
      title="Siblings and Peers — Relationships That Forged You in Fire";
      const malSrc=marsIn3?"Mars in the 3rd house — the most classical indicator of a competitive sibling relationship":malIn3.length>0?"The presence of "+joinAnd(malIn3)+" in the 3rd house":"The 3rd lord "+h3l+" in the "+h3lH+"th house (dusthana)";
      const numPart=num.moolank===9?" As Moolank 9, there is a deep pattern of taking on others' battles, sometimes at personal cost.":num.moolank===1?" As Moolank 1, the competitive environment actually activated your natural leadership instincts.":"";
      const loShuPart=num.missing_nums.includes(3)?" The missing 3 suggests the sibling/peer experience may have suppressed your natural voice, creating a pattern of holding back.":"";
      body=malSrc+" marks someone who had to fight for their position — in the family, in the classroom, in early social hierarchies. Nothing was handed. This built a specific quality of courage — not from confidence, but from having survived conflict and discovering you are still intact."+numPart+loShuPart;
    }else if(benIn3.length>0||TRIKONA.includes(h3lH)||KENDRA.includes(h3lH)){
      title="A Sibling Bond That Became a Lifelong Anchor";
      const benSrc=benIn3.length>0?joinAnd(benIn3)+" present in the 3rd house":"the 3rd lord "+h3l+" in the strong "+h3lH+"th house";
      const loShuPart=num.present_nums.includes(3)?" The 3 in your Lo Shu Grid activates the creative column — a specific intellectual vitality in the sibling bond.":"";
      body="With "+benSrc+", the sibling relationship or early peer group was a genuine source of support and formative connection. These early bonds modeled what genuine collaboration looks like."+loShuPart;
    }else{
      title="Sibling Dynamics — The Complex Middle Ground";
      const numPart=num.moolank===7||num.moolank===4?" Your Moolank reinforces an independent streak — you were built for depth over breadth in relationships.":" Your Moolank adds its own relational signature here.";
      body="The 3rd lord "+h3l+" in the "+h3lH+"th house presents a sibling narrative in the complex middle: not overt conflict, but also not the deep easy bond of natural allies. The relationship was marked by emotional distance or parallel living — sharing space without fully sharing inner worlds. The lesson carried into adult friendships is a specific kind of independence."+numPart;
    }
    past.push({title,body});
  }

  // Past 4 — Father & Fortune
  {
    let title,body;
    const malIn9=malInH(9),sunInKendra=KENDRA.includes(sunH);
    if(malIn9.length>0||aspMal(9)||DUSTHANA.includes(h9lH)){
      title="The Father Wound — and the Self-Made Fortune That Answered It";
      const malSrc=malIn9.length>0?joinAnd(malIn9)+" in the 9th house":DUSTHANA.includes(h9lH)?"The 9th lord "+h9l+" in the "+h9lH+"th house (dusthana)":"Malefic aspects on the 9th house";
      const numPart=num.bhagyank===8||num.bhagyank===4?" Bhagyank "+num.bhagyank+" — Saturn/Rahu-ruled — resonates with this. Your destiny vibrates to the frequency of earned fortune and authority built through personal discipline.":num.karmicDebt?" Karmic Debt "+num.karmicDebt+" adds another layer — the debt's energy may have been introduced through the father's pattern as a karmic inheritance.":"";
      body=malSrc+" is the classical indicator of a father who was either absent, limited, or whose presence created more burden than blessing. The message absorbed in childhood was: the most powerful figure in your world does not choose you consistently. This creates a particular karmic program — the drive to become powerful enough that the original wound is answered by the architecture of your own making. Fortune is absolutely real in this chart — but it requires activation through personal effort."+numPart;
    }else if((sunDig==="Exalted"||sunDig==="Own Sign"||sunInKendra)&&(TRIKONA.includes(h9lH)||KENDRA.includes(h9lH))){
      title="A Protective Father and the Inheritance of Grace";
      const sunDesc=sunDig==="Exalted"?"Sun exalted in Aries — the king planet at maximum expression":sunDig==="Own Sign"?"Sun in Leo — in its own regal domain":"Sun strong in a Kendra";
      const numPart=num.moolank===1||num.moolank===3?" Moolank "+num.moolank+" — ruled by "+mData.planet+", a natural ally of the 9th house's Jupiter energy — means psychic and fortunate energies are aligned. A specific kind of effortless expansion is available in this lifetime.":"";
      body=sunDesc+" combined with the 9th lord "+h9l+" in the fortunate "+h9lH+"th house indicates a father whose presence was genuinely beneficial — reliably enough present to create the psychological sense that powerful figures can be trusted. This chart carries innate Bhagya — a quality of fortune that feels almost structural."+numPart;
    }else{
      title="Fortune Built at the Intersection of Effort and Faith";
      const loShuPart=num.missing_nums.includes(9)?" The missing 9 in your Lo Shu Grid is significant — the completion energy requires deliberate cultivation.":"";
      body="The 9th lord "+h9l+" in the "+h9lH+"th house presents the most honest variety of fortune — tightly responsive to how one lives. The relationship with the father was mixed — loving in intention but limited in execution. This complexity shaped a very personal philosophy of life, constructed through direct experience rather than received from a father. Bhagyank "+num.bhagyank+": "+bDesc.split(".")[0].toLowerCase()+"."+loShuPart;
    }
    past.push({title,body});
  }

  // Past 5 — Health & Vitality
  {
    let title,body;
    const malIn6=malInH(6),benIn6=benInH(6);
    const satIn6=(pih[6]||[]).includes("Saturn"),marsIn6=(pih[6]||[]).includes("Mars");
    if(malIn6.length>0||satIn6||marsIn6){
      title="A Body That Has Carried More Than Its Share";
      const satPart=satIn6?" Saturn in the 6th indicates a constitution requiring careful management — chronic conditions, nervous system sensitivity, or a body that expresses the mind's unprocessed stress directly.":"";
      const marsPart=marsIn6?" Mars in the 6th creates a hot constitution — prone to inflammatory conditions and a tendency to push the body past sustainable limits. The upside: remarkable recovery capacity.":"";
      const loShuPart=num.missing_nums.includes(4)?" The missing 4 in your Lo Shu Grid points to a nervous system requiring grounding through consistent exercise, sleep, and mineral-rich nutrition.":num.missing_nums.includes(7)?" The missing 7 suggests immune system and mind-body connection need particular attention.":"";
      body="The 6th house carries "+joinAnd(malIn6.length>0?malIn6:["malefic influence"])+" in this chart."+satPart+marsPart+" The 6th is an Upachaya house — it improves with challenge. Malefics here often produce exceptional fighters who develop genuine health consciousness through adversity. Moolank "+num.moolank+"'s body areas ("+mData.body+") are particularly worth monitoring."+loShuPart;
    }else if(benIn6.length>0||TRIKONA.includes(h6lH)||KENDRA.includes(h6lH)){
      title="A Constitution Built for the Long Game";
      body="The 6th lord "+h6l+" strongly placed in the "+h6lH+"th house, with benefic influence, creates a naturally resilient constitution — a body that tends toward good recovery and ages with grace.";
    }else{
      title="Health as an Evolving Relationship With the Body";
      const pyPart=num.personalYear===4||num.personalYear===8?"this is a year requiring attention to skeletal structure and the effects of sustained pressure":num.personalYear===5?"nervous system support — regular movement and adequate rest — is especially important":"maintain existing health routines";
      body="The 6th lord "+h6l+" in the "+h6lH+"th house presents health as a domain requiring conscious engagement. The constitution is responsive to daily habits — what is done consistently matters enormously. Personal Year "+num.personalYear+": "+pyPart+".";
    }
    past.push({title,body});
  }

  // Past 6 — Hidden Talents & Creativity
  {
    let title,body;
    const jupIn5=(pih[5]||[]).includes("Jupiter"),venIn5=(pih[5]||[]).includes("Venus"),moonIn5=(pih[5]||[]).includes("Moon");
    const benIn5=benInH(5),malIn5=malInH(5);
    if(jupIn5||venIn5||moonIn5||venDig==="Exalted"||venDig==="Own Sign"||benIn5.length>0){
      title="A Creative Soul Whose Gifts Run Deeper Than They Have Been Expressed";
      const benDesc=jupIn5?"Jupiter in the 5th — a naturally philosophical, deeply creative mind that sees patterns others miss":venIn5?"Venus in the 5th creates an aesthetic sensibility that is genuinely extraordinary":moonIn5?"The Moon in the 5th creates a deeply imaginative, emotionally creative mind":"Benefic influence on the 5th house blesses creative gifts";
      const numPart=num.moolank===3||num.moolank===6?" Moolank "+num.moolank+" doubles the creative signature — creative expression is not optional for this soul, it is necessary.":"";
      const loShuPart=num.present_nums.includes(3)?" The 3 in your Lo Shu Grid activates the creative column — the gifts are genuinely accessible capacities waiting for consistent practice.":"";
      body=benDesc+". The hidden talent is almost certainly creative or expressive: music, writing, visual art, dance, or any domain where beauty and intelligence combine. These are the activities through which "+name+" enters genuine aliveness."+numPart+loShuPart;
    }else if(malIn5.length>0||DUSTHANA.includes(h5lH)){
      title="Creative Gifts That Had to Fight Their Way to the Surface";
      const malDesc=malIn5.length>0?"Malefic energy in the 5th house ("+joinAnd(malIn5)+")":"The 5th lord "+h5l+" in the "+h5lH+"th house";
      const loShuPart=num.missing_nums.includes(3)?" The missing 3 pinpoints this — creative expression is the specific karmic void. The prescription is expressing imperfectly and repeatedly until it finds its level.":"";
      body=malDesc+" indicates creative impulses that encountered obstacles in their development — dismissal, academic pressure, or economic necessity demanding employability over expression. The creativity is present but has been suppressed long enough that trust in one's own creative authority has been shaken."+loShuPart;
    }else{
      title="A Talent Portfolio Quietly Composting Into Mastery";
      const numPart=num.bhagyank===3||num.bhagyank===6?" Bhagyank "+num.bhagyank+" places creative expression at the center of the destiny — time invested in creative practice is dharmic alignment.":"";
      body="The 5th lord "+h5l+" in the "+h5lH+"th house indicates creative gifts that develop through accumulation. There is likely a creative practice that "+name+" has returned to repeatedly throughout life — for intrinsic satisfaction. This is the 5th house's truest expression."+numPart;
    }
    past.push({title,body});
  }

  // Past 7 — Relationships
  {
    let title,body;
    const malIn7=malInH(7),benIn7=benInH(7),jupIn7=(pih[7]||[]).includes("Jupiter");
    if(mangal&&(marsAsp7||marsH===7)){
      title="Love Has Never Been Quiet — Passion, Conflict, and the Lessons Between";
      const marsDesc=marsH===7?"Mars sitting directly in the house of partnership":"Mars powerfully aspecting the 7th house";
      const numPart=num.moolank===9||num.moolank===1?" Moolank "+num.moolank+" — ruled by Mars/Sun — creates doubled martial energy in the relationship sphere. The partner who works for this chart is someone with genuine inner strength.":num.moolank===2||num.moolank===6?" The tension between Mars/7th house fire and Moolank "+num.moolank+"'s need for harmony creates the central relational paradox of this life.":"";
      const loShuPart=num.missing_nums.includes(2)?" The missing 2 points to a specific pattern: receiving love — being soft enough to be held — is the learned skill this lifetime is demanding.":"";
      body=marsDesc+" with Mangal Dosha present — this is the chart of someone for whom relationships have been anything but neutral. Every significant relationship has arrived with force, escalated quickly, and carried a recurring theme: the meeting of two strong wills. Each ended partnership has contributed a specific understanding of the difference between desire and respect."+numPart+loShuPart;
    }else if(satAsp7||DUSTHANA.includes(h7lH)){
      title="Love Delayed — And All the Richer for the Wait";
      const numPart=num.bhagyank===8||num.moolank===8?" Bhagyank/Moolank 8 — Saturn-ruled — creates a doubled karmic weight in the relationship area. The number 8 is associated with the most serious relational lessons.":num.karmicDebt===16?" Karmic Debt 16 is specifically about idealized structures collapsing — and romantic relationships are the most common arena for this.":"";
      const loShuPart=num.missing_nums.includes(6)?" The missing 6 highlights the specific learning edge: accepting love without suspecting it, receiving care without sabotaging it.":"";
      body="Saturn's aspect on the 7th house or the 7th lord "+h7l+" in the "+h7lH+"th house is the signature of delayed but ultimately serious and lasting partnership. Saturn takes from the relationship sphere what was not authentic and leaves only what was real. This is a painful but thorough education."+numPart+loShuPart;
    }else if(jupIn7||jupAsp7||venDig==="Exalted"||venDig==="Own Sign"){
      title="A Genuine Capacity for Sacred Partnership — The Real Thing";
      const numPart=num.moolank===6?" Moolank 6 — Venus-ruled — creates a person for whom love is genuinely the organizing principle of life.":num.moolank===2?" Moolank 2 — Moon-ruled — doubles the relational emphasis. The question is whether you can love fully while remaining fully yourself.":"";
      body="Jupiter in or aspecting the 7th house creates genuine capacity for blessed partnership — not the performance of relationship but its actual substance. Past romantic experiences have contained real beauty and moments of genuine recognition. The shadow is idealization — seeing partners at their best rather than as they consistently are."+numPart;
    }else{
      title="Partnership as a Mirror — Relationships That Reveal the Self";
      body="The 7th house ("+rName(HR(7))+" — "+elem(HR(7))+" energy) with lord "+h7l+" in the "+h7lH+"th house indicates that relationships have been the primary vehicle of self-discovery. Each significant partner has held up a specific mirror — reflecting back a particular aspect of "+name+"'s unintegrated material. Bhagyank "+num.bhagyank+": "+bDesc.split(".")[0].toLowerCase()+".";
    }
    past.push({title,body});
  }

  // Past 8 — Career
  {
    let title,body;
    const benIn10=benInH(10);
    if(satDig==="Exalted"&&[3,6,10,11].includes(satH)){
      title="The Professional Journey: A Monument Built One Stone at a Time";
      const numPart=num.bhagyank===8?" Bhagyank 8 — Saturn's own number — and Saturn exalted create an almost unbreakable configuration for eventual professional authority.":num.moolank===8?" Moolank 8's Saturn energy means the work ethic is psychic — embedded so deeply it doesn't feel like discipline, it feels like nature.":"";
      body="Saturn exalted in an Upachaya house ("+satH+") is one of the most powerful career configurations. The professional trajectory follows a specific pattern: early invisibility despite genuine capability, responsibility above formal title, and ultimately a professional standing that exceeds the expectations of everyone who knew "+name+" at the starting point. Every year of patient, quality work has been deposited into an account that pays increasing interest."+numPart;
    }else if(malInH(10).length>0||DUSTHANA.includes(h10lH)||aspMal(10)){
      title="Career Obstacles That Were Actually a Re-Routing System";
      const malSrc=malInH(10).length>0?"Malefic planets in the 10th house":"The 10th lord "+h10l+" in the "+h10lH+"th house";
      const numPart=num.karmicDebt?" Karmic Debt "+num.karmicDebt+" adds a specific texture to the career obstacles.":num.bhagyank===4?" Bhagyank 4 is the signature of the unconventional professional path — you were not built for the ladder but for the tunnel beneath it.":"";
      const loShuPart=num.missing_nums.includes(8)?" The missing 8 indicates specific development needed around financial authority and the capacity to claim material power.":"";
      body=malSrc+" indicates significant professional redirections — moments where the clear road forward suddenly closed. The obstacles were not random misfortune — they were the chart's method of preventing "+name+" from committing fully to the wrong professional path."+numPart+loShuPart;
    }else{
      title="A Career Quietly Becoming What It Was Always Meant to Be";
      const elemDesc=elem(HR(10))==="Fire"?"visible leadership and creative direction":elem(HR(10))==="Earth"?"practical mastery, system-building, and tangible results":elem(HR(10))==="Air"?"communication, analysis, and the knowledge economy":"emotional intelligence and relational depth as professional assets";
      const pyPart=num.personalYear===1?"a year for new professional initiatives":num.personalYear===8?"the career peak of the nine-year cycle — moves made now carry maximum impact":num.personalYear===9?"the year of professional completion":"year "+num.personalYear+" energy";
      body="The 10th house ("+rName(HR(10))+" — "+elem(HR(10))+" element) with lord "+h10l+" in the "+h10lH+"th house indicates a professional life moving toward genuine alignment through "+elemDesc+". Personal Year "+num.personalYear+": "+pyPart+".";
    }
    past.push({title,body});
  }

  // Past 9 — The Hidden Self (8th house)
  {
    let title,body;
    const malIn8=malInH(8),benIn8=benInH(8);
    const ketuIn8=ketuH===8,satIn8=(pih[8]||[]).includes("Saturn"),marsIn8=(pih[8]||[]).includes("Mars");
    if(ketuIn8||satIn8||marsIn8||malIn8.length>0){
      title="The Underworld You Have Visited — and What You Brought Back";
      const in8Desc=ketuIn8?"Ketu in the 8th house creates a person who has already been to the underworld and returned — a quality of having survived something perceptible to sensitive people":satIn8?"Saturn in the 8th house marks someone carrying genuine ancestral or past-life psychological weight that must be consciously metabolized":"Malefic planets in the 8th house have made the themes of transformation and loss more than theoretical";
      const numPart=num.moolank===7?" Moolank 7 — Ketu-ruled — creates a natural resonance with the 8th house's depth. Beneath the ordinary surface, you have always known there is something else.":num.moolank===8?" Moolank 8 carries its own karmic weight in resonance with the 8th house — specifically designed for the serious excavation of life's most essential questions.":"";
      body=in8Desc+". They have been lived. The 8th house carries the chart's most intimate biographical material — the specific encounters with limitation and mortality that shaped "+name+"'s deepest understanding of what matters."+numPart;
    }else{
      title="The Quiet Depths — A Private Spiritual Life That Deepens With Age";
      const numPart=num.moolank===7||num.bhagyank===7?" Moolank/Bhagyank 7 — the seeker's number — resonates with the 8th house's invitation to depth. The natural orientation toward solitude and mystical investigation aligns with the astrological indication.":"";
      body="The 8th lord "+h8l+" in the "+h8lH+"th house indicates that transformative experiences have been internal rather than dramatic: gradual psychological evolution and a deepening relationship with mortality through reflection. There is likely a private spiritual practice that provides genuine meaning without public declaration."+numPart;
    }
    past.push({title,body});
  }

  // Past 10 — The Karmic Axis
  {
    const ketuRashiName=rName(pos.Ketu.rashi),rahuRashiName=rName(pos.Rahu.rashi);
    const ketuMasteries=["courage, initiative, and independent action","beauty, pleasure, and material security","communication, versatility, and mental agility","emotional depth, nurturing, and home-making","leadership, creativity, and self-expression","analytical precision, healing, and service","harmony-seeking, diplomacy, and relational grace","intensity, transformation, and occult knowledge","philosophical wisdom and far-reaching perspective","disciplined mastery and long-term structural thinking","humanitarian vision and social innovation","mystical receptivity and universal compassion"];
    const ketuMastery=ketuMasteries[pos.Ketu.rashi]||"deep mastery";
    const axisNum=num.bhagyank===1&&rahuH===1?"Both the numerological and astrological vectors point toward fully inhabiting individual authority.":num.bhagyank===9&&ketuH===9?"The irony is the teaching: you arrived with universal compassion already developed and your destiny is to complete the same journey through lived experience.":"Bhagyank "+num.bhagyank+" and Rahu in the "+rahuH+"th house speak to the same evolutionary theme from different angles — the convergence is confirmation.";
    const title="The Karmic Axis: From "+ketuRashiName+" Mastery Toward "+rahuRashiName+" Destiny";
    const body="Ketu in "+ketuRashiName+" ("+ketuH+"th house — "+hSig(ketuH)+") represents deep mastery carried from previous lives — "+ketuMastery+". These qualities come almost too naturally — a foundation available without effort, and also a comfort zone that prevents the evolution this incarnation requires.\n\nRahu in "+rahuRashiName+" ("+rahuH+"th house — "+hSig(rahuH)+") is the magnetic north of this lifetime's soul journey. Rahu's domain feels uncomfortable precisely because it represents new territory. The pattern of this lifetime: being pulled toward the Rahu direction, making progress, retreating to Ketu's comfort zone, then being pulled forward again.\n\n"+axisNum+" The conscious integration of Rahu's invitation — living in "+rahuRashiName+"'s qualities without apology — is the central work of this lifetime.";
    past.push({title,body});
  }

  // ── PRESENT ─────────────────────────────────────────────
  const dashaChars={Su:"stepping into authority, identity, and visibility — stop making yourself smaller than you are",Mo:"emotional tides, family dynamics, and the inner world — the interior landscape must be honored as seriously as the exterior",Ma:"decisive action, ambition, courage, and property — Mars does not wait and does not forgive hesitation",Me:"communication, commerce, skill development, and networking — precise thinking and strategic relationship cultivation",Ju:"expansion, wisdom, grace, and dharmic alignment — increase in every domain aligned with authentic purpose",Ve:"beauty, love, creative expression, and the quality of daily life — are you living beautifully, loving fully, creating consistently?",Sa:"karma, patience, foundations — Saturn strips away everything inessential and demands that what remains be worthy of it",Ra:"ambition beyond conventional maps, identity reinvention, and the soul's evolutionary edge",Ke:"spiritual turning points, detachment, and past-life patterns surfacing for integration"};
  const cdChar=dashaChars[cl]||"multi-domain complexity";
  const ndDesc=nd?"The "+nd.name+" Mahadasha begins "+fmt(nd.start)+", shifting focus toward "+(dashaChars[nd.lord]||"").split("—")[0]+".":"";
  const presMain=name+" is currently in the "+( cd?.name||"?")+" Mahadasha (until "+(cd?fmt(cd.end):"unknown")+"). "+cdChar+". The Dasha lord "+(cd?.name)+" sits in the "+cdH+"th house ("+hSig(cdH)+") in "+(cdDig||"its current")+" state. Numerologically, "+name+" is in Personal Year "+num.personalYear+" — "+pyDesc+". "+ndDesc;

  const present={};

  // Present — Family
  const fam4Mal=malInH(4).length>0||(asp[4]||[]).some(p=>["Saturn","Rahu"].includes(p));
  const famBase=fam4Mal?"The 4th house carries active tension — family dynamics may be strained or the domestic environment is in a period of restructuring.":"Benefic 4th house energy creates a currently supportive home environment. Family bonds are harmonious or actively being strengthened.";
  const famNum=num.personalYear===6?" Personal Year 6 specifically activates family, home, and responsibility.":num.personalYear===4?" Personal Year 4 requires building stable domestic foundations — practical solutions over emotional reactions.":" Personal Year "+num.personalYear+" colors the family arena with: "+pyDesc.split("—")[0].toLowerCase()+".";
  const famLoShu=num.missing_nums.includes(6)?" The missing 6 in the Lo Shu Grid suggests home and family is a specific developmental arena this lifetime.":"";
  present.family=famBase+famNum+famLoShu;

  // Present — Career
  const careerActive=clFull===h10l||cdH===10||cl==="Su"||clFull===HL(1);
  const careerBase=careerActive?"The current Mahadasha powerfully activates career themes — this is a pivotal professional window. Opportunities for recognition or authority are live. Effort invested now directly determines professional standing for the next 5-8 years.":cl==="Sa"||cl==="Ra"||cl==="Ke"?"The "+( cd?.name)+" Mahadasha brings career transformation rather than linear advancement. Professional direction may be fundamentally questioned — the chart is clearing an inauthentic path.":"Career during the "+(cd?.name)+" Mahadasha is "+(cl==="Ju"||cl==="Ve"?"genuinely favorable — expansion and growth are natural byproducts.":"steady and developmental — seeds planted now determine the next harvest.");
  const careerNum=num.bhagyank===1||num.bhagyank===8||num.bhagyank===22?" Bhagyank "+num.bhagyank+" is the executive destiny signature — authority and professional recognition are literal destiny requirements.":" Personal Year "+num.personalYear+(num.personalYear===8?" is the career peak of the nine-year cycle.":" intersects with career: "+pyDesc.split("—")[0].toLowerCase()+".");
  const careerLoShu=num.missing_nums.includes(1)?" The missing 1 in the Lo Shu Grid indicates that developing professional assertiveness is a specific career task this lifetime.":"";
  present.career=careerBase+careerNum+careerLoShu;

  // Present — Love
  const loveDashaActive=clFull===h7l||cl==="Ve"||cdH===7;
  const loveBase=loveDashaActive?"Venus or the 7th lord being activated makes relationships the primary arena of life right now. The quality of love available mirrors precisely the degree of self-love cultivated in the preceding years.":satAsp7&&(cl==="Sa"||cl==="Ke")?"Saturn's involvement creates a serious reckoning in the relationship sphere. What is real in current or potential partnerships will be made unmistakably clear. What survives will be genuinely real.":"The relationship sector is relatively quiet in this Dasha — but evolving internally. The 7th lord "+h7l+" in the "+h7lH+"th house continues its permanent influence.";
  const loveNum=" Moolank "+num.moolank+" governs the relational style: "+mData.love+".";
  const loveLoShu=num.missing_nums.includes(2)?" The missing 2 in the Lo Shu Grid — learning to receive as gracefully as you give is the specific relational work this lifetime is requiring.":"";
  present.love=loveBase+loveNum+loveLoShu;

  // Present — Finance
  const finActive=[h7l,HL(2),HL(11)].includes(clFull)||["Ju","Ve"].includes(cl)||yogas.some(y=>y.name==="Dhana Yoga");
  const dhanaTag=yogas.some(y=>y.name==="Dhana Yoga")?" The Dhana Yoga is being triggered — significant wealth accumulation is possible for those who take initiative with discipline.":"";
  const finBase=finActive?"Financial energy is strongly activated."+dhanaTag+" Income streams may multiply. The equal and opposite risk is overspending at the same rate as earning.":DUSTHANA.includes(cdH)||cl==="Sa"||cl==="Ke"?"The current Dasha carries financial restriction or unexpected expenses. This is not the period for speculative investment — build cash reserves and develop skills for the next favorable Dasha.":"Financial life during the "+(cd?.name)+" Mahadasha is stable with gradual growth.";
  const finNum=num.bhagyank===8||num.bhagyank===4?" Bhagyank "+num.bhagyank+" carries the financial destiny of the disciplined accumulator — compound growth of patient, systematic management.":" Personal Year "+num.personalYear+(num.personalYear===8?" is the financial year of the nine-year cycle.":" intersects with finance: "+pyDesc.split("—")[0].toLowerCase()+".");
  const finLoShu=num.missing_nums.includes(8)?" The missing 8 in the Lo Shu Grid points to a karmic void around financial authority — developing this capacity is one of the central practical tasks this lifetime has assigned.":"";
  present.finance=finBase+finNum+finLoShu;

  // Present — Inner
  const innerBase=cl==="Ke"||ketuH===1||ketuH===12?"Ketu's activation creates a powerful internal pull toward introspection and releasing identities that no longer serve. This is one of the most fertile periods for genuine spiritual development — solitude and philosophical inquiry are investments in the next version of life.":cl==="Ju"||jupH===1?"Jupiter's activation brings genuine wisdom expansion. Increased faith in life's larger design, natural movement toward teaching others, deepening philosophical understanding.":"The inner world reflects the "+(cd?.name)+" Mahadasha's quality — "+cdChar.split("—")[0]+". The central psychological work: integrating the themes of the "+cdH+"th house ("+hSig(cdH)+") at a deeper level of consciousness.";
  const innerNum=" Moolank "+num.moolank+": "+mData.desc.split(".")[0]+".";
  const innerPlane=num.thoughtPlane.length>0&&num.willPlane.length>0&&num.actionPlane.length>0?" All three Lo Shu planes active — a broadly resourced inner life.":num.thoughtPlane.length>num.actionPlane.length?" Thought Plane dominance — the inner life is rich, but translation into tangible action may require deliberate effort.":" Action Plane dominance — strong practical energy, but the deeper reflective life needs cultivation.";
  present.inner=innerBase+innerNum+innerPlane;

  // Present — Lo Shu Reading
  {
    const lsrThought=num.thoughtPlane.length===3?"complete Mental Plane (1-2-3) — all three thinking styles available":num.thoughtPlane.length>0?"partial Mental Plane: "+num.thoughtPlane.join(",")+" active":"Mental Plane dormant";
    const lsrWill=num.willPlane.length===3?"complete Will Plane (4-5-6) — extraordinary determination":num.willPlane.length>0?"Will Plane numbers "+num.willPlane.join(",")+" present":"Will Plane absent";
    const lsrAction=num.actionPlane.length===3?"complete Action Plane (7-8-9) — powerful executive energy":num.actionPlane.length>0?"Action Plane numbers "+num.actionPlane.join(",")+" present":"Action Plane absent";
    const lsrRepeats=num.repeat_nums.length>0?" Repeated: "+num.repeat_nums.map(r=>r.n+" (x"+r.c+")").join(", ")+" — amplified energies, both gifts and blind spots.":"";
    const lsrMissing=num.missing_nums.length>0?" Missing: "+num.missing_nums.join(", ")+" — karmic voids. "+num.missing_nums.slice(0,3).map(n=>num.missingDesc[n]).join(" "):"";
    const lsrMaster=num.masterNumber?" Master Number "+num.masterNumber+" present — "+(num.masterNumber===11?"Master Illuminator: heightened psychic sensitivity and visionary potential.":num.masterNumber===22?"Master Builder: potential to construct systems that transform reality at scale.":num.masterNumber===33?"Master Teacher: the rarest vibration, associated with pure compassionate service.":""):"";
    present.loShuReading="Lo Shu Grid for "+name+": "+lsrThought+"; "+lsrWill+"; "+lsrAction+"."+lsrRepeats+lsrMissing+lsrMaster;
  }

  // Present — Personal Year
  {
    const pyDetails={1:"New beginnings — plant seeds, launch initiatives. Bold action rewarded. Waiting for perfect conditions is the 1 Year's specific trap.",2:"Patience and partnership — cultivate connection and depth. Relationships deepened this year carry unusual longevity.",3:"Creative expression and joy — communications and artistic projects flourish. Take every opportunity to be seen and create.",4:"Hard work and foundation-building — systems built this year carry the next four years. What is built slowly and well lasts.",5:"Freedom and change — major life shifts, breaking old patterns. Discernment between evolutionary versus merely novel changes.",6:"Love, responsibility, and home — family demands increase; creative and aesthetic projects flourish. Invest in relationships closest to the heart.",7:"Introspection and spiritual deepening — retreat, study, solitary reflection. What is discovered in solitude this year becomes the foundation of the next cycle.",8:"Power and material achievement — career peak, financial moves, authority claimed. Moves made in an 8 Year carry ten times the impact of other years.",9:"Completion and release — ending cycles, letting go, clearing space. The quality of release determines the quality of the new beginning."};
    present.personalYear="Personal Year "+num.personalYear+" ("+new Date().getFullYear()+"): "+(pyDetails[num.personalYear]||pyDesc)+" For "+name+" specifically: the domains governed by Lagna lord "+lagL+" and Rahu's "+rahuH+"th house ("+hSig(rahuH)+") are most activated by this year's vibration.";
  }

  // ── 10 FUTURE PROPHECIES ─────────────────────────────────
  const future=[];

  // Future 1 — Career Peak
  {
    let title,body;
    const cDasha=futureDashas.find(d=>S2F[d.lord]===h10l||H(S2F[d.lord]||d.lord)===10||d.lord==="Su"||S2F[d.lord]===HL(1));
    if(cDasha){
      const yAway=((cDasha.start-today)/(365.25*86400000)).toFixed(1);
      const yogaDesc=rajYoga?"the Raj Yoga activates fully — authority, recognition, and positions of genuine leadership become not just possible but likely":satDig==="Exalted"?"Saturn's exaltation delivers its harvest — years of patient disciplined effort compound into visible achievement":"the chart's professional indicators converge for maximum expression";
      const numPart=num.bhagyank===1||num.bhagyank===8||num.bhagyank===22?" Bhagyank "+num.bhagyank+" is the executive destiny signature — "+bDesc.split(".")[0].toLowerCase()+". The "+cDasha.name+" Dasha is when this promise reaches fullest expression.":" Personal Year 8 within this Dasha will further amplify professional momentum.";
      const elemDesc=elem(HR(10))==="Fire"?"leadership that inspires rather than commands":elem(HR(10))==="Earth"?"creation of something tangible and lasting — a system, body of work, or institution that outlives the active effort":elem(HR(10))==="Air"?"mastery of communication and ideas — being recognized as someone whose perspective genuinely matters":"cultivation of emotional intelligence as a professional asset";
      title="The Professional Peak — "+cDasha.name+" Mahadasha ("+fmt(cDasha.start)+", ~"+yAway+" Years)";
      body="The "+cDasha.name+" Mahadasha represents the most significant career window in this chart's future. Every indicator points the same direction: "+yogaDesc+". The 10th house in "+rName(HR(10))+" ("+elem(HR(10))+" element) expresses at its highest frequency.\n\n"+numPart+" The most important preparation is not skill acquisition — it is clearing the psychological obstacles to receiving what this period is willing to give.\n\nThe professional expression at its peak: "+elemDesc+".";
    }else{
      title="Professional Fulfillment Through the Current Dasha's Full Development";
      body="The most potent career activation in the near-term is deepening the current "+(cd?.name)+" Mahadasha. The professional seeds being planted now determine the ceiling available in the next career-activating cycle. Bhagyank "+num.bhagyank+": "+bDesc.split(".")[0].toLowerCase()+".";
    }
    future.push({title,body});
  }

  // Future 2 — Partnership
  {
    let title,body;
    const vDasha=futureDashas.find(d=>d.lord==="Ve");
    const h7Dasha=futureDashas.find(d=>S2F[d.lord]===h7l);
    const tDasha=[vDasha,h7Dasha].filter(Boolean).sort((a,b)=>a.start-b.start)[0];
    if(tDasha){
      const yAway=((tDasha.start-today)/(365.25*86400000)).toFixed(1);
      const jupIn7=(pih[7]||[]).includes("Jupiter");
      if(jupAsp7||jupIn7||venDig==="Exalted"||venDig==="Own Sign"){
        title="Sacred Partnership — The "+tDasha.name+" Dasha Union ("+fmt(tDasha.start)+")";
        const numPart=num.moolank===6||num.moolank===2?" Moolank "+num.moolank+" — the Venus/Moon number of love — is arriving at its fullest expression during this Dasha. This is the central relational event of the lifetime.":num.bhagyank===6||num.bhagyank===2?" Bhagyank "+num.bhagyank+" places love and partnership at the center of the destiny.":"The Kua number ("+num.kuaMale+" for males / "+num.kuaFemale+" for females) provides directional guidance for the partner's arrival.";
        body="Jupiter's grace on the 7th house combined with the "+tDasha.name+" Mahadasha (~"+yAway+" years away) creates one of the most auspicious partnership windows in this chart's entire timeline. The classical texts describe this configuration as 'a union that elevates both parties.' The partner likely carries Jupiterian qualities: philosophical depth, ethical integrity, genuine commitment to growth. "+numPart+" The inner preparation required: self-worth must be established before this Dasha begins. The Jupiter-blessed partner will not fill a void — they will enhance what is already full.";
      }else if(mangal||satAsp7||DUSTHANA.includes(h7lH)){
        title="A Transformative Union — Catalytic Partnership in the "+tDasha.name+" Period";
        const numPart=num.karmicDebt===16?" Karmic Debt 16 — the specific debt of idealized structures collapsing — is most likely experienced in the relationship domain during this Dasha.":num.moolank===9?" Moolank 9 tends to experience love as complete commitment that can border on martyrdom. This Dasha asks: can you love fully while remaining fully yourself?":"";
        body="The "+tDasha.name+" Dasha (~"+yAway+" years) activates the 7th house with all its karmic weight. This is the relationship that changes everything — the one that requires the most and ultimately reveals the most about who "+name+" actually is. "+numPart+" What survives this Dasha, approached with honesty, will be genuinely, permanently real.";
      }else{
        title="Partnership and Fulfillment — "+tDasha.name+" Period ("+fmt(tDasha.start)+")";
        const h7Descs=["courage and initiative","reliability and sensual warmth","intellectual vitality","emotional depth and nurturing","charisma and warmth","analytical reliability","aesthetic sensitivity and balance","transformative depth and loyalty","philosophical depth and adventure","practical reliability","humanitarian vision","compassionate depth"];
        const h7RashiDesc=h7Descs[HR(7)]||"distinctive personal qualities";
        body="The "+tDasha.name+" Mahadasha (~"+yAway+" years) brings relationships to the foreground with clarity. The 7th house in "+rName(HR(7))+" describes the partner's energy: "+h7RashiDesc+". Kua number ("+num.kuaMale+" / "+num.kuaFemale+") provides directional guidance for the partner's arrival.";
      }
    }else{
      title="Partnership Energy Most Potent in the Current Life Chapter";
      body="The most significant relationship activation is currently live. The 7th lord "+h7l+" in the "+h7lH+"th house creates the permanent relational architecture. Genuine partnership commitment is available within the current Dasha period. Moolank "+num.moolank+"'s relational style — "+mData.love+" — is the inner compass for this timing.";
    }
    future.push({title,body});
  }

  // Future 3 — Wealth
  {
    let title,body;
    const wDasha=futureDashas.find(d=>["Ve","Ju"].includes(d.lord)||S2F[d.lord]===HL(2)||S2F[d.lord]===HL(11));
    const dhana=yogas.some(y=>y.name==="Dhana Yoga");
    if(dhana&&wDasha){
      const yAway=((wDasha.start-today)/(365.25*86400000)).toFixed(1);
      const numPart=num.bhagyank===8||num.bhagyank===6||num.bhagyank===22?" Bhagyank "+num.bhagyank+" is specifically a wealth-generating destiny signature when aligned with a Dhana Yoga activation.":" Personal Year 8 within this Dasha is the specific financial peak window.";
      const loShuPart=num.missing_nums.includes(8)?" The missing 8 is the single most important remedial focus — developing financial authority transforms the Dhana Yoga from theoretical promise to actualized reality.":num.missing_nums.includes(4)?" The missing 4's practical grounding is needed to manage the wealth that arrives.":"";
      const wElem=elem(HR(2))==="Fire"||elem(HR(11))==="Fire"?"leadership, entrepreneurship, or creative endeavors":elem(HR(2))==="Earth"||elem(HR(11))==="Earth"?"property, systematic investment, or established industries":elem(HR(2))==="Air"||elem(HR(11))==="Air"?"communication, networks, or knowledge-based industries":"creative, healing, or emotional intelligence-intensive fields";
      title="The Dhana Yoga Activates — Wealth in the "+wDasha.name+" Period";
      body="The Dhana Yoga has a specific activation window: the "+wDasha.name+" Mahadasha ("+fmt(wDasha.start)+", ~"+yAway+" years). During this period, the 2nd lord "+HL(2)+" and 11th lord "+HL(11)+" receive Dasha activation simultaneously — the classical signature of multiple income streams opening or a significant upward shift in earning capacity."+numPart+loShuPart+" The wealth-generating domain flows most naturally through "+wElem+".";
    }else if(jupDig==="Exalted"||(pih[11]||[]).includes("Jupiter")){
      const jupDashaStart=dashas.find(d=>d.lord==="Ju")?.start;
      const jupDashaStr=jupDashaStart?fmt(jupDashaStart):"upcoming";
      const numPart=num.bhagyank===3||num.moolank===3?" Bhagyank/Moolank 3 — Jupiter's own number — creates a doubled alignment between astrological and numerological wealth indicators.":num.bhagyank===6?" Bhagyank 6 — Venus-ruled — adds aesthetic quality to wealth generation.":"";
      title="Jupiter's Long Game — Sustainable, Legacy Wealth";
      body="Jupiter "+jupDig+" carries inherent wealth-generating energy on Jupiter's timescale: slow, sure, proportionate to dharma. The Jupiter Dasha ("+jupDashaStr+") is the specific high-water mark. Jupiter-generated wealth tends to be used wisely — for education, family, and genuine quality of life."+numPart;
    }else{
      const numPart=num.bhagyank===4||num.moolank===4||num.bhagyank===8?" Bhagyank/Moolank "+num.bhagyank+"/"+num.moolank+" is the signature of wealth built through the most durable method: making yourself genuinely indispensable in a specific domain.":" The numerological blueprint points toward financial security developing most fully in the period from age "+(age+8)+" to "+(age+18)+".";
      title="The Architecture of Abundance — Built Systematically";
      body="The wealth indicators favor the consistent architect over the spectacular gambler. The financial destiny is real and accessible — the path is through discipline, strategic positioning, and patient development of income streams that compound over time."+numPart;
    }
    future.push({title,body});
  }

  // Future 4 — Children & Legacy
  {
    let title,body;
    const jupIn5=(pih[5]||[]).includes("Jupiter"),h5lGood=TRIKONA.includes(h5lH)||KENDRA.includes(h5lH),malIn5=malInH(5);
    if(jupIn5||(jupDig==="Exalted"&&jupAsp7)||h5lGood){
      title="Children, Creative Legacy, and the Living Extension of Your Soul";
      const creDesc=jupIn5?"Jupiter's direct presence in the 5th — the most classical indicator of blessed progeny and creative fulfillment":"the 5th lord "+h5l+" in the strong "+h5lH+"th house";
      const numPart=num.moolank===3||num.bhagyank===3?" Moolank/Bhagyank 3 — Jupiter-ruled — is the children and creative legacy number. The numerological and astrological indicators are aligned.":" The Bhagyank "+num.bhagyank+" points toward the domain of most lasting contribution: "+bDesc.split(".")[0].toLowerCase()+".";
      body="The 5th house carries "+creDesc+" — what classical Jyotishis call Poorva Punya (past-life merit manifesting as natural gifts). The children or creative works that enter during a 5th-house-activating Dasha will carry the best of what "+name+" has developed — the authentic gifts, the hard-earned wisdom."+numPart;
    }else if(malIn5.length>0||DUSTHANA.includes(h5lH)){
      title="The Creative and Generational Legacy That Fought Its Way Into Being";
      const loShuPart=num.missing_nums.includes(3)?" The missing 3 is the karmic void the 5th house difficulty is addressing — creative expression requires expressing imperfectly and repeatedly until the gift finds its own level.":"";
      body="The 5th house with "+joinAnd(malIn5.length>0?malIn5:["its lord "+h5l+" in the "+h5lH+"th house"])+" indicates that the legacy domain has required genuine effort rather than easy flow. The creative or generational legacy that emerges carries the authority of something that had to fight to exist — and this makes it more resilient and meaningful than comfort could have produced."+loShuPart+" The Dasha timing for fullest activation: when "+h5l+" or Jupiter becomes the active Dasha lord.";
    }else{
      title="The Legacy That Grows As You Grow";
      const pyPart=num.personalYear===5||num.personalYear===1?"this is specifically a year for initiating creative or generative projects that will become the most visible part of your legacy":num.personalYear===9?"the year for completing legacy projects — what is finished this year carries special completion energy":"the legacy work is building depth and authenticity";
      body="The 5th lord "+h5l+" in the "+h5lH+"th house presents a legacy narrative developing in parallel with "+name+"'s overall growth. Bhagyank "+num.bhagyank+": "+bDesc.split(".")[0]+". Personal Year "+num.personalYear+": "+pyPart+".";
    }
    future.push({title,body});
  }

  // Future 5 — Foreign Travel & Settlement
  {
    let title,body;
    const rahuIn12=rahuH===12,foreignStrong=rahuIn12||rahuH===1||(asp[12]||[]).includes("Rahu")||(pih[12]||[]).length>0;
    if(foreignStrong||rahuH===7){
      const rahuDasha=dashas.find(d=>d.lord==="Ra");
      const rahuDashaStr=rahuDasha?.start?fmt(rahuDasha.start):"upcoming";
      const numPart=num.bhagyank===5?" Bhagyank 5 — the freedom and travel number — is the numerological confirmation of this astrological indicator.":num.moolank===5?" Moolank 5 — the psychic traveler — means the soul's instinctive orientation has always been toward expansion and movement.":num.missing_nums.includes(5)?" The missing 5 suggests the foreign chapter requires deliberate initiation — the soul has a comfort zone resistance to the movement it actually needs.":"The Kua number ("+num.kuaMale+"/"+num.kuaFemale+") provides directional guidance for geographical alignment.";
      title="Foreign Lands Are Written Into This Chart — The Call Will Come";
      body="Rahu in the "+rahuH+"th house combined with the 12th house configuration creates one of the clearest indicators of foreign connection in the Vedic system. The timing of the most significant foreign chapter: Rahu Mahadasha ("+rahuDashaStr+") or any Dasha involving the 12th lord ("+h12l+" in the "+h12lH+"th house)."+numPart;
    }else if((pih[12]||[]).includes("Jupiter")||TRIKONA.includes(h12lH)||KENDRA.includes(h12lH)){
      const numPart=num.moolank===7||num.bhagyank===7?" Moolank/Bhagyank 7 — the seeker's number — resonates perfectly with this Jupiter 12th house configuration.":"The Personal Year 7 (arriving in "+(7-num.personalYear>0?7-num.personalYear:9-(num.personalYear-7))+" years) is the most natural timing for the 12th house's spiritual gifts.";
      title="Spiritual Travel and Sacred Journeys — The 12th House Gifts";
      body="Jupiter in the 12th house creates the spiritually oriented expression of the foreign dimension: sacred travel, spiritual retreats, deep interest in other cultural wisdom traditions. "+numPart;
    }else{
      title="Foreign Connections and the Expansion Beyond the Known";
      body="The 12th house ("+rName(HR(12))+") with lord "+h12l+" in the "+h12lH+"th house presents foreign connection as available but not a structural destiny requirement. Periods most likely to activate it: when "+h12l+", Rahu, or "+h9l+" becomes the active Dasha lord. Kua number "+num.kuaMale+"/"+num.kuaFemale+" provides specific directional guidance.";
    }
    future.push({title,body});
  }

  // Future 6 — Spiritual Awakening
  {
    let title,body;
    const kDasha=futureDashas.find(d=>d.lord==="Ke"),jDasha=futureDashas.find(d=>d.lord==="Ju");
    const ketuSpirit=[1,8,9,12].includes(ketuH);
    if(kDasha&&ketuSpirit){
      const numPart=num.moolank===7?" Moolank 7 — Ketu's own number — creates a soul already oriented toward this journey. The Ketu Dasha is the activation of its deepest purpose.":num.missing_nums.includes(7)?" The missing 7 flags this Dasha as the period of specific karmic spiritual development — the intensive course the numerological structure marked as necessary.":"";
      title="The Great Turning — Ketu Mahadasha ("+fmt(kDasha.start)+")";
      body="Ketu placed in the "+ketuH+"th house ("+hSig(ketuH)+") combined with the upcoming Ketu Mahadasha — this is one of the most spiritually significant periods in a human life. During this period, the external world's ability to satisfy will diminish in specific, previously reliable domains. Career achievements that felt meaningful may feel hollow. The teachers, texts, or practices encountered will not feel like new information — they will feel like memory. Trust the recognition."+numPart;
    }else if(jDasha){
      const numPart=num.bhagyank===3||num.moolank===3?" Moolank/Bhagyank 3 — Jupiter's own frequency — creates doubled resonance during the Jupiter Dasha. The philosophical and teaching dimensions are the numerological destiny expression becoming most visible.":num.bhagyank===9?" Bhagyank 9 — number of completion and universal compassion — resonates strongly with Jupiter's expansive spiritual orientation.":"";
      title="Jupiter's Grace — Wisdom, Teaching, and Spiritual Expansion";
      body="The upcoming Jupiter Mahadasha ("+fmt(jDasha.start)+") in "+jupDig+" state carries what the classical texts describe as 'the period when the guru appears' — a period when the universe becomes unusually generous with wisdom. The spiritual development is specific to Jupiter's domain: ethics, dharma, and the relationship between individual life and cosmic order."+numPart;
    }else{
      title="The Spiritual Thread That Runs Through Every Chapter";
      const loShuPart=num.missing_nums.includes(7)?" The missing 7 indicates that dedicated interior time — the kind that integrates insight into genuine wisdom — is the specific spiritual practice this lifetime requires.":"";
      body="The 9th house ("+rName(HR(9))+") and 12th house ("+rName(HR(12))+") shape the spiritual trajectory as a deepening river — each Dasha adding a layer of philosophical understanding that compounds across the lifetime. By the time the later Dashas activate, there will be a recognizable philosophical maturity — a quality of spiritual ease earned through the full sequence of lived experience."+loShuPart;
    }
    future.push({title,body});
  }

  // Future 7 — Saturn Turning Points
  {
    const nextSatReturn=Math.round(age/29.5)*29.5>(age)?Math.round(age/29.5)*29.5:Math.round(age/29.5)*29.5+29.5;
    const yrsToSatReturn=(nextSatReturn-age).toFixed(1);
    const satDashaFuture=futureDashas.find(d=>d.lord==="Sa");
    const satDashaDesc=satDashaFuture?"The Saturn Mahadasha ("+fmt(satDashaFuture.start)+") carries the concentrated energy of natal Saturn in "+rName(pos.Saturn.rashi)+" ("+satDig+") in the "+satH+"th house. "+(satDig==="Exalted"?"Saturn exalted in its own Dasha is one of the most powerful combinations for sustained achievement and legacy-building.":satDig==="Debilitated"?"Saturn debilitated in its own Dasha requires specific remediation and conscious navigation.":"Saturn in "+satDig+" state will shape the Dasha through "+hSig(satH)+" themes."):"";
    const moonSadeSati=moonDig==="Debilitated"||moonDig==="Enemy"?"A challenged Moon in Sade Sati requires deliberate emotional and spiritual support — this period tests the fundamental emotional architecture more intensively than most transits.":moonDig==="Exalted"||moonDig==="Own Sign"?"A strong Moon in Sade Sati means the transit's challenges are processed with unusual resilience.":"The Moon in "+rName(moonRashi)+" navigates Sade Sati through its characteristic responses — "+(moonDescMap[rName(moonRashi)]||"its particular emotional signature")+".";
    const numPart=num.bhagyank===8||num.bhagyank===4?" Bhagyank "+num.bhagyank+" — Saturn/Rahu-ruled — means these Saturn transits carry the destiny's full weight. These periods are the central life chapters, not interruptions of it.":" Personal Year 8 occurring within a Sade Sati or Saturn Dasha creates the single most intensive combination of life-restructuring energy available in this chart.";
    const title="Saturn's Major Turning Points — Sade Sati, Saturn Return, and the Architecture of Fate";
    const body="Saturn operates on its own geological timescale. Its next return to natal position is approximately age "+Math.round(nextSatReturn)+" (~"+yrsToSatReturn+" years from now). The Saturn Return is one of the three most significant milestone events in any human life — the structural examination of the life assembled in youth.\n\n"+satDashaDesc+"\n\nSade Sati — Saturn's seven-year transit over the natal Moon: "+moonSadeSati+"\n\n"+numPart+" These periods are not to be feared but approached with deliberateness and self-honesty that Saturn rewards. The preparation: simplification, integrity in all commitments, reduction of unnecessary obligations.";
    future.push({title,body});
  }

  // Future 8 — Nine-Year Peaks
  {
    const py8Year=new Date().getFullYear()+((8-num.personalYear+9)%9||9);
    const py1Year=new Date().getFullYear()+((1-num.personalYear+9)%9||9);
    const numPart=mData.planet==="Sun"||mData.planet==="Mars"?"Moolank "+num.moolank+" — "+mData.planet+"-ruled — means the Personal Year 1 carries particular force: leadership and initiative energy aligns with the 1 Year's invitation.":mData.planet==="Saturn"||mData.planet==="Mercury"?"Moolank "+num.moolank+" — "+mData.planet+"-ruled — means the Personal Year 8 carries particular force: the authority and analytical rigor align with the 8 Year's achievement energy.":"Track the Personal Year "+num.moolank+" cycle specifically — the year resonating with your essential nature produces the most coherent and lasting results.";
    const title="The Nine-Year Numerological Cycles — Your Peak Years Identified";
    const body="Beyond the Dasha system, the nine-year Personal Year cycle provides a secondary timing framework of remarkable precision. For "+name+", upcoming year peaks: Personal Year 1 (new beginnings, seed-planting for next nine years) arrives in "+py1Year+". Personal Year 8 (peak achievement, financial power, authority claimed) arrives in "+py8Year+". When a favorable astrological Dasha overlaps with a Personal Year 1 or 8, these create the highest-intensity opportunity windows in the entire life.\n\nPersonal Year 1 is the seed year — whatever is consciously initiated in the first three months sets the agenda for the following nine years.\n\nPersonal Year 8 is the harvest year — the specific year when achievement and financial initiative are supported by the universe's momentum. The trap: hesitation born of unworthiness. The medicine: acting as if the authority is already earned.\n\n"+numPart;
    future.push({title,body});
  }

  // Future 9 — Wildcard
  {
    let title,body;
    const ks=yogas.find(y=>y.name.includes("Kaal Sarpa")),pm=yogas.find(y=>y.name.includes("Mahapurusha"));
    const rj=yogas.find(y=>y.name==="Raj Yoga"),neecha=yogas.find(y=>y.name.includes("Neechabhanga"));
    if(ks){
      const numPart=num.bhagyank===8||num.bhagyank===4?" Bhagyank "+num.bhagyank+" alongside Kaal Sarpa Dosha is the signature of one of the most tested and ultimately most indestructible destinies.":num.karmicDebt?" Karmic Debt "+num.karmicDebt+" alongside the Kaal Sarpa Dosha indicates a double karmic load that is also a double spiritual accelerant.":"";
      title="The Kaal Sarpa Prophecy — From Great Obstruction to Equally Great Heights";
      body="The Kaal Sarpa Dosha carries a prophecy the classical texts state with unusual specificity: those born under this configuration experience either extreme obstruction throughout life, or a dramatic sudden reversal from apparent permanent stagnation to remarkable achievement — sometimes both, in sequence.\n\nThe specific prophecy: there will be a moment in "+name+"'s life — most likely at a Rahu or Ketu Dasha boundary — where circumstances that appeared permanently unfavorable undergo a complete and rapid reversal. The achievement that follows will genuinely shock those who knew the preceding period of struggle. The condition: the reversal follows and depends on the degree of genuine inner mastery developed during the difficult phases."+numPart;
    }else if(neecha){
      const numPart=num.karmicDebt?" Karmic Debt "+num.karmicDebt+" operates on the same principle: the specific area of karmic deficit is also the area of greatest potential transformation.":"";
      title="Neechabhanga Raj Yoga — Weakness Transmuted to Extraordinary Strength";
      body=neecha.desc+" The lived experience is specific: an area of life that appears to be a fundamental limitation — a character trait, a recurring pattern, a domain of persistent failure — that at some point reverses completely and becomes the source of unusual strength. The weakness was not actually weakness — it was undeveloped potential requiring specific conditions to activate."+numPart;
    }else if(pm){
      const pmQual=pm.name.includes("Hamsa")?"wisdom, philosophical authority, and the capacity to illuminate the minds of many":pm.name.includes("Malavya")?"aesthetic refinement, sensual intelligence, and relational mastery at the highest level":pm.name.includes("Shasha")?"disciplined authority, long-term vision, and the capacity to lead institutions":pm.name.includes("Ruchika")?"primal courage, executive leadership, and the specific quality of force that moves mountains":"analytical genius, communicative mastery, and the ability to articulate what others can only feel";
      const numPart=num.bhagyank===1||num.bhagyank===8||num.bhagyank===22?" Bhagyank "+num.bhagyank+" alongside "+pm.name+" creates one of the most concentrated configurations of exceptional destiny potential in the combined reading.":"";
      title=pm.name+" — Royal Configuration, Exceptional Destiny";
      body=pm.name+" is one of only five royal configurations described in the Brihat Parashara Hora Shastra. The promise: development of "+pmQual+". This is not only about external achievement but the cultivation of specific exceptional qualities that make this particular life irreplaceable."+numPart;
    }else if([1,10,11].includes(rahuH)){
      const rahuDasha=dashas.find(d=>d.lord==="Ra");
      const rahuDashaStr=rahuDasha?.start?fmt(rahuDasha.start):"upcoming";
      const numPart=num.bhagyank===4||num.moolank===4?" Bhagyank/Moolank 4 — Rahu's own number — doubles the unconventional-path indicator.":num.bhagyank===5?" Bhagyank 5 resonates with Rahu's unconventional energy: exceptional adaptability and the ability to thrive in environments of rapid change.":"";
      title="Rahu's Unconventional Rise — Power Through the Path Not Taken";
      body="Rahu in the "+rahuH+"th house ("+hSig(rahuH)+") is a configuration of amplified ambition and unconventional achievement. The Rahu Mahadasha ("+rahuDashaStr+") is when this energy reaches maximum expression. The specific prediction: during the Rahu Mahadasha, "+name+" will access a form of success or influence that people from "+name+"'s background are not supposed to reach through the methods employed. The route will be unconventional — technology, foreign connections, media, or a genuinely novel combination of disciplines. The result will be real and recognized."+numPart;
    }else{
      const loShuPart=num.missing_nums.length>0?"the karmic development work indicated by the missing numbers ("+num.missing_nums.join(", ")+" in the Lo Shu Grid)":"a complete Lo Shu Grid suggesting a broadly prepared soul";
      title="The Convergence — When All Threads Weave Into Purpose";
      body="Looking at the arc of "+name+"'s Dasha sequence alongside the nine-year Personal Year cycles and the Lo Shu Grid's developmental arc — there is a specific convergence point visible. Not a single dramatic event but a period (likely between ages "+(age+8)+" and "+(age+15)+") when the disparate threads of career, relationships, inner growth, creative expression, and spiritual understanding weave into a coherent life purpose.\n\nThe Rahu growth agenda ("+hSig(rahuH)+"), the Lagna lord's direction ("+lagL+" in the "+lagLH+"th house — "+hSig(lagLH)+"), the Bhagyank's destiny theme ("+bDesc.split(".")[0].toLowerCase()+"), "+loShuPart+" — all converge on the same outcome. The highest expression of this chart is genuinely, specifically, practically available. It requires not talent (already present) or luck (already built in) but the willingness to align daily choices with what the chart has always been pointing toward.";
    }
    future.push({title,body});
  }

  // Future 10 — The Final Prophecy
  {
    const lifePurpose=rahuH===1||lagLH===1?"fully inhabit individual authority and express the specific creative force of its nature without apology":rahuH===10||lagLH===10?"build something in the world that outlasts its builder — a contribution to the outer order that carries the signature of genuine character":rahuH===7||lagLH===7?"learn the deepest lessons available through conscious partnership — to discover through genuine love what cannot be learned in solitude":rahuH===9||lagLH===9?"develop wisdom that transcends personal experience and becomes genuinely available to others":rahuH===5||lagLH===5?"express, create, and generate — to bring into the world things of beauty and intelligence that would not exist without this specific soul":rahuH===12||lagLH===12?"dissolve the personal into something universal — discovering through progressive release of attachment the specific freedom this chart's highest potential points toward":"fulfill the destiny of the "+hSig(rahuH)+" house, developing "+rName(pos.Rahu.rashi)+" qualities until they are as natural as the Ketu qualities already are";
    const loShuFinal=num.missing_nums.length>0?"the karmic development work indicated by the missing numbers ("+num.missing_nums.join(", ")+" in the Lo Shu Grid)":"a complete Lo Shu Grid suggesting a broadly prepared soul";
    const title="The Final Prophecy — What This Life Is Actually For";
    const body="In the language of the oldest Vedic texts, every chart is a letter from the soul to itself — a document written before birth encoding the specific evolutionary agenda of this incarnation. Reading "+name+"'s chart through both Jyotish and numerological lenses, the letter's central message is clear:\n\nThe Lagna lord "+lagL+" in the "+lagLH+"th house, Rahu's hunger in the "+rahuH+"th house ("+hSig(rahuH)+"), the Moon's emotional nature in "+rName(moonRashi)+", Bhagyank "+num.bhagyank+"'s destiny ("+bDesc.split(".")[0].toLowerCase()+"), Moolank "+num.moolank+"'s psychic character ("+mData.desc.split(".")[0]+"), "+loShuFinal+" — all speak in chorus about the same thing: a soul that arrived here to "+lifePurpose+".\n\nBhagyank "+num.bhagyank+": "+bDesc+" The life that fully actualizes this chart will have an increasing quality of rightness, of coherence, of doing exactly what was designed to be done. This sense of being where one is supposed to be — this is the ultimate promise encoded in "+name+"'s chart. It is already in motion. It is already underway.";
    future.push({title,body});
  }

  // ── REMEDIES ─────────────────────────────────────────────
  const remedies=[];
  const mantras={Sun:"Om Hraam Hreem Hraum Sah Suryaya Namah (108x at sunrise, Sundays)",Moon:"Om Shram Shreem Shraum Sah Chandraya Namah (108x Monday evenings)",Mars:"Om Kraam Kreem Kraum Sah Bhaumaya Namah (108x Tuesdays)",Mercury:"Om Braam Breem Braum Sah Budhaya Namah (108x Wednesdays)",Jupiter:"Om Graam Greem Graum Sah Guruve Namah (108x Thursdays)",Venus:"Om Draam Dreem Draum Sah Shukraya Namah (108x Fridays)",Saturn:"Om Praam Preem Praum Sah Shanaischaraya Namah (108x Saturdays at dusk)"};
  const gems={Aries:"Red Coral (Mars, copper ring, right ring finger, Tuesday)",Taurus:"Diamond or White Sapphire (Venus, silver, right middle finger, Friday)",Gemini:"Emerald or Green Tourmaline (Mercury, gold, right little finger, Wednesday)",Cancer:"Pearl or Moonstone (Moon, silver, right little finger, Monday)",Leo:"Ruby or Red Garnet (Sun, gold, right ring finger, Sunday)",Virgo:"Emerald or Green Tourmaline (Mercury, gold, right little finger, Wednesday)",Libra:"Diamond or White Sapphire (Venus, silver, right middle finger, Friday)",Scorpio:"Red Coral or Carnelian (Mars, copper, right ring finger, Tuesday)",Sagittarius:"Yellow Sapphire or Citrine (Jupiter, gold, right index finger, Thursday)",Capricorn:"Blue Sapphire — verify with expert first (Saturn)",Aquarius:"Blue Sapphire — verify with expert first (Saturn)",Pisces:"Yellow Sapphire or Citrine (Jupiter, gold, right index finger, Thursday)"};

  if(lagLDig==="Debilitated"||lagLDig==="Enemy"){
    const donateMap={Sun:"wheat, jaggery, copper, and red flowers on Sundays",Moon:"rice, white cloth, silver items, and milk on Mondays",Mars:"red lentils, copper, and red flowers on Tuesdays",Mercury:"green lentils, copper coins, and green vegetables on Wednesdays",Jupiter:"yellow lentils, yellow cloth, turmeric, and gold on Thursdays",Venus:"white sweets, white cloth, silver items on Fridays",Saturn:"black sesame seeds, mustard oil, and blue cloth on Saturdays"};
    remedies.push({title:"Strengthen "+lagL+" — Your Lagna Lord",body:lagL+" as Lagna lord in "+lagLDig+" state reduces vitality and chart expression across all domains. Daily mantra: "+(mantras[lagL]||"appropriate planetary mantra")+". Donate: "+(donateMap[lagL]||"items associated with "+lagL)+". Numerologically, wearing "+mData.color+" on "+mData.day+" and using "+mData.gem+" activates the same planetary energy through the numerological channel."});
  }

  if(satDig==="Debilitated"||[1,4,7,12].includes(satH)){
    remedies.push({title:"Saturn Propitiation",body:"Serve the elderly or poor genuinely on Saturdays. Feed black sesame in mustard oil to the underprivileged. Mantra: "+mantras.Saturn+". Wear dark blue or black on Saturdays. Light a mustard oil lamp beneath a peepal tree on Saturday evenings. The most powerful Saturn remedy: sustained, patient, honest service without expectation of recognition. Numerological supplement: if your Bhagyank or Moolank is 8 or 4, Saturday routines of contemplative solitude and honest self-review are specifically restorative."});
  }

  if([1,4,7,8,12].includes(rahuH)||(asp[1]||[]).includes("Rahu")){
    remedies.push({title:"Rahu Pacification",body:"Donate mixed-quality items on Saturdays: multi-colored cloth, black and white sesame seeds. Recite 'Om Raam Rahave Namah' 108 times during Saturn hora on Saturdays. The most effective Rahu remedy is behavioral: cultivate radical honesty, avoid all forms of deception (including self-deception), and refuse shortcuts that compromise integrity. Numerological supplement: if your Moolank is 4, the Rahu propitiation and the numerological self-work are the same process — developing the groundedness the number 4 carries."});
  }

  if(mangal){
    remedies.push({title:"Mangal Dosha — Mars Pacification",body:"Chant: "+mantras.Mars+". Visit Hanuman temples on Tuesdays offering red sindoor and flowers. The single most effective Mars remedy is physical: regular rigorous exercise — specifically the kind requiring courage and pushing beyond comfort. Mars energy not channeled through the body turns inward as aggression or conflict. Numerological supplement: if Moolank is 9 or 1 (both Mars-influenced), cultivating patience and the willingness to receive care — not just give it — are the specific numerological antidotes."});
  }

  if(moonDig==="Debilitated"||moonDig==="Enemy"||malInH(4).length>0){
    remedies.push({title:"Moon Strengthening — Mind and Emotional Healing",body:"Offer water to the Moon on Purnima nights: "+mantras.Moon+". Sit near water during the full moon. Wear pearl or moonstone (after verification). Consume white foods on Mondays. Maintain consistent sleep routines — the Moon governs the body's natural rhythms and disrupting them diminishes its chart function. The mother relationship remedy: consciously extending forgiveness internally for the ways the actual mother was limited — this releases the 4th house's held emotional charge. Numerological supplement: if Moolank is 2, Moon remedies are your primary self-care practice."});
  }

  if(num.missing_nums.length>0){
    const missingRemedies=num.missing_nums.map(n=>num.missingDesc[n]).join(" | ");
    remedies.push({title:"Lo Shu Grid — Missing Number Remedies ("+num.missing_nums.join(", ")+")",body:"The numbers absent from your birth date represent karmic voids: "+missingRemedies+" General approach: place the number's associated color prominently in your living and working space; practice activities that develop the missing number's qualities; light a candle in the missing number's color on its planet's day. The Lo Shu Grid remedies work through daily environmental reinforcement — consistent exposure to the qualities the soul marked as requiring development this lifetime."});
  }

  remedies.push({title:"Moolank "+num.moolank+" Daily Practice — "+mData.planet+"-Ruled Alignment",body:"As a Moolank "+num.moolank+", your primary alignment practice: wear "+mData.color+" on "+mData.day+" and as a general daily color when important outcomes are desired; work with "+mData.metal+" objects; repeat "+mData.mantra+" as your primary mantra. Gemstone resonance: "+mData.gem+" carried in the left pocket on "+mData.day+" activates the psychic number's field. Your primary psychological shadow: "+mData.shadow.split(",")[0]+" — when seen and consciously moderated, this releases the most life-energy currently spent on maintenance."});

  const karmicDebtBody=num.masterNumber?"Master Number "+num.masterNumber+" carries its own remedial requirement: grounding. High-voltage spiritual numbers require physical anchoring — regular contact with earth and nature, consistent sleep, disciplined eating, and deliberate cultivation of ordinary pleasures. The tendency of Master Number carriers is toward extremes. The remedy is the middle path, consistently chosen.":num.karmicDebt?"Karmic Debt "+num.karmicDebt+" — "+KARMIC_DEBT[num.karmicDebt].name+" — requires: "+KARMIC_DEBT[num.karmicDebt].warning+" The remedial practice: deliberate cultivation of the quality described above.":(BHAGYANK_DESC[num.bhagyank]?.split(".")[0]||bDesc.split(".")[0])+". Alignment practice: review major life decisions through the lens of your destiny — when actions are aligned with Bhagyank "+num.bhagyank+", they succeed with unusual ease. When they contradict it, obstacles appear consistently. Use this as a navigation instrument.";
  const pyRemTag=num.personalYear===8||num.personalYear===1?" Current Personal Year "+num.personalYear+" is one of the most powerful action windows in the numerological cycle — remedies practiced now carry amplified impact.":"";
  remedies.push({title:"Bhagyank "+num.bhagyank+" Destiny Alignment",body:karmicDebtBody+pyRemTag});

  const gemKey=rName(lr);
  const gemVal=gems[gemKey]||"Yellow Sapphire or Citrine (consult a qualified Jyotishi)";
  const numGemIdx=num.bhagyank>9?(num.bhagyank===11?3:num.bhagyank===22?4:6):num.bhagyank;
  const numGem=(MOOLANK_DATA[numGemIdx]||mData).gem||"as recommended by a qualified numerologist";
  remedies.push({title:"Primary Gemstone — "+gemVal.split(" (")[0],body:"For "+rName(lr)+" Lagna, the primary supporting gemstone is "+gemVal+". This strengthens the Lagna lord and overall chart vitality when worn correctly. Secondary consideration: for Bhagyank "+num.bhagyank+", the numerological gemstone ("+numGem+") may be worn on the non-dominant hand. CRITICAL: Always verify gemstone suitability with a qualified Jyotishi AND numerologist against your complete chart before purchasing or wearing. When uncertain, use an unset natural specimen for environmental placement rather than body-wearing."});

  return{soulText,yogas,past,presMain,present,future,remedies,cd,nd,age,num};
}

// ═══════════════════════════════════════════════════
// SVG CHART
// ═══════════════════════════════════════════════════
function ChartSVG({pih,lr,pos}){
  const S=300,m=S/2,q=S/4;
  const TL=[0,0],TR=[S,0],BL=[0,S],BR=[S,S],TM=[m,0],RM=[S,m],BM=[m,S],LM=[0,m],C=[m,m];
  const pp=pts=>pts.map(([x,y])=>`${x},${y}`).join(" ");
  const hp={1:[LM,TM,C],2:[TL,TM,C],3:[TL,TR,TM],4:[TM,TR,C],5:[TR,RM,C],6:[TR,BR,RM],7:[RM,BR,C],8:[BR,BM,C],9:[BR,BL,BM],10:[BM,C,LM],11:[BL,LM,C],12:[BL,BM,C]};
  const lp={1:[m-q/2,m-q/2-2],2:[q/2,q/2],3:[m,q/2-6],4:[m+q/2,m-q/2-2],5:[S-q/2,q/2],6:[S-q/2+6,m-4],7:[m+q/2,m+q/2-2],8:[S-q/2,S-q/2-2],9:[m,S-q/2+6],10:[m-q/2,m+q/2-2],11:[q/2,S-q/2-2],12:[q/2-6,m-4]};
  const pp2={1:[m-q/2,m-q/2+18],2:[q/2,q/2+18],3:[m,q/2+10],4:[m+q/2,m-q/2+18],5:[S-q/2,q/2+18],6:[S-q/2+6,m+14],7:[m+q/2,m+q/2+12],8:[S-q/2,S-q/2+10],9:[m,S-q/2+14],10:[m-q/2,m+q/2+12],11:[q/2,S-q/2+10],12:[q/2-6,m+14]};
  return(
    <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{filter:"drop-shadow(0 4px 16px rgba(139,0,0,0.4))"}}>
      <rect width={S} height={S} fill="#0d0400" rx="4"/>
      {Object.entries(hp).map(([h,p])=>(
        <polygon key={h} points={pp(p)} fill={["1","4","7","10"].includes(h)?"rgba(160,70,0,0.2)":"rgba(255,120,0,0.04)"} stroke="#6a3008" strokeWidth="1.2"/>
      ))}
      <rect x="1" y="1" width={S-2} height={S-2} fill="none" stroke="#b87a20" strokeWidth="1.5" rx="3"/>
      <polygon points={pp([TM,RM,BM,LM])} fill="none" stroke="#7a4a10" strokeWidth="0.8" strokeDasharray="3,2"/>
      {Object.entries(lp).map(([h,[lx,ly]])=>{
        const r=(lr+parseInt(h)-1)%12;
        return(<g key={h}>
          <text x={lx} y={ly} textAnchor="middle" fill={h==="1"?"#FFD700":"#b87a20"} fontSize="11" fontFamily="serif" fontWeight={h==="1"?"700":"400"}>{r+1}</text>
          {h==="1"&&<text x={lx} y={ly+13} textAnchor="middle" fill="#FF6B35" fontSize="8" fontFamily="serif">Lg</text>}
        </g>);
      })}
      {Object.entries(pp2).map(([h,[px,py]])=>(
        (pih[parseInt(h)]||[]).map((p,i)=>(
          <text key={p} x={px} y={py+i*12} textAnchor="middle" fill={PCOL[p]} fontSize="10" fontFamily="serif" fontWeight="bold">
            {PLANET_SH[PLANETS.indexOf(p)]}{pos[p]?.retro?"R":""}
          </text>
        ))
      ))}
    </svg>
  );
}

// ═══════════════════════════════════════════════════
// LOCATION DATA
// ═══════════════════════════════════════════════════
const CITIES={mumbai:[19.07,72.87],delhi:[28.61,77.20],kolkata:[22.57,88.36],chennai:[13.08,80.27],bangalore:[12.97,77.59],hyderabad:[17.38,78.48],pune:[18.52,73.85],nashik:[19.99,73.79],ahmedabad:[23.02,72.57],jaipur:[26.91,75.78],lucknow:[26.84,80.94],varanasi:[25.31,82.97],surat:[21.17,72.83],indore:[22.71,75.85],bhopal:[23.25,77.41],chandigarh:[30.73,76.77],amritsar:[31.63,74.87],patna:[25.59,85.13],nagpur:[21.14,79.08],kochi:[9.93,76.26],guwahati:[26.18,91.74],bhubaneswar:[20.29,85.82],"new york":[40.71,-74.00],"los angeles":[34.05,-118.24],chicago:[41.87,-87.62],london:[51.50,-0.12],toronto:[43.65,-79.38],dubai:[25.20,55.27],singapore:[1.35,103.81],tokyo:[35.67,139.65],sydney:[-33.86,151.20],doha:[25.28,51.51],riyadh:[24.68,46.72]};
const TZS={india:5.5,mumbai:5.5,delhi:5.5,kolkata:5.5,chennai:5.5,bangalore:5.5,hyderabad:5.5,pune:5.5,nashik:5.5,ahmedabad:5.5,jaipur:5.5,lucknow:5.5,varanasi:5.5,surat:5.5,indore:5.5,bhopal:5.5,chandigarh:5.5,amritsar:5.5,patna:5.5,nagpur:5.5,kochi:5.5,guwahati:5.5,bhubaneswar:5.5,ist:5.5,"new york":-5,"los angeles":-8,chicago:-6,toronto:-5,london:0,paris:1,berlin:1,dubai:4,singapore:8,tokyo:9,sydney:10,doha:3,riyadh:3};
const getCoords=r=>{const k=r.toLowerCase();for(const[n,v]of Object.entries(CITIES))if(k.includes(n))return v;return[22,78];};
const getTZ=r=>{const k=r.toLowerCase();for(const[n,v]of Object.entries(TZS))if(k.includes(n))return v;return 5.5;};

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
export default function App(){
  const[form,setForm]=useState({name:"",date:"",time:"",region:""});
  const[data,setData]=useState(null);
  const[tab,setTab]=useState("chart");
  const[openPast,setOpenPast]=useState(null);
  const[openFuture,setOpenFuture]=useState(null);

  const [err,setErr]=useState(null);
  const go=()=>{
    setErr(null);
    try{
      const[yr,mo,dy]=form.date.split("-").map(Number);
      const[hr,min]=form.time.split(":").map(Number);
      const tz=getTZ(form.region),[lat,lng]=getCoords(form.region);
      const{pos,lagna}=calcChart(yr,mo,dy,hr,min,tz,lat,lng);
      const pih=getPIH(pos,lagna),asp=getAspects(pos,lagna),das=getDashas(pos,yr,mo,dy);
      const pred=buildPredictions(pos,lagna,pih,asp,das,yr,mo,dy,form.name);
      setData({pos,lagna,pih,asp,das,pred,form:{...form}});
      setTab("chart");
    }catch(e){setErr("Calculation error: "+e.message);console.error(e);}
  };

  const today=new Date();
  const cd=data?.das.find(d=>d.start<=today&&d.end>=today);
  const pred=data?.pred;
  const fmt=d=>d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});

  return(
    <div style={{minHeight:"100vh",background:"#080300",color:"#E8D5C0",fontFamily:"'EB Garamond',Georgia,serif",backgroundImage:"radial-gradient(ellipse at 10% 0%,rgba(100,20,0,0.3) 0%,transparent 50%),radial-gradient(ellipse at 90% 100%,rgba(80,40,0,0.2) 0%,transparent 50%)"}}>
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
        .cd{background:rgba(255,100,0,0.04);border:1px solid #2a1001;border-radius:7px;padding:0.9rem;}
        .cd.ben{background:rgba(30,80,30,0.1);border-color:#1a3a10;}
        .cd.mal{background:rgba(80,20,20,0.12);border-color:#3a1010;}
        .cd.mix{background:rgba(80,60,10,0.1);border-color:#3a2a05;}
        .xp{cursor:pointer;border:1px solid #2a1001;border-radius:7px;padding:0.85rem 1rem;margin:0.45rem 0;transition:all 0.2s;background:rgba(255,100,0,0.02);}
        .xp:hover{border-color:#b87a20;background:rgba(255,100,0,0.06);}
        .xp.op{border-color:#FFD700;background:rgba(255,215,0,0.04);}
        .pr{transition:background 0.15s;}.pr:hover{background:rgba(255,100,0,0.07)!important;}
      `}</style>

      {/* HEADER */}
      <div style={{textAlign:"center",padding:"1.8rem 1rem 1rem",borderBottom:"1px solid #1e0800"}}>
        <div style={{color:"#7a3a0a",fontSize:"1.4rem",letterSpacing:"0.6em"}}>✦ ॐ ✦</div>
        <h1 style={{fontFamily:"'Cinzel Decorative',serif",fontSize:"clamp(1.2rem,3vw,2rem)",color:"#FFD700",margin:"0.2rem 0",fontWeight:700,animation:"glow 4s ease-in-out infinite"}}>जन्म कुंडली</h1>
        <div style={{fontFamily:"'Cinzel',serif",color:"#7a5010",fontSize:"0.65rem",letterSpacing:"0.25em"}}>VEDIC BIRTH CHART · CLASSICAL DEEP READING · ALL CALCULATIONS LOCAL</div>
      </div>

      <div style={{maxWidth:"1050px",margin:"0 auto",padding:"1.2rem 0.9rem"}}>

        {/* FORM */}
        {!data&&(
          <div style={{maxWidth:"480px",margin:"0 auto",animation:"fd 0.5s ease"}}>
            <div style={{border:"1px solid #2a1001",borderRadius:"10px",padding:"1.6rem",background:"rgba(255,100,0,0.02)"}}>
              <div style={{textAlign:"center",fontFamily:"'Cinzel',serif",color:"#b87a20",fontSize:"0.75rem",letterSpacing:"0.15em",marginBottom:"1.2rem"}}>ENTER BIRTH DETAILS</div>
              <div style={{display:"grid",gap:"0.8rem"}}>
                <div><div style={{color:"#6a4010",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.3rem",fontFamily:"'Cinzel',serif"}}>FULL NAME</div><input placeholder="Your full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.7rem"}}>
                  <div><div style={{color:"#6a4010",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.3rem",fontFamily:"'Cinzel',serif"}}>DATE OF BIRTH</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div>
                  <div><div style={{color:"#6a4010",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.3rem",fontFamily:"'Cinzel',serif"}}>TIME OF BIRTH</div><input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></div>
                </div>
                <div><div style={{color:"#6a4010",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.3rem",fontFamily:"'Cinzel',serif"}}>BIRTH CITY</div><input placeholder="e.g. Mumbai, Delhi, London, Dubai..." value={form.region} onChange={e=>setForm({...form,region:e.target.value})}/></div>
              </div>
              <button onClick={go} disabled={!form.name||!form.date||!form.time||!form.region}
                style={{width:"100%",marginTop:"1.2rem",padding:"12px",background:"linear-gradient(135deg,#6b0000,#a87010)",border:"1px solid #FFD700",color:"#FFD700",borderRadius:"6px",cursor:"pointer",fontFamily:"'Cinzel',serif",fontSize:"0.78rem",letterSpacing:"0.2em",fontWeight:700,opacity:(!form.name||!form.date||!form.time||!form.region)?0.4:1,transition:"opacity 0.2s"}}>
                ✦ CAST MY KUNDALI ✦
              </button>
              <p style={{color:"#2a1505",fontSize:"0.62rem",textAlign:"center",marginTop:"0.6rem"}}>All calculations are 100% local · No API · No data sent anywhere · Classical Vedic rules</p>
              {err&&<p style={{color:"#E05252",fontSize:"0.72rem",textAlign:"center",marginTop:"0.5rem",padding:"0.4rem",background:"rgba(200,0,0,0.1)",borderRadius:"4px"}}>{err}</p>}
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {data&&(
          <div style={{animation:"fd 0.4s ease"}}>
            {/* Header strip */}
            <div style={{display:"flex",gap:"0.8rem",alignItems:"center",flexWrap:"wrap",padding:"0.7rem 1rem",border:"1px solid #2a1001",borderRadius:"7px",background:"rgba(255,100,0,0.03)",marginBottom:"0.9rem"}}>
              <div>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"1rem",color:"#FFD700",fontWeight:700}}>{data.form.name}</div>
                <div style={{color:"#7a5010",fontSize:"0.68rem"}}>{data.form.date} · {data.form.time} · {data.form.region}</div>
              </div>
              <div style={{display:"flex",gap:"1rem",marginLeft:"auto",flexWrap:"wrap"}}>
                {[["Lagna",RASHI[data.lagna]],["Moon",data.pos.Moon.rashiName],["Dasha",cd?.name||"—"]].map(([k,v])=>(
                  <div key={k} style={{textAlign:"center"}}>
                    <div style={{color:"#5a3a0a",fontSize:"0.58rem",letterSpacing:"0.1em",fontFamily:"'Cinzel',serif"}}>{k}</div>
                    <div style={{color:"#DEB887",fontSize:"0.78rem",fontFamily:"'Cinzel',serif"}}>{v}</div>
                  </div>
                ))}
              </div>
              <button onClick={()=>{setData(null);setTab("chart");}} style={{background:"none",border:"1px solid #2a1001",color:"#5a3010",padding:"3px 9px",borderRadius:"4px",cursor:"pointer",fontSize:"0.62rem",fontFamily:"'Cinzel',serif"}}>↩</button>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",gap:"0.35rem",flexWrap:"wrap",marginBottom:"0.9rem"}}>
              {[["chart","🪐 Chart"],["planets","⭐ Planets"],["yogas","⚡ Yogas"],["dasha","📅 Dasha"],["past","🔮 Past (10)"],["present","⚡ Present"],["future","🌟 Future (10)"],["numerology","🔢 Numerology"],["remedies","🙏 Remedies"]].map(([id,label])=>(
                <button key={id} className={`tb ${tab===id?"on":""}`} onClick={()=>setTab(id)}>{label}</button>
              ))}
            </div>

            {/* CHART */}
            {tab==="chart"&&(
              <div style={{display:"flex",gap:"1.5rem",flexWrap:"wrap",alignItems:"flex-start"}}>
                <ChartSVG pih={data.pih} lr={data.lagna} pos={data.pos}/>
                <div style={{flex:1,minWidth:"260px"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#b87a20",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.5rem"}}>SOUL SIGNATURE</div>
                  <p style={{color:"#D4C0A0",fontSize:"0.83rem",lineHeight:1.8,marginBottom:"1rem",borderLeft:"2px solid #7a3a0a",paddingLeft:"0.8rem"}}>{pred.soulText}</p>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#b87a20",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.4rem"}}>HOUSES</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"2px"}}>
                    {Array.from({length:12},(_,i)=>i+1).map(h=>(
                      <div key={h} style={{display:"flex",gap:"0.4rem",fontSize:"0.7rem",padding:"2px 0",borderBottom:"1px solid rgba(50,20,0,0.3)"}}>
                        <span style={{color:"#7a4a10",fontFamily:"'Cinzel',serif",minWidth:"20px"}}>H{h}</span>
                        <span style={{color:"#555",fontSize:"0.62rem",minWidth:"22px"}}>{RASHI_SH[(data.lagna+h-1)%12]}</span>
                        <span style={{color:data.pih[h].length?"#DEB887":"#333"}}>
                          {data.pih[h].map(p=>`${PLANET_SH[PLANETS.indexOf(p)]}${data.pos[p].retro?"ᴿ":""}`).join(" ")||"—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PLANETS */}
            {tab==="planets"&&(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.77rem"}}>
                <thead><tr style={{background:"rgba(80,15,0,0.3)"}}>
                  {["Planet","House","Rashi","Deg","Nakshatra","Pada","Dignity","R"].map(h=>(
                    <th key={h} style={{padding:"5px 7px",color:"#b87a20",fontFamily:"'Cinzel',serif",fontSize:"0.62rem",textAlign:"left",borderBottom:"1px solid #2a1001"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {PLANETS.map(p=>{
                    const d=data.pos[p],h=houseOf(d.rashi,data.lagna);
                    return(<tr key={p} className="pr" style={{borderBottom:"1px solid rgba(30,10,0,0.5)"}}>
                      <td style={{padding:"4px 7px",color:PCOL[p],fontWeight:"bold"}}>{p}</td>
                      <td style={{padding:"4px 7px",color:"#777"}}>{h}</td>
                      <td style={{padding:"4px 7px",color:"#DEB887"}}>{d.rashiName}</td>
                      <td style={{padding:"4px 7px",color:"#999"}}>{d.deg.toFixed(1)}°</td>
                      <td style={{padding:"4px 7px",color:"#bbb",fontSize:"0.7rem"}}>{d.nak}</td>
                      <td style={{padding:"4px 7px",color:"#777"}}>{d.pada}</td>
                      <td style={{padding:"4px 7px",color:d.dig==="Exalted"?"#FFD700":d.dig==="Debilitated"?"#E05252":d.dig==="Own Sign"?"#52C052":d.dig==="Friendly"?"#52A0C0":"#666",fontSize:"0.68rem"}}>{d.dig}</td>
                      <td style={{padding:"4px 7px",color:"#E05252",fontSize:"0.68rem"}}>{d.retro?"R":""}</td>
                    </tr>);
                  })}
                  <tr style={{borderTop:"2px solid #6a3008",background:"rgba(80,20,0,0.2)"}}>
                    <td style={{padding:"4px 7px",color:"#FF6B35",fontWeight:"bold"}} colSpan={2}>Ascendant</td>
                    <td style={{padding:"4px 7px",color:"#DEB887"}}>{data.pos.Ascendant.rashiName}</td>
                    <td style={{padding:"4px 7px",color:"#999"}}>{data.pos.Ascendant.deg.toFixed(1)}°</td>
                    <td style={{padding:"4px 7px",color:"#bbb",fontSize:"0.7rem"}}>{data.pos.Ascendant.nak}</td>
                    <td style={{padding:"4px 7px",color:"#777"}}>{data.pos.Ascendant.pada}</td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            )}

            {/* YOGAS */}
            {tab==="yogas"&&(
              <div>
                <p style={{color:"#6a4010",fontSize:"0.73rem",marginBottom:"0.7rem",fontStyle:"italic"}}>Yogas detected using classical BPHS rules — each modifies the chart's results significantly.</p>
                {pred.yogas.length===0&&<p style={{color:"#444"}}>No major algorithmic yogas detected. See planets tab for individual dignities.</p>}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"0.6rem"}}>
                  {pred.yogas.map((y,i)=>(
                    <div key={i} className={`cd ${y.type==="benefic"?"ben":y.type==="malefic"?"mal":"mix"}`}>
                      <div style={{display:"flex",gap:"0.5rem",alignItems:"center",marginBottom:"0.3rem"}}>
                        <span>{y.type==="benefic"?"✦":y.type==="malefic"?"⚠":"◈"}</span>
                        <span style={{fontFamily:"'Cinzel',serif",color:y.type==="benefic"?"#6aCC6a":y.type==="malefic"?"#E06060":"#DEB887",fontSize:"0.72rem",fontWeight:700}}>{y.name}</span>
                      </div>
                      <p style={{color:"#9a7a4a",fontSize:"0.72rem",lineHeight:1.5,margin:0}}>{y.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* DASHA */}
            {tab==="dasha"&&(
              <div>
                <p style={{color:"#6a4010",fontSize:"0.73rem",marginBottom:"0.7rem",fontStyle:"italic"}}>Vimshottari Dasha — 120-year cycle from Moon's Nakshatra lord at birth.</p>
                <div style={{display:"grid",gap:"0.3rem"}}>
                  {data.das.map((d,i)=>{
                    const iC=d.start<=today&&d.end>=today,pct=iC?Math.min(100,((today-d.start)/(d.end-d.start))*100):0;
                    return(<div key={i} style={{padding:"8px 11px",border:`1px solid ${iC?"#FFD700":"#1e0800"}`,borderRadius:"5px",background:iC?"rgba(80,15,0,0.3)":"rgba(255,80,0,0.02)",position:"relative",overflow:"hidden"}}>
                      {iC&&<div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct}%`,background:"rgba(255,130,0,0.07)"}}/>}
                      <div style={{display:"flex",gap:"1rem",alignItems:"center",position:"relative"}}>
                        <div style={{width:"70px",fontFamily:"'Cinzel',serif",color:iC?"#FFD700":"#b87a20",fontWeight:iC?700:400,fontSize:"0.76rem"}}>{d.name}{iC&&<span style={{marginLeft:"4px",color:"#FF6B35",fontSize:"0.58rem"}}>▶</span>}</div>
                        <div style={{color:"#777",fontSize:"0.7rem",flex:1}}>{fmt(d.start)} → {fmt(d.end)}</div>
                        <div style={{color:"#4a2a08",fontSize:"0.65rem"}}>{Math.round(d.yrs)}y</div>
                      </div>
                    </div>);
                  })}
                </div>
              </div>
            )}

            {/* PAST */}
            {tab==="past"&&(
              <div>
                <div style={{padding:"0.75rem 0.9rem",border:"1px solid #2a1001",borderRadius:"7px",background:"rgba(255,80,0,0.02)",marginBottom:"0.8rem"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#b87a20",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.35rem"}}>🔮 10 DEEP REVELATIONS FROM YOUR PAST</div>
                  <p style={{color:"#7a5020",fontSize:"0.76rem",lineHeight:1.6}}>Derived entirely from classical Vedic rules — planetary dignities, house placements, aspects, yogas, and Nakshatra analysis. Zero generic statements — every insight is traceable to a specific feature of this chart.</p>
                </div>
                {pred.past.map((p,i)=>(
                  <div key={i} className={`xp ${openPast===i?"op":""}`} onClick={()=>setOpenPast(openPast===i?null:i)}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.7rem"}}>
                      <div style={{fontFamily:"'Cinzel',serif",color:"#FFD700",fontSize:"0.9rem",minWidth:"24px",textAlign:"center",fontWeight:700}}>{i+1}</div>
                      <div style={{fontFamily:"'Cinzel',serif",color:openPast===i?"#FFD700":"#DEB887",fontSize:"0.8rem",fontWeight:600,flex:1,lineHeight:1.4}}>{p.title}</div>
                      <div style={{color:"#6a4010",fontSize:"0.7rem"}}>{openPast===i?"▲":"▼"}</div>
                    </div>
                    {openPast===i&&(
                      <div style={{marginTop:"0.7rem",paddingTop:"0.7rem",borderTop:"1px solid #2a1001",animation:"fd 0.25s ease"}}>
                        <p style={{color:"#D4B880",fontSize:"0.84rem",lineHeight:1.85}}>{p.body}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* PRESENT */}
            {tab==="present"&&(
              <div>
                <div style={{padding:"0.8rem 0.9rem",border:"1px solid #2a1001",borderRadius:"7px",marginBottom:"0.8rem",background:"rgba(255,80,0,0.02)"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#b87a20",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.45rem"}}>⚡ CURRENT LIFE — {cd?.name?.toUpperCase()} MAHADASHA ANALYSIS</div>
                  <p style={{color:"#D4B880",fontSize:"0.84rem",lineHeight:1.8}}>{pred.presMain}</p>
                </div>
                {[["🏠 Family & Home",pred.present.family],["💼 Career & Status",pred.present.career],["❤️ Love & Relationships",pred.present.love],["💰 Finance & Wealth",pred.present.finance],["🧘 Inner World",pred.present.inner],["🔲 Lo Shu Grid Analysis",pred.present.loShuReading],["📆 Personal Year Forecast",pred.present.personalYear]].map(([label,text])=>(
                  <div key={label} className="cd" style={{marginBottom:"0.55rem"}}>
                    <div style={{fontFamily:"'Cinzel',serif",color:"#DEB887",fontSize:"0.72rem",marginBottom:"0.45rem",fontWeight:600}}>{label}</div>
                    <p style={{color:"#C8A878",fontSize:"0.82rem",lineHeight:1.8}}>{text}</p>
                  </div>
                ))}
              </div>
            )}

            {/* FUTURE */}
            {tab==="future"&&(
              <div>
                <div style={{padding:"0.75rem 0.9rem",border:"1px solid #2a1001",borderRadius:"7px",background:"rgba(255,80,0,0.02)",marginBottom:"0.8rem"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#b87a20",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.35rem"}}>🌟 10 PROPHECIES FOR YOUR FUTURE</div>
                  <p style={{color:"#7a5020",fontSize:"0.76rem",lineHeight:1.6}}>Each prophecy is anchored to an upcoming Dasha period or classical yoga activation — with specific timing. These are derived from this chart's unique planetary architecture, not generic statements.</p>
                </div>
                {pred.future.map((f,i)=>(
                  <div key={i} className={`xp ${openFuture===i?"op":""}`} onClick={()=>setOpenFuture(openFuture===i?null:i)}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.7rem"}}>
                      <div style={{fontFamily:"'Cinzel Decorative',serif",color:"#FFD700",fontSize:"0.85rem",minWidth:"24px",textAlign:"center"}}>{["I","II","III","IV","V"][i]}</div>
                      <div style={{fontFamily:"'Cinzel',serif",color:openFuture===i?"#FFD700":"#DEB887",fontSize:"0.8rem",fontWeight:600,flex:1,lineHeight:1.4}}>{f.title}</div>
                      <div style={{color:"#6a4010",fontSize:"0.7rem"}}>{openFuture===i?"▲":"▼"}</div>
                    </div>
                    {openFuture===i&&(
                      <div style={{marginTop:"0.7rem",paddingTop:"0.7rem",borderTop:"1px solid #2a1001",animation:"fd 0.25s ease"}}>
                        <p style={{color:"#D4B880",fontSize:"0.84rem",lineHeight:1.85}}>{f.body}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* NUMEROLOGY */}
            {tab==="numerology"&&(
              <div style={{animation:"fd 0.4s ease"}}>
                <div style={{padding:"0.75rem 0.9rem",border:"1px solid #2a1001",borderRadius:"7px",background:"rgba(255,80,0,0.02)",marginBottom:"0.8rem"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#b87a20",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.35rem"}}>🔢 NUMEROLOGY DEEP READING</div>
                  <p style={{color:"#7a5020",fontSize:"0.76rem",lineHeight:1.6}}>Vedic numerology (Ank Jyotish) — Cheiro system integrated with Lo Shu Grid, Kua number, Karmic Debt, and Personal Year analysis.</p>
                </div>
                {/* Moolank & Bhagyank */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.6rem",marginBottom:"0.6rem"}}>
                  {[
                    {label:"Moolank (Psychic №)",value:pred.num.moolank,sub:`Ruled by ${MOOLANK_DATA[pred.num.moolank]?.planet||"—"}`},
                    {label:"Bhagyank (Destiny №)",value:pred.num.bhagyank,sub:pred.num.masterNumber?`✦ Master Number ${pred.num.masterNumber}`:pred.num.karmicDebt?`⚠ Karmic Debt ${pred.num.karmicDebt}`:`Life Path`},
                    {label:"Personal Year",value:pred.num.personalYear,sub:`${new Date().getFullYear()} vibration`},
                    {label:"Kua (M / F)",value:`${pred.num.kuaMale} / ${pred.num.kuaFemale}`,sub:"Feng Shui luck direction"},
                  ].map(({label,value,sub})=>(
                    <div key={label} style={{border:"1px solid #2a1001",borderRadius:"7px",padding:"0.8rem",background:"rgba(255,100,0,0.03)",textAlign:"center"}}>
                      <div style={{color:"#5a3a0a",fontSize:"0.58rem",letterSpacing:"0.1em",fontFamily:"'Cinzel',serif",marginBottom:"0.3rem"}}>{label}</div>
                      <div style={{fontFamily:"'Cinzel Decorative',serif",color:"#FFD700",fontSize:"1.6rem",fontWeight:700,lineHeight:1}}>{value}</div>
                      <div style={{color:"#7a5020",fontSize:"0.62rem",marginTop:"0.25rem"}}>{sub}</div>
                    </div>
                  ))}
                </div>
                {/* Moolank deep desc */}
                <div className="cd" style={{marginBottom:"0.55rem"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#DEB887",fontSize:"0.72rem",fontWeight:600,marginBottom:"0.4rem"}}>✦ Moolank {pred.num.moolank} — {MOOLANK_DATA[pred.num.moolank]?.planet}-Ruled Psychic Nature</div>
                  <p style={{color:"#C8A878",fontSize:"0.82rem",lineHeight:1.8}}>{MOOLANK_DATA[pred.num.moolank]?.desc}</p>
                  <div style={{marginTop:"0.6rem",display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.4rem",fontSize:"0.73rem"}}>
                    {[["Core Traits",MOOLANK_DATA[pred.num.moolank]?.traits],["Shadow",MOOLANK_DATA[pred.num.moolank]?.shadow],["Career Paths",MOOLANK_DATA[pred.num.moolank]?.career],["Love Style",MOOLANK_DATA[pred.num.moolank]?.love],["Body Areas",MOOLANK_DATA[pred.num.moolank]?.body],["Lucky Day",MOOLANK_DATA[pred.num.moolank]?.day+" · "+MOOLANK_DATA[pred.num.moolank]?.gem]].map(([k,v])=>(
                      <div key={k} style={{padding:"0.4rem 0.6rem",background:"rgba(0,0,0,0.15)",borderRadius:"4px",border:"1px solid #1a0800"}}>
                        <div style={{color:"#7a5020",fontSize:"0.58rem",letterSpacing:"0.08em",fontFamily:"'Cinzel',serif",marginBottom:"0.2rem"}}>{k}</div>
                        <div style={{color:"#C8A878",lineHeight:1.5}}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Lo Shu Grid */}
                <div className="cd" style={{marginBottom:"0.55rem"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#DEB887",fontSize:"0.72rem",fontWeight:600,marginBottom:"0.5rem"}}>🔲 Lo Shu Grid — Birth Date Blueprint</div>
                  <div style={{display:"flex",gap:"1.2rem",alignItems:"flex-start",flexWrap:"wrap"}}>
                    <div>
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,42px)",gap:"3px",marginBottom:"0.5rem"}}>
                        {[[4,9,2],[3,5,7],[8,1,6]].map((row,ri)=>row.map((n,ci)=>{
                          const cnt=pred.num.gridCount[n]||0;
                          return(<div key={`${ri}-${ci}`} style={{width:"42px",height:"42px",border:`1px solid ${cnt>0?"#b87a20":"#2a1001"}`,borderRadius:"4px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:cnt>0?"rgba(255,150,0,0.08)":"rgba(0,0,0,0.2)"}}>
                            <div style={{fontFamily:"'Cinzel',serif",color:cnt>1?"#FFD700":cnt===1?"#DEB887":"#2a1001",fontSize:"1rem",fontWeight:700,lineHeight:1}}>{n}</div>
                            {cnt>0&&<div style={{color:"#7a5020",fontSize:"0.5rem"}}>{Array(cnt).fill("·").join("")}</div>}
                          </div>);
                        }))}
                      </div>
                      <div style={{fontSize:"0.6rem",color:"#5a3010",textAlign:"center"}}>4-9-2 / 3-5-7 / 8-1-6</div>
                    </div>
                    <div style={{flex:1,minWidth:"160px"}}>
                      {pred.num.missing_nums.length>0&&<div style={{marginBottom:"0.4rem"}}><span style={{color:"#E05252",fontSize:"0.65rem",fontFamily:"'Cinzel',serif"}}>Missing: </span><span style={{color:"#C8A878",fontSize:"0.72rem"}}>{pred.num.missing_nums.join(", ")}</span></div>}
                      {pred.num.repeat_nums.length>0&&<div style={{marginBottom:"0.4rem"}}><span style={{color:"#FFD700",fontSize:"0.65rem",fontFamily:"'Cinzel',serif"}}>Repeated: </span><span style={{color:"#C8A878",fontSize:"0.72rem"}}>{pred.num.repeat_nums.map(r=>`${r.n}×${r.c}`).join(", ")}</span></div>}
                      <div style={{fontSize:"0.65rem",lineHeight:1.7,color:"#C8A878"}}>{pred.present.loShuReading}</div>
                    </div>
                  </div>
                </div>
                {/* Karmic Debt / Master Number */}
                {(pred.num.karmicDebt||pred.num.masterNumber)&&(
                  <div className={`cd ${pred.num.masterNumber?"ben":"mal"}`} style={{marginBottom:"0.55rem"}}>
                    <div style={{fontFamily:"'Cinzel',serif",color:pred.num.masterNumber?"#90EE90":"#FF9999",fontSize:"0.72rem",fontWeight:600,marginBottom:"0.4rem"}}>
                      {pred.num.masterNumber?`✦ Master Number ${pred.num.masterNumber} — High-Voltage Destiny`:`⚠ Karmic Debt ${pred.num.karmicDebt} — ${KARMIC_DEBT[pred.num.karmicDebt]?.name}`}
                    </div>
                    <p style={{color:"#C8A878",fontSize:"0.82rem",lineHeight:1.8}}>{pred.num.masterNumber?BHAGYANK_DESC[pred.num.masterNumber]:KARMIC_DEBT[pred.num.karmicDebt]?.warning}</p>
                  </div>
                )}
                {/* Personal Year detail */}
                <div className="cd" style={{marginBottom:"0.55rem"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#DEB887",fontSize:"0.72rem",fontWeight:600,marginBottom:"0.4rem"}}>📆 Personal Year {pred.num.personalYear} — {new Date().getFullYear()}</div>
                  <p style={{color:"#C8A878",fontSize:"0.82rem",lineHeight:1.8}}>{pred.present.personalYear}</p>
                </div>
                {/* Bhagyank */}
                <div className="cd">
                  <div style={{fontFamily:"'Cinzel',serif",color:"#DEB887",fontSize:"0.72rem",fontWeight:600,marginBottom:"0.4rem"}}>✦ Bhagyank {pred.num.bhagyank} — Destiny Path</div>
                  <p style={{color:"#C8A878",fontSize:"0.82rem",lineHeight:1.8}}>{BHAGYANK_DESC[pred.num.bhagyank]||BHAGYANK_DESC[1]}</p>
                </div>
              </div>
            )}

            {/* REMEDIES */}
            {tab==="remedies"&&(
              <div>
                <div style={{padding:"0.75rem 0.9rem",border:"1px solid #2a1001",borderRadius:"7px",background:"rgba(255,80,0,0.02)",marginBottom:"0.8rem"}}>
                  <div style={{fontFamily:"'Cinzel',serif",color:"#b87a20",fontSize:"0.65rem",letterSpacing:"0.1em",marginBottom:"0.35rem"}}>🙏 VEDIC REMEDIES — SPECIFIC TO THIS CHART</div>
                  <p style={{color:"#7a5020",fontSize:"0.76rem",lineHeight:1.6}}>Remedies target the specific planetary weaknesses detected in this chart using classical Vedic methods.</p>
                </div>
                {pred.remedies.map((r,i)=>(
                  <div key={i} className="cd" style={{marginBottom:"0.55rem"}}>
                    <div style={{fontFamily:"'Cinzel',serif",color:"#DEB887",fontSize:"0.75rem",fontWeight:700,marginBottom:"0.45rem"}}>✦ {r.title}</div>
                    <p style={{color:"#C8A878",fontSize:"0.82rem",lineHeight:1.8}}>{r.body}</p>
                  </div>
                ))}
                <div className="cd" style={{marginTop:"0.7rem",background:"rgba(0,0,0,0.2)",borderColor:"#1a0800"}}>
                  <p style={{color:"#4a2808",fontSize:"0.7rem",lineHeight:1.7,fontStyle:"italic"}}>⚠ Disclaimer: These predictions are based on classical Vedic textual rules and should be used as one perspective for self-understanding. Consult a qualified Jyotishi for major life decisions. Gemstone recommendations require in-person expert consultation — incorrect gemstones can produce adverse effects.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
