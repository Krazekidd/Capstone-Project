import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Filler, Tooltip, Legend, }from "chart.js";
import "./Account.css";

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Tooltip,
  Legend
);

// ─── DATA ─────────────────────────────────────────────
const WORKOUTS = {
  chest: [
    { icon: "🏋️", name: "Flat Bench Press", detail: "Compound · Chest focus", sets: ["4×8", "80% 1RM", "Rest 90s"] },
    { icon: "📐", name: "Incline DB Press",  detail: "Upper chest activation", sets: ["3×10", "70% effort", "Rest 75s"] },
    { icon: "🔄", name: "Cable Flys",        detail: "Isolation · Stretch",    sets: ["3×15", "Light-Med",  "Rest 60s"] },
  ],
  back: [
    { icon: "⬆️", name: "Weighted Pull-ups", detail: "Width builder · Lats",  sets: ["4×6",  "BW+10kg",   "Rest 2min"] },
    { icon: "🚣", name: "Barbell Rows",       detail: "Thickness · Mid-back",  sets: ["4×8",  "75% 1RM",   "Rest 90s"]  },
    { icon: "🔽", name: "Lat Pulldown",       detail: "Lat sweep · Volume",    sets: ["3×12", "Moderate",  "Rest 60s"]  },
  ],
  legs: [
    { icon: "🏆", name: "Back Squat",        detail: "King of leg exercises",  sets: ["5×5",  "80% 1RM",   "Rest 2min"] },
    { icon: "🦵", name: "Romanian Deadlift", detail: "Hamstrings & glutes",    sets: ["4×10", "65% 1RM",   "Rest 90s"]  },
    { icon: "📦", name: "Leg Press",         detail: "Volume & quad pump",     sets: ["3×15", "Moderate",  "Rest 60s"]  },
  ],
  core: [
    { icon: "🌊", name: "Ab Wheel Rollout",  detail: "Full core tension",      sets: ["4×12", "Slow tempo","Rest 60s"]  },
    { icon: "🧱", name: "Plank Variations",  detail: "Stability & endurance",  sets: ["3×60s","Max tension","Rest 45s"] },
    { icon: "🔄", name: "Hanging Leg Raise", detail: "Lower abs & hip flex",   sets: ["3×15", "Controlled","Rest 60s"]  },
  ],
  fullbody: [
    { icon: "⚡", name: "Power Cleans",      detail: "Full-body power",        sets: ["5×3",  "70% 1RM",   "Rest 2min"] },
    { icon: "🏋️", name: "Deadlift",         detail: "Total posterior chain",  sets: ["4×5",  "80% 1RM",   "Rest 2min"] },
    { icon: "🤸", name: "Dumbbell Complex",  detail: "6-move circuit",         sets: ["3 rounds","No rest","Rest 90s"]  },
  ],
  cardio: [
    { icon: "💥", name: "Sprint Intervals",  detail: "HIIT · Fat burn",        sets: ["8×30s","Max effort","Rest 90s"]  },
    { icon: "🚴", name: "Assault Bike HIIT", detail: "Cardio conditioning",    sets: ["5×1min","All-out",  "Rest 2min"] },
    { icon: "🏃", name: "Rowing Machine",    detail: "Low-impact endurance",   sets: ["20min","Moderate",  "Steady"]    },
  ],
};

const INITIAL_HISTORY = [
  { month: "Oct", weight: 88, chest: 100, waist: 88, hips: 100, thigh: 58, arm: 37 },
  { month: "Nov", weight: 87, chest: 100, waist: 87, hips: 99,  thigh: 58, arm: 37 },
  { month: "Dec", weight: 86, chest: 99,  waist: 86, hips: 99,  thigh: 57, arm: 37 },
  { month: "Jan", weight: 85, chest: 98,  waist: 85, hips: 98,  thigh: 57, arm: 37 },
  { month: "Feb", weight: 84, chest: 97,  waist: 84, hips: 97,  thigh: 56, arm: 37 },
  { month: "Mar", weight: 84, chest: 96,  waist: 84, hips: 96,  thigh: 56, arm: 37 },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const CHAT_REPLIES = [
  "Great question! Let me check that for you 💪",
  "Your membership covers all classes. Want to book one?",
  "I can see your account — what would you like to update?",
  "Our nutrition add-on is popular. Want the details?",
  "12-week streak — you're crushing it! 🔥",
  "I can schedule a PT session. What day works?",
];

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ─── CHART OPTIONS ────────────────────────────────────
const CO = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#9494a8", font: { family: "DM Sans", size: 11 } } } },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#6b6b7a", font: { family: "DM Sans" } } },
    y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#6b6b7a", font: { family: "DM Sans" } } },
  },
};

// ─── INDIVIDUAL CHART COMPONENTS ──────────────────────
// Each is its own component so it always mounts its own
// canvas — Chart.js can always measure the dimensions.

function WeightChart({ history, goalWeight }) {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    chart.current?.destroy();
    const labels = history.map(h => h.month);
    chart.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Weight (kg)", data: history.map(h => h.weight), borderColor: "#ff6b1a", backgroundColor: "rgba(255,107,26,0.1)", borderWidth: 2.5, tension: 0.4, fill: true, pointBackgroundColor: "#ff6b1a", pointRadius: 5 },
          { label: "Goal",        data: history.map(() => goalWeight), borderColor: "rgba(240,238,234,0.45)", borderWidth: 2, borderDash: [6, 4], tension: 0, fill: false, pointRadius: 0 },
        ],
      },
      options: { ...CO },
    });
    return () => chart.current?.destroy();
  }, [history, goalWeight]);

  return <canvas ref={ref} />;
}

function BodyChart({ history }) {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    chart.current?.destroy();
    const labels = history.map(h => h.month);
    chart.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Chest/Bust", data: history.map(h => h.chest), borderColor: "#ff6b1a", tension: 0.4, borderWidth: 2, fill: false, pointRadius: 4 },
          { label: "Waist",      data: history.map(h => h.waist), borderColor: "#ffa040", tension: 0.4, borderWidth: 2, fill: false, pointRadius: 4 },
          { label: "Hips",       data: history.map(h => h.hips),  borderColor: "#f0eeea", tension: 0.4, borderWidth: 2, fill: false, pointRadius: 4 },
          { label: "Thigh",      data: history.map(h => h.thigh), borderColor: "#6b6b7a", tension: 0.4, borderWidth: 2, fill: false, pointRadius: 4 },
          { label: "Arm",        data: history.map(h => h.arm),   borderColor: "#d4a050", tension: 0.4, borderWidth: 2, fill: false, pointRadius: 4 },
        ],
      },
      options: { ...CO },
    });
    return () => chart.current?.destroy();
  }, [history]);

  return <canvas ref={ref} />;
}

function StrengthChart() {
  const ref = useRef(null);
  const chart = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    chart.current?.destroy();
    chart.current = new Chart(ref.current, {
      type: "bar",
      data: {
        labels: ["Bench Press", "Squat", "Deadlift", "OHP", "Pull-ups"],
        datasets: [
          { label: "Current (kg)", data: [100, 130, 160, 65, 18], backgroundColor: "rgba(255,107,26,0.75)", borderRadius: 6 },
          { label: "Goal (kg)",    data: [120, 150, 180, 80, 25], backgroundColor: "rgba(240,238,234,0.14)", borderRadius: 6, borderWidth: 1, borderColor: "rgba(240,238,234,0.38)" },
        ],
      },
      options: { ...CO, barPercentage: 0.6 },
    });
    return () => chart.current?.destroy();
  }, []);

  return <canvas ref={ref} />;
}

// ─── BODY AVATAR ──────────────────────────────────────
function BodyAvatar({ gender, chest, waist, hips, thigh, arm, shoulders }) {
  const cx = 80;

  if (gender === "female") {
    const sw  = 33 + clamp((shoulders - 100) / 40, -1, 1) * 10;
    const bRx = 12 + clamp((chest - 82) / 36, -1, 1) * 8;
    const ww  = 13 + clamp((waist - 62) / 36, -1, 1) * 9;
    const hw  = 42 + clamp((hips - 86) / 40, -1, 1) * 16;
    const tw  = 12 + clamp((thigh - 46) / 26, -1, 1) * 10;
    const aw  =  6 + clamp((arm - 28) / 20, -1, 1) * 6;
    const L = cx - sw, R = cx + sw;
    return (
      <svg viewBox="0 0 160 310" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="80" cy="18" rx="22" ry="16" fill="#2d1f12"/>
        <path d="M58 20 Q56 6 80 4 Q104 6 102 20 Q110 12 106 4 Q100 -4 80 -4 Q60 -4 54 4 Q50 12 58 20Z" fill="#2d1f12"/>
        <path d="M98 18 Q110 26 108 42 Q104 48 100 42 Q103 34 96 26Z" fill="#2d1f12"/>
        <ellipse cx="80" cy="30" rx="20" ry="22" fill="#c89a74"/>
        <ellipse cx="60" cy="30" rx="4" ry="6" fill="#c4956e"/>
        <ellipse cx="100" cy="30" rx="4" ry="6" fill="#c4956e"/>
        <ellipse cx="72" cy="26" rx="4" ry="5" fill="white"/>
        <ellipse cx="88" cy="26" rx="4" ry="5" fill="white"/>
        <circle cx="73" cy="27" r="2.8" fill="#1e1208"/>
        <circle cx="89" cy="27" r="2.8" fill="#1e1208"/>
        <circle cx="73.8" cy="26.2" r="0.9" fill="white" opacity="0.85"/>
        <circle cx="89.8" cy="26.2" r="0.9" fill="white" opacity="0.85"/>
        <path d="M68 20.5 Q72 18.5 76 20.5" stroke="#5c3a1e" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M84 20.5 Q88 18.5 92 20.5" stroke="#5c3a1e" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <path d="M79 30 Q77 35 79 37 Q80 38.5 81 37 Q83 35 81 30" stroke="#a87250" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M74 41.5 Q80 45 86 41.5" stroke="#d4806a" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <ellipse cx="68" cy="35" rx="5" ry="3" fill="rgba(220,120,100,0.18)"/>
        <ellipse cx="92" cy="35" rx="5" ry="3" fill="rgba(220,120,100,0.18)"/>
        <rect x="74" y="50" width="12" height="12" rx="4" fill="#c4956e"/>
        <ellipse cx={cx} cy="70" rx={sw} ry="11" fill="#c2185b" opacity="0.85"/>
        <path d={`M${L} 69 Q${L-2} 96 ${L} 115 Q54 124 80 128 Q106 124 ${R} 115 Q${R+2} 96 ${R} 69Z`} fill="#880e4f" opacity="0.88"/>
        <ellipse cx={cx - bRx - 2} cy="107" rx={bRx} ry={bRx * 0.75} fill="#ad1457" opacity="0.9"/>
        <ellipse cx={cx + bRx + 2} cy="107" rx={bRx} ry={bRx * 0.75} fill="#ad1457" opacity="0.9"/>
        <path d={`M${cx-ww-32} 115 Q${cx-ww-34} 138 ${cx-ww-22} 150 Q${cx-ww-12} 160 80 162 Q${cx+ww+12} 160 ${cx+ww+22} 150 Q${cx+ww+34} 138 ${cx+ww+32} 115 Q${cx+26} 126 80 130 Q${cx-26} 126 ${cx-ww-32} 115Z`} fill="#6a0f3a"/>
        <ellipse cx="80" cy="163" rx={hw} ry="14" fill="#6a0f3a" stroke="#2a2a35" strokeWidth="1"/>
        <path d={`M${cx-tw-22} 161 Q${cx-tw-30} 196 ${cx-tw-26} 226 Q${cx-tw-16} 238 ${cx-tw-4} 234 Q${cx-tw+2} 200 ${cx-tw+2} 162Z`} fill="#880e4f" opacity="0.78"/>
        <path d={`M${cx+tw+22} 161 Q${cx+tw+30} 196 ${cx+tw+26} 226 Q${cx+tw+16} 238 ${cx+tw+4} 234 Q${cx+tw-2} 200 ${cx+tw-2} 162Z`} fill="#880e4f" opacity="0.78"/>
        <path d={`M${cx-tw-26} 226 Q${cx-tw-30} 260 ${cx-tw-26} 284 Q${cx-tw-20} 293 ${cx-tw-12} 290 Q${cx-tw-8} 262 ${cx-tw-4} 234Z`} fill="#6a0f3a"/>
        <path d={`M${cx+tw+26} 226 Q${cx+tw+30} 260 ${cx+tw+26} 284 Q${cx+tw+20} 293 ${cx+tw+12} 290 Q${cx+tw+8} 262 ${cx+tw+4} 234Z`} fill="#6a0f3a"/>
        <ellipse cx={cx-tw-19} cy="291" rx="10" ry="5" fill="#111"/>
        <ellipse cx={cx+tw+19} cy="291" rx="10" ry="5" fill="#111"/>
        <path d={`M${L} 69 Q${L-aw-7} 80 ${L-aw-11} 108 Q${L-aw-11} 132 ${L-aw-5} 142 Q${L-aw} 148 ${L-aw+5} 144 Q${L-aw+7} 120 ${L-2} 95 Q${L} 80 ${L} 69Z`} fill="#880e4f" opacity="0.78"/>
        <path d={`M${R} 69 Q${R+aw+7} 80 ${R+aw+11} 108 Q${R+aw+11} 132 ${R+aw+5} 142 Q${R+aw} 148 ${R+aw-5} 144 Q${R+aw-7} 120 ${R+2} 95 Q${R} 80 ${R} 69Z`} fill="#880e4f" opacity="0.78"/>
        <path d={`M${L-aw-5} 142 Q${L-aw-13} 166 ${L-aw-11} 185 Q${L-aw-7} 193 ${L-aw} 190 Q${L-aw+4} 170 ${L-aw+5} 144Z`} fill="#c4956e"/>
        <path d={`M${R+aw+5} 142 Q${R+aw+13} 166 ${R+aw+11} 185 Q${R+aw+7} 193 ${R+aw} 190 Q${R+aw-4} 170 ${R+aw-5} 144Z`} fill="#c4956e"/>
        <ellipse cx={L-aw-8} cy="193" rx="6" ry="8" fill="#c4956e"/>
        <ellipse cx={R+aw+8} cy="193" rx="6" ry="8" fill="#c4956e"/>
      </svg>
    );
  }

  // MALE
  const sw  = 40 + clamp((shoulders - 110) / 50, -1, 1) * 14;
  const ww  = 18 + clamp((waist - 70) / 40, -1, 1) * 10;
  const hw  = 36 + clamp((hips - 88) / 40, -1, 1) * 14;
  const tw  = 10 + clamp((thigh - 48) / 28, -1, 1) * 9;
  const aw  =  7 + clamp((arm - 30) / 20, -1, 1) * 7;
  const L = cx - sw, R = cx + sw;
  const wL = cx - ww, wR = cx + ww;

  return (
    <svg viewBox="0 0 160 310" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="80" cy="18" rx="23" ry="14" fill="#2a1a0e"/>
      <path d="M57 22 Q57 8 80 6 Q103 8 103 22 Q107 16 105 8 Q98 -2 80 -2 Q62 -2 55 8 Q53 16 57 22Z" fill="#2a1a0e"/>
      <ellipse cx="80" cy="30" rx="22" ry="24" fill="#b8855a"/>
      <ellipse cx="58" cy="30" rx="4.5" ry="7" fill="#b07a50"/>
      <ellipse cx="102" cy="30" rx="4.5" ry="7" fill="#b07a50"/>
      <ellipse cx="72" cy="25" rx="4.5" ry="5.5" fill="white"/>
      <ellipse cx="88" cy="25" rx="4.5" ry="5.5" fill="white"/>
      <circle cx="73" cy="26" r="3" fill="#1e1208"/>
      <circle cx="89" cy="26" r="3" fill="#1e1208"/>
      <circle cx="74" cy="25" r="1" fill="white" opacity="0.9"/>
      <circle cx="90" cy="25" r="1" fill="white" opacity="0.9"/>
      <path d="M67 19 Q72 17.5 77 19" stroke="#3d2208" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M83 19 Q88 17.5 93 19" stroke="#3d2208" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M79 29 Q76 35 77 38 Q78.5 40 80 39 Q81.5 40 83 38 Q84 35 81 29" stroke="#9a6238" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="77.5" cy="38.5" rx="2" ry="1.2" fill="rgba(0,0,0,0.2)"/>
      <ellipse cx="82.5" cy="38.5" rx="2" ry="1.2" fill="rgba(0,0,0,0.2)"/>
      <path d="M73 44 Q80 47.5 87 44" stroke="#8a4e2e" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
      <path d="M60 38 Q62 50 80 54 Q98 50 100 38" stroke="rgba(0,0,0,0.08)" strokeWidth="2" fill="none"/>
      <rect x="73" y="53" width="14" height="14" rx="5" fill="#b07a50"/>
      <ellipse cx="80" cy="74" rx={sw} ry="14" fill="#ff6b1a" opacity="0.88"/>
      <path d={`M${L} 74 Q${L-2} 112 ${wL} 134 Q56 150 80 152 Q104 150 ${wR} 134 Q${R+2} 112 ${R} 74Z`} fill="#1e2536"/>
      <path d={`M${L+4} 78 Q70 82 79 95 Q80 96 81 95 Q90 82 ${R-4} 78`} stroke="rgba(255,107,26,0.14)" strokeWidth="1.5" fill="none"/>
      <line x1="80" y1="76" x2="80" y2="138" stroke="rgba(255,107,26,0.1)" strokeWidth="1.5"/>
      <path d="M72 100 Q80 103 88 100" stroke="rgba(255,107,26,0.08)" strokeWidth="1" fill="none"/>
      <path d="M70 114 Q80 117 90 114" stroke="rgba(255,107,26,0.08)" strokeWidth="1" fill="none"/>
      <path d={`M${wL} 134 Q48 158 80 162 Q112 158 ${wR} 134 Q104 150 80 152 Q56 150 ${wL} 134Z`} fill="#161e2c"/>
      <ellipse cx="80" cy="163" rx={hw} ry="12" fill="#161e2c" stroke="#2a2a35" strokeWidth="1"/>
      <path d={`M${cx-tw-22} 162 Q${cx-tw-28} 196 ${cx-tw-26} 226 Q${cx-tw-16} 237 ${cx-tw-6} 233 Q${cx-tw+2} 201 ${cx-tw+2} 163Z`} fill="#1e2536"/>
      <path d={`M${cx+tw+22} 162 Q${cx+tw+28} 196 ${cx+tw+26} 226 Q${cx+tw+16} 237 ${cx+tw+6} 233 Q${cx+tw-2} 201 ${cx+tw-2} 163Z`} fill="#1e2536"/>
      <path d={`M${cx-tw-26} 226 Q${cx-tw-30} 260 ${cx-tw-26} 285 Q${cx-tw-20} 294 ${cx-tw-13} 291 Q${cx-tw-9} 263 ${cx-tw-6} 233Z`} fill="#161e2c"/>
      <path d={`M${cx+tw+26} 226 Q${cx+tw+30} 260 ${cx+tw+26} 285 Q${cx+tw+20} 294 ${cx+tw+13} 291 Q${cx+tw+9} 263 ${cx+tw+6} 233Z`} fill="#161e2c"/>
      <ellipse cx={cx-tw-19} cy="292" rx="11" ry="5.5" fill="#0d0d12"/>
      <ellipse cx={cx+tw+19} cy="292" rx="11" ry="5.5" fill="#0d0d12"/>
      <path d={`M${L} 74 Q${L-aw-9} 85 ${L-aw-13} 115 Q${L-aw-13} 143 ${L-aw-7} 153 Q${L-aw} 159 ${L-aw+7} 155 Q${L-aw+9} 129 ${L-2} 101 Q${L} 85 ${L} 74Z`} fill="#1e2536"/>
      <path d={`M${R} 74 Q${R+aw+9} 85 ${R+aw+13} 115 Q${R+aw+13} 143 ${R+aw+7} 153 Q${R+aw} 159 ${R+aw-7} 155 Q${R+aw-9} 129 ${R+2} 101 Q${R} 85 ${R} 74Z`} fill="#1e2536"/>
      <path d={`M${L-aw-7} 153 Q${L-aw-15} 180 ${L-aw-13} 200 Q${L-aw-9} 209 ${L-aw} 206 Q${L-aw+5} 186 ${L-aw+7} 155Z`} fill="#b07a50"/>
      <path d={`M${R+aw+7} 153 Q${R+aw+15} 180 ${R+aw+13} 200 Q${R+aw+9} 209 ${R+aw} 206 Q${R+aw-5} 186 ${R+aw-7} 155Z`} fill="#b07a50"/>
      <ellipse cx={L-aw-10} cy="209" rx="7" ry="9" fill="#b07a50"/>
      <ellipse cx={R+aw+10} cy="209" rx="7" ry="9" fill="#b07a50"/>
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────
export default function Account() {
  const [gender, setGender]             = useState("male");
  const [goals, setGoals]               = useState({ weight:80, chest:100, waist:80, hips:98, thigh:58, arm:38 });
  const [goalInputs, setGoalInputs]     = useState({ weight:80, chest:100, waist:80, hips:98, thigh:58, arm:38 });
  const [goalType, setGoalType]         = useState("Bulk Up");
  const [history, setHistory]           = useState(INITIAL_HISTORY);
  const [activeTarget, setActiveTarget] = useState(null);
  const [chartTab, setChartTab]         = useState("compare");
  const [chatOpen, setChatOpen]         = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role:"agent", text:"Hey Marcus! 👋 I'm your GymPro support agent. How can I help?", time:"Just now" },
    { role:"agent", text:"I can help with membership, classes, nutrition, or training! 💪",  time:"Just now" },
  ]);
  const [chatInput, setChatInput]       = useState("");
  const [aiInput, setAiInput]           = useState("");
  const [aiResponse, setAiResponse]     = useState(null);
  const [aiLoading, setAiLoading]       = useState(false);
  const [toast, setToast]               = useState({ show:false, msg:"" });
  const [m, setM] = useState({
    weight:"", height:"", bf:"",
    chest:"", waist:"", shoulders:"", armL:"", armR:"", neck:"",
    hips:"", thighL:"", thighR:"", calfL:"", calfR:"", glutes:"",
  });

  const chatMsgsRef = useRef(null);
  const replyIdx    = useRef(0);

  // live avatar values — fall back to neutral defaults if field is empty
  const av = {
    chest:     parseFloat(m.chest)     || 96,
    waist:     parseFloat(m.waist)     || 84,
    hips:      parseFloat(m.hips)      || 96,
    thigh:     parseFloat(m.thighL)    || 56,
    arm:       parseFloat(m.armL)      || 37,
    shoulders: parseFloat(m.shoulders) || 118,
  };

  const showToast = (msg) => {
    setToast({ show:true, msg });
    setTimeout(() => setToast({ show:false, msg:"" }), 2500);
  };

  // scroll chat to bottom whenever messages change
  useEffect(() => {
    if (chatMsgsRef.current)
      chatMsgsRef.current.scrollTop = chatMsgsRef.current.scrollHeight;
  }, [chatMessages]);

  // ── handlers ──────────────────────────────────────
  const saveGoals = () => {
    setGoals({ ...goalInputs });
    showToast("✓ Goals saved!");
  };

  const saveMeasurements = () => {
    const month = MONTHS[new Date().getMonth()];
    const entry = {
      month,
      weight: parseFloat(m.weight) || 84,
      chest:  parseFloat(m.chest)  || 96,
      waist:  parseFloat(m.waist)  || 84,
      hips:   parseFloat(m.hips)   || 96,
      thigh:  parseFloat(m.thighL) || 56,
      arm:    parseFloat(m.armL)   || 37,
    };
    setHistory(prev => {
      const idx = prev.findIndex(h => h.month === month);
      if (idx >= 0) { const n = [...prev]; n[idx] = entry; return n; }
      return [...prev, entry];
    });
    showToast("✓ Measurements saved!");
  };

  const clearM = () => setM({
    weight:"", height:"", bf:"",
    chest:"", waist:"", shoulders:"", armL:"", armR:"", neck:"",
    hips:"", thighL:"", thighR:"", calfL:"", calfR:"", glutes:"",
  });

  const askAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse("thinking");
    const last = history[history.length - 1];
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an elite personal trainer at GymPro. Member: Marcus Powell, ${gender}, weight ${last.weight}kg, chest ${last.chest}cm, waist ${last.waist}cm, hips ${last.hips}cm. Goals: weight ${goals.weight}kg. Concise advice under 120 words. Use fitness emojis. Be direct and motivating.`,
          messages: [{ role:"user", content:aiInput }],
        }),
      });
      const data = await res.json();
      setAiResponse(data.content?.map(c => c.text || "").join("") || "Try again!");
    } catch {
      setAiResponse("⚠️ Connection issue. Please try again.");
    }
    setAiLoading(false);
    setAiInput("");
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    setChatMessages(prev => [...prev, { role:"user", text:chatInput, time:now }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { role:"agent", text:CHAT_REPLIES[replyIdx.current++ % CHAT_REPLIES.length], time:now },
      ]);
    }, 900);
  };

  // ── compare data ──
  const last = history[history.length - 1];
  const compareItems = [
    { label:"Weight (kg)", current:last.weight, goal:goals.weight, unit:"kg" },
    { label:"Chest/Bust",  current:last.chest,  goal:goals.chest,  unit:"cm" },
    { label:"Waist",       current:last.waist,  goal:goals.waist,  unit:"cm" },
    { label:"Hips",        current:last.hips,   goal:goals.hips,   unit:"cm" },
    { label:"Thigh",       current:last.thigh,  goal:goals.thigh,  unit:"cm" },
    { label:"Arm",         current:last.arm,    goal:goals.arm,    unit:"cm" },
  ];
  const cMax = Math.max(...compareItems.map(i => Math.max(i.current, i.goal)));

  // helper for measurement inputs
  const inp = (label, key, ph, step = "1") => (
    <div className="field" key={key}>
      <label>{label}</label>
      <input
        type="number" placeholder={ph} step={step}
        value={m[key]}
        onChange={e => setM(p => ({ ...p, [key]: e.target.value }))}
      />
    </div>
  );

  // ── render ────────────────────────────────────────
  return (
    <>
      {/* TOAST */}
      <div className={`success-toast${toast.show ? " show" : ""}`}>{toast.msg}</div>

      {/* BANNER */}
      <div className="banner">
        <div className="banner-bg" />
        <div className="banner-text">GYMPRO</div>
        <div className="banner-badge">
          <div className="logo-dot" />
          <div className="logo-text">GYMPRO</div>
        </div>
        <div className="profile-avatar-wrap">
          <div className="avatar-ring">
            <img src="https://api.dicebear.com/8.x/adventurer/svg?seed=Marcus&backgroundColor=1a1a2e" alt="Profile" />
            <div className="avatar-status" />
          </div>
        </div>
      </div>

      <div className="main">

        {/* PROFILE HEADER */}
        <div className="profile-header">
          <div className="profile-info">
            <h1>Marcus Powell</h1>
            <div className="handle">@marcus.lifts · Member since 2022</div>
            <div className="profile-tags">
              <span className="tag tag-red">⚡ Elite Member</span>
              <span className="tag tag-orange">🔥 12-Week Streak</span>
              <span className="tag tag-green">✓ Verified Athlete</span>
            </div>
          </div>
          <div className="profile-stats">
            <div className="stat"><div className="stat-num">218</div><div className="stat-label">Sessions</div></div>
            <div className="stat"><div className="stat-num">84<small style={{fontSize:18}}>kg</small></div><div className="stat-label">Current</div></div>
            <div className="stat"><div className="stat-num">12</div><div className="stat-label">Wk Streak</div></div>
          </div>
        </div>

        {/* MINI STATS */}
        <div className="mini-stats">
          {[["2,840","Calories Burned"],["5h 40m","Active This Week"],["127","Avg BPM"],["94%","Goal Progress"]].map(([v,l]) => (
            <div className="mini-stat" key={l}><div className="ms-val">{v}</div><div className="ms-label">{l}</div></div>
          ))}
        </div>

        {/* BODY GOALS */}
        <div className="card" style={{marginBottom:20}}>
          <div className="card-label">Setup</div>
          <div className="section-title">🎯 Body Goal &amp; Target Proportions</div>
          <p style={{fontSize:13,color:"#6b6b7a",marginBottom:22}}>Set your primary goal, target weight, and ideal body proportions.</p>
          <div className="form-row">
            <div className="field">
              <label>Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="field">
              <label>Primary Goal</label>
              <select>
                <option>Build Muscle &amp; Size</option>
                <option>Lose Fat &amp; Cut</option>
                <option>Body Recomposition</option>
                <option>Pure Strength</option>
                <option>Endurance &amp; Cardio</option>
                <option>Tone &amp; Define</option>
              </select>
            </div>
          </div>
          <div className="goal-body-select">
            {[["💪","Bulk Up"],["✂️","Cut Down"],["⚡","Athletic Build"],["🔥","Lean & Shredded"],["⚖️","Maintain"],["🌊","Tone & Define"]].map(([icon,name]) => (
              <div key={name} className={`goal-type-btn${goalType===name?" active":""}`} onClick={() => setGoalType(name)}>
                <div className="g-icon">{icon}</div><div className="g-name">{name}</div>
              </div>
            ))}
          </div>
          <p style={{fontSize:12,color:"#6b6b7a",margin:"16px 0 14px"}}>Target proportions (cm)</p>
          <div className="form-row-3">
            {[["Target Weight (kg)","weight"],["Target "+(gender==="female"?"Bust":"Chest")+" (cm)","chest"],["Target Waist (cm)","waist"]].map(([lbl,k]) => (
              <div className="field" key={k}>
                <label>{lbl}</label>
                <input type="number" value={goalInputs[k]} onChange={e => setGoalInputs(p => ({...p,[k]:+e.target.value}))} />
              </div>
            ))}
          </div>
          <div className="form-row-3">
            {[["Target Hips (cm)","hips"],["Target Thigh (cm)","thigh"],["Target Arm (cm)","arm"]].map(([lbl,k]) => (
              <div className="field" key={k}>
                <label>{lbl}</label>
                <input type="number" value={goalInputs[k]} onChange={e => setGoalInputs(p => ({...p,[k]:+e.target.value}))} />
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={saveGoals}>Save Goals →</button>
        </div>

        {/* TRACK YOUR PROGRESS */}
        <div className="card" style={{marginBottom:20}}>
          <div className="card-label">Monthly Entry</div>
          <div className="section-title">📏 Track Your Progress</div>
          <p style={{fontSize:13,color:"#6b6b7a",marginBottom:22}}>Log your measurements monthly. Your body silhouette updates live as you type.</p>
          <div className="tracker-layout">

            {/* AVATAR */}
            <div className="body-avatar-panel">
              <div className="body-avatar-title">Body Shape — {gender === "male" ? "Male" : "Female"}</div>
              <div className="avatar-svg-wrap">
                <BodyAvatar gender={gender} {...av} />
                <div className="avatar-labels">
                  {[[gender==="female"?"Bust":"Chest",av.chest],["Waist",av.waist],["Hips",av.hips],["Thigh",av.thigh],["Arm",av.arm]].map(([lbl,val]) => (
                    <div className="aml-row" key={lbl}>
                      <span className="aml-label">{lbl}</span>
                      <span className="aml-val">{m[lbl.toLowerCase()] ? val+" cm" : "—"}</span>
                    </div>
                  ))}
                </div>
                <div className="avatar-legend">
                  <span><span className="legend-dot" style={{background:"#ff6b1a"}} /> Updating live</span>
                  <span><span className="legend-dot" style={{background:"rgba(240,238,234,0.35)"}} /> Goal</span>
                </div>
              </div>
            </div>

            {/* MEASUREMENT FORM */}
            <div className="measure-section">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:20,letterSpacing:2}}>March 2026 Entry</span>
                <span style={{fontSize:10,letterSpacing:1,textTransform:"uppercase",padding:"4px 10px",background:"rgba(255,107,26,0.15)",color:"#ff6b1a",border:"1px solid rgba(255,107,26,0.3)",borderRadius:20}}>Monthly Log</span>
              </div>
              <div className="measure-group">
                <div className="measure-group-title">📦 Body Basics</div>
                <div className="measure-inputs">
                  {inp("Weight (kg)","weight","84","0.1")}
                  {inp("Height (cm)","height","178")}
                  {inp("Body Fat %","bf","18","0.1")}
                </div>
              </div>
              <div className="measure-group">
                <div className="measure-group-title">📐 Upper Body (cm)</div>
                <div className="measure-inputs">
                  {inp(gender==="female"?"Bust (cm)":"Chest (cm)","chest","96","0.5")}
                  {inp("Waist (cm)","waist","84","0.5")}
                  {inp("Shoulders (cm)","shoulders","118","0.5")}
                </div>
                <div className="measure-inputs" style={{marginTop:12}}>
                  {inp("Left Arm (cm)","armL","36","0.5")}
                  {inp("Right Arm (cm)","armR","36","0.5")}
                  {inp("Neck (cm)","neck","38","0.5")}
                </div>
              </div>
              <div className="measure-group">
                <div className="measure-group-title">📐 Lower Body (cm)</div>
                <div className="measure-inputs">
                  {inp("Hips (cm)","hips","96","0.5")}
                  {inp("Left Thigh (cm)","thighL","56","0.5")}
                  {inp("Right Thigh (cm)","thighR","56","0.5")}
                </div>
                <div className="measure-inputs" style={{marginTop:12}}>
                  {inp("Left Calf (cm)","calfL","36","0.5")}
                  {inp("Right Calf (cm)","calfR","36","0.5")}
                  {inp("Glutes (cm)","glutes","100","0.5")}
                </div>
              </div>
              <div style={{display:"flex",gap:12}}>
                <button className="btn-primary" onClick={saveMeasurements}>💾 Save This Month</button>
                <button className="btn-outline" onClick={clearM}>Clear</button>
              </div>
            </div>
          </div>
        </div>

        {/* PROGRESS CHARTS */}
        <div className="card" style={{marginBottom:20}}>
          <div className="card-label">Analytics</div>
          <div className="section-title">📊 Progress Dashboard</div>
          <p style={{fontSize:13,color:"#6b6b7a",marginBottom:20}}>Live comparison of your current stats vs goals, plus monthly trend lines.</p>
          <div className="chart-tabs">
            {[["compare","Goal vs Current"],["weight","Weight Trend"],["body","Body Measurements"],["strength","Strength"]].map(([id,lbl]) => (
              <button key={id} className={`chart-tab${chartTab===id?" active":""}`} onClick={() => setChartTab(id)}>{lbl}</button>
            ))}
          </div>

          {/* COMPARE — always in DOM, shown/hidden via display */}
          <div style={{display: chartTab==="compare" ? "block" : "none"}}>
            <div className="compare-grid">
              {compareItems.map(item => {
                const cp = (item.current / cMax * 100).toFixed(1);
                const gp = (item.goal    / cMax * 100).toFixed(1);
                const diff = (item.current - item.goal).toFixed(1);
                const dc = Math.abs(+diff) < 1 ? "#ffa040" : "#ff6b1a";
                return (
                  <div key={item.label}>
                    <div className="compare-row-top">
                      <span className="c-label">{item.label}</span>
                      <div className="c-vals">
                        <span className="c-current">Now: {item.current}{item.unit}</span>
                        <span className="c-goal">Goal: {item.goal}{item.unit}</span>
                        <span style={{color:dc,fontWeight:700}}>{+diff>0?"+":""}{diff}</span>
                      </div>
                    </div>
                    <div className="compare-bars">
                      <div className="bar-goal"    style={{width:`${gp}%`}} />
                      <div className="bar-current" style={{width:`${cp}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CHARTS — each always mounted so canvas always has real dimensions */}
          <div style={{display: chartTab==="weight" ? "block" : "none"}}>
            <div className="chart-canvas-wrap">
              <WeightChart history={history} goalWeight={goals.weight} />
            </div>
          </div>
          <div style={{display: chartTab==="body" ? "block" : "none"}}>
            <div className="chart-canvas-wrap">
              <BodyChart history={history} />
            </div>
          </div>
          <div style={{display: chartTab==="strength" ? "block" : "none"}}>
            <div className="chart-canvas-wrap">
              <StrengthChart />
            </div>
          </div>
        </div>

        <div className="grid">

          {/* AI COACH */}
          <div className="card ai-area grid-full">
            <div className="card-label">AI Powered</div>
            <div className="section-title">🤖 AI Coach — Ask Anything</div>
            <p style={{fontSize:13,color:"#6b6b7a",marginBottom:4}}>Get personalized advice based on your measurements, goals, and training history.</p>
            <div className="ai-input-row">
              <input
                className="ai-input"
                value={aiInput}
                onChange={e => setAiInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && askAI()}
                placeholder="e.g. Based on my measurements, what should I focus on this month?"
              />
              <button className="btn-primary" onClick={askAI} disabled={aiLoading}>Ask Coach</button>
            </div>
            {aiResponse && (
              <div className="ai-response">
                {aiResponse === "thinking"
                  ? <><span className="ai-typing"><span /><span /><span /></span> Thinking...</>
                  : aiResponse}
              </div>
            )}
          </div>

          {/* TARGET SELECTOR */}
          <div className="card grid-full">
            <div className="card-label">Personalized Plan</div>
            <div className="section-title">🎯 Select Your Body Target</div>
            <p style={{fontSize:13,color:"#6b6b7a",marginBottom:20}}>Choose your primary focus area for tailored workout recommendations.</p>
            <div className="target-grid">
              {[["💪","Chest & Arms","chest","Push power & definition"],["🦴","Back & Lats","back","Width & thickness"],["🦵","Legs & Glutes","legs","Strength & size"],["🎯","Core & Abs","core","Stability & tone"],["⚡","Full Body","fullbody","Total conditioning"],["🏃","Cardio & HIIT","cardio","Burn & endurance"]].map(([icon,name,key,desc]) => (
                <button key={key} className={`target-btn${activeTarget===key?" active":""}`} onClick={() => setActiveTarget(key)}>
                  <div className="icon">{icon}</div>
                  <div className="name">{name}</div>
                  <div className="desc">{desc}</div>
                </button>
              ))}
            </div>
            {activeTarget && (
              <div className="workout-recs show">
                <div style={{margin:"20px 0 14px",fontFamily:"'Bebas Neue',sans-serif",fontSize:18,letterSpacing:2,color:"#ff6b1a"}}>RECOMMENDED WORKOUTS</div>
                <div className="workout-grid">
                  {WORKOUTS[activeTarget].map(w => (
                    <div className="workout-card" key={w.name}>
                      <div className="w-icon">{w.icon}</div>
                      <div className="w-name">{w.name}</div>
                      <div className="w-detail">{w.detail}</div>
                      <div className="w-sets">{w.sets.map(s => <span className="set-tag" key={s}>{s}</span>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* STRENGTH */}
          <div className="card">
            <div className="card-label">Lifting Stats</div>
            <div className="section-title">🏋️ Strength Progress</div>
            <div style={{marginTop:18}}>
              {[["Bench Press","100/120kg",83],["Squat","130/150kg",87],["Deadlift","160/180kg",89],["Overhead Press","65/80kg",81],["Pull-ups","18/25 reps",72]].map(([name,val,pct]) => (
                <div className="progress-item" key={name}>
                  <div className="progress-top"><span>{name}</span><span>{val}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}} /></div>
                </div>
              ))}
            </div>
          </div>

          {/* SCHEDULE */}
          <div className="card">
            <div className="card-label">This Month</div>
            <div className="section-title">📅 Training Schedule</div>
            <div style={{marginTop:18}}>
              <div className="schedule-row">
                {[["Mon",25,true,false],["Tue",26,false,false],["Wed",27,true,false],["Thu",28,true,false],["Fri",1,false,false],["Sat",2,true,true],["Sun",3,false,false],["Mon",4,true,false]].map(([day,num,dot,today]) => (
                  <div key={`${day}${num}`} className={`day-card${today ? " today" : ""}`}>
                    <div className="day-name">{day}</div>
                    <div className="day-num">{num}</div>
                    {dot ? <div className="day-dot" /> : <div className="day-empty" />}
                  </div>
                ))}
              </div>
              <div style={{marginTop:20,padding:14,background:"rgba(255,107,26,0.08)",border:"1px solid rgba(255,107,26,0.2)",borderRadius:10}}>
                <div style={{fontSize:11,color:"#ff6b1a",letterSpacing:1,textTransform:"uppercase",marginBottom:6}}>Today's Session</div>
                <div style={{fontWeight:600,fontSize:15}}>Upper Body Hypertrophy</div>
                <div style={{fontSize:12,color:"#6b6b7a",marginTop:4}}>5:30 PM · Bench Press, Rows, OHP, Dips</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CHAT FAB */}
      <div className="chat-fab">
        <span className="chat-label">Live Support</span>
        <button className="chat-btn" onClick={() => setChatOpen(o => !o)}>
          💬
          <div className="chat-ping" />
        </button>
      </div>

      {/* CHAT POPUP — inlined portal, renders directly into document.body */}
      {chatOpen && createPortal(
        <div className="chat-popup" style={{display:"flex"}}>
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🏋️</div>
              <div>
                <div className="name">GymPro Support</div>
                <div className="sub">Online now</div>
              </div>
            </div>
            <button className="close-btn" onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-messages" ref={chatMsgsRef}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`msg ${msg.role}`}>
                {msg.text}
                <div className="msg-time">{msg.time}</div>
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input
              className="chat-input"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendChat()}
              placeholder="Type a message..."
            />
            <button className="send-btn" onClick={sendChat}>➤</button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}