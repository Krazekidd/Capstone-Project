import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Chart, registerables } from "chart.js";
import { useNavigate } from "react-router-dom";
import { authAPI, accountAPI, progressAPI } from "../../api/api";
Chart.register(...registerables);
import "./Account.css";

// ─────────────────────────────────────────────────────────────
//  STATIC DATA
// ─────────────────────────────────────────────────────────────

const WORKOUTS = {
  chest: [
    { icon: "🏋️", name: "Flat Bench Press", detail: "Compound · Chest focus", sets: ["4×8", "80% 1RM", "Rest 90s"] },
    { icon: "📐", name: "Incline DB Press", detail: "Upper chest activation", sets: ["3×10", "70% effort", "Rest 75s"] },
    { icon: "🔄", name: "Cable Flys", detail: "Isolation · Stretch", sets: ["3×15", "Light-Med", "Rest 60s"] },
  ],
  back: [
    { icon: "⬆️", name: "Weighted Pull-ups", detail: "Width builder · Lats", sets: ["4×6", "BW+10kg", "Rest 2min"] },
    { icon: "🚣", name: "Barbell Rows", detail: "Thickness · Mid-back", sets: ["4×8", "75% 1RM", "Rest 90s"] },
    { icon: "🔽", name: "Lat Pulldown", detail: "Lat sweep · Volume", sets: ["3×12", "Moderate", "Rest 60s"] },
  ],
  legs: [
    { icon: "🏆", name: "Back Squat", detail: "King of leg exercises", sets: ["5×5", "80% 1RM", "Rest 2min"] },
    { icon: "🦵", name: "Romanian Deadlift", detail: "Hamstrings & glutes", sets: ["4×10", "65% 1RM", "Rest 90s"] },
    { icon: "📦", name: "Leg Press", detail: "Volume & quad pump", sets: ["3×15", "Moderate", "Rest 60s"] },
  ],
  core: [
    { icon: "🌊", name: "Ab Wheel Rollout", detail: "Full core tension", sets: ["4×12", "Slow tempo", "Rest 60s"] },
    { icon: "🧱", name: "Plank Variations", detail: "Stability & endurance", sets: ["3×60s", "Max tension", "Rest 45s"] },
    { icon: "🔄", name: "Hanging Leg Raise", detail: "Lower abs & hip flex", sets: ["3×15", "Controlled", "Rest 60s"] },
  ],
  fullbody: [
    { icon: "⚡", name: "Power Cleans", detail: "Full-body power", sets: ["5×3", "70% 1RM", "Rest 2min"] },
    { icon: "🏋️", name: "Deadlift", detail: "Total posterior chain", sets: ["4×5", "80% 1RM", "Rest 2min"] },
    { icon: "🤸", name: "Dumbbell Complex", detail: "6-move circuit", sets: ["3 rounds", "No rest", "Rest 90s"] },
  ],
  cardio: [
    { icon: "💥", name: "Sprint Intervals", detail: "HIIT · Fat burn", sets: ["8×30s", "Max effort", "Rest 90s"] },
    { icon: "🚴", name: "Assault Bike HIIT", detail: "Cardio conditioning", sets: ["5×1min", "All-out", "Rest 2min"] },
    { icon: "🏃", name: "Rowing Machine", detail: "Low-impact endurance", sets: ["20min", "Moderate", "Steady"] },
  ],
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CHAT_REPLIES = [
  "Great question! Let me check that for you 💪",
  "Your membership covers all classes. Want to book one?",
  "I can see your account — what would you like to update?",
  "Our nutrition add-on is popular. Want the details?",
  "12-week streak — you're crushing it! 🔥",
  "I can schedule a PT session. What day works?",
];

// ─────────────────────────────────────────────────────────────
//  CHART COMPONENTS
// ─────────────────────────────────────────────────────────────
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#9494a8", font: { family: "DM Sans", size: 11 } } } },
  scales: {
    x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#6b6b7a", font: { family: "DM Sans" } } },
    y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#6b6b7a", font: { family: "DM Sans" } } },
  },
  
};

function WeightChart({ history, goalWeight }) {
  const ref = useRef(null);
  const chart = useRef(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    // Destroy existing chart
    if (chart.current) {
      chart.current.destroy();
      chart.current = null;
    }
    
    // Only create chart if we have data
    if (!history || history.length === 0) return;
    
    const labels = history.map(h => `${h.month}${h.year ? ` ${h.year}` : ''}`);
    const weightData = history.map(h => h.weight);
    
    chart.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Weight (kg)",
            data: weightData,
            borderColor: "#ff6b1a",
            backgroundColor: "rgba(255,107,26,0.1)",
            borderWidth: 2.5,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: "#ff6b1a",
            pointRadius: 5,
            pointHoverRadius: 7,
          },
          {
            label: "Goal",
            data: history.map(() => goalWeight),
            borderColor: "rgba(240,238,234,0.45)",
            borderWidth: 2,
            borderDash: [6, 4],
            tension: 0,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        ...chartOptions,
        plugins: {
          ...chartOptions.plugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.raw} kg`;
              }
            }
          }
        }
      },
    });
    
    return () => {
      if (chart.current) {
        chart.current.destroy();
        chart.current = null;
      }
    };
  }, [history, goalWeight]); // Re-run when history or goalWeight changes
  
  return <canvas ref={ref} />;
}

function BodyChart({ history }) {
  const ref = useRef(null);
  const chart = useRef(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    if (chart.current) {
      chart.current.destroy();
      chart.current = null;
    }
    
    if (!history || history.length === 0) return;
    
    const labels = history.map(h => `${h.month}${h.year ? ` ${h.year}` : ''}`);
    
    chart.current = new Chart(ref.current, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Chest/Bust",
            data: history.map(h => h.chest),
            borderColor: "#ff6b1a",
            tension: 0.4,
            borderWidth: 2,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Waist",
            data: history.map(h => h.waist),
            borderColor: "#ffa040",
            tension: 0.4,
            borderWidth: 2,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Hips",
            data: history.map(h => h.hips),
            borderColor: "#f0eeea",
            tension: 0.4,
            borderWidth: 2,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Thigh",
            data: history.map(h => h.thigh),
            borderColor: "#6b6b7a",
            tension: 0.4,
            borderWidth: 2,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
          {
            label: "Arm",
            data: history.map(h => h.arm),
            borderColor: "#d4a050",
            tension: 0.4,
            borderWidth: 2,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: chartOptions,
    });
    
    return () => {
      if (chart.current) {
        chart.current.destroy();
        chart.current = null;
      }
    };
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
        labels: ["Bench Press","Squat","Deadlift","OHP","Pull-ups"],
        datasets: [
          { label: "Current (kg)", data: [100,130,160,65,18], backgroundColor: "rgba(255,107,26,0.75)", borderRadius: 6 },
          { label: "Goal (kg)", data: [120,150,180,80,25], backgroundColor: "rgba(240,238,234,0.14)", borderRadius: 6, borderWidth: 1, borderColor: "rgba(240,238,234,0.38)" },
        ],
      },
      options: { ...chartOptions, barPercentage: 0.6 },
    });
    return () => chart.current?.destroy();
  }, []);
  return <canvas ref={ref} />;
}

// ─────────────────────────────────────────────────────────────
//  BODY AVATAR (SVG)
// ─────────────────────────────────────────────────────────────
function BodyAvatar({ gender, chest, waist, hips, thigh, arm, shoulders }) {
  // Calculate proportions for SVG (0-1 scale based on targets)
  const chestNorm = Math.min(chest / 120, 1);
  const waistNorm = Math.min(waist / 100, 1);
  const hipsNorm = Math.min(hips / 110, 1);
  const thighNorm = Math.min(thigh / 70, 1);
  
  return (
    <svg width="180" height="280" viewBox="0 0 180 280">
      {/* Head */}
      <circle cx="90" cy="45" r="28" fill="#ff6b1a" opacity="0.4" stroke="#ff6b1a" strokeWidth="1.5"/>
      {/* Neck */}
      <rect x="82" y="70" width="16" height="15" fill="#ff6b1a" opacity="0.3"/>
      {/* Upper Body (Chest) */}
      <path d={`M 55,90 Q ${90 - chestNorm * 15},85 90,85 Q ${90 + chestNorm * 15},85 125,90 L 130,140 L 50,140 Z`} fill="#ff6b1a" opacity="0.3" stroke="#ff6b1a" strokeWidth="1"/>
      {/* Waist */}
      <path d={`M 55,140 Q ${90 - waistNorm * 10},145 90,145 Q ${90 + waistNorm * 10},145 125,140 L 120,170 L 60,170 Z`} fill="#ff6b1a" opacity="0.35" stroke="#ff6b1a" strokeWidth="1"/>
      {/* Hips */}
      <path d={`M 60,170 Q ${90 - hipsNorm * 12},175 90,175 Q ${90 + hipsNorm * 12},175 120,170 L 115,210 L 65,210 Z`} fill="#ff6b1a" opacity="0.4" stroke="#ff6b1a" strokeWidth="1"/>
      {/* Legs */}
      <path d={`M 70,210 L 65,260 Q 65,265 70,265 L 75,265 L 80,210 Z`} fill="#ff6b1a" opacity="0.3"/>
      <path d={`M 110,210 L 105,260 Q 105,265 110,265 L 115,265 L 100,210 Z`} fill="#ff6b1a" opacity="0.3"/>
      {/* Arms */}
      <path d={`M 50,100 L 35,140 L 40,145 L 55,110 Z`} fill="#ff6b1a" opacity="0.3"/>
      <path d={`M 130,100 L 145,140 L 140,145 L 125,110 Z`} fill="#ff6b1a" opacity="0.3"/>
      <text x="90" y="250" textAnchor="middle" fill="#9494a8" fontSize="10">Body Avatar</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  WATER INTAKE CIRCLE
// ─────────────────────────────────────────────────────────────
function WaterIntakeCircle({ percentage }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={radius} fill="none" stroke="#2a2a35" strokeWidth="8" />
      <circle
        cx="50" cy="50" r={radius}
        fill="none" stroke="#ff6b1a"
        strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset 0.5s ease" }}
      />
      <text x="50" y="55" textAnchor="middle" fill="#f0eeea" fontSize="18" fontWeight="bold">
        {Math.round(percentage)}%
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
//  MAIN ACCOUNT COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Account() {
  const navigate = useNavigate();
  
  // User state from API
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Local state
  const [gender, setGender] = useState("male");
  const [goals, setGoals] = useState({ weight:80, chest:100, waist:80, hips:98, thigh:58, arm:38 });
  const [goalInputs, setGoalInputs] = useState({ weight:80, chest:100, waist:80, hips:98, thigh:58, arm:38 });
  const [goalType, setGoalType] = useState("Bulk Up");
  const [history, setHistory] = useState([]);
  const [activeTarget, setActiveTarget] = useState(null);
  const [chartTab, setChartTab] = useState("compare");
  const [chartKey, setChartKey] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role:"agent", text:"Hello! 👋 I'm your GymPro support agent. How can I help?", time:"Just now" },
    { role:"agent", text:"I can help with membership, classes, nutrition, or training! 💪", time:"Just now" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState({ show:false, msg:"" });
  const [m, setM] = useState({
    weight:"", height:"", bf:"", chest:"", waist:"", shoulders:"",
    armL:"", armR:"", neck:"", hips:"", thighL:"", thighR:"",
    calfL:"", calfR:"", glutes:"",
  });
  const [healthConditions, setHealthConditions] = useState([]);
  const healthOptions = ["Diabetes","Hypertension","Asthma","Knee Injury","Back Pain"];

  const [waterLogs, setWaterLogs] = useState(0);
  const waterPercentage = (waterLogs / 8) * 100;

  const [bgColor, setBgColor] = useState("#0a0a0a");
  const [showSettings, setShowSettings] = useState(false);
  const [tempColor, setTempColor] = useState(bgColor);

  const [trainerRatings, setTrainerRatings] = useState({});
  const trainersList = ["Coach Marcus", "Coach Lisa", "Coach David", "Coach Sarah"];

  const chatMsgsRef = useRef(null);
  const replyIdx = useRef(0);
  
  const av = {
    chest: parseFloat(m.chest) || (history[history.length-1]?.chest || 96),
    waist: parseFloat(m.waist) || (history[history.length-1]?.waist || 84),
    hips: parseFloat(m.hips) || (history[history.length-1]?.hips || 96),
    thigh: parseFloat(m.thighL) || (history[history.length-1]?.thigh || 56),
    arm: parseFloat(m.armL) || (history[history.length-1]?.arm || 37),
    shoulders: parseFloat(m.shoulders) || 118,
  };

  const showToast = (msg) => {
    setToast({ show:true, msg });
    setTimeout(() => setToast({ show:false, msg:"" }), 2500);
  };

  useEffect(() => {
    if (chatMsgsRef.current) chatMsgsRef.current.scrollTop = chatMsgsRef.current.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    document.body.style.backgroundColor = bgColor;
  }, [bgColor]);



  
  const refreshData = async () => {
    try {
      const historyData = await progressAPI.getProgressHistory(12);
      if (historyData && historyData.length > 0) {
        const formattedHistory = historyData.map(entry => {
          const measurements = entry.measurements || {};
          return {
            month: new Date(entry.recorded_at).toLocaleString('default', { month: 'short' }),
            year: new Date(entry.recorded_at).getFullYear(),
            weight: entry.weight || measurements.weight || 84,
            chest: measurements.chest || 96,
            waist: measurements.waist || 84,
            hips: measurements.hips || 96,
            thigh: measurements.thigh_left || 56,
            arm: measurements.arm_left || 37,
          };
        });
        setHistory(formattedHistory);
        setChartKey(prev => prev + 1);
      }
    } catch (err) {
      console.error("Failed to refresh data:", err);
    }
  };

  // Load user data on mount
  useEffect(() => {
    loadUserData();

  }, []);

const loadUserData = async () => {
  // Load measurement history
try {
  const historyData = await progressAPI.getProgressHistory();
  console.log("Raw history data from API:", historyData);
  
  if (historyData && historyData.length > 0) {
    // Transform history for charts
    const formattedHistory = historyData.map(entry => {
      const measurements = entry.measurements || {};
      return {
        month: new Date(entry.recorded_at).toLocaleString('default', { month: 'short' }),
        year: new Date(entry.recorded_at).getFullYear(),
        fullDate: new Date(entry.recorded_at), // Store full date for sorting
        weight: entry.weight || measurements.weight || 84,
        chest: measurements.chest || 96,
        waist: measurements.waist || 84,
        hips: measurements.hips || 96,
        thigh: measurements.thigh_left || 56,
        arm: measurements.arm_left || 37,
      };
    });
    
    // Sort by date (oldest first) for proper chart display
    formattedHistory.sort((a, b) => a.fullDate - b.fullDate);
    
    // Remove the fullDate property after sorting (optional)
    const sortedHistory = formattedHistory.map(({ fullDate, ...rest }) => rest);
    
    console.log("Formatted & sorted history:", sortedHistory);
    setHistory(sortedHistory);
    
    // Set current measurements from latest record (last item after sorting)
    const latest = sortedHistory[sortedHistory.length - 1];
    if (latest) {
      setM(prev => ({
        ...prev,
        weight: latest.weight || "",
        chest: latest.chest || "",
        waist: latest.waist || "",
        hips: latest.hips || "",
        thighL: latest.thigh || "",
        armL: latest.arm || ""
      }));
    }
  } else {
    console.log("No history data found, using defaults");
    const defaultHistory = [
      { month: "Oct", year: 2025, weight: 88, chest: 100, waist: 88, hips: 100, thigh: 58, arm: 37 },
      { month: "Nov", year: 2025, weight: 87, chest: 100, waist: 87, hips: 99, thigh: 58, arm: 37 },
      { month: "Dec", year: 2025, weight: 86, chest: 99, waist: 86, hips: 99, thigh: 57, arm: 37 },
      { month: "Jan", year: 2026, weight: 85, chest: 98, waist: 85, hips: 98, thigh: 57, arm: 37 },
      { month: "Feb", year: 2026, weight: 84, chest: 97, waist: 84, hips: 97, thigh: 56, arm: 37 },
      { month: "Mar", year: 2026, weight: 84, chest: 96, waist: 84, hips: 96, thigh: 56, arm: 37 },
    ];
    setHistory(defaultHistory);
  }
} catch (err) {
  console.error("Error loading history:", err);
  setError("Failed to load user data");
    showToast("Failed to load user data");
  } finally {
    setLoading(false);
  }
};
  const logWater = () => {
    if (waterLogs < 8) {
      setWaterLogs(prev => prev + 1);
      showToast(`💧 Water logged! ${waterLogs+1}/8 cups today.`);
    } else {
      showToast("🥤 You've reached your daily water goal! Great job!");
    }
  };

  const applyColor = () => {
    setBgColor(tempColor);
    setShowSettings(false);
    showToast("Background color updated!");
  };

  const handleRateTrainer = (trainer, rating) => {
    setTrainerRatings(prev => ({ ...prev, [trainer]: rating }));
    showToast(`You rated ${trainer} ${rating}⭐`);
  };

  const saveGoals = async () => {
    try {
      setGoals({...goalInputs});
      await progressAPI.updateGoals({
        goal_type: goalType,
        target_weight_kg: goalInputs.weight,
        target_chest_cm: goalInputs.chest,
        target_waist_cm: goalInputs.waist,
        target_hips_cm: goalInputs.hips,
        target_thigh_cm: goalInputs.thigh,
        target_arm_cm: goalInputs.arm
      });
      showToast("✓ Goals saved!");
    } catch (err) {
      console.error("Error saving goals:", err);
      showToast("Failed to save goals");
    }
  };
  
const saveMeasurements = async () => {
  try {
    // Prepare complete measurements object
    const measurementsData = {
      // Body basics
      weight: m.weight ? parseFloat(m.weight) : null,
      height: m.height ? parseFloat(m.height) : null,
      body_fat: m.bf ? parseFloat(m.bf) : null,
      
      // Upper body
      chest: m.chest ? parseFloat(m.chest) : null,
      waist: m.waist ? parseFloat(m.waist) : null,
      shoulders: m.shoulders ? parseFloat(m.shoulders) : null,
      arm_left: m.armL ? parseFloat(m.armL) : null,
      arm_right: m.armR ? parseFloat(m.armR) : null,
      neck: m.neck ? parseFloat(m.neck) : null,
      
      // Lower body
      hips: m.hips ? parseFloat(m.hips) : null,
      thigh_left: m.thighL ? parseFloat(m.thighL) : null,
      thigh_right: m.thighR ? parseFloat(m.thighR) : null,
      calf_left: m.calfL ? parseFloat(m.calfL) : null,
      calf_right: m.calfR ? parseFloat(m.calfR) : null,
      glutes: m.glutes ? parseFloat(m.glutes) : null,
      };
    
    // Remove null values
    Object.keys(measurementsData).forEach(key => {
      if (measurementsData[key] === null) {
        delete measurementsData[key];
      }
    });
    
    // Save to backend
    await progressAPI.saveProgress(measurementsData);
    await refreshData();

    // Update local history for charts
    const month = new Date().toLocaleString('default', { month: 'short' });
    const currentYear = new Date().getFullYear();

    const newEntry = {
      month,
      year: currentYear,
      weight: measurementsData.weight || (history.length > 0 ? history[history.length - 1]?.weight : 84),
      chest: measurementsData.chest || (history.length > 0 ? history[history.length - 1]?.chest : 96),
      waist: measurementsData.waist || (history.length > 0 ? history[history.length - 1]?.waist : 84),
      hips: measurementsData.hips || (history.length > 0 ? history[history.length - 1]?.hips : 96),
      thigh: measurementsData.thigh_left || (history.length > 0 ? history[history.length - 1]?.thigh : 56),
      arm: measurementsData.arm_left || (history.length > 0 ? history[history.length - 1]?.arm : 37),
    };
    
 setHistory(prev => {
      const existingIndex = prev.findIndex(h => h.month === currentMonth && h.year === currentYear);
      let updatedHistory;
      
      if (existingIndex >= 0) {
        // Replace existing month
        updatedHistory = [...prev];
        updatedHistory[existingIndex] = newEntry;
      } else {
        // Add new entry and keep last 12 months
        updatedHistory = [...prev, newEntry];
        if (updatedHistory.length > 12) {
          updatedHistory = updatedHistory.slice(-12);
        }
      }
      
      // Sort by date (assuming months in order)
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      updatedHistory.sort((a, b) => {
        return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
      });
      
      return updatedHistory;
    });
    
    showToast("✓ All measurements saved successfully!");
  
    // Clear form after save (optional)
    // clearMeasurements();
    
  } catch (err) {
    console.error("Failed to save measurements:", err);
    showToast("Failed to save measurements: " + (err.detail || err.message));
  }
};
  
  const clearM = () => setM({
    weight:"", height:"", bf:"", chest:"", waist:"", shoulders:"",
    armL:"", armR:"", neck:"", hips:"", thighL:"", thighR:"",
    calfL:"", calfR:"", glutes:"",
  });

  const askAI = async () => {
    if (!aiInput.trim()) return;
    setAiLoading(true);
    setAiResponse("thinking");
    const last = history[history.length-1] || { weight: 84, chest: 96, waist: 84, hips: 96, thigh: 56, arm: 37 };
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{"Content-Type":"application/json", "x-api-key": process.env.REACT_APP_CLAUDE_API_KEY || ""},
        body:JSON.stringify({
          model:"claude-3-sonnet-20240229",
          max_tokens:1000,
          system:`You are an elite personal trainer at GymPro. Member: ${userData?.name || "Client"}, ${gender}, weight ${last.weight}kg, chest ${last.chest}cm, waist ${last.waist}cm, hips ${last.hips}cm. Goals: weight ${goals.weight}kg. Concise advice under 120 words. Use fitness emojis. Be direct and motivating.`,
          messages:[{ role:"user", content:aiInput }],
        }),
      });
      const data = await res.json();
      setAiResponse(data.content?.[0]?.text || "Try again!");
    } catch { 
      setAiResponse("⚠️ Connection issue. Please try again."); 
    }
    setAiLoading(false);
    setAiInput("");
  };

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const now = new Date().toLocaleTimeString([],{ hour:"2-digit", minute:"2-digit" });
    setChatMessages(prev => [...prev, { role:"user", text:chatInput, time:now }]);
    setChatInput("");
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role:"agent", text:CHAT_REPLIES[replyIdx.current++ % CHAT_REPLIES.length], time:now }]);
    }, 900);
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/');
  };


  // Calculate last entry dynamically
  const last = history.length > 0 ? history[history.length - 1] : { 
    weight: 84, chest: 96, waist: 84, hips: 96, thigh: 56, arm: 37 
  };

  const compareItems = [
    { label: "Weight (kg)", current: last.weight, goal: goals.weight, unit: "kg" },
    { label: gender === "female" ? "Bust (cm)" : "Chest (cm)", current: last.chest, goal: goals.chest, unit: "cm" },
    { label: "Waist (cm)", current: last.waist, goal: goals.waist, unit: "cm" },
    { label: "Hips (cm)", current: last.hips, goal: goals.hips, unit: "cm" },
    { label: "Thigh (cm)", current: last.thigh, goal: goals.thigh, unit: "cm" },
    { label: "Arm (cm)", current: last.arm, goal: goals.arm, unit: "cm" },
  ];
  const cMax = Math.max(...compareItems.map(i => Math.max(i.current, i.goal)), 1);
  
  const ratingsArray = Object.values(trainerRatings);
  const totalRatings = ratingsArray.reduce((sum, r) => sum + r, 0);
  const averageRating = ratingsArray.length > 0 ? (totalRatings / ratingsArray.length).toFixed(1) : 0;
  const starDisplay = averageRating > 0
    ? '★'.repeat(Math.floor(averageRating)) + (averageRating % 1 >= 0.5 ? '½' : '')
    : '☆☆☆☆☆';

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <div className={`success-toast${toast.show ? " show" : ""}`}>{toast.msg}</div>
      <div className="banner">
        <div className="banner-bg" />
        <div className="banner-text">GYMPRO</div>
        <div className="banner-badge">
          <button onClick={() => navigate('/')} className="logo-button">
            <div className="logo-dot" />
            <div className="logo-text">GYMPRO</div>
          </button>
        </div>
        <button className="settings-btn" onClick={() => { setTempColor(bgColor); setShowSettings(true); }}>⚙️</button>
      </div>
      <div className="main">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-small">
            <img src={`https://api.dicebear.com/8.x/adventurer/svg?seed=${userData?.name || 'User'}&backgroundColor=1a1a2e`} alt="Profile" />
          </div>
          <div className="profile-info">
            <h1>{userData?.name || "Member"}</h1>
            <div className="handle">@{userData?.email?.split('@')[0] || 'member'} · Member since {userData?.created_at ? new Date(userData.created_at).getFullYear() : '2025'}</div>
            <div className="profile-tags">
              <span className="tag tag-red">⚡ Elite Member</span>
              <span className="tag tag-orange">🔥 Active Member</span>
              <span className="tag tag-green">✓ Verified Athlete</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Sign Out
          </button>
          <div className="profile-stats">
            <div className="stat"><div className="stat-num">{history.length * 5}</div><div className="stat-label">Sessions</div></div>
            <div className="stat"><div className="stat-num">{last.weight}<small style={{ fontSize:18 }}>kg</small></div><div className="stat-label">Current</div></div>
            <div className="stat"><div className="stat-num">12</div><div className="stat-label">Wk Streak</div></div>
          </div>
        </div>

        {/* Mini Stats */}
        <div className="mini-stats">
          <div className="mini-stat"><div className="ms-val">2,840</div><div className="ms-label">Calories Burned</div></div>
          <div className="mini-stat"><div className="ms-val">5h 40m</div><div className="ms-label">Active This Week</div></div>
          <div className="mini-stat"><div className="ms-val">127</div><div className="ms-label">Avg BPM</div></div>
          <div className="mini-stat"><div className="ms-val">94%</div><div className="ms-label">Goal Progress</div></div>
        </div>

        {/* Body Goals Card */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-label">Setup</div>
          <div className="section-title">🎯 Body Goal &amp; Target Proportions</div>
          <p style={{ fontSize:13, color:"#6b6b7a", marginBottom:22 }}>Set your primary goal, target weight, and ideal body proportions.</p>
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
              <select defaultValue="Build Muscle &amp; Size">
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
                <div className="g-icon">{icon}</div>
                <div className="g-name">{name}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize:12, color:"#6b6b7a", margin:"16px 0 14px" }}>Target proportions (cm)</p>
          <div className="form-row-3">
            <div className="field"><label>Target Weight (kg)</label><input type="number" value={goalInputs.weight} onChange={e => setGoalInputs(p => ({...p, weight: +e.target.value}))} /></div>
            <div className="field"><label>Target {gender==="female"?"Bust":"Chest"} (cm)</label><input type="number" value={goalInputs.chest} onChange={e => setGoalInputs(p => ({...p, chest: +e.target.value}))} /></div>
            <div className="field"><label>Target Waist (cm)</label><input type="number" value={goalInputs.waist} onChange={e => setGoalInputs(p => ({...p, waist: +e.target.value}))} /></div>
          </div>
          <div className="form-row-3">
            <div className="field"><label>Target Hips (cm)</label><input type="number" value={goalInputs.hips} onChange={e => setGoalInputs(p => ({...p, hips: +e.target.value}))} /></div>
            <div className="field"><label>Target Thigh (cm)</label><input type="number" value={goalInputs.thigh} onChange={e => setGoalInputs(p => ({...p, thigh: +e.target.value}))} /></div>
            <div className="field"><label>Target Arm (cm)</label><input type="number" value={goalInputs.arm} onChange={e => setGoalInputs(p => ({...p, arm: +e.target.value}))} /></div>
          </div>
          <button className="btn-primary" onClick={saveGoals}>Save Goals →</button>
        </div>

        {/* Health Card */}
        <div className="card">
          <div className="card-label">Health Profile</div>
          <div className="section-title">🩺 Health Conditions</div>
          <p style={{ fontSize:13, color:"#6b6b7a", marginBottom:16 }}>Select any conditions that may affect your training.</p>
          <div className="health-checkbox-group">
            {healthOptions.map(cond => (
              <label key={cond} className="health-checkbox">
                <input type="checkbox" value={cond} checked={healthConditions.includes(cond)} onChange={e => {
                  if (e.target.checked) setHealthConditions([...healthConditions, cond]);
                  else setHealthConditions(healthConditions.filter(c => c !== cond));
                }} />
                {cond}
              </label>
            ))}
          </div>
          <button className="btn-primary" style={{ marginTop:16 }} onClick={() => showToast("Health conditions saved")}>Save Health Info</button>
        </div>

        {/* Track Your Progress Card */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-label">Monthly Entry</div>
          <div className="section-title">📏 Track Your Progress</div>
          <p style={{ fontSize:13, color:"#6b6b7a", marginBottom:22 }}>Log your measurements monthly. Your body silhouette updates live as you type.</p>
          <div className="tracker-layout">
            <div className="body-avatar-panel">
              <div className="body-avatar-title">Body Shape — {gender==="male"?"Male":"Female"}</div>
              <div className="avatar-svg-wrap">
                <BodyAvatar gender={gender} {...av} />
                <div className="avatar-labels">
                  <div className="aml-row"><span className="aml-label">Chest</span><span className="aml-val">{av.chest} cm</span></div>
                  <div className="aml-row"><span className="aml-label">Waist</span><span className="aml-val">{av.waist} cm</span></div>
                  <div className="aml-row"><span className="aml-label">Hips</span><span className="aml-val">{av.hips} cm</span></div>
                  <div className="aml-row"><span className="aml-label">Thigh</span><span className="aml-val">{av.thigh} cm</span></div>
                  <div className="aml-row"><span className="aml-label">Arm</span><span className="aml-val">{av.arm} cm</span></div>
                </div>
                <div className="avatar-legend">
                  <span><span className="legend-dot" style={{ background:"#ff6b1a" }} /> Updating live</span>
                  <span><span className="legend-dot" style={{ background:"rgba(240,238,234,0.35)" }} /> Goal</span>
                </div>
              </div>
            </div>
            <div className="measure-section">
              <div className="measure-header">
                <span className="measure-title">{MONTHS[new Date().getMonth()]} 2026 Entry</span>
                <span className="measure-badge">Monthly Log</span>
              </div>
              <div className="measure-group">
                <div className="measure-group-title">📦 Body Basics</div>
                <div className="measure-inputs">
                  <div className="field"><label>Weight (kg)</label><input type="number" placeholder="84" step="0.1" value={m.weight} onChange={e => setM(p => ({...p, weight: e.target.value}))} /></div>
                  <div className="field"><label>Height (cm)</label><input type="number" placeholder="178" value={m.height} onChange={e => setM(p => ({...p, height: e.target.value}))} /></div>
                  <div className="field"><label>Body Fat %</label><input type="number" placeholder="18" step="0.1" value={m.bf} onChange={e => setM(p => ({...p, bf: e.target.value}))} /></div>
                </div>
              </div>
              <div className="measure-group">
                <div className="measure-group-title">📐 Upper Body (cm)</div>
                <div className="measure-inputs">
                  <div className="field"><label>{gender==="female"?"Bust (cm)":"Chest (cm)"}</label><input type="number" placeholder="96" step="0.5" value={m.chest} onChange={e => setM(p => ({...p, chest: e.target.value}))} /></div>
                  <div className="field"><label>Waist (cm)</label><input type="number" placeholder="84" step="0.5" value={m.waist} onChange={e => setM(p => ({...p, waist: e.target.value}))} /></div>
                  <div className="field"><label>Shoulders (cm)</label><input type="number" placeholder="118" step="0.5" value={m.shoulders} onChange={e => setM(p => ({...p, shoulders: e.target.value}))} /></div>
                </div>
                <div className="measure-inputs" style={{ marginTop:12 }}>
                  <div className="field"><label>Left Arm (cm)</label><input type="number" placeholder="36" step="0.5" value={m.armL} onChange={e => setM(p => ({...p, armL: e.target.value}))} /></div>
                  <div className="field"><label>Right Arm (cm)</label><input type="number" placeholder="36" step="0.5" value={m.armR} onChange={e => setM(p => ({...p, armR: e.target.value}))} /></div>
                  <div className="field"><label>Neck (cm)</label><input type="number" placeholder="38" step="0.5" value={m.neck} onChange={e => setM(p => ({...p, neck: e.target.value}))} /></div>
                </div>
              </div>
              <div className="measure-group">
                <div className="measure-group-title">📐 Lower Body (cm)</div>
                <div className="measure-inputs">
                  <div className="field"><label>Hips (cm)</label><input type="number" placeholder="96" step="0.5" value={m.hips} onChange={e => setM(p => ({...p, hips: e.target.value}))} /></div>
                  <div className="field"><label>Left Thigh (cm)</label><input type="number" placeholder="56" step="0.5" value={m.thighL} onChange={e => setM(p => ({...p, thighL: e.target.value}))} /></div>
                  <div className="field"><label>Right Thigh (cm)</label><input type="number" placeholder="56" step="0.5" value={m.thighR} onChange={e => setM(p => ({...p, thighR: e.target.value}))} /></div>
                </div>
                <div className="measure-inputs" style={{ marginTop:12 }}>
                  <div className="field"><label>Left Calf (cm)</label><input type="number" placeholder="36" step="0.5" value={m.calfL} onChange={e => setM(p => ({...p, calfL: e.target.value}))} /></div>
                  <div className="field"><label>Right Calf (cm)</label><input type="number" placeholder="36" step="0.5" value={m.calfR} onChange={e => setM(p => ({...p, calfR: e.target.value}))} /></div>
                  <div className="field"><label>Glutes (cm)</label><input type="number" placeholder="100" step="0.5" value={m.glutes} onChange={e => setM(p => ({...p, glutes: e.target.value}))} /></div>
                </div>
              </div>
              <div className="measure-actions">
                <button className="btn-primary" onClick={saveMeasurements}>💾 Save This Month</button>
                <button className="btn-outline" onClick={clearM}>Clear</button>
              </div>
            </div>
          </div>
        </div>

        {/* Water Reminder Card */}
        <div className="card">
          <div className="card-label">Hydration</div>
          <div className="section-title">💧 Water Reminder</div>
          <p style={{ fontSize:13, color:"#6b6b7a", marginBottom:16 }}>Aim for 8 cups per day. Each cup fills the circle.</p>
          <div className="water-container">
            <WaterIntakeCircle percentage={waterPercentage} />
            <div className="water-info">
              <div className="water-count">{waterLogs} / 8 cups</div>
              <button className="btn-primary" onClick={logWater}>💧 Drink Now</button>
            </div>
          </div>
        </div>

        {/* Progress Dashboard */}
        <div className="card" style={{ marginBottom:20 }}>
          <div className="card-label">Analytics</div>
          <div className="section-title">📊 Progress Dashboard</div>
          <p style={{ fontSize:13, color:"#6b6b7a", marginBottom:20 }}>Live comparison of your current stats vs goals, plus monthly trend lines.</p>
          <div className="chart-tabs">
            <button className={`chart-tab${chartTab==="compare"?" active":""}`} onClick={() => setChartTab("compare")}>Goal vs Current</button>
            <button className={`chart-tab${chartTab==="weight"?" active":""}`} onClick={() => setChartTab("weight")}>Weight Trend</button>
            <button className={`chart-tab${chartTab==="body"?" active":""}`} onClick={() => setChartTab("body")}>Body Measurements</button>
            <button className={`chart-tab${chartTab==="strength"?" active":""}`} onClick={() => setChartTab("strength")}>Strength</button>
          </div>
          <div style={{ display:chartTab==="compare"?"block":"none" }} className="compare-grid">
            {compareItems.map(item => {
              const cp = ((item.current/cMax)*100).toFixed(1);
              const gp = ((item.goal/cMax)*100).toFixed(1);
              const diff = (item.current - item.goal).toFixed(1);
              const dc = Math.abs(+diff)<1?"#ffa040":"#ff6b1a";
              return (
                <div key={item.label}>
                  <div className="compare-row-top">
                    <span className="c-label">{item.label}</span>
                    <div className="c-vals">
                      <span className="c-current">Now: {item.current}{item.unit}</span>
                      <span className="c-goal">Goal: {item.goal}{item.unit}</span>
                      <span style={{ color:dc, fontWeight:700 }}>{+diff>0?"+":""}{diff}</span>
                    </div>
                  </div>
                  <div className="compare-bars">
                    <div className="bar-goal" style={{ width:`${gp}%` }} />
                    <div className="bar-current" style={{ width:`${cp}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ display:chartTab==="weight"?"block":"none" }} className="chart-canvas-wrap" key={`weight-${chartKey}`}>  
            <WeightChart history={history} goalWeight={goals.weight} />
          </div>
          <div style={{ display:chartTab==="body"?"block":"none" }} className="chart-canvas-wrap" key={`body-${chartKey}`}> 
            <BodyChart history={history} />
          </div>
          <div style={{ display:chartTab==="strength"?"block":"none" }} className="chart-canvas-wrap">
            <StrengthChart />
          </div>
        </div>

        {/* AI Coach */}
        <div className="card ai-area grid-full">
          <div className="card-label">AI Powered</div>
          <div className="section-title">🤖 AI Coach — Ask Anything</div>
          <p style={{ fontSize:13, color:"#6b6b7a", marginBottom:4 }}>Get personalized advice based on your measurements, goals, and training history.</p>
          <div className="ai-input-row">
            <input className="ai-input" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key==="Enter" && askAI()} placeholder="e.g. Based on my measurements, what should I focus on this month?" />
            <button className="btn-primary" onClick={askAI} disabled={aiLoading}>Ask Coach</button>
          </div>
          {aiResponse && (
            <div className="ai-response">
              {aiResponse==="thinking" ? (
                <><span className="ai-typing"><span /><span /><span /></span> Thinking...</>
              ) : aiResponse}
            </div>
          )}
        </div>

        {/* Trainer Ratings Card */}
        <div className="card">
          <div className="card-label">Feedback</div>
          <div className="section-title">⭐ Rate Your Trainers</div>
          <p style={{ fontSize:13, color:"#6b6b7a", marginBottom:16 }}>Rate each trainer you've worked with. Your feedback helps us improve.</p>
          <div className="trainer-ratings-list">
            {trainersList.map(trainer => {
              const userRating = trainerRatings[trainer] || 0;
              return (
                <div key={trainer} className="trainer-rating-item">
                  <span className="trainer-name">{trainer}</span>
                  <div className="star-rating">
                    {[1,2,3,4,5].map(s => (
                      <span
                        key={s}
                        className={`star ${userRating >= s ? "filled" : ""}`}
                        onClick={() => handleRateTrainer(trainer, s)}
                      >★</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="avg-rating">
            <span>Overall client satisfaction: {averageRating} {starDisplay}</span>
            <span>Based on {ratingsArray.length} trainer ratings</span>
          </div>
        </div>

        {/* Grid for remaining cards */}
        <div className="grid">
          <div className="card grid-full">
            <div className="card-label">Personalized Plan</div>
            <div className="section-title">🎯 Select Your Body Target</div>
            <p style={{ fontSize:13, color:"#6b6b7a", marginBottom:20 }}>Choose your primary focus area for tailored workout recommendations.</p>
            <div className="target-grid">
              {[["💪","Chest & Arms","chest"],["🦴","Back & Lats","back"],["🦵","Legs & Glutes","legs"],["🎯","Core & Abs","core"],["⚡","Full Body","fullbody"],["🏃","Cardio & HIIT","cardio"]].map(([icon,name,key]) => (
                <button key={key} className={`target-btn${activeTarget===key?" active":""}`} onClick={() => setActiveTarget(key)}>
                  <div className="icon">{icon}</div>
                  <div className="name">{name}</div>
                </button>
              ))}
            </div>
            {activeTarget && (
              <div className="workout-recs show">
                <div className="workout-recs-title">RECOMMENDED WORKOUTS</div>
                <div className="workout-grid">
                  {WORKOUTS[activeTarget]?.map(w => (
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
          <div className="card">
            <div className="card-label">Lifting Stats</div>
            <div className="section-title">🏋️ Strength Progress</div>
            <div className="strength-stats">
              {[["Bench Press","100/120kg",83],["Squat","130/150kg",87],["Deadlift","160/180kg",89],["Overhead Press","65/80kg",81],["Pull-ups","18/25 reps",72]].map(([name,val,pct]) => (
                <div className="progress-item" key={name}>
                  <div className="progress-top"><span>{name}</span><span>{val}</span></div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-label">This Month</div>
            <div className="section-title">📅 Training Schedule</div>
            <div className="schedule-container">
              <div className="schedule-row">
                {[["Mon",25,true],["Tue",26,false],["Wed",27,true],["Thu",28,true],["Fri",1,false],["Sat",2,true],["Sun",3,false],["Mon",4,true]].map(([day,num,dot]) => (
                  <div key={`${day}${num}`} className="day-card">
                    <div className="day-name">{day}</div>
                    <div className="day-num">{num}</div>
                    {dot ? <div className="day-dot" /> : <div className="day-empty" />}
                  </div>
                ))}
              </div>
              <div className="today-session">
                <div className="today-label">Today's Session</div>
                <div className="today-name">Upper Body Hypertrophy</div>
                <div className="today-detail">5:30 PM · Bench Press, Rows, OHP, Dips</div>
              </div>
            </div>
          </div>
        </div>

        {/* Awarded Badges Card */}
        <div className="card">
          <div className="card-label">Achievements</div>
          <div className="section-title">🏅 Awarded Badges</div>
          <div className="badges-grid">
            <div className="badge-item">💪 100 Workouts</div>
            <div className="badge-item">🔥 12‑Week Streak</div>
            <div className="badge-item">🏆 Elite Member</div>
            <div className="badge-item">🥗 Nutrition Master</div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && createPortal(
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h3>Customize Background</h3>
            <input type="color" value={tempColor} onChange={e => setTempColor(e.target.value)} />
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setShowSettings(false)}>Cancel</button>
              <button className="btn-primary" onClick={applyColor}>Apply</button>
            </div>
          </div>
        </div>, document.body
      )}

      {/* Chat FAB */}
      <div className="chat-fab">
        <span className="chat-label">Live Support</span>
        <button className="chat-btn" onClick={() => setChatOpen(o => !o)}>
          💬<div className="chat-ping" />
        </button>
      </div>
      
      {chatOpen && createPortal(
        <div className="chat-popup">
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🏋️</div>
              <div><div className="name">GymPro Support</div><div className="sub">Online now</div></div>
            </div>
            <button className="close-btn" onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="chat-messages" ref={chatMsgsRef}>
            {chatMessages.map((msg,i) => (
              <div key={i} className={`msg ${msg.role}`}>
                {msg.text}
                <div className="msg-time">{msg.time}</div>
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input className="chat-input" value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key==="Enter" && sendChat()} placeholder="Type a message..." />
            <button className="send-btn" onClick={sendChat}>➤</button>
          </div>
        </div>, document.body
      )}
    </>
  );
}