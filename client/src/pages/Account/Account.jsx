import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import "./Account.css";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const TIMEZONES = ["AST (UTC-4)","EST (UTC-5)","CST (UTC-6)","MST (UTC-7)","PST (UTC-8)","GMT (UTC+0)","CET (UTC+1)","IST (UTC+5:30)","JST (UTC+9)","AEST (UTC+10)"];
const THEMES = [
  { name:"Dark Fire",  bg:"#080808", accent:"#ff6b1a", card:"#111116", text:"#f0eeea", border:"#1e1e28" },
  { name:"Midnight",   bg:"#06060f", accent:"#7c6fcd", card:"#0e0e1a", text:"#e8e8ff", border:"#1a1a2e" },
  { name:"Forest",     bg:"#060e08", accent:"#2ecc71", card:"#0c1610", text:"#e8f5e9", border:"#162016" },
  { name:"Ocean",      bg:"#060c14", accent:"#00b4d8", card:"#0a1420", text:"#e0f4ff", border:"#0d2035" },
  { name:"Light Mode", bg:"#f0ede8", accent:"#ff6b1a", card:"#ffffff", text:"#1a1a1a", border:"#e0ddd8" },
  { name:"Crimson",    bg:"#0a0606", accent:"#e63946", card:"#160c0c", text:"#fff0f0", border:"#2a1010" },
];
const TRAINER_LIST = ["Coach Alex Reid","Coach Marcus Lee","Coach Sarah Jones","Coach David Kim"];
const HEALTH_OPTIONS = ["Diabetes","Hypertension","Asthma","Knee Injury","Back Pain","Heart Condition","Obesity","Arthritis","Scoliosis","None"];
const WORKOUT_DB = {
  chest:   [{ icon:"🏋️", name:"Flat Bench Press", detail:"Compound · Chest focus", sets:["4×8","80% 1RM","Rest 90s"] },{ icon:"📐", name:"Incline DB Press", detail:"Upper chest activation", sets:["3×10","70% effort","Rest 75s"] },{ icon:"🔄", name:"Cable Flys", detail:"Isolation · Stretch", sets:["3×15","Light-Med","Rest 60s"] }],
  back:    [{ icon:"⬆️", name:"Weighted Pull-ups", detail:"Width builder · Lats", sets:["4×6","BW+10kg","Rest 2min"] },{ icon:"🚣", name:"Barbell Rows", detail:"Thickness · Mid-back", sets:["4×8","75% 1RM","Rest 90s"] },{ icon:"🔽", name:"Lat Pulldown", detail:"Lat sweep · Volume", sets:["3×12","Moderate","Rest 60s"] }],
  legs:    [{ icon:"🏆", name:"Back Squat", detail:"King of leg exercises", sets:["5×5","80% 1RM","Rest 2min"] },{ icon:"🦵", name:"Romanian Deadlift", detail:"Hamstrings & glutes", sets:["4×10","65% 1RM","Rest 90s"] },{ icon:"📦", name:"Leg Press", detail:"Volume & quad pump", sets:["3×15","Moderate","Rest 60s"] }],
  core:    [{ icon:"🌊", name:"Ab Wheel Rollout", detail:"Full core tension", sets:["4×12","Slow tempo","Rest 60s"] },{ icon:"🧱", name:"Plank Variations", detail:"Stability & endurance", sets:["3×60s","Max tension","Rest 45s"] },{ icon:"🔄", name:"Hanging Leg Raise", detail:"Lower abs & hip flex", sets:["3×15","Controlled","Rest 60s"] }],
  fullbody:[{ icon:"⚡", name:"Power Cleans", detail:"Full-body power", sets:["5×3","70% 1RM","Rest 2min"] },{ icon:"🏋️", name:"Deadlift", detail:"Total posterior chain", sets:["4×5","80% 1RM","Rest 2min"] },{ icon:"🤸", name:"Dumbbell Complex", detail:"6-move circuit", sets:["3 rounds","No rest","Rest 90s"] }],
  cardio:  [{ icon:"💥", name:"Sprint Intervals", detail:"HIIT · Fat burn", sets:["8×30s","Max effort","Rest 90s"] },{ icon:"🚴", name:"Assault Bike HIIT", detail:"Cardio conditioning", sets:["5×1min","All-out","Rest 2min"] },{ icon:"🏃", name:"Rowing Machine", detail:"Low-impact endurance", sets:["20min","Moderate","Steady"] }],
};
const BADGE_DEFS = [
  { id:"b1", name:"Iron Rookie",   desc:"First 10 sessions",      color:"#cd7f32", shine:"#e8a060", req:10,  type:"sessions" },
  { id:"b2", name:"Bronze Beast",  desc:"50 sessions",            color:"#cd7f32", shine:"#f0b070", req:50,  type:"sessions" },
  { id:"b3", name:"Silver Titan",  desc:"100 sessions",           color:"#c0c0c0", shine:"#e8e8e8", req:100, type:"sessions" },
  { id:"b4", name:"Gold Legend",   desc:"200 sessions",           color:"#ffd700", shine:"#fff176", req:200, type:"sessions" },
  { id:"b5", name:"Week Warrior",  desc:"7-day streak",           color:"#ff6b1a", shine:"#ffaa60", req:7,   type:"streak"   },
  { id:"b6", name:"Iron Will",     desc:"30-day streak",          color:"#7c6fcd", shine:"#a89cff", req:30,  type:"streak"   },
  { id:"b7", name:"Hydro Hero",    desc:"Hit water goal 5 days",  color:"#00b4d8", shine:"#70d8f0", req:5,   type:"water"    },
  { id:"b8", name:"Elite Status",  desc:"1 year membership",      color:"#e63946", shine:"#ff8090", req:365, type:"days"     },
];
const CHAT_REPLIES = [
  "Great question! Let me check that for you 💪",
  "Your membership covers all classes. Want to book one?",
  "I can help with that — what would you like to update?",
  "Our nutrition add-on is very popular. Want details?",
  "Looking at your streak — you're absolutely crushing it! 🔥",
  "I can schedule a PT session. What day works?",
];

// Real Unsplash gym photos
const GYM_PHOTOS = [
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80",
  "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80",
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&q=80",
  "https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800&q=80",
];
const TRAINER_PHOTOS = {
  "Coach Alex Reid":   "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=200&q=80",
  "Coach Marcus Lee":  "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=200&q=80",
  "Coach Sarah Jones": "https://images.unsplash.com/photo-1609899464726-0a4a2a88c8f8?w=200&q=80",
  "Coach David Kim":   "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&q=80",
};

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const calcBMI = (w, h) => h > 0 ? +(w / ((h/100)**2)).toFixed(1) : 0;
const bmiCategory = b => b < 18.5 ? "Underweight" : b < 25 ? "Healthy" : b < 30 ? "Overweight" : "Obese";
const bmiColor    = b => b < 18.5 ? "#00b4d8" : b < 25 ? "#2ecc71" : b < 30 ? "#ffa040" : "#e63946";

// ─── CHART COMPONENT ─────────────────────────────────────────────────────────
const mkOpts = () => ({
  responsive:true, maintainAspectRatio:false, animation:{ duration:900 },
  plugins:{ legend:{ labels:{ color:"rgba(240,238,234,0.6)", font:{ family:"DM Sans", size:11 } } } },
  scales:{
    x:{ grid:{ color:"rgba(255,255,255,0.04)" }, ticks:{ color:"#6b6b7a", font:{ family:"DM Sans",size:11 } } },
    y:{ grid:{ color:"rgba(255,255,255,0.04)" }, ticks:{ color:"#6b6b7a", font:{ family:"DM Sans",size:11 } } },
  },
});
function ChartLine({ id, data }) {
  const ref = useRef(null); const inst = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    inst.current?.destroy();
    inst.current = new Chart(ref.current, { type:"line", data, options:mkOpts() });
    return () => inst.current?.destroy();
  }, [data]);
  return <canvas ref={ref} id={id}/>;
}
function ChartBar({ id, data }) {
  const ref = useRef(null); const inst = useRef(null);
  useEffect(() => {
    if (!ref.current) return;
    inst.current?.destroy();
    inst.current = new Chart(ref.current, { type:"bar", data, options:{ ...mkOpts(), barPercentage:0.6 } });
    return () => inst.current?.destroy();
  }, [data]);
  return <canvas ref={ref} id={id}/>;
}

// ─── BODY AVATAR ─────────────────────────────────────────────────────────────
function BodyAvatar({ gender, chest, waist, hips, thigh, arm, shoulders }) {
  const cx = 80;
  if (gender === "female") {
    const sw=33+clamp((shoulders-100)/40,-1,1)*10, bRx=12+clamp((chest-82)/36,-1,1)*8,
          ww=13+clamp((waist-62)/36,-1,1)*9, hw=42+clamp((hips-86)/40,-1,1)*16,
          tw=12+clamp((thigh-46)/26,-1,1)*10, aw=6+clamp((arm-28)/20,-1,1)*6;
    const L=cx-sw, R=cx+sw;
    return (
      <svg viewBox="0 0 160 310" xmlns="http://www.w3.org/2000/svg" className="body-svg">
        <defs><radialGradient id="skinF" cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#d4a47a"/><stop offset="100%" stopColor="#a87050"/></radialGradient></defs>
        <ellipse cx="80" cy="18" rx="22" ry="16" fill="#2d1f12"/>
        <ellipse cx="80" cy="30" rx="20" ry="22" fill="url(#skinF)"/>
        <ellipse cx="72" cy="26" rx="4" ry="5" fill="white" opacity="0.9"/><ellipse cx="88" cy="26" rx="4" ry="5" fill="white" opacity="0.9"/>
        <circle cx="73" cy="27" r="3" fill="#1e1208"/><circle cx="89" cy="27" r="3" fill="#1e1208"/>
        <circle cx="74" cy="26" r="1" fill="white" opacity="0.7"/><circle cx="90" cy="26" r="1" fill="white" opacity="0.7"/>
        <path d="M74 41 Q80 45 86 41" stroke="#d4806a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <rect x="74" y="50" width="12" height="12" rx="4" fill="#c4956e"/>
        <ellipse cx="80" cy="70" rx={sw} ry="11" fill="#c2185b" opacity="0.9"/>
        <path d={`M${L} 69 Q${L-2} 96 ${L} 115 Q54 124 80 128 Q106 124 ${R} 115 Q${R+2} 96 ${R} 69Z`} fill="#880e4f" opacity="0.88"/>
        <ellipse cx={cx-bRx-2} cy="107" rx={bRx} ry={bRx*0.75} fill="#ad1457" opacity="0.9"/>
        <ellipse cx={cx+bRx+2} cy="107" rx={bRx} ry={bRx*0.75} fill="#ad1457" opacity="0.9"/>
        <path d={`M${cx-ww-32} 115 Q${cx-ww-34} 138 ${cx-ww-22} 150 Q${cx-ww-12} 160 80 162 Q${cx+ww+12} 160 ${cx+ww+22} 150 Q${cx+ww+34} 138 ${cx+ww+32} 115 Q${cx+26} 126 80 130 Q${cx-26} 126 ${cx-ww-32} 115Z`} fill="#6a0f3a"/>
        <ellipse cx="80" cy="163" rx={hw} ry="14" fill="#6a0f3a"/>
        <path d={`M${cx-tw-22} 161 Q${cx-tw-30} 196 ${cx-tw-26} 226 Q${cx-tw-16} 238 ${cx-tw-4} 234 Q${cx-tw+2} 200 ${cx-tw+2} 162Z`} fill="#880e4f" opacity="0.78"/>
        <path d={`M${cx+tw+22} 161 Q${cx+tw+30} 196 ${cx+tw+26} 226 Q${cx+tw+16} 238 ${cx+tw+4} 234 Q${cx+tw-2} 200 ${cx+tw-2} 162Z`} fill="#880e4f" opacity="0.78"/>
        <path d={`M${cx-tw-26} 226 Q${cx-tw-30} 260 ${cx-tw-26} 284 Q${cx-tw-20} 293 ${cx-tw-12} 290 Q${cx-tw-8} 262 ${cx-tw-4} 234Z`} fill="#6a0f3a"/>
        <path d={`M${cx+tw+26} 226 Q${cx+tw+30} 260 ${cx+tw+26} 284 Q${cx+tw+20} 293 ${cx+tw+12} 290 Q${cx+tw+8} 262 ${cx+tw+4} 234Z`} fill="#6a0f3a"/>
        <ellipse cx={cx-tw-19} cy="291" rx="10" ry="5" fill="#111"/>
        <ellipse cx={cx+tw+19} cy="291" rx="10" ry="5" fill="#111"/>
        <path d={`M${L} 69 Q${L-aw-7} 80 ${L-aw-11} 108 Q${L-aw-11} 132 ${L-aw-5} 142 Q${L-aw} 148 ${L-aw+5} 144 Q${L-aw+7} 120 ${L-2} 95 Q${L} 80 ${L} 69Z`} fill="#880e4f" opacity="0.78"/>
        <path d={`M${R} 69 Q${R+aw+7} 80 ${R+aw+11} 108 Q${R+aw+11} 132 ${R+aw+5} 142 Q${R+aw} 148 ${R+aw-5} 144 Q${R+aw-7} 120 ${R+2} 95 Q${R} 80 ${R} 69Z`} fill="#880e4f" opacity="0.78"/>
        <path d={`M${L-aw-5} 142 Q${L-aw-13} 166 ${L-aw-11} 185 Q${L-aw-7} 193 ${L-aw} 190 Q${L-aw+4} 170 ${L-aw+5} 144Z`} fill="url(#skinF)"/>
        <path d={`M${R+aw+5} 142 Q${R+aw+13} 166 ${R+aw+11} 185 Q${R+aw+7} 193 ${R+aw} 190 Q${R+aw-4} 170 ${R+aw-5} 144Z`} fill="url(#skinF)"/>
        <ellipse cx={L-aw-8} cy="193" rx="6" ry="8" fill="url(#skinF)"/>
        <ellipse cx={R+aw+8} cy="193" rx="6" ry="8" fill="url(#skinF)"/>
      </svg>
    );
  }
  const sw=40+clamp((shoulders-110)/50,-1,1)*14, ww=18+clamp((waist-70)/40,-1,1)*10,
        hw=36+clamp((hips-88)/40,-1,1)*14, tw=10+clamp((thigh-48)/28,-1,1)*9,
        aw=7+clamp((arm-30)/20,-1,1)*7;
  const L=cx-sw, R=cx+sw, wL=cx-ww, wR=cx+ww;
  return (
    <svg viewBox="0 0 160 310" xmlns="http://www.w3.org/2000/svg" className="body-svg">
      <defs><radialGradient id="skinM" cx="50%" cy="30%" r="70%"><stop offset="0%" stopColor="#c4956e"/><stop offset="100%" stopColor="#8a6040"/></radialGradient></defs>
      <ellipse cx="80" cy="18" rx="23" ry="14" fill="#2a1a0e"/>
      <ellipse cx="80" cy="30" rx="22" ry="24" fill="url(#skinM)"/>
      <ellipse cx="72" cy="25" rx="4.5" ry="5.5" fill="white" opacity="0.9"/><ellipse cx="88" cy="25" rx="4.5" ry="5.5" fill="white" opacity="0.9"/>
      <circle cx="73" cy="26" r="3" fill="#1e1208"/><circle cx="89" cy="26" r="3" fill="#1e1208"/>
      <circle cx="74" cy="25" r="1" fill="white" opacity="0.8"/><circle cx="90" cy="25" r="1" fill="white" opacity="0.8"/>
      <path d="M67 19 Q72 17.5 77 19" stroke="#3d2208" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M83 19 Q88 17.5 93 19" stroke="#3d2208" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M73 44 Q80 47.5 87 44" stroke="#8a4e2e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <rect x="73" y="53" width="14" height="14" rx="5" fill="url(#skinM)"/>
      <ellipse cx="80" cy="74" rx={sw} ry="14" fill="#ff6b1a" opacity="0.9"/>
      <path d={`M${L} 74 Q${L-2} 112 ${wL} 134 Q56 150 80 152 Q104 150 ${wR} 134 Q${R+2} 112 ${R} 74Z`} fill="#1e2536"/>
      <line x1="80" y1="76" x2="80" y2="138" stroke="rgba(255,107,26,0.12)" strokeWidth="1.5"/>
      <path d={`M${wL} 134 Q48 158 80 162 Q112 158 ${wR} 134 Q104 150 80 152 Q56 150 ${wL} 134Z`} fill="#161e2c"/>
      <ellipse cx="80" cy="163" rx={hw} ry="12" fill="#161e2c"/>
      <path d={`M${cx-tw-22} 162 Q${cx-tw-28} 196 ${cx-tw-26} 226 Q${cx-tw-16} 237 ${cx-tw-6} 233 Q${cx-tw+2} 201 ${cx-tw+2} 163Z`} fill="#1e2536"/>
      <path d={`M${cx+tw+22} 162 Q${cx+tw+28} 196 ${cx+tw+26} 226 Q${cx+tw+16} 237 ${cx+tw+6} 233 Q${cx+tw-2} 201 ${cx+tw-2} 163Z`} fill="#1e2536"/>
      <path d={`M${cx-tw-26} 226 Q${cx-tw-30} 260 ${cx-tw-26} 285 Q${cx-tw-20} 294 ${cx-tw-13} 291 Q${cx-tw-9} 263 ${cx-tw-6} 233Z`} fill="#161e2c"/>
      <path d={`M${cx+tw+26} 226 Q${cx+tw+30} 260 ${cx+tw+26} 285 Q${cx+tw+20} 294 ${cx+tw+13} 291 Q${cx+tw+9} 263 ${cx+tw+6} 233Z`} fill="#161e2c"/>
      <ellipse cx={cx-tw-19} cy="292" rx="11" ry="5.5" fill="#0d0d12"/>
      <ellipse cx={cx+tw+19} cy="292" rx="11" ry="5.5" fill="#0d0d12"/>
      <path d={`M${L} 74 Q${L-aw-9} 85 ${L-aw-13} 115 Q${L-aw-13} 143 ${L-aw-7} 153 Q${L-aw} 159 ${L-aw+7} 155 Q${L-aw+9} 129 ${L-2} 101 Q${L} 85 ${L} 74Z`} fill="#1e2536"/>
      <path d={`M${R} 74 Q${R+aw+9} 85 ${R+aw+13} 115 Q${R+aw+13} 143 ${R+aw+7} 153 Q${R+aw} 159 ${R+aw-7} 155 Q${R+aw-9} 129 ${R+2} 101 Q${R} 85 ${R} 74Z`} fill="#1e2536"/>
      <path d={`M${L-aw-7} 153 Q${L-aw-15} 180 ${L-aw-13} 200 Q${L-aw-9} 209 ${L-aw} 206 Q${L-aw+5} 186 ${L-aw+7} 155Z`} fill="url(#skinM)"/>
      <path d={`M${R+aw+7} 153 Q${R+aw+15} 180 ${R+aw+13} 200 Q${R+aw+9} 209 ${R+aw} 206 Q${R+aw-5} 186 ${R+aw-7} 155Z`} fill="url(#skinM)"/>
      <ellipse cx={L-aw-10} cy="209" rx="7" ry="9" fill="url(#skinM)"/>
      <ellipse cx={R+aw+10} cy="209" rx="7" ry="9" fill="url(#skinM)"/>
    </svg>
  );
}

// ─── GAME BADGE SVG ──────────────────────────────────────────────────────────
function GameBadge({ badge, earned }) {
  return (
    <div className={`gbadge${earned?" earned":""}`} title={badge.desc}>
      <svg viewBox="0 0 100 124" className="gbadge-svg">
        <defs>
          <radialGradient id={`g${badge.id}`} cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor={earned ? badge.shine : "#333345"}/>
            <stop offset="100%" stopColor={earned ? badge.color : "#1a1a25"}/>
          </radialGradient>
          <filter id={`gl${badge.id}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <linearGradient id={`sh${badge.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={earned ? badge.shine : "#444455"} stopOpacity="0.6"/>
            <stop offset="100%" stopColor="transparent"/>
          </linearGradient>
        </defs>
        {/* Shield */}
        <path d="M50 6 L90 20 L90 58 Q90 90 50 104 Q10 90 10 58 L10 20 Z"
          fill={`url(#g${badge.id})`} stroke={earned ? badge.shine : "#333345"} strokeWidth="1.5"
          filter={earned ? `url(#gl${badge.id})` : "none"} opacity={earned ? 1 : 0.35}/>
        {/* Highlight */}
        <path d="M50 10 L86 23 L86 55 Q86 86 50 99 Q14 86 14 55 L14 23 Z"
          fill={`url(#sh${badge.id})`}/>
        {/* Inner ring */}
        <path d="M50 18 L80 29 L80 56 Q80 79 50 90 Q20 79 20 56 L20 29 Z"
          fill="none" stroke={earned ? `${badge.shine}50` : "transparent"} strokeWidth="1"/>
        {/* Star */}
        {earned
          ? <path d="M50 30 L54 42 L67 42 L57 50 L61 62 L50 54 L39 62 L43 50 L33 42 L46 42 Z"
              fill={badge.shine} filter={`url(#gl${badge.id})`} opacity="0.95"/>
          : <g opacity="0.4">
              <rect x="41" y="46" width="18" height="14" rx="3" fill="#333"/>
              <path d="M44 46 Q44 38 50 38 Q56 38 56 46" fill="none" stroke="#555" strokeWidth="2.5"/>
              <circle cx="50" cy="53" r="2" fill="#555"/>
            </g>
        }
        {/* Ribbon base */}
        <rect x="34" y="97" width="32" height="10" rx="2" fill={earned ? badge.color : "#222"} opacity={earned ? 0.95 : 0.3}/>
        <path d="M36 107 L50 120 L64 107" fill={earned ? badge.color : "#222"} opacity={earned ? 0.9 : 0.3}/>
        {/* Shine line */}
        {earned && <path d="M20 20 Q28 16 36 22" fill="none" stroke={`${badge.shine}70`} strokeWidth="2" strokeLinecap="round"/>}
      </svg>
      <div className="gbadge-name">{badge.name}</div>
      {!earned && <div className="gbadge-lock">LOCKED</div>}
    </div>
  );
}

// ─── CONFETTI ────────────────────────────────────────────────────────────────
function Confetti() {
  const shapes = ["■","▲","●","♦","★"];
  const pieces = Array.from({length:70},(_,i)=>({
    id:i, shape:shapes[i%shapes.length],
    color:["#ff6b1a","#ffa040","#fff","#ffd700","#ff4488","#00e5a0","#4a9eff"][i%7],
    left:Math.random()*100, delay:Math.random()*6,
    dur:3+Math.random()*5, size:8+Math.random()*10, rot:Math.random()*360,
  }));
  return (
    <div className="confetti-wrap">
      {pieces.map(p=>(
        <div key={p.id} className="confetti-p" style={{
          left:`${p.left}%`, color:p.color, fontSize:p.size,
          animationDelay:`${p.delay}s`, animationDuration:`${p.dur}s`,
          transform:`rotate(${p.rot}deg)`,
        }}>{p.shape}</div>
      ))}
    </div>
  );
}

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
function Confirm({ msg, onOk, onCancel }) {
  return createPortal(
    <div className="overlay-dark" onClick={onCancel}>
      <div className="confirm-box" onClick={e=>e.stopPropagation()}>
        <div className="confirm-icon">⚠️</div>
        <p className="confirm-msg">{msg}</p>
        <div className="confirm-row">
          <button className="btn-ghost" onClick={onCancel}>← Go Back</button>
          <button className="btn-danger" onClick={onOk}>Proceed →</button>
        </div>
      </div>
    </div>, document.body
  );
}

// ─── HISTORY DRAWER ──────────────────────────────────────────────────────────
function HistoryDrawer({ title, entries, onClose, onRestore }) {
  return createPortal(
    <div className="overlay-dark" onClick={onClose}>
      <div className="bottom-sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div className="sheet-head">
          <span className="sheet-title">{title} History</span>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="sheet-body">
          {entries.length===0 && <p className="empty-msg">No history yet — save something first.</p>}
          {entries.map((e,i)=>(
            <div className="hist-row" key={i}>
              <div className="hist-meta">
                <span className="hist-date">{e.date}</span>
                {onRestore && <button className="hist-restore" onClick={()=>onRestore(e)}>↩ Restore</button>}
              </div>
              <div className="hist-chips">
                {Object.entries(e.data).map(([k,v])=>(
                  <span className="hist-chip" key={k}><span className="hist-k">{k}:</span> {v}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>, document.body
  );
}

// ─── CALENDAR MODAL ──────────────────────────────────────────────────────────
function CalendarModal({ attendedDays, onClose, onToggle, tz }) {
  const now = new Date();
  const [vm, setVm] = useState(now.getMonth());
  const [vy, setVy] = useState(now.getFullYear());
  const first = new Date(vy,vm,1).getDay();
  const total = new Date(vy,vm+1,0).getDate();
  const key = d=>`${vy}-${String(vm+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
  const dow = d=>new Date(vy,vm,d).getDay();
  const isGym = d=>dow(d)>=1&&dow(d)<=6;
  const isMorn = d=>dow(d)===5||dow(d)===6;
  const isPast = d=>new Date(vy,vm,d)<=now;
  return createPortal(
    <div className="overlay-dark" onClick={onClose}>
      <div className="cal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="sheet-handle"/>
        <div className="cal-head">
          <button className="cal-nav" onClick={()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);}}>‹</button>
          <div className="sheet-title">{MONTHS[vm]} {vy} <span className="tz-tag">{tz}</span></div>
          <button className="cal-nav" onClick={()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);}}>›</button>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="cal-dow-row">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div className="cal-dow" key={d}>{d}</div>)}
        </div>
        <div className="cal-grid">
          {Array(first).fill(null).map((_,i)=><div key={`e${i}`} className="cal-cell"/>)}
          {Array.from({length:total},(_,i)=>i+1).map(d=>{
            const k=key(d), att=attendedDays[k], gym=isGym(d), mo=isMorn(d), past=isPast(d);
            return (
              <div key={d} className={`cal-cell${gym?" gym":""}${att?.am?" am":""}${att?.pm?" pm":""}`}
                onClick={()=>gym&&past&&onToggle(k,mo)}>
                <span className="cal-n">{d}</span>
                {gym&&<div className="cal-dots">
                  <span className={`cd${att?.am?" on":""}`}/>
                  {!mo&&<span className={`cd pm${att?.pm?" on":""}`}/>}
                </div>}
              </div>
            );
          })}
        </div>
        <div className="cal-leg">
          <span><span className="cd on" style={{display:"inline-block",width:8,height:8,borderRadius:"50%",marginRight:4}}/> AM</span>
          <span><span className="cd pm on" style={{display:"inline-block",width:8,height:8,borderRadius:"50%",marginRight:4}}/> PM</span>
          <span style={{color:"var(--sub)"}}>Click to toggle · Fri/Sat = AM only</span>
        </div>
      </div>
    </div>, document.body
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function Account() {
  // Theme
  const [theme, setTheme] = useState(THEMES[0]);
  const [darkMode, setDarkMode] = useState(true);
  const [tz, setTz] = useState("AST (UTC-4)");
  const [showSettings, setShowSettings] = useState(false);

  // Profile
  const [profilePic, setProfilePic] = useState(null);
  const [username] = useState("Marcus Powell");
  const [birthday, setBirthday] = useState("");
  const [memberSince] = useState(2022);
  const picRef = useRef(null);
  const photoRef = useRef(null);
  const aiImgRef = useRef(null);

  // Birthday
  const isBday = (() => {
    if (!birthday) return false;
    const t=new Date(), b=new Date(birthday);
    return t.getMonth()===b.getMonth()&&t.getDate()===b.getDate();
  })();
  const [bdayPopup, setBdayPopup] = useState(isBday);
  const [showConfetti, setShowConfetti] = useState(isBday);

  // Measurements
  const [meas, setMeas] = useState({ weight:"", height:"", bf:"", chest:"", waist:"", shoulders:"", armL:"", armR:"", neck:"", hips:"", thighL:"", thighR:"", calfL:"", calfR:"", glutes:"" });
  const [gender, setGender] = useState("male");
  const [measHist, setMeasHist] = useState([
    { date:"Mar 2026", data:{ weight:"84kg", waist:"84cm", chest:"96cm", bmi:"26.6" } },
    { date:"Feb 2026", data:{ weight:"85kg", waist:"85cm", chest:"97cm", bmi:"26.9" } },
  ]);
  const [progressPhotos, setProgressPhotos] = useState([]);
  const [showMeasHist, setShowMeasHist] = useState(false);
  const [restoreMeas, setRestoreMeas] = useState(null);

  const currentBMI = calcBMI(parseFloat(meas.weight)||84, parseFloat(meas.height)||178);

  // Goals
  const [goals, setGoals] = useState({ weight:80, chest:100, waist:80, hips:98, thigh:58, arm:38 });
  const [goalIn, setGoalIn] = useState({ weight:80, chest:100, waist:80, hips:98, thigh:58, arm:38 });
  const [goalType, setGoalType] = useState("Bulk Up");
  const [goalHist, setGoalHist] = useState([]);
  const [showGoalHist, setShowGoalHist] = useState(false);
  const [confirmGoal, setConfirmGoal] = useState(false);

  // Health
  const [health, setHealth] = useState([]);
  const [healthNotes, setHealthNotes] = useState("");
  const [healthHist, setHealthHist] = useState([]);
  const [showHealthHist, setShowHealthHist] = useState(false);

  // Activity (wearable)
  const [activity, setActivity] = useState({ steps:"—", heartRate:"—", calories:"—", sleep:"—" });
  const [editActivity, setEditActivity] = useState(false);

  // Sessions
  const [attendedDays, setAttendedDays] = useState({});
  const [showCal, setShowCal] = useState(false);
  const [totalSessions, setTotalSessions] = useState(218);
  const [streak, setStreak] = useState(12);

  // Water
  const [waterCups, setWaterCups] = useState(0);
  const WGOAL = 8;

  // Charts
  const [history] = useState([
    { month:"Oct", weight:88, chest:100, waist:88, hips:100, thigh:58, arm:37 },
    { month:"Nov", weight:87, chest:100, waist:87, hips:99,  thigh:58, arm:37 },
    { month:"Dec", weight:86, chest:99,  waist:86, hips:99,  thigh:57, arm:37 },
    { month:"Jan", weight:85, chest:98,  waist:85, hips:98,  thigh:57, arm:37 },
    { month:"Feb", weight:84, chest:97,  waist:84, hips:97,  thigh:56, arm:37 },
    { month:"Mar", weight:84, chest:96,  waist:84, hips:96,  thigh:56, arm:37 },
  ]);
  const [chartTab, setChartTab] = useState("weight");

  // Strength
  const [lifts, setLifts] = useState({ bench:100, squat:130, dead:160, ohp:65, pullups:18 });
  const [liftHist, setLiftHist] = useState([]);
  const [showLiftHist, setShowLiftHist] = useState(false);

  // AI
  const [aiMsgs, setAiMsgs] = useState([{ role:"ai", text:"Hey! I'm NutriAI 🤖 — your personal fitness & nutrition coach. Ask me anything about your goals, workouts, or diet!" }]);
  const [aiIn, setAiIn] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiImg, setAiImg] = useState(null);
  const aiScrollRef = useRef(null);

  // Target
  const [activeTarget, setActiveTarget] = useState(null);

  // Reviews
  const [reviews, setReviews] = useState([
    { id:1, trainer:"Coach Alex Reid",  rating:5, comment:"Absolutely incredible. Best trainer at the gym.", privacy:"public",  draft:false, date:"Feb 2026" },
    { id:2, trainer:"Coach Marcus Lee", rating:4, comment:"Great session structure, really organised.",       privacy:"private", draft:false, date:"Jan 2026" },
  ]);
  const [rDraft, setRDraft] = useState({ trainer:TRAINER_LIST[0], rating:0, comment:"", privacy:"public" });
  const [editRev, setEditRev] = useState(null);
  const [delRevId, setDelRevId] = useState(null);
  const [revTab, setRevTab] = useState("posted");

  // Chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState([{ role:"agent", text:"Hey Marcus! 👋 I'm your GymPro support agent. How can I help today?", time:"Just now" }]);
  const [chatIn, setChatIn] = useState("");
  const chatRef = useRef(null);
  const replyIdx = useRef(0);

  // Toast
  const [toast, setToast] = useState({ show:false, msg:"" });
  const showToast = useCallback(msg=>{
    setToast({show:true,msg});
    setTimeout(()=>setToast({show:false,msg:""}),2600);
  },[]);

  // Time
  const [now, setNow] = useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60000); return()=>clearInterval(t); },[]);

  // Theme apply
  useEffect(()=>{
    const r = document.documentElement;
    r.style.setProperty("--bg", theme.bg);
    r.style.setProperty("--accent", theme.accent);
    r.style.setProperty("--card", theme.card);
    r.style.setProperty("--text", theme.text);
    r.style.setProperty("--border", theme.border);
    document.body.style.background = theme.bg;
  },[theme]);

  // Scroll chat/ai
  useEffect(()=>{ if(chatRef.current) chatRef.current.scrollTop=chatRef.current.scrollHeight; },[chatMsgs]);
  useEffect(()=>{ if(aiScrollRef.current) aiScrollRef.current.scrollTop=aiScrollRef.current.scrollHeight; },[aiMsgs]);

  // Sessions calc
  useEffect(()=>{
    const keys=Object.keys(attendedDays).filter(k=>attendedDays[k]?.am||attendedDays[k]?.pm);
    let s=0; keys.forEach(k=>{if(attendedDays[k]?.am)s++;if(attendedDays[k]?.pm)s++;});
    setTotalSessions(218+s);
    setStreak(keys.length>0?Math.min(Math.ceil(keys.length/3),52):12);
  },[attendedDays]);

  // Level
  const level = (() => {
    const yrs = now.getFullYear()-memberSince;
    const sc = yrs*10+(currentBMI>=18.5&&currentBMI<25?20:currentBMI>=25&&currentBMI<30?10:5);
    if(sc>=50) return { label:"Elite",        color:"#ffd700", tier:5 };
    if(sc>=35) return { label:"Advanced",     color:"#ff6b1a", tier:4 };
    if(sc>=20) return { label:"Intermediate", color:"#00b4d8", tier:3 };
    return       { label:"Beginner",         color:"#2ecc71", tier:1 };
  })();

  // Nutrition plan
  const nutrition = (() => {
    const b=currentBMI;
    if(b<18.5) return { label:"Caloric Surplus", protein:30, carbs:45, fat:25, cals:2800, note:"Focus on lean proteins and complex carbs to gain healthy mass." };
    if(b<25)   return { label:"Balanced Macros",  protein:25, carbs:45, fat:30, cals:2400, note:"Maintain your current balance. Increase protein on training days." };
    if(b<30)   return { label:"Moderate Deficit", protein:35, carbs:35, fat:30, cals:2000, note:"Reduce refined carbs. Prioritise fibre, vegetables, and lean protein." };
    return       { label:"Caloric Deficit",      protein:40, carbs:25, fat:35, cals:1700, note:"Whole foods and low-GI carbs. Medical guidance recommended." };
  })();

  // Chart data
  const labels = history.map(h=>h.month);
  const wData = { labels, datasets:[
    { label:"Weight (kg)", data:history.map(h=>h.weight), borderColor:"#ff6b1a", backgroundColor:"rgba(255,107,26,0.12)", borderWidth:2.5, tension:0.4, fill:true, pointBackgroundColor:"#ff6b1a", pointRadius:5, pointHoverRadius:7 },
    { label:"Goal",        data:history.map(()=>goals.weight), borderColor:"rgba(255,255,255,0.3)", borderWidth:1.5, borderDash:[6,4], fill:false, pointRadius:0 },
    { label:"Predicted",   data:history.map((h,i)=>+(h.weight-i*0.35).toFixed(1)), borderColor:"#4a9eff", backgroundColor:"rgba(74,158,255,0.06)", borderWidth:1.5, borderDash:[3,3], tension:0.4, fill:true, pointRadius:0 },
  ]};
  const bData = { labels, datasets:[
    { label:"Chest", data:history.map(h=>h.chest), borderColor:"#ff6b1a", tension:0.4, borderWidth:2, fill:false, pointRadius:4 },
    { label:"Waist", data:history.map(h=>h.waist), borderColor:"#ffa040", tension:0.4, borderWidth:2, fill:false, pointRadius:4 },
    { label:"Hips",  data:history.map(h=>h.hips),  borderColor:"#f0eeea", tension:0.4, borderWidth:2, fill:false, pointRadius:4 },
    { label:"Thigh", data:history.map(h=>h.thigh), borderColor:"#6b6b7a", tension:0.4, borderWidth:2, fill:false, pointRadius:4 },
  ]};
  const sData = { labels:["Bench","Squat","Deadlift","OHP","Pull-ups"], datasets:[
    { label:"Current", data:[lifts.bench,lifts.squat,lifts.dead,lifts.ohp,lifts.pullups], backgroundColor:"rgba(255,107,26,0.78)", borderRadius:8 },
    { label:"Goal",    data:[120,150,180,80,25], backgroundColor:"rgba(255,255,255,0.08)", borderRadius:8, borderWidth:1, borderColor:"rgba(255,255,255,0.25)" },
  ]};
  const compareItems = [
    { label:"Weight", current:history[history.length-1].weight, goal:goals.weight, unit:"kg" },
    { label:"Chest",  current:history[history.length-1].chest,  goal:goals.chest,  unit:"cm" },
    { label:"Waist",  current:history[history.length-1].waist,  goal:goals.waist,  unit:"cm" },
    { label:"Hips",   current:history[history.length-1].hips,   goal:goals.hips,   unit:"cm" },
  ];
  const cMax = Math.max(...compareItems.map(i=>Math.max(i.current,i.goal)));

  const av = { chest:parseFloat(meas.chest)||96, waist:parseFloat(meas.waist)||84, hips:parseFloat(meas.hips)||96, thigh:parseFloat(meas.thighL)||56, arm:parseFloat(meas.armL)||37, shoulders:parseFloat(meas.shoulders)||118 };

  const inp = (label, key, ph, step="1") => (
    <div className="field" key={key}>
      <label>{label}</label>
      <input type="number" placeholder={ph} step={step} value={meas[key]} onChange={e=>setMeas(p=>({...p,[key]:e.target.value}))}/>
    </div>
  );

  // Handlers
  const saveGoals = () => setConfirmGoal(true);
  const doSaveGoals = () => {
    const d=now.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    setGoalHist(h=>[{date:d,data:{...goalIn,type:goalType}},...h]);
    setGoals({...goalIn}); setConfirmGoal(false); showToast("✓ Goals updated!");
  };

  const saveMeas = () => {
    const mo=MONTHS[now.getMonth()], yr=now.getFullYear();
    setMeasHist(h=>[{ date:`${mo} ${yr}`, data:{ weight:(meas.weight||"84")+"kg", waist:(meas.waist||"84")+"cm", chest:(meas.chest||"96")+"cm", bmi:currentBMI.toString() } },...h]);
    showToast(`✓ ${mo} ${yr} measurements saved!`);
  };

  const saveHealth = () => {
    const d=now.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
    setHealthHist(h=>[{date:d,data:{ conditions:health.join(", ")||"None", notes:healthNotes||"—" }},...h]);
    showToast("✓ Health profile saved!");
  };

  const toggleDay = (key, morningOnly) => {
    setAttendedDays(p=>{
      const cur=p[key]||{};
      if(!cur.am) return {...p,[key]:{am:true,pm:false}};
      if(!morningOnly&&cur.am&&!cur.pm) return {...p,[key]:{am:true,pm:true}};
      return {...p,[key]:{am:false,pm:false}};
    });
  };

  const askAI = async () => {
    if(!aiIn.trim()) return;
    const um={role:"user",text:aiIn,image:aiImg};
    setAiMsgs(m=>[...m,um]); setAiIn(""); setAiImg(null); setAiLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:600,
          system:`You are NutriAI, a GymPro elite fitness & nutrition coach. User: ${username}, ${gender}, BMI ${currentBMI} (${bmiCategory(currentBMI)}), goal: ${goalType}, health: ${health.join(", ")||"None"}. Give concise motivating advice under 100 words. Use fitness emojis.`,
          messages:[{role:"user",content:aiIn}] }),
      });
      const data=await res.json();
      setAiMsgs(m=>[...m,{role:"ai",text:data.content?.map(c=>c.text||"").join("")||"Try again!"}]);
    } catch { setAiMsgs(m=>[...m,{role:"ai",text:"⚠️ Connection issue. Please try again."}]); }
    setAiLoading(false);
  };

  const postReview = () => {
    if(!rDraft.rating||!rDraft.comment.trim()){showToast("⚠️ Rating and comment required.");return;}
    setReviews(r=>[...r,{...rDraft,id:Date.now(),draft:false,date:now.toLocaleDateString("en-GB",{month:"short",year:"numeric"})}]);
    setRDraft({trainer:TRAINER_LIST[0],rating:0,comment:"",privacy:"public"});
    showToast("✓ Review posted!");
  };
  const saveDraft = () => {
    if(!rDraft.comment.trim()){showToast("⚠️ Write something first.");return;}
    setReviews(r=>[...r,{...rDraft,id:Date.now(),draft:true,date:"Draft"}]);
    setRDraft({trainer:TRAINER_LIST[0],rating:0,comment:"",privacy:"public"});
    showToast("✓ Saved as draft.");
  };

  const sendChat = () => {
    if(!chatIn.trim()) return;
    const t=now.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
    setChatMsgs(p=>[...p,{role:"user",text:chatIn,time:t}]);
    setChatIn("");
    setTimeout(()=>setChatMsgs(p=>[...p,{role:"agent",text:CHAT_REPLIES[replyIdx.current++%CHAT_REPLIES.length],time:t}]),900);
  };

  const postedRevs = reviews.filter(r=>!r.draft);
  const draftRevs  = reviews.filter(r=>r.draft);
  const currentMo  = MONTHS[now.getMonth()];
  const hasMoCurrent = history.some(h=>h.month===currentMo);
  const dayOfMo = now.getDate();
  const progressWarn = !hasMoCurrent ? (dayOfMo>20?"red":dayOfMo>10?"orange":"subtle") : null;
  const sessThisWk = Object.keys(attendedDays).filter(k=>{
    const d=new Date(k), t=new Date(); const sw=new Date(t); sw.setDate(t.getDate()-t.getDay());
    return d>=sw&&d<=t;
  }).length;

  return (
    <>
      {showConfetti && <Confetti/>}
      <div className={`toast${toast.show?" show":""}`}>{toast.msg}</div>

      {/* Birthday popup */}
      {bdayPopup && (
        <div className="overlay-dark">
          <div className="bday-popup">
            <div className="bday-emoji-ring">🎂</div>
            <div className="bday-title">Happy Birthday, {username.split(" ")[0]}!</div>
            <p className="bday-msg">The entire GymPro family celebrates you today. Keep smashing those goals — today and every day! 🎉💪</p>
            <button className="btn-accent" onClick={()=>setBdayPopup(false)}>Thank You! 🎊</button>
          </div>
        </div>
      )}

      {/* Confirm dialogs */}
      {confirmGoal && <Confirm msg="Save these new goals? Your previous goals will be archived." onOk={doSaveGoals} onCancel={()=>setConfirmGoal(false)}/>}
      {restoreMeas && <Confirm msg="Restore this measurement snapshot? Your current inputs will be replaced." onOk={()=>{
        const d=restoreMeas.data;
        setMeas(m=>({...m,weight:parseFloat(d.weight)||"",chest:parseFloat(d.chest)||"",waist:parseFloat(d.waist)||""}));
        setRestoreMeas(null); setShowMeasHist(false); showToast("✓ Measurement restored.");
      }} onCancel={()=>setRestoreMeas(null)}/>}
      {delRevId && <Confirm msg="Permanently delete this review? This cannot be undone." onOk={()=>{setReviews(r=>r.filter(x=>x.id!==delRevId));setDelRevId(null);showToast("✓ Review deleted.");}} onCancel={()=>setDelRevId(null)}/>}

      {/* History drawers */}
      {showMeasHist && <HistoryDrawer title="Measurement" entries={measHist} onClose={()=>setShowMeasHist(false)} onRestore={e=>setRestoreMeas(e)}/>}
      {showGoalHist && <HistoryDrawer title="Goal" entries={goalHist} onClose={()=>setShowGoalHist(false)}/>}
      {showHealthHist && <HistoryDrawer title="Health" entries={healthHist} onClose={()=>setShowHealthHist(false)}/>}
      {showLiftHist && <HistoryDrawer title="Strength" entries={liftHist} onClose={()=>setShowLiftHist(false)}/>}
      {showCal && <CalendarModal attendedDays={attendedDays} onClose={()=>setShowCal(false)} onToggle={toggleDay} tz={tz}/>}

      {/* Settings */}
      {showSettings && createPortal(
        <div className="overlay-dark" onClick={()=>setShowSettings(false)}>
          <div className="settings-panel" onClick={e=>e.stopPropagation()}>
            <div className="settings-head">
              <span className="settings-title">⚙️ Settings</span>
              <button className="icon-btn" onClick={()=>setShowSettings(false)}>✕</button>
            </div>
            <div className="settings-sect">
              <div className="settings-lbl">🌙 Display Mode</div>
              <div className="mode-row">
                <button className={`mode-btn${darkMode?" on":""}`} onClick={()=>{setDarkMode(true);setTheme(THEMES[0]);}}>🌑 Dark</button>
                <button className={`mode-btn${!darkMode?" on":""}`} onClick={()=>{setDarkMode(false);setTheme(THEMES[4]);}}>☀️ Light</button>
              </div>
            </div>
            <div className="settings-sect">
              <div className="settings-lbl">🎨 Theme</div>
              <div className="theme-grid">
                {THEMES.map(t=>(
                  <button key={t.name} className={`theme-sw${theme.name===t.name?" on":""}`}
                    style={{background:t.bg,borderColor:theme.name===t.name?t.accent:"#2a2a35"}} onClick={()=>setTheme(t)}>
                    <div className="theme-dot" style={{background:t.accent}}/>
                    <span style={{color:t.text,fontSize:9}}>{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="settings-sect">
              <div className="settings-lbl">🌍 Timezone</div>
              <select className="settings-sel" value={tz} onChange={e=>setTz(e.target.value)}>
                {TIMEZONES.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="settings-sect">
              <div className="settings-lbl">🎂 Birthday</div>
              <input type="date" className="settings-inp" value={birthday} onChange={e=>setBirthday(e.target.value)}/>
            </div>
            <div className="settings-sect">
              <button className="btn-danger full" onClick={()=>{setShowSettings(false);showToast("Logged out — see you next time! 👋");}}>
                🚪 Log Out
              </button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* ══════════════════════════════════════════════
          HERO BANNER — cinematic parallax style
      ══════════════════════════════════════════════ */}
      <div className="hero-banner">
        {/* Background gym photos mosaic */}
        <div className="hero-mosaic">
          {GYM_PHOTOS.map((url,i)=>(
            <div key={i} className="mosaic-tile" style={{ animationDelay:`${i*0.8}s` }}>
              <img src={url} alt="" loading="lazy"/>
            </div>
          ))}
        </div>
        {/* Overlay gradient */}
        <div className="hero-overlay"/>
        {/* Noise texture */}
        <div className="hero-noise"/>

        {/* Top bar */}
        <div className="hero-topbar">
          <div className="logo-lockup">
            <div className="logo-orb"/>
            <div className="logo-text">GYMPRO</div>
          </div>
          <button className="settings-fab" onClick={()=>setShowSettings(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>

        {isBday && <div className="bday-ribbon">🎂 Happy Birthday, {username.split(" ")[0]}! Your gym family celebrates you today! 🎉</div>}

        {/* Profile card floating on hero */}
        <div className="hero-profile">
          <div className="hero-pic-wrap" onClick={()=>picRef.current?.click()}>
            <img src={profilePic||`https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=300&q=80`} alt="Profile" className="hero-pic"/>
            <div className="hero-pic-overlay">
              <span>📷</span>
              <span>Change</span>
            </div>
            <div className="hero-online-dot"/>
            <input ref={picRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
              const f=e.target.files[0]; if(f){setProfilePic(URL.createObjectURL(f));showToast("✓ Profile picture updated!");}
            }}/>
          </div>
          <div className="hero-info">
            <div className="hero-name">{username}</div>
            <div className="hero-handle">@marcus.lifts · Member since {memberSince} · {tz}</div>
            <div className="hero-tags">
              <span className="htag" style={{color:level.color,borderColor:level.color,background:`${level.color}18`}}>⚡ {level.label}</span>
              <span className="htag orange">🔥 {streak}-Wk Streak</span>
              <span className="htag white">✓ Verified</span>
              {isBday && <span className="htag gold">🎂 Birthday!</span>}
            </div>
          </div>
          <div className="hero-stats">
            {[[totalSessions,"Sessions"],[parseFloat(meas.weight)||84,"kg Current"],[streak,"Wk Streak"],[currentBMI>0?currentBMI:"—","BMI"]].map(([v,l])=>(
              <div className="hstat" key={l}>
                <div className="hstat-val" style={l==="BMI"&&currentBMI>0?{color:bmiColor(currentBMI)}:{}}>{v}</div>
                <div className="hstat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="main">

        {/* Activity wearable strip */}
        <div className="activity-strip">
          <div className="activity-strip-label">📱 Smart Watch Data</div>
          <div className="activity-chips">
            {[["👣","Steps","steps"],["❤️","Heart Rate","heartRate"],["🔥","Calories","calories"],["🌙","Sleep","sleep"]].map(([ic,lbl,key])=>(
              <div className="ach" key={key}>
                <div className="ach-icon">{ic}</div>
                <div>
                  {editActivity
                    ? <input className="ach-inp" value={activity[key]==="—"?"":activity[key]} placeholder="—"
                        onChange={e=>setActivity(p=>({...p,[key]:e.target.value||"—"}))}/>
                    : <div className="ach-val">{activity[key]}</div>}
                  <div className="ach-lbl">{lbl}</div>
                </div>
              </div>
            ))}
            <button className="ach-edit" onClick={()=>{setEditActivity(e=>!e);if(editActivity)showToast("✓ Activity saved!");}}>
              {editActivity?"💾":"✏️"}
            </button>
          </div>
          {sessThisWk<3 && (
            <div className="session-nudge">
              💡 <strong>{sessThisWk}</strong> session{sessThisWk!==1?"s":""} this week — aim for <strong>3–4</strong> for best results
              <button className="nudge-btn" onClick={()=>setShowCal(true)}>View Schedule →</button>
            </div>
          )}
        </div>

        {/* ═══════════ BODY GOALS ═══════════ */}
        <div className="section-divider">
          <div className="divider-line"/><div className="divider-label">BODY GOALS</div><div className="divider-line"/>
        </div>

        <div className="card card-goals">
          {/* Photo accent */}
          <div className="card-photo-accent">
            <img src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80" alt="gym"/>
            <div className="card-photo-fade"/>
          </div>
          <div className="card-content">
            <div className="card-head-row">
              <div><div className="clabel">Setup</div><div className="ctitle">🎯 Body Goals & Targets</div></div>
              <button className="hist-btn" onClick={()=>setShowGoalHist(true)}>📋 History</button>
            </div>
            <p className="csub">Your goals are used to personalise workouts, nutrition, and AI recommendations.</p>

            <div className="form-row">
              <div className="field"><label>Gender</label>
                <select value={gender} onChange={e=>setGender(e.target.value)}>
                  <option value="male">Male</option><option value="female">Female</option><option value="nonbinary">Non-Binary</option>
                </select>
              </div>
              <div className="field"><label>Goal Type</label>
                <select value={goalType} onChange={e=>setGoalType(e.target.value)}>
                  {["Bulk Up","Cut Down","Athletic Build","Lean & Shredded","Maintain","Tone & Define"].map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="goal-pills">
              {[["💪","Bulk Up"],["✂️","Cut Down"],["⚡","Athletic Build"],["🔥","Lean & Shredded"],["⚖️","Maintain"],["🌊","Tone & Define"]].map(([ic,nm])=>(
                <div key={nm} className={`goal-pill${goalType===nm?" on":""}`} onClick={()=>setGoalType(nm)}>
                  <span>{ic}</span><span>{nm}</span>
                </div>
              ))}
            </div>

            <div className="form-row-3">
              {[["Target Weight","weight","kg"],["Target Chest/Bust","chest","cm"],["Target Waist","waist","cm"]].map(([lbl,k,u])=>(
                <div className="field" key={k}><label>{lbl} ({u})</label><input type="number" value={goalIn[k]} onChange={e=>setGoalIn(p=>({...p,[k]:+e.target.value}))}/></div>
              ))}
            </div>
            <div className="form-row-3">
              {[["Target Hips","hips","cm"],["Target Thigh","thigh","cm"],["Target Arm","arm","cm"]].map(([lbl,k,u])=>(
                <div className="field" key={k}><label>{lbl} ({u})</label><input type="number" value={goalIn[k]} onChange={e=>setGoalIn(p=>({...p,[k]:+e.target.value}))}/></div>
              ))}
            </div>
            <button className="btn-accent" onClick={saveGoals}>Save Goals →</button>
          </div>
        </div>

        {/* ═══════════ HEALTH ═══════════ */}
        <div className="card">
          <div className="card-head-row">
            <div><div className="clabel">Health Profile</div><div className="ctitle">🩺 Health Conditions</div></div>
            <button className="hist-btn" onClick={()=>setShowHealthHist(true)}>📋 History</button>
          </div>
          <p className="csub">Used to safely personalise workout and nutrition recommendations.</p>
          <div className="health-grid">
            {HEALTH_OPTIONS.map(c=>(
              <label key={c} className={`hchip${health.includes(c)?" on":""}`}>
                <input type="checkbox" checked={health.includes(c)} onChange={e=>{
                  if(e.target.checked)setHealth(h=>[...h,c]);else setHealth(h=>h.filter(x=>x!==c));
                }}/>
                {c}
              </label>
            ))}
          </div>
          <textarea className="notes-ta" rows={2} value={healthNotes} onChange={e=>setHealthNotes(e.target.value)} placeholder="Additional notes — medications, injuries, surgical history…"/>
          <button className="btn-accent" style={{marginTop:14}} onClick={saveHealth}>Save Health Profile</button>
        </div>

        {/* ═══════════ TRACK PROGRESS ═══════════ */}
        <div className="section-divider">
          <div className="divider-line"/><div className="divider-label">PROGRESS TRACKING</div><div className="divider-line"/>
        </div>

        <div className="card card-track">
          <div className="card-head-row">
            <div>
              <div className="clabel">Monthly Entry</div>
              <div className="ctitle">📏 Track Your Progress</div>
              {progressWarn && <span className={`prog-tag ${progressWarn}`}>{progressWarn==="red"?"🔴 Month ending!":progressWarn==="orange"?"🟠 Update soon":"📋 Reminder"}</span>}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="hist-btn" onClick={()=>setShowMeasHist(true)}>📋 History</button>
              <button className="hist-btn" onClick={()=>photoRef.current?.click()}>📸 Add Photo</button>
            </div>
          </div>
          <input ref={photoRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={e=>{
            Array.from(e.target.files).forEach(f=>{
              setProgressPhotos(p=>[...p,{url:URL.createObjectURL(f),date:now.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}]);
            });
            showToast(`✓ ${e.target.files.length} photo(s) added!`);
          }}/>

          {progressPhotos.length>0 && (
            <div className="prog-gallery">
              {progressPhotos.map((p,i)=>(
                <div className="prog-photo" key={i}>
                  <img src={p.url} alt="Progress"/>
                  <div className="prog-date">{p.date}</div>
                </div>
              ))}
            </div>
          )}

          <div className="tracker-layout">
            {/* Avatar panel */}
            <div className="avatar-panel">
              <div className="avatar-panel-title">Body Shape Preview</div>
              <div className="avatar-wrap">
                <BodyAvatar gender={gender==="nonbinary"?(Math.random()>0.5?"male":"female"):gender} {...av}/>
                <div className="avatar-stats">
                  {[["Chest",av.chest],["Waist",av.waist],["Hips",av.hips],["Arm",av.arm]].map(([l,v])=>(
                    <div className="astat" key={l}><span className="astat-l">{l}</span><span className="astat-v">{meas[l.toLowerCase()]?v+" cm":"—"}</span></div>
                  ))}
                </div>
                {/* BMI panel */}
                <div className="bmi-panel">
                  <div className="bmi-gauge">
                    <svg viewBox="0 0 100 60" width="100" height="60">
                      <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke="#1e1e28" strokeWidth="8" strokeLinecap="round"/>
                      <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke={bmiColor(currentBMI)} strokeWidth="8"
                        strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={125.6*(1-Math.min(currentBMI/40,1))}
                        style={{transition:"stroke-dashoffset 0.8s ease, stroke 0.5s ease"}}/>
                      <text x="50" y="48" textAnchor="middle" fill="var(--text,#f0eeea)" fontSize="14" fontWeight="700">{currentBMI||"—"}</text>
                    </svg>
                  </div>
                  <div className="bmi-cat" style={{color:bmiColor(currentBMI)}}>{currentBMI>0?bmiCategory(currentBMI):"Enter height & weight"}</div>
                  <div className="bmi-ideal">Ideal: 18.5–24.9</div>
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="meas-section">
              <div className="meas-header">
                <span className="meas-title">{currentMo} {now.getFullYear()} Entry</span>
                <span className="monthly-chip">Monthly Log</span>
              </div>
              <div className="mgroup"><div className="mgroup-title">📦 Basics</div>
                <div className="minputs">{inp("Weight (kg)","weight","84","0.1")}{inp("Height (cm)","height","178")}{inp("Body Fat %","bf","18","0.1")}</div>
              </div>
              <div className="mgroup"><div className="mgroup-title">📐 Upper Body (cm)</div>
                <div className="minputs">{inp("Chest/Bust","chest","96","0.5")}{inp("Waist","waist","84","0.5")}{inp("Shoulders","shoulders","118","0.5")}</div>
                <div className="minputs" style={{marginTop:10}}>{inp("Left Arm","armL","36","0.5")}{inp("Right Arm","armR","36","0.5")}{inp("Neck","neck","38","0.5")}</div>
              </div>
              <div className="mgroup"><div className="mgroup-title">📐 Lower Body (cm)</div>
                <div className="minputs">{inp("Hips","hips","96","0.5")}{inp("L. Thigh","thighL","56","0.5")}{inp("R. Thigh","thighR","56","0.5")}</div>
                <div className="minputs" style={{marginTop:10}}>{inp("L. Calf","calfL","36","0.5")}{inp("R. Calf","calfR","36","0.5")}{inp("Glutes","glutes","100","0.5")}</div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button className="btn-accent" onClick={saveMeas}>💾 Save {currentMo}</button>
                <button className="btn-ghost" onClick={()=>setMeas({weight:"",height:"",bf:"",chest:"",waist:"",shoulders:"",armL:"",armR:"",neck:"",hips:"",thighL:"",thighR:"",calfL:"",calfR:"",glutes:""})}>Clear</button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ SCHEDULE ═══════════ */}
        <div className="card card-schedule">
          <div className="card-photo-accent right">
            <img src="https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&q=80" alt="training"/>
            <div className="card-photo-fade right"/>
          </div>
          <div className="card-content">
            <div className="card-head-row">
              <div><div className="clabel">Attendance</div><div className="ctitle">📅 Training Schedule</div></div>
              <button className="hist-btn" onClick={()=>setShowCal(true)}>📆 Full Calendar</button>
            </div>
            <p className="csub">Mon–Thu: AM & PM · Fri–Sat: AM only · Sun: Rest · Tap to mark attendance</p>
            <div className="week-strip">
              {Array.from({length:7},(_,i)=>{
                const d=new Date(); d.setDate(d.getDate()-d.getDay()+i);
                const k=d.toISOString().slice(0,10);
                const dn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()];
                const isGym=d.getDay()>=1&&d.getDay()<=6;
                const att=attendedDays[k];
                const isToday=d.toDateString()===new Date().toDateString();
                const isMo=d.getDay()===5||d.getDay()===6;
                return (
                  <div key={k} className={`wday${isToday?" today":""}${!isGym?" rest":""}`}
                    onClick={()=>isGym&&toggleDay(k,isMo)}>
                    <div className="wday-name">{dn}</div>
                    <div className="wday-num">{d.getDate()}</div>
                    {isGym?(
                      <div className="wday-dots">
                        <div className={`wdot am${att?.am?" on":""}`}/>
                        {!isMo&&<div className={`wdot pm${att?.pm?" on":""}`}/>}
                      </div>
                    ):<div className="rest-lbl">REST</div>}
                  </div>
                );
              })}
            </div>
            <div className="today-box">
              <div className="today-label">Today's Sessions</div>
              <div className="today-val">
                {now.getDay()===0?"Rest Day — Recovery & Mobility"
                  :now.getDay()===5||now.getDay()===6?"☀️ Morning only — 6:00 AM – 12:00 PM"
                  :"☀️ Morning 6AM–12PM  ·  🌙 Evening 4PM–9PM"}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ WATER + NUTRITION ═══════════ */}
        <div className="two-col">
          {/* Water */}
          <div className="card card-water">
            <div className="clabel">Hydration</div>
            <div className="ctitle">💧 Daily Water Intake</div>
            <p className="csub">Health is wealth — stay hydrated!</p>
            <div className="water-layout">
              <div className="water-ring-wrap">
                <svg viewBox="0 0 120 120" width="120" height="120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#waterGrad)" strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={`${2*Math.PI*50}`}
                    strokeDashoffset={`${2*Math.PI*50*(1-waterCups/WGOAL)}`}
                    transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 0.5s ease"}}/>
                  <defs>
                    <linearGradient id="waterGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00b4d8"/><stop offset="100%" stopColor="#4a9eff"/>
                    </linearGradient>
                  </defs>
                  <text x="60" y="55" textAnchor="middle" fill="var(--text,#f0eeea)" fontSize="20" fontWeight="700">{Math.round(waterCups/WGOAL*100)}%</text>
                  <text x="60" y="74" textAnchor="middle" fill="#6b6b7a" fontSize="11">{waterCups}/{WGOAL} cups</text>
                </svg>
              </div>
              <div className="cups-grid">
                {Array.from({length:WGOAL},(_,i)=>(
                  <div key={i} className={`cup${i<waterCups?" full":""}`}
                    onClick={()=>{if(i<waterCups)setWaterCups(i);else if(i===waterCups){setWaterCups(i+1);showToast(`💧 Cup ${i+1} logged!`);}}}>
                    <svg viewBox="0 0 32 40" width="32" height="40">
                      <path d="M5 10 L27 10 L24 38 L8 38 Z" fill={i<waterCups?"url(#cupFill)":"rgba(255,255,255,0.06)"} style={{transition:"fill 0.3s"}}/>
                      <path d="M5 10 L27 10 L29 5 L3 5 Z" fill={i<waterCups?"#4a9eff":"rgba(255,255,255,0.1)"}/>
                      {i<waterCups&&<>
                        <path d="M8 38 L24 38 L24 26 Q16 22 8 26 Z" fill="#00b4d8" opacity="0.4"/>
                        <defs><linearGradient id="cupFill" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#4a9eff"/><stop offset="100%" stopColor="#00b4d8"/></linearGradient></defs>
                      </>}
                    </svg>
                  </div>
                ))}
              </div>
            </div>
            {waterCups>=WGOAL && <div className="water-done">🎉 Daily goal achieved!</div>}
          </div>

          {/* Nutrition */}
          <div className="card card-nutrition">
            <div className="clabel">Nutrition</div>
            <div className="ctitle">🥗 Daily Nutrition Plan</div>
            <div className="nutrition-tag">{nutrition.label}</div>
            <div className="macro-list">
              {[["Protein",nutrition.protein,"#ff6b1a"],["Carbs",nutrition.carbs,"#ffa040"],["Fat",nutrition.fat,"#4a9eff"]].map(([nm,pct,col])=>(
                <div className="macro-row" key={nm}>
                  <div className="macro-nm">{nm}</div>
                  <div className="macro-bar"><div className="macro-fill" style={{width:`${pct}%`,background:col}}/></div>
                  <div className="macro-pct" style={{color:col}}>{pct}%</div>
                </div>
              ))}
            </div>
            <div className="cals-tag">🔥 Daily target: <strong>{nutrition.cals} kcal</strong></div>
            <p className="nutrition-note">{nutrition.note}</p>
            {health.length>0&&health[0]!=="None"&&(
              <div className="health-note">⚕️ Adjusted for: {health.join(", ")}</div>
            )}
          </div>
        </div>

        {/* ═══════════ PROGRESS CHARTS ═══════════ */}
        <div className="section-divider">
          <div className="divider-line"/><div className="divider-label">ANALYTICS</div><div className="divider-line"/>
        </div>

        <div className="card">
          <div className="ctitle">📊 Progress Dashboard</div>
          <p className="csub">Your journey in data — current vs goal vs predicted trajectory</p>
          <div className="chart-tabs">
            {[["compare","Comparison"],["weight","Weight & Predicted"],["body","Body Measurements"],["strength","Strength"]].map(([id,lbl])=>(
              <button key={id} className={`ctab${chartTab===id?" on":""}`} onClick={()=>setChartTab(id)}>{lbl}</button>
            ))}
          </div>

          <div style={{display:chartTab==="compare"?"block":"none"}}>
            <div className="compare-list">
              {compareItems.map(item=>{
                const cp=(item.current/cMax*100).toFixed(1), gp=(item.goal/cMax*100).toFixed(1);
                const diff=(item.current-item.goal).toFixed(1);
                return (
                  <div key={item.label} className="cmp-row">
                    <div className="cmp-top">
                      <span className="cmp-label">{item.label}</span>
                      <div className="cmp-vals">
                        <span className="cmp-now">Now: {item.current}{item.unit}</span>
                        <span className="cmp-goal">Goal: {item.goal}{item.unit}</span>
                        <span className="cmp-diff" style={{color:Math.abs(+diff)<1?"#ffa040":"#ff6b1a"}}>{+diff>0?"+":""}{diff}</span>
                      </div>
                    </div>
                    <div className="cmp-bars">
                      <div className="cmp-bar-goal" style={{width:`${gp}%`}}/>
                      <div className="cmp-bar-now"  style={{width:`${cp}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{display:chartTab==="weight"?"block":"none"}}><div className="chart-wrap"><ChartLine id="wc" data={wData}/></div></div>
          <div style={{display:chartTab==="body"?"block":"none"}}><div className="chart-wrap"><ChartLine id="bc" data={bData}/></div></div>
          <div style={{display:chartTab==="strength"?"block":"none"}}><div className="chart-wrap"><ChartBar id="sc" data={sData}/></div></div>
        </div>

        {/* ═══════════ WORKOUTS ═══════════ */}
        <div className="card card-workouts">
          <div className="card-photo-accent">
            <img src="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80" alt="workout"/>
            <div className="card-photo-fade"/>
          </div>
          <div className="card-content">
            <div className="clabel">AI Personalised</div>
            <div className="ctitle">🎯 Recommended Workouts</div>
            <p className="csub">Based on your BMI ({currentBMI} — {bmiCategory(currentBMI)}), goal: {goalType}, health conditions</p>
            <div className="target-grid">
              {[["💪","Chest & Arms","chest","Push & definition"],["🦴","Back & Lats","back","Width & thickness"],["🦵","Legs & Glutes","legs","Strength & size"],["🎯","Core & Abs","core","Stability & tone"],["⚡","Full Body","fullbody","Total conditioning"],["🏃","Cardio & HIIT","cardio","Burn & endurance"]].map(([ic,nm,key,desc])=>(
                <button key={key} className={`tgt-btn${activeTarget===key?" on":""}`} onClick={()=>setActiveTarget(k=>k===key?null:key)}>
                  <div className="tgt-ic">{ic}</div><div className="tgt-nm">{nm}</div><div className="tgt-desc">{desc}</div>
                </button>
              ))}
            </div>
            {activeTarget && (
              <div className="workout-area">
                <div className="workout-heading">— {activeTarget.toUpperCase()} WORKOUTS —</div>
                <div className="workout-grid">
                  {WORKOUT_DB[activeTarget].map(w=>(
                    <div className="workout-card" key={w.name}>
                      <div className="wc-icon">{w.icon}</div>
                      <div className="wc-name">{w.name}</div>
                      <div className="wc-detail">{w.detail}</div>
                      <div className="wc-sets">{w.sets.map(s=><span className="stag" key={s}>{s}</span>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════ STRENGTH ═══════════ */}
        <div className="card">
          <div className="card-head-row">
            <div><div className="clabel">Lifting</div><div className="ctitle">🏋️ Strength Monitor</div></div>
            <button className="hist-btn" onClick={()=>setShowLiftHist(true)}>📋 History</button>
          </div>
          <p className="csub">Log your current lifts — progress is tracked against your BMI and training tenure.</p>
          <div className="strength-inputs">
            {[["Bench Press (kg)","bench"],["Squat (kg)","squat"],["Deadlift (kg)","dead"],["OHP (kg)","ohp"],["Pull-ups (reps)","pullups"]].map(([lbl,k])=>(
              <div className="field" key={k}><label>{lbl}</label><input type="number" value={lifts[k]} onChange={e=>setLifts(p=>({...p,[k]:+e.target.value}))}/></div>
            ))}
          </div>
          <div className="chart-wrap" style={{marginTop:16}}><ChartBar id="str2" data={sData}/></div>
          <button className="btn-accent" style={{marginTop:14}} onClick={()=>{
            const d=now.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"});
            setLiftHist(h=>[{date:d,data:{bench:lifts.bench+"kg",squat:lifts.squat+"kg",dead:lifts.dead+"kg"}},...h]);
            showToast("✓ Strength saved!");
          }}>💾 Save Progress</button>
        </div>

        {/* ═══════════ AI NUTRI COACH ═══════════ */}
        <div className="section-divider">
          <div className="divider-line"/><div className="divider-label">AI COACH</div><div className="divider-line"/>
        </div>

        <div className="card card-ai">
          <div className="card-photo-accent right">
            <img src="https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&q=80" alt="nutrition"/>
            <div className="card-photo-fade right"/>
          </div>
          <div className="card-content">
            <div className="ai-header">
              <div className="ai-avatar-wrap">
                <div className="ai-avatar">
                  <svg viewBox="0 0 80 80" width="64" height="64">
                    <defs>
                      <radialGradient id="aiBg" cx="50%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#2a1a0e"/><stop offset="100%" stopColor="#0a0a0f"/>
                      </radialGradient>
                    </defs>
                    <circle cx="40" cy="40" r="38" fill="url(#aiBg)" stroke="#ff6b1a" strokeWidth="2"/>
                    <ellipse cx="40" cy="34" rx="16" ry="18" fill="#b8855a"/>
                    <ellipse cx="33" cy="30" rx="6" ry="7" fill="white" opacity="0.9"/>
                    <ellipse cx="47" cy="30" rx="6" ry="7" fill="white" opacity="0.9"/>
                    <circle cx="34" cy="31" r="4" fill="#1e1208"/><circle cx="48" cy="31" r="4" fill="#1e1208"/>
                    <circle cx="35.5" cy="29.5" r="1.3" fill="white" opacity="0.8"/>
                    <circle cx="49.5" cy="29.5" r="1.3" fill="white" opacity="0.8"/>
                    <path d="M33 48 Q40 52 47 48" stroke="#8a4e2e" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    <circle cx="40" cy="60" r="8" fill="#ff6b1a"/>
                    <text x="40" y="64" textAnchor="middle" fill="white" fontSize="9" fontWeight="800">AI</text>
                    {/* Circuit lines */}
                    <line x1="8" y1="40" x2="22" y2="40" stroke="#ff6b1a" strokeWidth="1" opacity="0.5"/>
                    <line x1="58" y1="40" x2="72" y2="40" stroke="#ff6b1a" strokeWidth="1" opacity="0.5"/>
                    <circle cx="8" cy="40" r="2" fill="#ff6b1a" opacity="0.7"/>
                    <circle cx="72" cy="40" r="2" fill="#ff6b1a" opacity="0.7"/>
                  </svg>
                </div>
                <div>
                  <div className="ai-name">Nutri-AI</div>
                  <div className="ai-online"><span className="ai-dot"/>Online · Elite Coach Mode</div>
                </div>
              </div>
            </div>

            <div className="ai-chat" ref={aiScrollRef}>
              {aiMsgs.map((m,i)=>(
                <div key={i} className={`ai-bubble ${m.role}`}>
                  {m.role==="ai"&&<div className="ai-b-avatar">🤖</div>}
                  <div className="ai-b-text">
                    {m.image&&<img src={m.image} alt="" className="ai-b-img"/>}
                    {m.text}
                  </div>
                </div>
              ))}
              {aiLoading&&(
                <div className="ai-bubble ai">
                  <div className="ai-b-avatar">🤖</div>
                  <div className="ai-b-text"><span className="typing"><span/><span/><span/></span></div>
                </div>
              )}
            </div>

            <div className="ai-input-wrap">
              {aiImg&&(
                <div className="ai-img-prev">
                  <img src={aiImg} alt="prev"/>
                  <button onClick={()=>setAiImg(null)}>✕</button>
                </div>
              )}
              <div className="ai-input-row">
                <button className="attach-btn" onClick={()=>aiImgRef.current?.click()} title="Attach image">📎</button>
                <input ref={aiImgRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f)setAiImg(URL.createObjectURL(f));}}/>
                <textarea className="ai-ta" value={aiIn} onChange={e=>setAiIn(e.target.value)}
                  onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();handleAskAI();}}}
                  placeholder="Ask NutriAI about nutrition, workouts, recovery… (Enter to send)" rows={2}/>
                <button className="btn-accent ai-send" onClick={handleAskAI} disabled={aiLoading||!aiIn.trim()}>
                  {aiLoading?"…":"Send ➤"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ TRAINER REVIEWS ═══════════ */}
        <div className="section-divider">
          <div className="divider-line"/><div className="divider-label">REVIEWS</div><div className="divider-line"/>
        </div>

        <div className="card card-reviews">
          <div className="ctitle">⭐ Rate Your Trainer</div>

          {/* Trainer photo strip */}
          <div className="trainer-strip">
            {TRAINER_LIST.map(t=>(
              <div key={t} className={`trainer-card${rDraft.trainer===t?" on":""}`} onClick={()=>setRDraft(d=>({...d,trainer:t}))}>
                <div className="trainer-photo"><img src={TRAINER_PHOTOS[t]} alt={t} loading="lazy"/></div>
                <div className="trainer-name">{t.replace("Coach ","")}</div>
              </div>
            ))}
          </div>

          <div className="review-form">
            <div className="rev-sublbl">✍️ {editRev?"Edit Review":"Write a Review"} — {editRev?editRev.trainer:rDraft.trainer}</div>
            <div className="form-row" style={{marginBottom:12}}>
              <div className="field">
                <label>Trainer</label>
                <select value={editRev?editRev.trainer:rDraft.trainer}
                  onChange={e=>editRev?setEditRev(r=>({...r,trainer:e.target.value})):setRDraft(d=>({...d,trainer:e.target.value}))}>
                  {TRAINER_LIST.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Visibility</label>
                <select value={editRev?editRev.privacy:rDraft.privacy}
                  onChange={e=>editRev?setEditRev(r=>({...r,privacy:e.target.value})):setRDraft(d=>({...d,privacy:e.target.value}))}>
                  <option value="public">🌐 Public</option><option value="private">🔒 Private</option>
                </select>
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <label className="field-lbl">Rating</label>
              <div className="star-row">
                {[1,2,3,4,5].map(s=>{
                  const val=editRev?editRev.rating:rDraft.rating;
                  return <span key={s} className={`star${val>=s?" on":""}`}
                    onClick={()=>editRev?setEditRev(r=>({...r,rating:s})):setRDraft(d=>({...d,rating:s}))}>★</span>;
                })}
              </div>
            </div>
            <textarea className="rev-ta" rows={3}
              value={editRev?editRev.comment:rDraft.comment}
              onChange={e=>editRev?setEditRev(r=>({...r,comment:e.target.value})):setRDraft(d=>({...d,comment:e.target.value}))}
              placeholder="Describe your experience — methodology, results, communication…"/>
            <div style={{display:"flex",gap:8,marginTop:12}}>
              {editRev?(
                <><button className="btn-accent" onClick={()=>{setReviews(r=>r.map(x=>x.id===editRev.id?editRev:x));setEditRev(null);showToast("✓ Review updated!");}}>Update</button>
                  <button className="btn-ghost" onClick={()=>setEditRev(null)}>Cancel</button></>
              ):(
                <><button className="btn-accent" onClick={postReview}>🌐 Post Review</button>
                  <button className="btn-ghost" onClick={saveDraft}>💾 Save Draft</button></>
              )}
            </div>
          </div>

          <div className="chart-tabs" style={{marginTop:20}}>
            <button className={`ctab${revTab==="posted"?" on":""}`} onClick={()=>setRevTab("posted")}>Posted ({postedRevs.length})</button>
            <button className={`ctab${revTab==="drafts"?" on":""}`} onClick={()=>setRevTab("drafts")}>Drafts ({draftRevs.length})</button>
          </div>

          <div className="review-list">
            {(revTab==="posted"?postedRevs:draftRevs).map(rev=>(
              <div key={rev.id} className="rev-card">
                <div className="rev-card-top">
                  <div className="rev-trainer-photo">
                    <img src={TRAINER_PHOTOS[rev.trainer]} alt={rev.trainer}/>
                  </div>
                  <div style={{flex:1}}>
                    <div className="rev-trainer-name">{rev.trainer}</div>
                    <div className="rev-stars">{[1,2,3,4,5].map(s=><span key={s} className={`star sm${rev.rating>=s?" on":""}`}>★</span>)}</div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"flex-start",flexWrap:"wrap"}}>
                    <span className={`priv-tag ${rev.privacy}`}>{rev.privacy==="public"?"🌐":"🔒"} {rev.privacy}</span>
                    <span className="date-tag">{rev.date}</span>
                    <button className="action-btn" onClick={()=>setEditRev({...rev})}>✏️</button>
                    <button className="action-btn del" onClick={()=>setDelRevId(rev.id)}>🗑️</button>
                  </div>
                </div>
                <p className="rev-comment">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════ BADGES ═══════════ */}
        <div className="section-divider">
          <div className="divider-line"/><div className="divider-label">ACHIEVEMENTS</div><div className="divider-line"/>
        </div>

        <div className="card card-badges" style={{marginBottom:100}}>
          <div className="card-photo-accent">
            <img src="https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80" alt="achievement"/>
            <div className="card-photo-fade"/>
          </div>
          <div className="card-content">
            <div className="ctitle">🏅 Achievement Badges</div>
            <p className="csub">Earn game badges by hitting milestones. Click a badge to inspect it.</p>
            <div className="badges-grid">
              {BADGE_DEFS.map(badge=>{
                const earned=(badge.type==="sessions"?totalSessions>=badge.req:badge.type==="streak"?streak>=badge.req:badge.type==="water"?waterCups>=5:true);
                return <GameBadge key={badge.id} badge={badge} earned={earned}/>;
              })}
            </div>
            {/* XP bar */}
            <div className="xp-row">
              <div className="xp-info">
                <span className="xp-val">{BADGE_DEFS.filter(b=>b.type==="sessions"?totalSessions>=b.req:b.type==="streak"?streak>=b.req:b.type==="water"?waterCups>=5:true).reduce((s,b)=>s+b.req,0).toLocaleString()} XP</span>
                <span className="xp-lbl">{BADGE_DEFS.filter(b=>b.type==="sessions"?totalSessions>=b.req:b.type==="streak"?streak>=b.req:b.type==="water"?waterCups>=5:true).length} / {BADGE_DEFS.length} badges</span>
              </div>
              <div className="xp-lvl-badge" style={{borderColor:level.color,color:level.color}}>Lv.{level.tier} {level.label}</div>
            </div>
            <div className="xp-track"><div className="xp-fill" style={{width:`${(level.tier/5)*100}%`}}/></div>
          </div>
        </div>

      </div>{/* end .main */}

      {/* CHAT FAB */}
      <div className="chat-fab">
        <span className="chat-label">Live Support</span>
        <button className="chat-btn" onClick={()=>setChatOpen(o=>!o)}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
          <div className="chat-ping"/>
        </button>
      </div>

      {chatOpen && createPortal(
        <div className="chat-popup">
          <div className="chat-head">
            <div className="chat-agent">
              <div className="chat-av">🏋️</div>
              <div><div className="chat-nm">GymPro Support</div><div className="chat-st">Online now</div></div>
            </div>
            <button className="icon-btn" onClick={()=>setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-msgs" ref={chatRef}>
            {chatMsgs.map((m,i)=>(
              <div key={i} className={`cmsg ${m.role}`}>{m.text}<div className="cmsg-t">{m.time}</div></div>
            ))}
          </div>
          <div className="chat-inp-row">
            <input className="chat-inp" value={chatIn} onChange={e=>setChatIn(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Type a message…"/>
            <button className="chat-send" onClick={sendChat}>➤</button>
          </div>
        </div>, document.body
      )}
    </>
  );

  // Moved up to avoid hoisting issue
  function handleAskAI() { askAI(); }
}