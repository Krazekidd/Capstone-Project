import { useState, useRef, useEffect, useCallback } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);
import "./Trainer.css";

/* ─────────────────────────────────────────────
   TRAINER DATA  (the logged-in trainer)
───────────────────────────────────────────── */
const TRAINER = {
  name:     "Sasha Volkov",
  title:    "Combat & Conditioning Director",
  certs:    "WBC Certified · Muay Thai Level 3 · ACE-CPT",
  exp:      "14 yrs",
  since:    "January 2018",
  clients:  19,
  active:   15,
  img:      "https://images.unsplash.com/photo-1570655652364-2e0a67455ac6?w=800&q=80&fit=crop",
  coverImg: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=1600&q=80&fit=crop",
  quote:    "Every punch thrown in training is a punch saved in battle.",
  bio:      "Elite combat and conditioning specialist with 14 years of experience transforming athletes and everyday people alike. Combining martial arts precision with cutting-edge sports science.",
  specs:    ["Boxing","Muay Thai","HIIT","Conditioning"],
  myInternal: [75,78,80,82,79,83,85,84,86,88,87],
  myClient:   [3.9,4.0,4.1,4.3,4.2,4.4,4.5,4.3,4.6,4.5,4.7],
};

/* My personal clients (subset of AT_RISK who belong to this trainer) */
const MY_CLIENTS = [
  { id:1,  name:"Kwame Asante",    risk:"high",   reason:"Missed 4 consecutive sessions",        attendance:38, progress:-12, lastSeen:"8 days ago",  goal:"Weight Loss",    img:"https://images.unsplash.com/photo-1534367610401-9f5ed68180aa?w=80&q=80",  interventionBy:null  },
  { id:2,  name:"Nia Williams",    risk:"medium", reason:"Strength plateau for 3 weeks",          attendance:80, progress:6,   lastSeen:"2 days ago",  goal:"Build Muscle",   img:"https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=80&q=80",  interventionBy:null  },
  { id:3,  name:"Tariq Mensah",    risk:"high",   reason:"BMI increased 2.8 points this month",   attendance:44, progress:-9,  lastSeen:"4 days ago",  goal:"Weight Loss",    img:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80",  interventionBy:"Marcus Reid" },
  { id:4,  name:"Serena Blake",    risk:"low",    reason:"Hydration logs below daily target",      attendance:88, progress:10,  lastSeen:"Today",       goal:"Endurance",      img:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80",  interventionBy:null  },
  { id:5,  name:"Dante Powell",    risk:"medium", reason:"No nutrition check-in for 10 days",     attendance:65, progress:3,   lastSeen:"3 days ago",  goal:"Build Muscle",   img:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=80",  interventionBy:null  },
  { id:6,  name:"Camille Forrest", risk:"low",    reason:"Sleep average dropped to 5.5 hours",    attendance:85, progress:8,   lastSeen:"Yesterday",   goal:"Tone & Define",  img:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=80&q=80",  interventionBy:null  },
  { id:7,  name:"Marcus Webb",     risk:"medium", reason:"Skipped last scheduled PT session",     attendance:70, progress:2,   lastSeen:"5 days ago",  goal:"Lose Weight",    img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80",  interventionBy:null  },
];

/* Public reviews for this trainer */
const MY_REVIEWS = [
  { id:1, client:"Bob Kamara",       rating:5, date:"Apr 27, 2026", time:"2:30 PM",  comment:"Sasha's boxing sessions are incredible. Lost 12kg in 3 months and I genuinely love going to the gym now. Life-changing.", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&q=80" },
  { id:2, client:"Yemi Adebayo",     rating:5, date:"Apr 24, 2026", time:"10:15 AM", comment:"Best HIIT coach I've ever trained with. Sasha knows exactly how to push you without breaking you. Results speak for themselves.", avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80" },
  { id:3, client:"Grace Okafor",     rating:4, date:"Apr 21, 2026", time:"3:45 PM",  comment:"Really effective training style. Sessions are intense but always safe. Noticed huge improvements in my fitness after just 6 weeks.", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=60&q=80" },
  { id:4, client:"Dean McAllister",  rating:5, date:"Apr 18, 2026", time:"8:00 AM",  comment:"Sasha doesn't just train you — he coaches you. The mental side is just as strong as the physical. Highly recommend.", avatar:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=60&q=80" },
  { id:5, client:"Priya Sundaram",   rating:4, date:"Apr 15, 2026", time:"12:30 PM", comment:"Fantastic conditioning programme. Packed my schedule but every session has a clear purpose. My endurance has skyrocketed.", avatar:"https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=60&q=80" },
  { id:6, client:"Liam Thornton",    rating:5, date:"Apr 10, 2026", time:"6:20 PM",  comment:"Came in after a 2-year gym break and Sasha had me back to full fitness in 8 weeks. Incredible knowledge and patience.", avatar:"https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&q=80" },
];

/* My internal grades (received from senior/admin — read-only to this trainer) */
const MY_GRADES_BY_MONTH = [
  { month:"Jan", internal:75, criteria:{ performance:7.5, motivation:8.0, interaction:7.0, knowledge:7.5, punctuality:7.5 }, notes:"Solid start. Push for more client check-ins." },
  { month:"Feb", internal:78, criteria:{ performance:7.8, motivation:8.2, interaction:7.5, knowledge:8.0, punctuality:7.8 }, notes:"Improvement across the board. Keep it up." },
  { month:"Mar", internal:80, criteria:{ performance:8.0, motivation:8.5, interaction:8.0, knowledge:8.2, punctuality:7.8 }, notes:"Strong month. Client retention improved." },
  { month:"Apr", internal:82, criteria:{ performance:8.2, motivation:8.5, interaction:8.2, knowledge:8.5, punctuality:8.0 }, notes:"Excellent consistency. Near top performer." },
  { month:"May", internal:79, criteria:{ performance:8.0, motivation:8.0, interaction:7.8, knowledge:8.0, punctuality:7.5 }, notes:"Minor dip — focus on punctuality." },
  { month:"Jun", internal:83, criteria:{ performance:8.5, motivation:8.8, interaction:8.2, knowledge:8.5, punctuality:8.0 }, notes:"Back on track. Best month yet." },
  { month:"Jul", internal:85, criteria:{ performance:8.8, motivation:9.0, interaction:8.5, knowledge:8.5, punctuality:8.2 }, notes:"Outstanding performance this month." },
  { month:"Aug", internal:84, criteria:{ performance:8.5, motivation:8.8, interaction:8.5, knowledge:8.5, punctuality:8.0 }, notes:"Consistent excellence." },
  { month:"Sep", internal:86, criteria:{ performance:9.0, motivation:9.0, interaction:8.5, knowledge:8.8, punctuality:8.5 }, notes:"Top 2 performer on the team this month." },
  { month:"Oct", internal:88, criteria:{ performance:9.0, motivation:9.2, interaction:8.8, knowledge:9.0, punctuality:8.6 }, notes:"Exceptional. Keep this level going." },
  { month:"Nov", internal:87, criteria:{ performance:8.8, motivation:9.0, interaction:8.8, knowledge:8.8, punctuality:8.6 }, notes:"Consistently excellent across all criteria." },
];

const CRITERIA_LABELS = [
  { key:"performance", label:"Performance & Results", icon:"🏆" },
  { key:"motivation",  label:"Motivation & Energy",   icon:"⚡" },
  { key:"interaction", label:"Client Interaction",    icon:"🤝" },
  { key:"knowledge",   label:"Technical Knowledge",   icon:"🧠" },
  { key:"punctuality", label:"Punctuality",           icon:"⏱️" },
];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const avg       = (arr) => arr.length ? +(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(2) : 0;
const gradeCol  = (s) => { if(s==null) return "#555"; if(s>=8.5) return "#22C55E"; if(s>=6) return "#F59E0B"; return "#EF4444"; };
const gradeLbl  = (s) => { if(s==null) return "Not Graded"; if(s>=8.5) return "Excellent"; if(s>=6) return "Good"; return "Needs Improvement"; };
const stars5    = (s) => s==null ? 0 : Math.round((s/10)*5);

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */
const Ico = {
  arrow:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  close:  ()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  shield: ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  swap:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4m0 0L3 8m4-4l4 4"/><path d="M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>,
  warn:   ()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  lock:   ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  clock:  ()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  up:     ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  down:   ()=><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>,
  star:   (f)=>f
    ?<svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    :<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
};

/* ─────────────────────────────────────────────
   STAR ROW
───────────────────────────────────────────── */
function StarRow({ score, size="sm" }) {
  const n = stars5(score);
  return (
    <div className={`rt-stars rt-stars--${size}`}>
      {[1,2,3,4,5].map(i=><span key={i}>{Ico.star(i<=n)}</span>)}
    </div>
  );
}

/* ─────────────────────────────────────────────
   TOAST
───────────────────────────────────────────── */
function Toast({ msg, show }) {
  return <div className={`rt-toast${show?" rt-toast--on":""}`}>{msg}</div>;
}

/* ─────────────────────────────────────────────
   PERFORMANCE CHART
───────────────────────────────────────────── */
function PerfChart({ internalArr, clientArr }) {
  const ref = useRef(null);
  const ch  = useRef(null);
  const pts = internalArr.map((v,i)=>({ l:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov"][i], int:v, cli:clientArr[i] }));
  useEffect(()=>{
    if(!ref.current) return;
    ch.current?.destroy();
    ch.current = new Chart(ref.current, {
      type:"line",
      data:{
        labels:pts.map(d=>d.l),
        datasets:[
          { label:"Internal %", data:pts.map(d=>d.int), borderColor:"#F26522", backgroundColor:"rgba(242,101,34,0.07)", borderWidth:2, tension:0.4, fill:true, pointBackgroundColor:"#F26522", pointRadius:4 },
          { label:"Client ×20", data:pts.map(d=>d.cli*20), borderColor:"#22C55E", backgroundColor:"rgba(34,197,94,0.05)", borderWidth:2, borderDash:[4,3], tension:0.4, fill:false, pointBackgroundColor:"#22C55E", pointRadius:3 },
        ],
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:(c)=>c.datasetIndex===0?`Internal: ${c.raw}%`:`Client: ${(c.raw/20).toFixed(1)}/5` } } },
        scales:{
          x:{ grid:{color:"rgba(255,255,255,0.04)"}, ticks:{color:"#555",font:{size:10}} },
          y:{ grid:{color:"rgba(255,255,255,0.04)"}, ticks:{color:"#555",font:{size:10}}, min:0, max:100 },
        },
      },
    });
    return()=>ch.current?.destroy();
  },[]);
  return <canvas ref={ref}/>;
}

/* ─────────────────────────────────────────────
   GRADE HISTORY CARD  (read-only)
───────────────────────────────────────────── */
function GradeHistoryCard({ entry, isSelected, onClick }) {
  const col = gradeCol(entry.internal/10);
  const pct = entry.internal;
  return (
    <button
      className={`rt-grade-tile${isSelected?" rt-grade-tile--active":""}`}
      style={{"--tc":col}}
      onClick={onClick}
      title={`${entry.month}: ${pct}% — ${gradeLbl(entry.internal/10)}`}
    >
      <span className="rt-gt-month">{entry.month}</span>
      <span className="rt-gt-score" style={{color:col}}>{(entry.internal/10).toFixed(1)}</span>
      <span className="rt-gt-pct"   style={{color:col}}>{pct}%</span>
      <div className="rt-gt-stars">
        {[1,2,3,4,5].map(i=>(
          <span key={i} style={{color:i<=stars5(entry.internal/10)?"#F59E0B":"rgba(255,255,255,0.1)",fontSize:8}}>★</span>
        ))}
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   RISK CLIENT CARD  (no intervention button — not senior)
───────────────────────────────────────────── */
function RiskCard({ client, transfers, onTransfer }) {
  const rc  = {"high":"#EF4444","medium":"#F59E0B","low":"#22C55E"}[client.risk];
  const rl  = {"high":"High Risk","medium":"Moderate","low":"Low Risk"}[client.risk];
  const pending    = transfers.find(t=>t.clientId===client.id);
  const seniorInt  = !!client.interventionBy;

  return (
    <div className={`rt-risk-card rt-risk-card--${client.risk}`} style={{"--rc":rc}}>
      <div className="rt-risk-top">
        <div className="rt-risk-av-wrap">
          <img src={client.img} alt={client.name} className="rt-risk-avatar"/>
          <span className="rt-risk-pip" style={{background:rc}}/>
        </div>
        <div className="rt-risk-main">
          <div className="rt-risk-name-row">
            <span className="rt-risk-name">{client.name}</span>
            <span className="rt-risk-badge" style={{background:`${rc}18`,border:`1px solid ${rc}40`,color:rc}}>{rl}</span>
          </div>
          <span className="rt-risk-goal">{client.goal}</span>
          <div className="rt-risk-reason"><Ico.warn/>{client.reason}</div>
        </div>
        <div className="rt-risk-stats">
          <div className="rt-risk-stat">
            <span style={{color:client.progress<0?"#EF4444":"inherit"}}>{client.progress>0?"+":""}{client.progress}%</span>
            <span>Progress</span>
          </div>
          <div className="rt-risk-stat">
            <span>{client.attendance}%</span>
            <span>Attendance</span>
          </div>
        </div>
      </div>

      {seniorInt && (
        <div className="rt-risk-senior-banner">
          <Ico.shield/> Senior trainer {client.interventionBy} is actively intervening
        </div>
      )}

      <div className="rt-risk-footer">
        <span className="rt-risk-seen">Last seen: {client.lastSeen}</span>
        <div className="rt-risk-actions">
          {pending
            ? <span className="rt-risk-pending">⌛ Transfer Pending</span>
            : <button className="rt-risk-btn rt-risk-btn--swap" onClick={()=>onTransfer(client.id,client.name)}>
                <Ico.swap/> Request Transfer
              </button>
          }
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REVIEW CARD
───────────────────────────────────────────── */
function ReviewCard({ r }) {
  return (
    <div className="rt-review-card">
      <div className="rt-review-top">
        <img src={r.avatar} alt={r.client} className="rt-review-avatar"/>
        <div className="rt-review-meta">
          <span className="rt-review-client">{r.client}</span>
          <span className="rt-review-datetime">{r.date} · {r.time}</span>
        </div>
        <div className="rt-review-rating">
          <div className="rt-review-stars">
            {[1,2,3,4,5].map(i=>(
              <span key={i} style={{color:i<=r.rating?"#F59E0B":"rgba(255,255,255,0.12)",fontSize:15}}>★</span>
            ))}
          </div>
          <span className="rt-review-score">{r.rating}.0 / 5</span>
        </div>
      </div>
      <p className="rt-review-comment">"{r.comment}"</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function RegularTrainerPage() {
  const [activeTab,       setActiveTab]       = useState("overview");
  const [showAllRisk,     setShowAllRisk]      = useState(false);
  const [transfers,       setTransfers]        = useState([]);
  const [selectedGrade,   setSelectedGrade]    = useState(MY_GRADES_BY_MONTH.length - 1);
  const [toast,           setToast]            = useState({show:false,msg:""});

  const showToast = useCallback((msg)=>{
    setToast({show:true,msg});
    setTimeout(()=>setToast({show:false,msg:""}),2800);
  },[]);

  /* derived stats */
  const intAvg     = Math.round(avg(TRAINER.myInternal));
  const cliAvg     = +avg(TRAINER.myClient).toFixed(1);
  const overall    = (((intAvg/20)+cliAvg)/2).toFixed(1);
  const lastInt    = TRAINER.myInternal.slice(-1)[0];
  const prevInt    = TRAINER.myInternal.slice(-2,-1)[0];
  const lastCli    = TRAINER.myClient.slice(-1)[0];
  const prevCli    = TRAINER.myClient.slice(-2,-1)[0];
  const lastGrade  = MY_GRADES_BY_MONTH[MY_GRADES_BY_MONTH.length-1];
  const selGrade   = MY_GRADES_BY_MONTH[selectedGrade];

  const displayedRisk   = showAllRisk ? MY_CLIENTS : MY_CLIENTS.slice(0,5);
  const avgReviewRating = (MY_REVIEWS.reduce((a,r)=>a+r.rating,0)/MY_REVIEWS.length).toFixed(1);

  const TABS = [
    { id:"overview", label:"Overview"       },
    { id:"grades",   label:"My Grades"      },
    { id:"risk",     label:"Clients at Risk"},
    { id:"reviews",  label:"My Reviews"     },
  ];

  return (
    <div className="rt-page">
      <Toast msg={toast.msg} show={toast.show}/>

      {/* ── HERO ── */}
      <div className="rt-hero">
        <div className="rt-hero-cover" style={{backgroundImage:`url(${TRAINER.coverImg})`}}/>
        <div className="rt-hero-tint"/>
        <div className="rt-hero-body">
          {/* Avatar col */}
          <div className="rt-hero-left">
            <div className="rt-hero-avatar-ring">
              <img src={TRAINER.img} alt={TRAINER.name} className="rt-hero-avatar"/>
            </div>
            <div className="rt-trainer-badge">Trainer</div>
          </div>

          {/* Copy col */}
          <div className="rt-hero-copy">
            <p className="rt-hero-eyebrow">B.A.D People Fitness · Trainer Dashboard</p>
            <h1 className="rt-hero-name">{TRAINER.name}</h1>
            <p className="rt-hero-title">{TRAINER.title}</p>
            <p className="rt-hero-bio">{TRAINER.bio}</p>
            <div className="rt-hero-tags">
              {TRAINER.specs.map(s=><span key={s} className="rt-tag">{s}</span>)}
            </div>
            <div className="rt-hero-meta">
              <div><span>Since</span><strong>{TRAINER.since}</strong></div>
              <div><span>Experience</span><strong>{TRAINER.exp}</strong></div>
              <div><span>Clients</span><strong>{TRAINER.clients}</strong></div>
              <div><span>Active</span><strong>{TRAINER.active}</strong></div>
            </div>
            <blockquote className="rt-hero-quote">"{TRAINER.quote}"</blockquote>
          </div>

          {/* KPI col */}
          <div className="rt-hero-kpis">
            <div className="rt-hero-kpi">
              <span className="rt-hero-kpi-val" style={{color:gradeCol(intAvg/10)}}>{intAvg}%</span>
              <span>Internal Rating</span>
            </div>
            <div className="rt-hero-kpi">
              <span className="rt-hero-kpi-val" style={{color:"#22C55E"}}>{cliAvg}/5</span>
              <span>Client Rating</span>
            </div>
            <div className="rt-hero-kpi">
              <span className="rt-hero-kpi-val" style={{color:"#F26522"}}>{overall}</span>
              <span>Overall Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div className="rt-tab-bar">
        <div className="rt-tab-inner">
          {TABS.map(t=>(
            <button key={t.id}
              className={`rt-tab${activeTab===t.id?" rt-tab--on":""}`}
              onClick={()=>setActiveTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="rt-main">

        {/* ═══ OVERVIEW ═══ */}
        {activeTab==="overview" && (
          <div className="rt-tab-content">

            {/* KPI strip */}
            <div className="rt-kpi-strip">
              {[
                { val:intAvg+"%",         lbl:"Avg Internal Rating",   col:gradeCol(intAvg/10) },
                { val:cliAvg+"/5",        lbl:"Avg Client Rating",     col:"#22C55E"            },
                { val:overall,            lbl:"Overall Score",          col:"#F26522"            },
                { val:TRAINER.active,     lbl:"Active Clients",         col:"#F26522"            },
                { val:MY_REVIEWS.length,  lbl:"Total Reviews",          col:"#F26522"            },
                { val:lastGrade.internal+"%", lbl:"Latest Grade",       col:gradeCol(lastGrade.internal/10) },
              ].map((k,i)=>(
                <div key={i} className="rt-kpi-card">
                  <span className="rt-kpi-val" style={{color:k.col}}>{k.val}</span>
                  <span className="rt-kpi-lbl">{k.lbl}</span>
                </div>
              ))}
            </div>

            {/* Performance chart + quick grade snapshot */}
            <div className="rt-two-col">
              <div className="rt-panel">
                <div className="rt-panel-hdr">
                  <h3>My Performance — Jan–Nov</h3>
                  <div className="rt-chart-legend">
                    <span><span className="rt-leg-dot rt-leg-dot--orange"/>Internal %</span>
                    <span><span className="rt-leg-dot rt-leg-dot--green"/>Client ×20</span>
                  </div>
                </div>
                <div className="rt-chart-wrap">
                  <PerfChart internalArr={TRAINER.myInternal} clientArr={TRAINER.myClient}/>
                </div>
              </div>

              <div className="rt-panel">
                <div className="rt-panel-hdr"><h3>This Month at a Glance</h3></div>
                <div className="rt-snapshot-list">
                  {[
                    { label:"Internal Rating",  val:lastInt+"%",    prev:prevInt+"%",   up:lastInt>=prevInt,  col:gradeCol(lastInt/10) },
                    { label:"Client Rating",    val:lastCli+"/5",   prev:prevCli+"/5",  up:lastCli>=prevCli,  col:"#22C55E"           },
                    { label:"Latest Grade",     val:(lastGrade.internal/10).toFixed(1)+"/10", prev:lastGrade.internal+"%", up:true, col:gradeCol(lastGrade.internal/10) },
                    { label:"Active Clients",   val:TRAINER.active, prev:"of "+TRAINER.clients,up:null, col:"#F26522"              },
                  ].map((s,i)=>(
                    <div key={i} className="rt-snapshot-row">
                      <span className="rt-snapshot-label">{s.label}</span>
                      <div className="rt-snapshot-right">
                        <span className="rt-snapshot-val" style={{color:s.col}}>{s.val}</span>
                        {s.up!==null
                          ? <span className={`rt-snapshot-trend${s.up?" rt-trend-up":" rt-trend-dn"}`}>
                              {s.up?<Ico.up/>:<Ico.down/>} {s.prev}
                            </span>
                          : <span className="rt-snapshot-sub">{s.prev}</span>
                        }
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mini bar chart of my internal history */}
                <div className="rt-panel-hdr" style={{marginTop:20}}><h3>Internal Rating Trend</h3></div>
                <div className="rt-mini-bar-strip">
                  {MY_GRADES_BY_MONTH.map((g,i)=>{
                    const c   = gradeCol(g.internal/10);
                    const pct = g.internal;
                    return (
                      <div key={i} className="rt-mini-bar-col">
                        <div className="rt-mini-bar-fill" style={{height:`${(pct-60)*3}px`,background:c}}/>
                        <span className="rt-mini-bar-label" style={{color:c}}>{g.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent clients preview */}
            <div className="rt-panel">
              <div className="rt-panel-hdr">
                <h3>My Clients</h3>
                <button className="rt-tab-link" onClick={()=>setActiveTab("risk")}>
                  View At-Risk <Ico.arrow/>
                </button>
              </div>
              <div className="rt-clients-preview">
                {MY_CLIENTS.map(c=>{
                  const rc = {"high":"#EF4444","medium":"#F59E0B","low":"#22C55E"}[c.risk];
                  return (
                    <div key={c.id} className="rt-client-row">
                      <img src={c.img} alt={c.name} className="rt-client-avatar"/>
                      <div className="rt-client-info">
                        <span className="rt-client-name">{c.name}</span>
                        <span className="rt-client-goal">{c.goal}</span>
                      </div>
                      <div className="rt-client-bar-col">
                        <div className="rt-client-bar-wrap">
                          <div className="rt-client-bar" style={{width:`${c.attendance}%`,background:rc}}/>
                        </div>
                        <span className="rt-client-pct" style={{color:rc}}>{c.attendance}%</span>
                      </div>
                      <span className="rt-client-risk-dot" style={{background:rc}} title={c.risk}/>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══ MY GRADES (read-only) ═══ */}
        {activeTab==="grades" && (
          <div className="rt-tab-content">
            <div className="rt-section-intro">
              <h2 className="rt-section-title">My Internal Grades</h2>
              <p className="rt-section-sub">Grades submitted by your senior trainer and management each month. Grades are read-only — speak to your senior trainer about any queries.</p>
            </div>

            {/* Month selector tiles */}
            <div className="rt-panel">
              <div className="rt-panel-hdr">
                <h3>Select a Month</h3>
                <div className="rt-grade-key">
                  <span><span className="rt-key-dot" style={{background:"#22C55E"}}/>≥ 8.5 Excellent</span>
                  <span><span className="rt-key-dot" style={{background:"#F59E0B"}}/>6–8.4 Good</span>
                  <span><span className="rt-key-dot" style={{background:"#EF4444"}}/>Below 6</span>
                </div>
              </div>
              <div className="rt-grade-tiles">
                {MY_GRADES_BY_MONTH.map((g,i)=>(
                  <GradeHistoryCard
                    key={i} entry={g}
                    isSelected={selectedGrade===i}
                    onClick={()=>setSelectedGrade(i)}
                  />
                ))}
              </div>
            </div>

            {/* Selected month detail */}
            {selGrade && (
              <div className="rt-grade-detail-grid">
                {/* Criteria breakdown */}
                <div className="rt-panel">
                  <div className="rt-panel-hdr">
                    <h3>{selGrade.month} 2025–26 — Breakdown</h3>
                    <div>
                      <span className="rt-grade-overall-val" style={{color:gradeCol(selGrade.internal/10)}}>
                        {(selGrade.internal/10).toFixed(1)}/10
                      </span>
                      <span className="rt-grade-overall-pct" style={{color:gradeCol(selGrade.internal/10)}}>
                        {selGrade.internal}%
                      </span>
                    </div>
                  </div>
                  <div className="rt-crit-bars">
                    {CRITERIA_LABELS.map(c=>{
                      const v  = selGrade.criteria[c.key];
                      const cc = gradeCol(v>=8.5?9:v>=6?7:4);
                      return (
                        <div key={c.key} className="rt-crit-row">
                          <span className="rt-crit-icon">{c.icon}</span>
                          <span className="rt-crit-label">{c.label}</span>
                          <div className="rt-crit-bar-track">
                            <div className="rt-crit-bar-fill" style={{width:`${v*10}%`,background:cc}}/>
                          </div>
                          <span className="rt-crit-val" style={{color:cc}}>{v.toFixed(1)}</span>
                          <StarRow score={v} size="xs"/>
                        </div>
                      );
                    })}
                  </div>

                  {selGrade.notes && (
                    <div className="rt-grade-notes">
                      <span className="rt-grade-notes-label">Trainer Notes</span>
                      <p>"{selGrade.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Summary card */}
                <div className="rt-panel rt-grade-summary-panel">
                  <div className="rt-grade-ring-wrap">
                    <svg viewBox="0 0 80 80" className="rt-ring-svg">
                      <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
                      <circle cx="40" cy="40" r="30" fill="none"
                        stroke={gradeCol(selGrade.internal/10)} strokeWidth="6"
                        strokeDasharray={`${(selGrade.internal/100)*188.5} 188.5`}
                        strokeLinecap="round" transform="rotate(-90 40 40)"
                        style={{transition:"stroke-dasharray 0.4s ease"}}/>
                      <text x="40" y="37" textAnchor="middle" fill={gradeCol(selGrade.internal/10)} fontSize="12" fontFamily="Bebas Neue" letterSpacing="1">
                        {(selGrade.internal/10).toFixed(1)}
                      </text>
                      <text x="40" y="49" textAnchor="middle" fill={gradeCol(selGrade.internal/10)} fontSize="8" fontFamily="Barlow Condensed" fontWeight="700">
                        {selGrade.internal}%
                      </text>
                    </svg>
                  </div>
                  <div className="rt-grade-summary-info">
                    <span className="rt-grade-summary-month">{selGrade.month} 2025–26</span>
                    <span className="rt-grade-summary-score" style={{color:gradeCol(selGrade.internal/10)}}>
                      {(selGrade.internal/10).toFixed(2)} / 10
                    </span>
                    <span className="rt-grade-summary-label" style={{color:gradeCol(selGrade.internal/10)}}>
                      {gradeLbl(selGrade.internal/10)}
                    </span>
                    <StarRow score={selGrade.internal/10} size="md"/>
                  </div>
                  {/* All months mini summary */}
                  <div className="rt-grade-all-months">
                    <span className="rt-grade-all-months-title">All Months</span>
                    {MY_GRADES_BY_MONTH.map((g,i)=>(
                      <div key={i}
                        className={`rt-grade-month-row${selectedGrade===i?" rt-grade-month-row--active":""}`}
                        onClick={()=>setSelectedGrade(i)}>
                        <span>{g.month}</span>
                        <span style={{color:gradeCol(g.internal/10)}}>{(g.internal/10).toFixed(1)}</span>
                        <div className="rt-gm-bar-track">
                          <div className="rt-gm-bar-fill" style={{width:`${g.internal}%`,background:gradeCol(g.internal/10)}}/>
                        </div>
                        <span style={{color:gradeCol(g.internal/10)}}>{g.internal}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ CLIENTS AT RISK ═══ */}
        {activeTab==="risk" && (
          <div className="rt-tab-content">
            <div className="rt-section-intro">
              <h2 className="rt-section-title">Clients at Risk</h2>
              <p className="rt-section-sub">
                Your clients showing warning signs. You can request a transfer to another trainer. If a client needs senior intervention, flag it to your senior trainer.
              </p>
            </div>

            {/* Summary counts */}
            <div className="rt-risk-summary">
              {["high","medium","low"].map(level=>{
                const cnt = MY_CLIENTS.filter(c=>c.risk===level).length;
                const rc  = {"high":"#EF4444","medium":"#F59E0B","low":"#22C55E"}[level];
                const rl  = {"high":"High Risk","medium":"Moderate","low":"Low Risk"}[level];
                return (
                  <div key={level} className="rt-risk-sum-item" style={{borderTopColor:rc}}>
                    <span className="rt-risk-sum-val" style={{color:rc}}>{cnt}</span>
                    <span>{rl}</span>
                  </div>
                );
              })}
            </div>

            <div className="rt-risk-grid">
              {displayedRisk.map(c=>(
                <RiskCard
                  key={c.id} client={c}
                  transfers={transfers}
                  onTransfer={(id,name)=>{ setTransfers(p=>[...p,{clientId:id,clientName:name}]); showToast(`Transfer request sent for ${name}`); }}
                />
              ))}
            </div>

            {MY_CLIENTS.length > 5 && (
              <button className="rt-view-more" onClick={()=>setShowAllRisk(v=>!v)}>
                {showAllRisk?"Show Less":`View All ${MY_CLIENTS.length} Clients`}
              </button>
            )}
          </div>
        )}

        {/* ═══ REVIEWS ═══ */}
        {activeTab==="reviews" && (
          <div className="rt-tab-content">
            <div className="rt-section-intro">
              <h2 className="rt-section-title">My Reviews</h2>
              <p className="rt-section-sub">Public client reviews submitted about your training sessions and coaching style.</p>
            </div>

            {/* Overview score */}
            <div className="rt-reviews-overview">
              <div className="rt-reviews-score-block">
                <span className="rt-reviews-big-num">{avgReviewRating}</span>
                <div>
                  <div className="rt-reviews-big-stars">
                    {[1,2,3,4,5].map(i=>(
                      <span key={i} style={{color:i<=Math.round(parseFloat(avgReviewRating))?"#F59E0B":"rgba(255,255,255,0.12)",fontSize:24}}>★</span>
                    ))}
                  </div>
                  <span className="rt-reviews-count">{MY_REVIEWS.length} verified reviews</span>
                </div>
              </div>
              {/* Rating distribution */}
              <div className="rt-reviews-dist">
                {[5,4,3,2,1].map(star=>{
                  const cnt = MY_REVIEWS.filter(r=>r.rating===star).length;
                  const pct = MY_REVIEWS.length ? Math.round((cnt/MY_REVIEWS.length)*100) : 0;
                  return (
                    <div key={star} className="rt-dist-row">
                      <span className="rt-dist-star">{star} ★</span>
                      <div className="rt-dist-bar-wrap">
                        <div className="rt-dist-bar" style={{width:`${pct}%`}}/>
                      </div>
                      <span className="rt-dist-count">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rt-reviews-grid">
              {MY_REVIEWS.map(r=><ReviewCard key={r.id} r={r}/>)}
            </div>
          </div>
        )}

      </div>

      {/* ── MARQUEE ── */}
      <div className="rt-marquee">
        <div className="rt-marquee-inner">
          {["FORGE YOUR LEGACY","✦","ELITE COACHING","✦","REAL RESULTS","✦","B.A.D PEOPLE FITNESS","✦","FORGE YOUR LEGACY","✦","ELITE COACHING","✦","REAL RESULTS","✦","B.A.D PEOPLE FITNESS","✦"].map((t,i)=>(
            <span key={i} className={t==="✦"?"rt-mq-sep":"rt-mq-text"}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}