import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import "./STrainer.css";

/* ─────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────── */
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"];

const CRITERIA = [
  { key:"performance", label:"Performance & Results", icon:"🏆" },
  { key:"motivation",  label:"Motivation & Energy",   icon:"⚡" },
  { key:"interaction", label:"Client Interaction",    icon:"🤝" },
  { key:"knowledge",   label:"Technical Knowledge",   icon:"🧠" },
  { key:"punctuality", label:"Punctuality",           icon:"⏱️" },
];

const SENIOR = {
  name:     "Marcus Reid",
  title:    "Senior Trainer · Head of Strength & Performance",
  certs:    "NSCA-CSCS · Olympic Lifting Coach · CPR/AED",
  exp:      "18 yrs",
  since:    "March 2016",
  clients:  24,
  active:   18,
  img:      "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=800&q=80&fit=crop",
  coverImg: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80&fit=crop",
  quote:    "Champions aren't made in gyms — they're made from something deep inside.",
  bio:      "Elite performance coach specialising in strength conditioning and functional movement. Known for evidence-based programming and a relentless standard of excellence.",
  specs:    ["Strength","Olympic Lifting","Powerlifting","Sports Conditioning"],
  myInternal: [88,90,91,89,93,94,92,95,94,96,95],
  myClient:   [4.5,4.6,4.7,4.6,4.8,4.8,4.7,4.9,4.8,4.9,5.0],
};

const TRAINERS = [
  { id:"t1", name:"Sasha Volkov",  role:"Combat & Conditioning", exp:"14 yrs", img:"https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=400&q=80&fit=crop&crop=top", clientRatings:[3.9,4.0,4.1,4.3,4.2,4.4,4.5,4.3,4.6,4.5,4.7] },
  { id:"t2", name:"Priya Nair",    role:"Mobility & Recovery",   exp:"11 yrs", img:"https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80&fit=crop&crop=top", clientRatings:[4.5,4.6,4.7,4.8,4.7,4.9,4.8,4.9,5.0,4.9,5.0] },
  { id:"t3", name:"Jordan Wells",  role:"HIIT & Sports Science", exp:"9 yrs",  img:"https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&q=80&fit=crop&crop=top", clientRatings:[3.8,3.9,4.0,4.1,4.0,4.2,4.3,4.2,4.4,4.5,4.4] },
  { id:"t4", name:"Devon Clarke",  role:"Strength & Performance", exp:"10 yrs", img:"https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&q=80&fit=crop&crop=top", clientRatings:[4.0,4.1,4.2,4.3,4.2,4.4,4.5,4.4,4.6,4.5,4.7] },
  { id:"t5", name:"Alicia Chen",   role:"Cardio & Wellness",     exp:"7 yrs",  img:"https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80&fit=crop&crop=top", clientRatings:[4.1,4.2,4.3,4.4,4.3,4.5,4.6,4.5,4.7,4.6,4.8] },
];

const AT_RISK = [
  { id:1, name:"Kwame Asante",   trainer:"Sasha Volkov",  risk:"high",   reason:"Missed 4 consecutive sessions",       attendance:38, progress:-12, lastSeen:"8 days ago", goal:"Weight Loss",    img:"https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=80&q=80",  interventionBy:null },
  { id:2, name:"Leila Moreau",   trainer:"Priya Nair",    risk:"high",   reason:"BMI increased 3.2 points this month",  attendance:45, progress:-8,  lastSeen:"5 days ago", goal:"Tone & Define",  img:"https://images.unsplash.com/photo-1550259979-ed79b48d2a30?w=80&q=80",  interventionBy:null },
  { id:3, name:"Devon Campbell", trainer:"Jordan Wells",  risk:"high",   reason:"Heart rate spike flagged by wearable", attendance:42, progress:-5,  lastSeen:"6 days ago", goal:"Cardio Fitness", img:"https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80", interventionBy:"Marcus Reid" },
  { id:4, name:"Ana Costa",      trainer:"Devon Clarke",  risk:"medium", reason:"No nutrition log in 2 weeks",          attendance:62, progress:2,   lastSeen:"3 days ago", goal:"Build Muscle",   img:"https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=80&q=80", interventionBy:null },
  { id:5, name:"James Thornton", trainer:"Alicia Chen",   risk:"medium", reason:"Sleep tracking shows 5-hour average",  attendance:71, progress:4,   lastSeen:"Yesterday",  goal:"Build Muscle",   img:"https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?w=80&q=80", interventionBy:null },
  { id:6, name:"Nia Williams",   trainer:"Sasha Volkov",  risk:"medium", reason:"Strength plateau for 3 weeks",         attendance:80, progress:6,   lastSeen:"2 days ago", goal:"Build Muscle",   img:"https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=80&q=80", interventionBy:null },
  { id:7, name:"Raj Patel",      trainer:"Jordan Wells",  risk:"low",    reason:"Water intake consistently below target",attendance:85, progress:8,   lastSeen:"Today",      goal:"Lose Weight",    img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80",  interventionBy:null },
  { id:8, name:"Sofia Mendez",   trainer:"Priya Nair",    risk:"low",    reason:"Missed two optional wellness sessions", attendance:88, progress:9,   lastSeen:"Today",      goal:"Endurance",      img:"https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=80&q=80",  interventionBy:null },
];

const REVIEWS = [
  { id:1, client:"Alice Morrison", trainer:"Marcus Reid",   rating:5, date:"Apr 28, 2026", time:"9:14 AM",  comment:"Marcus completely transformed my approach to fitness. Every session is purposeful and challenging — best trainer I've had.", avatar:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80" },
  { id:2, client:"Bob Kamara",     trainer:"Sasha Volkov",  rating:5, date:"Apr 27, 2026", time:"2:30 PM",  comment:"Sasha's boxing sessions are incredible. Lost 12kg in 3 months and I genuinely enjoy going to the gym now.", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&q=80" },
  { id:3, client:"Sara Linares",   trainer:"Priya Nair",    rating:5, date:"Apr 26, 2026", time:"11:05 AM", comment:"Priya helped me recover from a knee injury I'd had for years. Her rehab knowledge is outstanding.", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&q=80" },
  { id:4, client:"Tom Richardson", trainer:"Marcus Reid",   rating:4, date:"Apr 25, 2026", time:"4:45 PM",  comment:"Very knowledgeable and professional. Sessions are always well-planned. Marcus pushes you just hard enough.", avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80" },
  { id:5, client:"Maya Johnson",   trainer:"Jordan Wells",  rating:4, date:"Apr 24, 2026", time:"8:20 AM",  comment:"Jordan's HIIT classes are brilliant. Lost body fat and endurance is through the roof.", avatar:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&q=80" },
  { id:6, client:"Carlos Diaz",    trainer:"Devon Clarke",  rating:5, date:"Apr 23, 2026", time:"6:00 PM",  comment:"Devon builds athletes. Went from 80kg to 140kg squats in four months. Elite-level periodisation.", avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&q=80" },
  { id:7, client:"Naomi Ashford",  trainer:"Alicia Chen",   rating:5, date:"Apr 22, 2026", time:"10:30 AM", comment:"Alicia's holistic approach is genuinely caring. She balances mental and physical health perfectly.", avatar:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=60&q=80" },
  { id:8, client:"Ethan Wright",   trainer:"Marcus Reid",   rating:5, date:"Apr 20, 2026", time:"3:15 PM",  comment:"Incredible attention to detail. Marcus remembers every aspect of your programme and pushes you to exceed it.", avatar:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&q=80" },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const avg  = (arr) => arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : null;
const avgG = (g) => { if(!g) return null; const v=CRITERIA.map(c=>Number(g[c.key]||0)); return +(v.reduce((a,b)=>a+b,0)/v.length).toFixed(2); };
const gradeCol = (s) => { if(s==null) return "#555"; if(s>=8.5) return "#22C55E"; if(s>=6) return "#F59E0B"; return "#EF4444"; };
const gradeLbl = (s) => { if(s==null) return "Not Graded"; if(s>=8.5) return "Excellent"; if(s>=6) return "Good"; return "Needs Improvement"; };
const stars5   = (s) => s==null ? 0 : Math.round((s/10)*5);
const hoursAgo = (ts) => ts ? (Date.now()-ts)/3600000 : 999;

const seedGrades = () => {
  const g = {};
  TRAINERS.forEach(t => {
    g[t.id] = {};
    MONTHS.forEach((_,mi) => {
      if (mi < 9) {
        const base = 6.2 + Math.random()*2.6;
        const row  = { notes:"", submittedAt: Date.now()-(MONTHS.length-mi)*30*24*3600*1000, finalised:true };
        CRITERIA.forEach(c => { row[c.key] = Math.min(10,Math.max(1,+(base+(Math.random()*1.8-0.9)).toFixed(1))); });
        g[t.id][mi] = row;
      }
    });
  });
  return g;
};

/* ─────────────────────────────────────────────
   TINY ICONS
───────────────────────────────────────────── */
const Ico = {
  arrow:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  close:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  shield: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  swap:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  warn:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  lock:   ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  clock:  ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  pen:    ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>,
  info:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  check:  ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
  up:     ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  down:   ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  crown:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"/><line x1="5" y1="20" x2="19" y2="20"/></svg>,
  star:   (f)=>f
    ?<svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    :<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

function StarRow({ score, size="sm" }) {
  const n = stars5(score);
  return (
    <div className={`sd-stars sd-stars--${size}`}>
      {[1,2,3,4,5].map(i=><span key={i}>{Ico.star(i<=n)}</span>)}
    </div>
  );
}

function Toast({ msg, show }) {
  return <div className={`sd-toast${show?" sd-toast--on":""}`}>{msg}</div>;
}

/* ─────────────────────────────────────────────
   MINI LINE CHART
───────────────────────────────────────────── */
function MiniChart({ internalArr, clientArr }) {
  const ref = useRef(null);
  const ch  = useRef(null);
  const pts = MONTHS.map((l,i)=>({ l, int:internalArr[i]??null, cli:clientArr[i]??null })).filter(d=>d.int!==null);
  useEffect(()=>{
    if(!ref.current) return;
    ch.current?.destroy();
    ch.current = new Chart(ref.current,{
      type:"line",
      data:{
        labels: pts.map(d=>d.l),
        datasets:[
          { label:"Internal %", data:pts.map(d=>d.int), borderColor:"#F26522", backgroundColor:"rgba(242,101,34,0.07)", borderWidth:2, tension:0.4, fill:true, pointBackgroundColor:"#F26522", pointRadius:4 },
          { label:"Client ×20", data:pts.map(d=>d.cli!=null?d.cli*20:null), borderColor:"#22C55E", backgroundColor:"rgba(34,197,94,0.05)", borderWidth:2, borderDash:[4,3], tension:0.4, fill:false, pointBackgroundColor:"#22C55E", pointRadius:3 },
        ],
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:{ callbacks:{ label:(c)=>c.datasetIndex===0?`Internal: ${c.raw}%`:`Client: ${(c.raw/20).toFixed(1)}/5` } } },
        scales:{
          x:{ grid:{color:"rgba(255,255,255,0.04)"}, ticks:{color:"#555",font:{size:10}} },
          y:{ grid:{color:"rgba(255,255,255,0.04)"}, ticks:{color:"#555",font:{size:10}}, min:0, max:100 },
        },
      },
    });
    return ()=>ch.current?.destroy();
  }, [JSON.stringify(pts)]);
  return <canvas ref={ref}/>;
}

/* ─────────────────────────────────────────────
   GRADING MODAL — clean, focused
───────────────────────────────────────────── */
function GradeModal({ trainer, monthIdx, existing, onSave, onClose }) {
  const isFinal   = !!existing?.finalised;
  const isExpired = isFinal && hoursAgo(existing.submittedAt) >= 24;
  const canEdit   = !isFinal || (isFinal && !isExpired);
  const hrsLeft   = isFinal && !isExpired ? Math.max(0, 24-hoursAgo(existing.submittedAt)).toFixed(1) : null;

  const [scores, setScores] = useState(()=>
    CRITERIA.reduce((o,c)=>({...o,[c.key]:existing?.[c.key]??5}),{})
  );
  const [notes, setNotes]   = useState(existing?.notes||"");
  const [confirm, setConfirm] = useState(false);

  const overall = +(CRITERIA.map(c=>Number(scores[c.key])).reduce((a,b)=>a+b,0)/CRITERIA.length).toFixed(2);
  const col     = gradeCol(overall);

  const doSave = () => {
    onSave({ ...scores, notes, submittedAt:existing?.submittedAt||Date.now(), finalised:true });
  };

  return (
    <div className="sd-overlay" onClick={onClose}>
      <div className="sd-modal" onClick={e=>e.stopPropagation()}>

        {/* Header */}
        <div className="sd-modal-top">
          <div className="sd-modal-who">
            <img src={trainer.img} alt={trainer.name} className="sd-modal-photo"/>
            <div>
              <p className="sd-modal-month-tag">{MONTHS[monthIdx]} 2025–26 · Internal Grade</p>
              <h3 className="sd-modal-trainer-name">{trainer.name}</h3>
              <p className="sd-modal-trainer-role">{trainer.role}</p>
            </div>
          </div>
          <button className="sd-modal-close" onClick={onClose}><Ico.close/></button>
        </div>

        {/* Status strip */}
        {!isFinal && (
          <div className="sd-modal-status sd-modal-status--info">
            <Ico.info/> Once submitted you have <strong>24 hours</strong> to correct mistakes — then the grade locks permanently.
          </div>
        )}
        {isFinal && !isExpired && (
          <div className="sd-modal-status sd-modal-status--warn">
            <Ico.clock/> Grade submitted · <strong>{hrsLeft}h remaining</strong> to make corrections before permanent lock.
          </div>
        )}
        {isExpired && (
          <div className="sd-modal-status sd-modal-status--error">
            <Ico.lock/> This grade is <strong>permanently locked</strong> — the 24-hour window has expired.
          </div>
        )}

        {/* Overall score hero */}
        <div className="sd-modal-score-hero" style={{"--oc":col}}>
          <div className="sd-modal-ring-wrap">
            <svg viewBox="0 0 72 72" className="sd-ring-svg">
              <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6"/>
              <circle cx="36" cy="36" r="28" fill="none" stroke={col} strokeWidth="6"
                strokeDasharray={`${(overall/10)*175.9} 175.9`} strokeLinecap="round"
                transform="rotate(-90 36 36)" style={{transition:"stroke-dasharray 0.35s ease"}}/>
              <text x="36" y="34" textAnchor="middle" fill={col} fontSize="11" fontFamily="Bebas Neue" letterSpacing="1">{overall.toFixed(1)}</text>
              <text x="36" y="45" textAnchor="middle" fill={col} fontSize="8" fontFamily="Barlow Condensed" fontWeight="700">{Math.round(overall*10)}%</text>
            </svg>
          </div>
          <div className="sd-modal-score-info">
            <span className="sd-modal-score-val" style={{color:col}}>{overall.toFixed(2)} / 10</span>
            <span className="sd-modal-score-lbl" style={{color:col}}>{gradeLbl(overall)}</span>
            <StarRow score={overall} size="md"/>
          </div>
        </div>

        {/* Sliders */}
        <div className="sd-modal-sliders">
          {CRITERIA.map(c=>{
            const v  = Number(scores[c.key]);
            const cc = gradeCol(v>=8.5?9:v>=6?7:4);
            return (
              <div key={c.key} className={`sd-crit${isExpired?" sd-crit--locked":""}`}>
                <div className="sd-crit-label">
                  <span className="sd-crit-icon">{c.icon}</span>
                  <span>{c.label}</span>
                </div>
                <div className="sd-crit-control">
                  <input type="range" min="1" max="10" step="0.5"
                    value={v} disabled={isExpired}
                    className="sd-slider" style={{"--sc":cc}}
                    onChange={e=>setScores(p=>({...p,[c.key]:parseFloat(e.target.value)}))}
                  />
                  <div className="sd-crit-tick">{[1,2,3,4,5,6,7,8,9,10].map(n=><span key={n}>{n}</span>)}</div>
                </div>
                <span className="sd-crit-val" style={{color:cc}}>{v.toFixed(1)}</span>
              </div>
            );
          })}
        </div>

        {/* Notes */}
        {!isExpired && (
          <textarea className="sd-modal-notes"
            placeholder="Optional notes for this grade…"
            value={notes}
            onChange={e=>setNotes(e.target.value)}
            rows={2}
          />
        )}

        {/* Submit */}
        {!isExpired && (
          <button className="sd-modal-submit" onClick={()=>isFinal?doSave():setConfirm(true)}>
            {isFinal?"Update Grade":"Submit Grade"} <Ico.arrow/>
          </button>
        )}

        {/* Confirm overlay */}
        {confirm && (
          <div className="sd-confirm-layer">
            <div className="sd-confirm">
              <p className="sd-confirm-title">Submit this grade?</p>
              <p className="sd-confirm-body">You have <strong>24 hours</strong> to correct mistakes after submission. After that it's <strong>permanently locked</strong>.</p>
              <div className="sd-confirm-btns">
                <button className="sd-btn-ghost" onClick={()=>setConfirm(false)}>Go Back</button>
                <button className="sd-btn-orange" onClick={doSave}>Confirm <Ico.check/></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   TRAINER GRADING ROW — one per trainer, compact
───────────────────────────────────────────── */
function TrainerRow({ trainer, grades, onGrade }) {
  const [open, setOpen] = useState(false);

  const monthData = MONTHS.map((_,mi)=>{
    const g   = grades[trainer.id]?.[mi];
    const avg = g?.finalised ? avgG(g) : null;
    return { mi, avg, g };
  });
  const graded      = monthData.filter(m=>m.avg!==null);
  const overallAvg  = graded.length ? avg(graded.map(m=>m.avg)) : null;
  const lastGraded  = graded[graded.length-1];
  const clientAvg   = avg(trainer.clientRatings);
  const col         = gradeCol(overallAvg);

  // Build internal arr for chart
  const intArr = monthData.map(m=>m.avg!==null?Math.round(m.avg*10):null);

  return (
    <div className={`sd-trainer-row${open?" sd-trainer-row--open":""}`}>
      {/* Collapsed summary bar */}
      <button className="sd-trainer-row-header" onClick={()=>setOpen(v=>!v)}>
        <img src={trainer.img} alt={trainer.name} className="sd-trainer-row-photo"/>
        <div className="sd-trainer-row-info">
          <span className="sd-trainer-row-name">{trainer.name}</span>
          <span className="sd-trainer-row-role">{trainer.role} · {trainer.exp}</span>
        </div>
        <div className="sd-trainer-row-grades">
          {MONTHS.map((m,mi)=>{
            const md  = monthData[mi];
            const c   = gradeCol(md.avg);
            const fin = md.g?.finalised;
            const exp = fin && hoursAgo(md.g.submittedAt)>=24;
            return (
              <button
                key={m}
                className={`sd-dot-btn${md.avg!==null?" sd-dot-btn--graded":""}`}
                style={{"--dc":c}}
                title={md.avg!==null?`${m}: ${md.avg?.toFixed(1)}/10 — ${gradeLbl(md.avg)}`:`${m}: Not graded`}
                onClick={e=>{ e.stopPropagation(); onGrade(trainer,mi); }}
              >
                <span className="sd-dot-m">{m}</span>
                {md.avg!==null
                  ? <span className="sd-dot-score" style={{color:c}}>{md.avg?.toFixed(1)}</span>
                  : <span className="sd-dot-empty">+</span>
                }
                {fin && !exp && <span className="sd-dot-edit"><Ico.pen/></span>}
                {exp          && <span className="sd-dot-lock"><Ico.lock/></span>}
              </button>
            );
          })}
        </div>
        <div className="sd-trainer-row-summary">
          {overallAvg!==null
            ? <>
                <span className="sd-trs-score" style={{color:col}}>{overallAvg.toFixed(1)}</span>
                <span className="sd-trs-pct"   style={{color:col}}>{Math.round(overallAvg*10)}%</span>
                <StarRow score={overallAvg} size="xs"/>
                <span className="sd-trs-label" style={{color:col}}>{gradeLbl(overallAvg)}</span>
              </>
            : <span className="sd-trs-none">No grades yet</span>
          }
        </div>
        <span className={`sd-row-chevron${open?" sd-row-chevron--up":""}`}><Ico.arrow/></span>
      </button>

      {/* Expanded detail panel */}
      {open && (
        <div className="sd-trainer-row-detail">
          <div className="sd-trd-chart-col">
            <p className="sd-trd-chart-title">Internal vs Client Rating — {trainer.name}</p>
            <div className="sd-trd-chart-wrap">
              <MiniChart internalArr={intArr} clientArr={trainer.clientRatings}/>
            </div>
            <div className="sd-trd-chart-legend">
              <span><span className="sd-leg-dot sd-leg-dot--orange"/>Internal Rating (%)</span>
              <span><span className="sd-leg-dot sd-leg-dot--green"/>Client Rating (×20)</span>
            </div>
          </div>
          <div className="sd-trd-breakdown-col">
            <p className="sd-trd-chart-title">Latest Graded Month — {lastGraded ? MONTHS[lastGraded.mi] : "—"}</p>
            {lastGraded ? (
              <>
                <div className="sd-trd-criteria">
                  {CRITERIA.map(c=>{
                    const v  = lastGraded.g?.[c.key]??0;
                    const cc = gradeCol(v>=8.5?9:v>=6?7:4);
                    return (
                      <div key={c.key} className="sd-trd-crit-row">
                        <span className="sd-trd-crit-icon">{c.icon}</span>
                        <span className="sd-trd-crit-label">{c.label}</span>
                        <div className="sd-trd-bar-track">
                          <div className="sd-trd-bar-fill" style={{width:`${v*10}%`,background:cc}}/>
                        </div>
                        <span className="sd-trd-crit-val" style={{color:cc}}>{Number(v).toFixed(1)}</span>
                      </div>
                    );
                  })}
                </div>
                {lastGraded.g?.notes && <p className="sd-trd-notes">"{lastGraded.g.notes}"</p>}
                <p className="sd-trd-graded-at"><Ico.clock/> Graded: {new Date(lastGraded.g.submittedAt).toLocaleDateString()}</p>
              </>
            ) : (
              <p className="sd-trd-no-data">No grades submitted yet. Click any month tile above to begin grading.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   RISK CLIENT CARD
───────────────────────────────────────────── */
function RiskCard({ client, interventions, onIntervene, onRelease, transfers, onTransfer }) {
  const rc  = {"high":"#EF4444","medium":"#F59E0B","low":"#22C55E"}[client.risk];
  const rl  = {"high":"High Risk","medium":"Moderate","low":"Low Risk"}[client.risk];
  const mine  = interventions[client.id]==="senior";
  const other = interventions[client.id] && !mine;
  const pending = transfers.find(t=>t.clientId===client.id);

  return (
    <div className={`sd-risk-card sd-risk-card--${client.risk}`} style={{"--rc":rc}}>
      <div className="sd-risk-top">
        <div className="sd-risk-avatar-wrap">
          <img src={client.img} alt={client.name} className="sd-risk-avatar"/>
          <span className="sd-risk-pip" style={{background:rc}}/>
        </div>
        <div className="sd-risk-main">
          <div className="sd-risk-name-row">
            <span className="sd-risk-name">{client.name}</span>
            <span className="sd-risk-badge" style={{background:`${rc}18`,border:`1px solid ${rc}40`,color:rc}}>{rl}</span>
          </div>
          <span className="sd-risk-trainer">With {client.trainer} · {client.goal}</span>
          <div className="sd-risk-reason"><Ico.warn/> {client.reason}</div>
        </div>
        <div className="sd-risk-stats">
          <div className="sd-risk-stat">
            <span style={{color:client.progress<0?"#EF4444":"inherit"}}>{client.progress>0?"+":""}{client.progress}%</span>
            <span>Progress</span>
          </div>
          <div className="sd-risk-stat">
            <span>{client.attendance}%</span>
            <span>Attend.</span>
          </div>
        </div>
      </div>
      <div className="sd-risk-footer">
        <span className="sd-risk-seen">Last seen: {client.lastSeen}</span>
        <div className="sd-risk-actions">
          {pending
            ? <span className="sd-risk-pending">⌛ Transfer Pending</span>
            : <button className="sd-risk-btn sd-risk-btn--swap" onClick={()=>onTransfer(client.id,client.name)}><Ico.swap/> Transfer</button>
          }
          {mine
            ? <button className="sd-risk-btn sd-risk-btn--release" onClick={()=>onRelease(client.id)}><Ico.shield/> Release</button>
            : other
              ? <button className="sd-risk-btn sd-risk-btn--locked" disabled><Ico.lock/> Locked</button>
              : <button className="sd-risk-btn sd-risk-btn--intervene" onClick={()=>onIntervene(client.id)}><Ico.shield/> Intervene</button>
          }
        </div>
      </div>
      {mine  && <div className="sd-risk-banner sd-risk-banner--active"><Ico.shield/> You are actively intervening</div>}
      {other && <div className="sd-risk-banner sd-risk-banner--blocked"><Ico.lock/> Intervention already in progress</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   REVIEW CARD
───────────────────────────────────────────── */
function ReviewCard({ r }) {
  return (
    <div className="sd-review-card">
      <div className="sd-review-top">
        <img src={r.avatar} alt={r.client} className="sd-review-avatar"/>
        <div className="sd-review-meta">
          <span className="sd-review-client">{r.client}</span>
          <span className="sd-review-trainer">Review of {r.trainer}</span>
          <span className="sd-review-datetime">{r.date} · {r.time}</span>
        </div>
        <div className="sd-review-rating">
          <div className="sd-review-stars">
            {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=r.rating?"#F59E0B":"rgba(255,255,255,0.12)",fontSize:14}}>★</span>)}
          </div>
          <span className="sd-review-score">{r.rating}.0</span>
        </div>
      </div>
      <p className="sd-review-comment">"{r.comment}"</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function SeniorTrainerPage() {
  const [grades, setGrades]         = useState(seedGrades);
  const [gradeModal, setGradeModal] = useState(null); // {trainer, mi}
  const [showAllRisk, setShowAllRisk] = useState(false);
  const [interventions, setInterventions] = useState({});
  const [transfers, setTransfers]   = useState([]);
  const [reviewFilter, setReviewFilter] = useState("All");
  const [toast, setToast]           = useState({show:false,msg:""});
  const [activeTab, setActiveTab]   = useState("overview"); // overview | grading | risk | reviews

  const showToast = useCallback((msg)=>{
    setToast({show:true,msg});
    setTimeout(()=>setToast({show:false,msg:""}),2800);
  },[]);

  /* senior's own stats */
  const myIntAvg = Math.round(avg(SENIOR.myInternal)*1)||0;
  const myCliAvg = avg(SENIOR.myClient)||0;
  const myOverall= (((myIntAvg/20)+myCliAvg)/2).toFixed(1);

  const saveGrade = (trainerId,mi,data) => {
    setGrades(p=>({ ...p, [trainerId]:{ ...p[trainerId], [mi]:{...data} } }));
    showToast("✓ Grade saved!");
    setGradeModal(null);
  };

  const displayedRisk = showAllRisk ? AT_RISK : AT_RISK.slice(0,5);
  const reviewOptions = ["All","Marcus Reid",...TRAINERS.map(t=>t.name)];
  const filteredReviews = reviewFilter==="All" ? REVIEWS : REVIEWS.filter(r=>r.trainer===reviewFilter);
  const avgReview = (REVIEWS.reduce((a,r)=>a+r.rating,0)/REVIEWS.length).toFixed(1);

  const TABS = [
    { id:"overview", label:"Overview"     },
    { id:"grading",  label:"Grade Trainers" },
    { id:"risk",     label:"Clients at Risk" },
    { id:"reviews",  label:"Client Reviews"  },
  ];

  return (
    <div className="sd-page">
      <Toast msg={toast.msg} show={toast.show}/>
      {gradeModal && (
        <GradeModal
          trainer={gradeModal.trainer}
          monthIdx={gradeModal.mi}
          existing={grades[gradeModal.trainer.id]?.[gradeModal.mi]}
          onSave={d=>saveGrade(gradeModal.trainer.id,gradeModal.mi,d)}
          onClose={()=>setGradeModal(null)}
        />
      )}

      {/* ─── PROFILE HERO ─── */}
      <div className="sd-hero">
        <div className="sd-hero-cover" style={{backgroundImage:`url(${SENIOR.coverImg})`}}/>
        <div className="sd-hero-tint"/>
        <div className="sd-hero-body">
          <div className="sd-hero-left">
            <div className="sd-hero-avatar-ring">
              <img src={SENIOR.img} alt={SENIOR.name} className="sd-hero-avatar"/>
            </div>
            <div className="sd-hero-crown"><Ico.crown/> Senior Trainer</div>
          </div>
          <div className="sd-hero-copy">
            <p className="sd-hero-eyebrow">B.A.D People Fitness · Senior Dashboard</p>
            <h1 className="sd-hero-name">{SENIOR.name}</h1>
            <p className="sd-hero-title">{SENIOR.title}</p>
            <p className="sd-hero-bio">{SENIOR.bio}</p>
            <div className="sd-hero-tags">
              {SENIOR.specs.map(s=><span key={s} className="sd-tag">{s}</span>)}
            </div>
            <div className="sd-hero-meta">
              <div><span>Since</span><strong>{SENIOR.since}</strong></div>
              <div><span>Experience</span><strong>{SENIOR.exp}</strong></div>
              <div><span>Clients</span><strong>{SENIOR.clients}</strong></div>
              <div><span>Active</span><strong>{SENIOR.active}</strong></div>
            </div>
          </div>
          <div className="sd-hero-kpis">
            <div className="sd-hero-kpi">
              <span className="sd-hero-kpi-val" style={{color:gradeCol(myIntAvg/10)}}>{myIntAvg}%</span>
              <span>Internal Rating</span>
            </div>
            <div className="sd-hero-kpi">
              <span className="sd-hero-kpi-val" style={{color:"#22C55E"}}>{myCliAvg.toFixed(1)}/5</span>
              <span>Client Rating</span>
            </div>
            <div className="sd-hero-kpi">
              <span className="sd-hero-kpi-val" style={{color:"#F26522"}}>{myOverall}</span>
              <span>Overall Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TAB NAV ─── */}
      <div className="sd-tab-bar">
        <div className="sd-tab-inner">
          {TABS.map(t=>(
            <button key={t.id} className={`sd-tab${activeTab===t.id?" sd-tab--on":""}`} onClick={()=>setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="sd-main">

        {/* ═══ TAB: OVERVIEW ═══ */}
        {activeTab==="overview" && (
          <div className="sd-tab-content">
            {/* KPI strip */}
            <div className="sd-kpi-strip">
              {[
                {val:myIntAvg+"%",  lbl:"My Internal Rating",  col:gradeCol(myIntAvg/10), trend:true  },
                {val:myCliAvg.toFixed(1)+"/5", lbl:"My Client Rating", col:"#22C55E",    trend:true  },
                {val:myOverall,     lbl:"Overall Score",        col:"#F26522",            trend:null  },
                {val:SENIOR.active, lbl:"Active Clients",       col:"#F26522",            trend:null  },
                {val:`${AT_RISK.filter(c=>c.risk==="high").length}`, lbl:"High Risk Clients", col:"#EF4444", trend:null },
                {val:REVIEWS.length,lbl:"Total Reviews",        col:"#F26522",            trend:null  },
              ].map((k,i)=>(
                <div key={i} className="sd-kpi-card">
                  <span className="sd-kpi-val" style={{color:k.col}}>{k.val}</span>
                  <span className="sd-kpi-lbl">{k.lbl}</span>
                </div>
              ))}
            </div>

            {/* My performance chart */}
            <div className="sd-panel">
              <div className="sd-panel-hdr">
                <h3>My Performance — Jan–Nov</h3>
                <div className="sd-chart-legend">
                  <span><span className="sd-leg-dot sd-leg-dot--orange"/>Internal %</span>
                  <span><span className="sd-leg-dot sd-leg-dot--green"/>Client ×20</span>
                </div>
              </div>
              <div className="sd-chart-wrap">
                <MiniChart internalArr={SENIOR.myInternal} clientArr={SENIOR.myClient}/>
              </div>
            </div>

            {/* Team at a glance */}
            <div className="sd-panel">
              <div className="sd-panel-hdr"><h3>Team Grading Summary</h3></div>
              <div className="sd-team-summary">
                {TRAINERS.map(t=>{
                  const gd    = MONTHS.map((_,mi)=>{ const g=grades[t.id]?.[mi]; return g?.finalised?avgG(g):null; }).filter(v=>v!==null);
                  const tavg  = gd.length?avg(gd):null;
                  const col2  = gradeCol(tavg);
                  const tcli  = avg(t.clientRatings);
                  return (
                    <div key={t.id} className="sd-team-row">
                      <img src={t.img} alt={t.name} className="sd-team-photo"/>
                      <div className="sd-team-info">
                        <span className="sd-team-name">{t.name}</span>
                        <span className="sd-team-role">{t.role}</span>
                      </div>
                      <div className="sd-team-bar-col">
                        <div className="sd-team-bar-wrap">
                          <div className="sd-team-bar" style={{width:tavg?`${Math.round(tavg*10)}%`:"0%",background:col2}}/>
                        </div>
                        <span className="sd-team-pct" style={{color:col2}}>{tavg?Math.round(tavg*10)+"%":"—"}</span>
                      </div>
                      <div className="sd-team-scores">
                        <span style={{color:col2}}>{tavg?tavg.toFixed(1):"—"}<small>/10</small></span>
                        <span style={{color:"#22C55E"}}>{tcli?.toFixed(1)}<small>/5</small></span>
                      </div>
                      <button className="sd-team-grade-btn" onClick={()=>{ setActiveTab("grading"); }}>
                        Grade <Ico.arrow/>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ TAB: GRADING ═══ */}
        {activeTab==="grading" && (
          <div className="sd-tab-content">
            <div className="sd-section-intro">
              <h2 className="sd-section-title">Grade Trainers</h2>
              <p className="sd-section-sub">Click any month tile to open the grading panel. Grades lock permanently after 24 hours.</p>
              <div className="sd-grade-key">
                <span><span className="sd-key-dot" style={{background:"#22C55E"}}/>≥ 8.5 Excellent</span>
                <span><span className="sd-key-dot" style={{background:"#F59E0B"}}/>6–8.4 Good</span>
                <span><span className="sd-key-dot" style={{background:"#EF4444"}}/>Below 6 Needs Work</span>
                <span><Ico.pen/> Editable (within 24h)</span>
                <span><Ico.lock/> Locked</span>
              </div>
            </div>
            <div className="sd-trainers-list">
              {TRAINERS.map(t=>(
                <TrainerRow key={t.id} trainer={t} grades={grades}
                  onGrade={(trainer,mi)=>setGradeModal({trainer,mi})}/>
              ))}
            </div>
          </div>
        )}

        {/* ═══ TAB: CLIENTS AT RISK ═══ */}
        {activeTab==="risk" && (
          <div className="sd-tab-content">
            <div className="sd-section-intro">
              <h2 className="sd-section-title">Clients at Risk</h2>
              <p className="sd-section-sub">Clients showing warning signs across the full training team. Intervene directly or request a transfer.</p>
            </div>
            <div className="sd-risk-summary">
              {["high","medium","low"].map(level=>{
                const cnt = AT_RISK.filter(c=>c.risk===level).length;
                const rc  = {"high":"#EF4444","medium":"#F59E0B","low":"#22C55E"}[level];
                const rl  = {"high":"High Risk","medium":"Moderate","low":"Low Risk"}[level];
                return (
                  <div key={level} className="sd-risk-sum-item" style={{borderTopColor:rc}}>
                    <span className="sd-risk-sum-val" style={{color:rc}}>{cnt}</span>
                    <span>{rl}</span>
                  </div>
                );
              })}
            </div>
            <div className="sd-risk-grid">
              {displayedRisk.map(c=>(
                <RiskCard key={c.id} client={c}
                  interventions={interventions}
                  onIntervene={id=>{ setInterventions(p=>({...p,[id]:"senior"})); showToast(`✓ Intervention started for ${AT_RISK.find(x=>x.id===id)?.name}`); }}
                  onRelease={id=>{ setInterventions(p=>{ const n={...p}; delete n[id]; return n; }); showToast("Intervention released."); }}
                  transfers={transfers}
                  onTransfer={(id,name)=>{ setTransfers(p=>[...p,{clientId:id,clientName:name}]); showToast(`Transfer request sent for ${name}`); }}
                />
              ))}
            </div>
            {AT_RISK.length > 5 && (
              <button className="sd-view-more" onClick={()=>setShowAllRisk(v=>!v)}>
                {showAllRisk ? "Show Less" : `View All ${AT_RISK.length} Clients`}
              </button>
            )}
          </div>
        )}

        {/* ═══ TAB: REVIEWS ═══ */}
        {activeTab==="reviews" && (
          <div className="sd-tab-content">
            <div className="sd-section-intro">
              <h2 className="sd-section-title">Client Reviews</h2>
              <p className="sd-section-sub">Public feedback submitted across the full coaching team.</p>
            </div>
            <div className="sd-reviews-header">
              <div className="sd-reviews-score">
                <span className="sd-reviews-big">{avgReview}</span>
                <div>
                  <div className="sd-reviews-stars-row">
                    {[1,2,3,4,5].map(i=><span key={i} style={{color:i<=Math.round(parseFloat(avgReview))?"#F59E0B":"rgba(255,255,255,0.12)",fontSize:22}}>★</span>)}
                  </div>
                  <span className="sd-reviews-count">{REVIEWS.length} verified reviews</span>
                </div>
              </div>
              <div className="sd-reviews-filters">
                {reviewOptions.map(opt=>(
                  <button key={opt}
                    className={`sd-filter-btn${reviewFilter===opt?" sd-filter-btn--on":""}`}
                    onClick={()=>setReviewFilter(opt)}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="sd-reviews-grid">
              {filteredReviews.map(r=><ReviewCard key={r.id} r={r}/>)}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}