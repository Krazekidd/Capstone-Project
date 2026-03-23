import React, { useEffect, useState } from 'react';
import '.Admin.css'; 

const Admin = () => {
  // ═══════════════════════════════════════════
  // DATA
  // ═══════════════════════════════════════════
  const [trainers, setTrainers] = useState([
    { id: 1, name: 'Marcus Steel', title: 'Senior Performance Trainer', img: 'https://randomuser.me/api/portraits/men/32.jpg', scores: { perf: 8.5, motiv: 9, interact: 8 } },
    { id: 2, name: 'Jordan Park', title: 'Senior Trainer', img: 'https://randomuser.me/api/portraits/men/45.jpg', scores: { perf: 7, motiv: 6.5, interact: 7 } },
    { id: 3, name: 'Aisha Brown', title: 'Head Coach', img: 'https://randomuser.me/api/portraits/women/44.jpg', scores: { perf: 9, motiv: 9.5, interact: 9 } },
    { id: 4, name: 'Leo Vasquez', title: 'Trainer', img: 'https://randomuser.me/api/portraits/men/67.jpg', scores: { perf: 5, motiv: 5.5, interact: 6 } },
  ]);

  const [assessHistory, setAssessHistory] = useState([
    { trainer: 'Marcus Steel', perf: 8.5, motiv: 9, interact: 8, avg: 8.5, standing: 'Excellent', date: 'Feb 28 2026' },
    { trainer: 'Jordan Park', perf: 7, motiv: 6.5, interact: 7, avg: 6.8, standing: 'Good', date: 'Feb 25 2026' },
    { trainer: 'Aisha Brown', perf: 9, motiv: 9.5, interact: 9, avg: 9.2, standing: 'Excellent', date: 'Feb 20 2026' },
    { trainer: 'Leo Vasquez', perf: 5, motiv: 5.5, interact: 6, avg: 5.5, standing: 'Warning', date: 'Feb 18 2026' },
  ]);

  const [reviewsAll, setReviewsAll] = useState([
    { client: 'Jennifer K.', trainer: 'Marcus Steel', stars: 5, type: 'public', date: 'Mar 2 2026', text: 'Marcus completely transformed my approach. Energy is unmatched!' },
    { client: 'David R.', trainer: 'Marcus Steel', stars: 4, type: 'private', date: 'Mar 1 2026', text: 'Great trainer but sometimes sessions overrun by 15 minutes.' },
    { client: 'Alicia M.', trainer: 'Aisha Brown', stars: 5, type: 'public', date: 'Feb 28 2026', text: 'Best coach I have ever had. Truly changed my life.' },
    { client: 'Tom H.', trainer: 'Jordan Park', stars: 3, type: 'private', date: 'Feb 27 2026', text: 'Needs to show more enthusiasm during sessions. Feels disengaged sometimes.' },
    { client: 'Priya N.', trainer: 'Aisha Brown', stars: 5, type: 'public', date: 'Feb 25 2026', text: 'I lost 18 pounds in 2 months following Aisha\'s nutrition advice!' },
    { client: 'Kevin M.', trainer: 'Marcus Steel', stars: 4, type: 'public', date: 'Feb 20 2026', text: 'Great technique coaching. My deadlift is at an all-time high.' },
    { client: 'Nina L.', trainer: 'Leo Vasquez', stars: 2, type: 'private', date: 'Feb 18 2026', text: 'Often late to sessions and doesn\'t seem prepared. Disappointed.' },
    { client: 'Chris P.', trainer: 'Jordan Park', stars: 3, type: 'public', date: 'Feb 15 2026', text: 'Decent trainer, but not very responsive to messages between sessions.' },
  ]);

  const [purchases, setPurchases] = useState([
    { id: 1, date: '2026-03-01', client: 'Jennifer K.', item: 'Monthly Membership', cat: 'Membership', qty: 1, price: 120, status: 'Paid' },
    { id: 2, date: '2026-03-02', client: 'David R.', item: 'Personal Training x10', cat: 'PT Package', qty: 10, price: 55, status: 'Paid' },
    { id: 3, date: '2026-03-03', client: 'Alicia M.', item: 'Protein Powder', cat: 'Supplement', qty: 2, price: 45, status: 'Paid' },
    { id: 4, date: '2026-03-04', client: 'Tom H.', item: 'Monthly Membership', cat: 'Membership', qty: 1, price: 120, status: 'Pending' },
    { id: 5, date: '2026-03-04', client: 'Kevin M.', item: 'Nutrition Plan (3mo)', cat: 'Nutrition', qty: 1, price: 180, status: 'Paid' },
    { id: 6, date: '2026-03-05', client: 'Priya N.', item: 'Gym Gloves', cat: 'Equipment', qty: 1, price: 28, status: 'Pending' },
    { id: 7, date: '2026-03-05', client: 'Leo M.', item: 'Monthly Membership', cat: 'Membership', qty: 1, price: 120, status: 'Paid' },
  ]);

  const [equipment, setEquipment] = useState([
    { id: 1, name: 'Treadmill #1', cat: 'Cardio', rating: 5 }, { id: 2, name: 'Treadmill #2', cat: 'Cardio', rating: 2 },
    { id: 3, name: 'Rowing Machine', cat: 'Cardio', rating: 4 }, { id: 4, name: 'Bench Press Rack A', cat: 'Strength', rating: 5 },
    { id: 5, name: 'Bench Press Rack B', cat: 'Strength', rating: 3 }, { id: 6, name: 'Cable Machine', cat: 'Machines', rating: 2 },
    { id: 7, name: 'Dumbbells 5–50kg', cat: 'Free Weights', rating: 4 }, { id: 8, name: 'Squat Rack', cat: 'Strength', rating: 5 },
    { id: 9, name: 'Yoga Mats', cat: 'Flexibility', rating: 3 }, { id: 10, name: 'Spin Bikes', cat: 'Cardio', rating: 1 },
  ]);

  const [priorityManual, setPriorityManual] = useState([
    { name: 'Resistance Bands (new set)', note: 'Old ones snapping — safety hazard' },
  ]);

  const [clients, setClients] = useState([
    { name: 'Jennifer K.', status: 'Active', joined: 'Jan 2025', trainer: 'Marcus Steel', plan: 'Premium', last: 'Mar 3 2026', progress: 82 },
    { name: 'David R.', status: 'Active', joined: 'Mar 2025', trainer: 'Marcus Steel', plan: 'Standard', last: 'Mar 2 2026', progress: 65 },
    { name: 'Alicia M.', status: 'New', joined: 'Mar 2026', trainer: 'Aisha Brown', plan: 'Premium', last: 'Mar 4 2026', progress: 20 },
    { name: 'Tom H.', status: 'Inactive', joined: 'Jun 2024', trainer: 'Jordan Park', plan: 'Standard', last: 'Jan 10 2026', progress: 31 },
    { name: 'Kevin M.', status: 'Active', joined: 'Sep 2024', trainer: 'Marcus Steel', plan: 'Premium', last: 'Mar 1 2026', progress: 75 },
    { name: 'Priya N.', status: 'Active', joined: 'Nov 2024', trainer: 'Aisha Brown', plan: 'Standard', last: 'Feb 28 2026', progress: 58 },
    { name: 'Omar J.', status: 'Inactive', joined: 'Feb 2024', trainer: 'Leo Vasquez', plan: 'Basic', last: 'Dec 5 2025', progress: 18 },
    { name: 'Nina L.', status: 'New', joined: 'Mar 2026', trainer: 'Leo Vasquez', plan: 'Basic', last: 'Mar 3 2026', progress: 10 },
  ]);

  const [excursions, setExcursions] = useState([
    { icon: '🏔️', title: 'Mountain Hike Challenge', date: 'Mar 22 2026', location: 'Blue Mountains', cap: 20, enrolled: 14, price: 45, desc: 'A full-day guided hike with nutrition breaks and team challenges.' },
    { icon: '🏖️', title: 'Beach Workout & Swim', date: 'Apr 5 2026', location: 'Sunset Bay', cap: 30, enrolled: 22, price: 25, desc: 'Outdoor bootcamp on the beach followed by a group swim session.' },
    { icon: '🚴', title: 'Cycling Tour', date: 'Apr 19 2026', location: 'National Park Trail', cap: 15, enrolled: 8, price: 60, desc: '30km scenic cycling route with rest stops. All levels welcome.' },
  ]);

  const [birthdays, setBirthdays] = useState([
    { name: 'Jennifer K.', bday: 'Mar 4', daysLeft: 0 }, { name: 'Kevin M.', bday: 'Mar 9', daysLeft: 5 },
    { name: 'Nina L.', bday: 'Mar 12', daysLeft: 8 }, { name: 'David R.', bday: 'Mar 18', daysLeft: 14 },
    { name: 'Chris P.', bday: 'Mar 22', daysLeft: 18 }, { name: 'Alicia M.', bday: 'Mar 29', daysLeft: 25 },
  ]);

  const [schedule, setSchedule] = useState([
    { type: 'Nutrition', date: 'Mar 4 2026', time: '09:00', dur: '60 min', client: 'Jennifer K.', trainer: 'Dr. Nadia Cole', notes: 'Post-competition meal plan review' },
    { type: 'Consultation', date: 'Mar 4 2026', time: '10:30', dur: '45 min', client: 'Tom H.', trainer: 'Marcus Steel', notes: 'Re-engagement session' },
    { type: 'Training', date: 'Mar 4 2026', time: '12:00', dur: '60 min', client: 'Kevin M.', trainer: 'Marcus Steel', notes: 'Strength assessment' },
    { type: 'Nutrition', date: 'Mar 5 2026', time: '09:00', dur: '30 min', client: 'Omar J.', trainer: 'Dr. Nadia Cole', notes: 'Initial diet consult' },
    { type: 'Consultation', date: 'Mar 5 2026', time: '11:00', dur: '60 min', client: 'Nina L.', trainer: 'Aisha Brown', notes: 'Goal setting — new member' },
    { type: 'Training', date: 'Mar 6 2026', time: '07:00', dur: '90 min', client: 'Priya N.', trainer: 'Aisha Brown', notes: 'HIIT + core session' },
  ]);

  const [orders, setOrders] = useState([
    { id: 'ORD-1042', client: 'David R.', phone: '876-555-1234', items: 'Protein Powder x2, Shaker', amount: 98, date: 'Mar 3 2026', note: 'Call ahead — client works mornings' },
    { id: 'ORD-1044', client: 'Priya N.', phone: '876-555-5678', items: 'Gym Gloves, Resistance Band Set', amount: 56, date: 'Mar 4 2026', note: 'Preferred pickup: after 5pm' },
    { id: 'ORD-1046', client: 'Omar J.', phone: '876-555-9012', items: 'Monthly Supplement Pack', amount: 145, date: 'Mar 4 2026', note: '' },
  ]);

  const [orderHistory, setOrderHistory] = useState([
    { id: 'ORD-1039', client: 'Jennifer K.', items: 'Gym Bag', amount: 75, status: 'Collected', date: 'Feb 28 2026' },
    { id: 'ORD-1040', client: 'Alicia M.', items: 'Yoga Mat, Water Bottle', amount: 48, status: 'Collected', date: 'Mar 1 2026' },
    { id: 'ORD-1041', client: 'Kevin M.', items: 'Creatine, Pre-workout', amount: 110, status: 'Collected', date: 'Mar 2 2026' },
    ...orders.map(o => ({ id: o.id, client: o.client, items: o.items, amount: o.amount, status: 'Pending', date: o.date })),
  ]);

  // ═══════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [topbarTitle, setTopbarTitle] = useState('DASHBOARD');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [toastMessage, setToastMessage] = useState({ show: false, text: '' });

  // Modal states
  const [trainerAssessModalOpen, setTrainerAssessModalOpen] = useState(false);
  const [addEquipModalOpen, setAddEquipModalOpen] = useState(false);
  const [addPriorityModalOpen, setAddPriorityModalOpen] = useState(false);
  const [addExcursionModalOpen, setAddExcursionModalOpen] = useState(false);
  const [addSessionModalOpen, setAddSessionModalOpen] = useState(false);

  // Trainer assessment
  const [currentAssessTrainer, setCurrentAssessTrainer] = useState(null);
  const [assessScores, setAssessScores] = useState({ perf: 8, motiv: 8, interact: 8, knowledge: 8, punctuality: 8 });

  // Filters
  const [reviewFilter, setReviewFilter] = useState('all');
  const [reviewTrainerFilter, setReviewTrainerFilter] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [clientStatusFilter, setClientStatusFilter] = useState('');
  const [scheduleFilter, setScheduleFilter] = useState('all');

  // New item forms
  const [newEquip, setNewEquip] = useState({ name: '', cat: 'Cardio', rating: 3 });
  const [newPriority, setNewPriority] = useState({ name: '', note: '' });
  const [newExcursion, setNewExcursion] = useState({ title: '', date: '', location: '', cap: 20, desc: '', price: 0, icon: '🏔️' });
  const [newSession, setNewSession] = useState({ type: 'Nutrition', date: '', time: '09:00', dur: '60 min', client: '', trainer: '', notes: '' });
  const [bdayMessage, setBdayMessage] = useState('Happy Birthday! 🎉 We\'re so glad you\'re part of the GymPro family. Enjoy a complimentary session on us this month!');
  const [bdaySent, setBdaySent] = useState(false);

  const assessCats = [
    { k: 'perf', l: 'Performance & Results' },
    { k: 'motiv', l: 'Motivation & Energy' },
    { k: 'interact', l: 'Client Interaction' },
    { k: 'knowledge', l: 'Technical Knowledge' },
    { k: 'punctuality', l: 'Punctuality' }
  ];

  const pageTitles = {
    dashboard: 'DASHBOARD', trainers: 'TRAINER ASSESSMENTS', reviews: 'CLIENT REVIEWS',
    purchases: 'PURCHASES & SALES', equipment: 'EQUIPMENT RATINGS', clients: 'CLIENT OVERVIEW',
    excursions: 'EXCURSIONS', birthdays: 'BIRTHDAYS', schedule: 'SESSIONS SCHEDULE', orders: 'ORDER PICKUPS'
  };

  // ═══════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Render based on current page
    switch (currentPage) {
      case 'trainers':
        
        break;
      case 'reviews':
        
        break;
      case 'purchases':
      
        break;
      case 'equipment':
        
        break;
      case 'clients':
        
        break;
      case 'excursions':
        
        break;
      case 'birthdays':
        
        break;
      case 'schedule':
        
        break;
      case 'orders':
        
        break;
      case 'dashboard':
      default:
        
        break;
    }
  }, [currentPage]);

  // ═══════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════
  const showToast = (msg) => {
    setToastMessage({ show: true, text: msg });
    setTimeout(() => setToastMessage({ show: false, text: '' }), 2800);
  };

  const avg = (...v) => (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1);

  const getStanding = (a) => {
    a = parseFloat(a);
    if (a >= 8.5) return { cls: 'badge-green', label: 'EXCELLENT' };
    if (a >= 7) return { cls: 'badge-cyan', label: 'GOOD' };
    if (a >= 5) return { cls: 'badge-orange', label: 'WARNING' };
    return { cls: 'badge-red', label: 'CRITICAL' };
  };

  const stars = (n, max = 5) => '★'.repeat(n) + '☆'.repeat(max - n);

  const seTypeBadge = (t) => t === 'Nutrition' ? 'badge-green' : t === 'Consultation' ? 'badge-cyan' : 'badge-purple';

  // ═══════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════
  const nav = (page) => {
    setCurrentPage(page);
    setTopbarTitle(pageTitles[page] || page.toUpperCase());
  };

  // ═══════════════════════════════════════════
  // TRAINERS
  // ═══════════════════════════════════════════
  const openTrainerAssess = (id) => {
    const t = trainers.find(x => x.id === id);
    setCurrentAssessTrainer(t);
    setAssessScores({
      perf: t.scores.perf,
      motiv: t.scores.motiv,
      interact: t.scores.interact,
      knowledge: 8,
      punctuality: 8
    });
    setTrainerAssessModalOpen(true);
  };

  const updateAssessScore = (k, v) => {
    setAssessScores(prev => ({ ...prev, [k]: parseFloat(v) }));
  };

  const calcAssessAvg = () => {
    const vals = assessCats.map(c => assessScores[c.k]);
    return (vals.reduce((x, y) => x + y, 0) / vals.length).toFixed(1);
  };

  const submitTrainerAssess = () => {
    const a = calcAssessAvg();
    const s = getStanding(a);
    const t = currentAssessTrainer;

    // Update trainer scores
    setTrainers(prev => prev.map(trainer =>
      trainer.id === t.id
        ? {
          ...trainer,
          scores: {
            perf: assessScores.perf,
            motiv: assessScores.motiv,
            interact: assessScores.interact
          }
        }
        : trainer
    ));

    // Add to history
    setAssessHistory(prev => [{
      trainer: t.name,
      perf: assessScores.perf,
      motiv: assessScores.motiv,
      interact: assessScores.interact,
      avg: a,
      standing: s.label,
      date: new Date().toDateString()
    }, ...prev]);

    setTrainerAssessModalOpen(false);
    showToast(`Assessment for ${t.name} saved — Avg: ${a}`);
  };

  // ═══════════════════════════════════════════
  // REVIEWS
  // ═══════════════════════════════════════════
  const filteredReviews = () => {
    let rv = [...reviewsAll].sort((a, b) => new Date(b.date) - new Date(a.date));
    if (reviewFilter !== 'all') rv = rv.filter(r => r.type === reviewFilter);
    if (reviewTrainerFilter) rv = rv.filter(r => r.trainer === reviewTrainerFilter);
    return rv;
  };

  // ═══════════════════════════════════════════
  // PURCHASES
  // ═══════════════════════════════════════════
  const editPurchase = (i, k, v) => {
    v = v.replace('$', '').trim();
    setPurchases(prev => {
      const updated = [...prev];
      updated[i][k] = (k === 'qty' || k === 'price') ? (parseFloat(v) || prev[i][k]) : v;
      return updated;
    });
  };

  const deletePurchase = (i) => {
    setPurchases(prev => prev.filter((_, idx) => idx !== i));
    showToast('Row deleted');
  };

  const addPurchaseRow = () => {
    setPurchases(prev => [...prev, {
      id: prev.length + 1,
      date: new Date().toISOString().slice(0, 10),
      client: 'New Client',
      item: 'Item',
      cat: 'Misc',
      qty: 1,
      price: 0,
      status: 'Pending'
    }]);
    showToast('Row added — click cells to edit');
  };

  const calcTotals = () => {
    const total = purchases.reduce((s, p) => s + (p.qty * p.price), 0);
    const pending = purchases.filter(p => p.status === 'Pending').reduce((s, p) => s + (p.qty * p.price), 0);
    return { total, pending, count: purchases.length };
  };

  const exportCSV = () => {
    const rows = [['Date', 'Client', 'Item', 'Category', 'Qty', 'Price', 'Total', 'Status'],
    ...purchases.map(p => [p.date, p.client, p.item, p.cat, p.qty, '$' + p.price, '$' + (p.qty * p.price).toFixed(2), p.status])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'purchases.csv';
    a.click();
    showToast('CSV exported!');
  };

  // ═══════════════════════════════════════════
  // EQUIPMENT
  // ═══════════════════════════════════════════
  const rateEquip = (id, rating) => {
    setEquipment(prev => prev.map(e => e.id === id ? { ...e, rating } : e));
    const e = equipment.find(x => x.id === id);
    if (rating < 4) showToast(`${e.name} flagged for replacement`);
  };

  const addEquipItem = () => {
    if (!newEquip.name.trim()) return;
    setEquipment(prev => [...prev, {
      id: Date.now(),
      name: newEquip.name,
      cat: newEquip.cat,
      rating: newEquip.rating
    }]);
    setAddEquipModalOpen(false);
    setNewEquip({ name: '', cat: 'Cardio', rating: 3 });
    showToast('Equipment added');
  };

  const addPriorityItem = () => {
    if (!newPriority.name.trim()) return;
    setPriorityManual(prev => [...prev, {
      name: newPriority.name,
      note: newPriority.note || 'Manually added'
    }]);
    setAddPriorityModalOpen(false);
    setNewPriority({ name: '', note: '' });
    showToast('Added to priority list');
  };

  const removePriority = (i) => {
    setPriorityManual(prev => prev.filter((_, idx) => idx !== i));
  };

  const priorityItems = () => {
    const below = equipment.filter(e => e.rating < 4);
    return [...below.map(e => ({ name: e.name, note: `Rated ${e.rating}/5`, manual: false })), ...priorityManual.map(p => ({ ...p, manual: true }))];
  };

  // ═══════════════════════════════════════════
  // CLIENTS
  // ═══════════════════════════════════════════
  const filteredClients = () => {
    let filtered = clients;
    if (clientSearch) {
      filtered = filtered.filter(c => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
    }
    if (clientStatusFilter) {
      filtered = filtered.filter(c => c.status === clientStatusFilter);
    }
    return filtered;
  };

  // ═══════════════════════════════════════════
  // EXCURSIONS
  // ═══════════════════════════════════════════
  const addExcursion = () => {
    if (!newExcursion.title.trim()) return;
    setExcursions(prev => [{
      icon: newExcursion.icon || '🏃',
      title: newExcursion.title,
      date: newExcursion.date || 'TBD',
      location: newExcursion.location || 'TBD',
      cap: parseInt(newExcursion.cap) || 20,
      enrolled: 0,
      price: parseFloat(newExcursion.price) || 0,
      desc: newExcursion.desc || ''
    }, ...prev]);
    setAddExcursionModalOpen(false);
    setNewExcursion({ title: '', date: '', location: '', cap: 20, desc: '', price: 0, icon: '🏔️' });
    showToast('Excursion published!');
  };

  const deleteExcursion = (i) => {
    setExcursions(prev => prev.filter((_, idx) => idx !== i));
    showToast('Excursion removed');
  };

  // ═══════════════════════════════════════════
  // BIRTHDAYS
  // ═══════════════════════════════════════════
  const sendBdayMsg = () => {
    setBdaySent(true);
    setTimeout(() => setBdaySent(false), 3000);
    showToast(`Birthday message sent!`);
  };

  // ═══════════════════════════════════════════
  // SCHEDULE
  // ═══════════════════════════════════════════
  const filteredSchedule = () => {
    if (scheduleFilter === 'all') return schedule;
    return schedule.filter(s => s.type === scheduleFilter);
  };

  const addSession = () => {
    if (!newSession.client.trim()) return;
    setSchedule(prev => [{
      type: newSession.type,
      date: newSession.date || 'Mar 2026',
      time: newSession.time,
      dur: newSession.dur,
      client: newSession.client,
      trainer: newSession.trainer || 'TBD',
      notes: newSession.notes
    }, ...prev]);
    setAddSessionModalOpen(false);
    setNewSession({ type: 'Nutrition', date: '', time: '09:00', dur: '60 min', client: '', trainer: '', notes: '' });
    showToast('Session scheduled!');
  };

  // ═══════════════════════════════════════════
  // ORDERS
  // ═══════════════════════════════════════════
  const markCollected = (i) => {
    const o = orders[i];
    setOrderHistory(prev => prev.map(item => item.id === o.id ? { ...item, status: 'Collected' } : item));
    setOrders(prev => prev.filter((_, idx) => idx !== i));
    showToast(`Order ${o.id} marked as collected`);
  };

  const notifyClient = (name) => {
    showToast(`Pickup notification sent to ${name}`);
  };

  // ═══════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════
  const totals = calcTotals();

  return (
    <>
      {/* SIDEBAR */}
      <nav className="sidebar">
        <div className="sidebar-logo"><span>⚡</span> GYMPRO</div>
        <div className="nav-section">Overview</div>
        <div className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`} onClick={() => nav('dashboard')}><span className="icon">🏠</span> Dashboard</div>
        <div className="nav-section">Staff</div>
        <div className={`nav-item ${currentPage === 'trainers' ? 'active' : ''}`} onClick={() => nav('trainers')}><span className="icon">👤</span> Trainer Assessments</div>
        <div className={`nav-item ${currentPage === 'reviews' ? 'active' : ''}`} onClick={() => nav('reviews')}><span className="icon">💬</span> All Reviews <span className="nav-badge">8</span></div>
        <div className="nav-section">Finance</div>
        <div className={`nav-item ${currentPage === 'purchases' ? 'active' : ''}`} onClick={() => nav('purchases')}><span className="icon">💳</span> Purchases & Sales</div>
        <div className="nav-section">Facility</div>
        <div className={`nav-item ${currentPage === 'equipment' ? 'active' : ''}`} onClick={() => nav('equipment')}><span className="icon">🏋️</span> Equipment Ratings</div>
        <div className="nav-section">Clients</div>
        <div className={`nav-item ${currentPage === 'clients' ? 'active' : ''}`} onClick={() => nav('clients')}><span className="icon">👥</span> Client Overview</div>
        <div className={`nav-item ${currentPage === 'excursions' ? 'active' : ''}`} onClick={() => nav('excursions')}><span className="icon">🏖️</span> Excursions</div>
        <div className={`nav-item ${currentPage === 'birthdays' ? 'active' : ''}`} onClick={() => nav('birthdays')}><span className="icon">🎂</span> Birthdays</div>
        <div className="nav-section">Operations</div>
        <div className={`nav-item ${currentPage === 'schedule' ? 'active' : ''}`} onClick={() => nav('schedule')}><span className="icon">📅</span> Sessions Schedule</div>
        <div className={`nav-item ${currentPage === 'orders' ? 'active' : ''}`} onClick={() => nav('orders')}><span className="icon">📦</span> Order Pickups <span className="nav-badge">3</span></div>
      </nav>

      {/* MAIN */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title" id="topbarTitle">{topbarTitle}</div>
          <div className="topbar-right">
            <div className="topbar-time" id="clock">
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div className="admin-tag">ADMIN ACCESS</div>
          </div>
        </div>

        {/* DASHBOARD */}
        {currentPage === 'dashboard' && (
          <div className="content active" id="page-dashboard">
            <div className="section-label">Command <span>Center</span></div>
            <div className="g4">
              <div className="stat-card cyan">
                <div className="stat-num" style={{ color: 'var(--cyan)' }}>47</div>
                <div className="stat-label">New Clients</div>
                <div className="stat-sub stat-up">↑ 12 this week</div>
              </div>
              <div className="stat-card green">
                <div className="stat-num" style={{ color: 'var(--green)' }}>312</div>
                <div className="stat-label">Active Clients</div>
                <div className="stat-sub stat-up">↑ 5% vs last month</div>
              </div>
              <div className="stat-card red">
                <div className="stat-num" style={{ color: 'var(--red)' }}>68</div>
                <div className="stat-label">Inactive Clients</div>
                <div className="stat-sub stat-down">↑ 3 since last week</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-num" style={{ color: 'var(--orange)' }}>$48,320</div>
                <div className="stat-label">Revenue (MTD)</div>
                <div className="stat-sub stat-up">↑ 8.4% vs March '25</div>
              </div>
            </div>
            <div className="g3">
              <div className="card">
                <div className="card-title">🚨 Pending Orders</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '36px', color: 'var(--orange)', fontWeight: 600 }}>3</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Ready for pickup</div>
                <button className="btn btn-orange" style={{ marginTop: '12px' }} onClick={() => nav('orders')}>View Orders →</button>
              </div>
              <div className="card">
                <div className="card-title">⭐ Equipment Alerts</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '36px', color: 'var(--red)', fontWeight: 600 }}>4</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Items rated below 4 — replace</div>
                <button className="btn btn-red" style={{ marginTop: '12px' }} onClick={() => nav('equipment')}>View Priority →</button>
              </div>
              <div className="card">
                <div className="card-title">🎂 Birthdays This Month</div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '36px', color: 'var(--gold)', fontWeight: 600 }}>6</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Clients celebrating in March</div>
                <button className="btn btn-ghost" style={{ marginTop: '12px' }} onClick={() => nav('birthdays')}>Send Wishes →</button>
              </div>
            </div>
            <div className="g2">
              <div className="card">
                <div className="card-title">📅 Today's Sessions</div>
                <div id="dashScheduleSnippet">
                  {schedule.slice(0, 4).map((se, idx) => (
                    <div className="schedule-item" key={idx}>
                      <div className="sched-time">{se.time}<br />{se.date.substring(0, 6)}</div>
                      <div className="sched-info">
                        <div className="sched-title">{se.client}</div>
                        <div className="sched-meta">{se.trainer} <span className={`badge ${seTypeBadge(se.type)} sched-type`}>{se.type}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">💬 Latest Reviews</div>
                <div id="dashReviewSnippet">
                  {reviewsAll.slice(0, 3).map((rv, idx) => (
                    <div className="review-item" key={idx}>
                      <div className="review-header">
                        <span className="reviewer-name">{rv.client}</span>
                        <span className="rev-stars">{stars(rv.stars)}</span>
                      </div>
                      <div className="review-text">{rv.text.substring(0, 80)}…</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRAINER ASSESSMENTS */}
        {currentPage === 'trainers' && (
          <div className="content active" id="page-trainers">
            <div className="section-label">Trainer <span>Assessments</span></div>
            <div className="g2">
              <div>
                <div className="card-title" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: '14px' }}>Click Trainer to Assess</div>
                <div id="trainerCardList">
                  {trainers.map(t => {
                    const a = avg(t.scores.perf, t.scores.motiv, t.scores.interact);
                    const s = getStanding(a);
                    return (
                      <div className="trainer-card" onClick={() => openTrainerAssess(t.id)} key={t.id}>
                        <img src={t.img} className="trainer-avatar" alt={t.name} />
                        <div className="trainer-info">
                          <div className="trainer-card-name">{t.name}</div>
                          <div className="trainer-card-sub">{t.title}</div>
                        </div>
                        <div>
                          <div className="trainer-score" style={{ color: a >= 7 ? 'var(--green)' : a >= 5 ? 'var(--orange)' : 'var(--red)' }}>{a}</div>
                          <div className={`badge ${s.cls}`} style={{ marginTop: '4px' }}>{s.label}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <div className="card">
                  <div className="card-title">📋 All Assessment History</div>
                  <div className="tbl-wrap">
                    <table id="assessHistoryTable">
                      <thead><tr><th>Trainer</th><th>Perf</th><th>Motiv</th><th>Interact</th><th>Avg</th><th>Standing</th><th>Date</th></tr></thead>
                      <tbody id="assessHistoryBody">
                        {assessHistory.map((a, idx) => {
                          const s = getStanding(a.avg);
                          return (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{a.trainer}</td>
                              <td>{a.perf}</td><td>{a.motiv}</td><td>{a.interact}</td>
                              <td style={{ fontWeight: 700, color: 'var(--cyan)' }}>{a.avg}</td>
                              <td><span className={`badge ${s.cls}`}>{a.standing}</span></td>
                              <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>{a.date}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {currentPage === 'reviews' && (
          <div className="content active" id="page-reviews">
            <div className="section-label">Client <span>Reviews</span></div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-ghost" onClick={() => setReviewFilter('all')}>All Reviews</button>
              <button className="btn btn-green" onClick={() => setReviewFilter('public')}>🌍 Public</button>
              <button className="btn btn-orange" onClick={() => setReviewFilter('private')}>🔒 Private</button>
              <div style={{ flex: 1 }}></div>
              <select
                id="reviewTrainerFilter"
                onChange={(e) => setReviewTrainerFilter(e.target.value)}
                value={reviewTrainerFilter}
                style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '7px 12px', borderRadius: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', outline: 'none' }}
              >
                <option value="">All Trainers</option>
                <option value="Marcus Steel">Marcus Steel</option>
                <option value="Jordan Park">Jordan Park</option>
                <option value="Aisha Brown">Aisha Brown</option>
              </select>
            </div>
            <div className="card">
              <div id="reviewListAdmin">
                {filteredReviews().map((r, idx) => (
                  <div className={`review-item ${r.type === 'private' ? 'review-private' : 'review-public'}`} key={idx}>
                    <div className="review-header">
                      <div className="reviewer-info">
                        <div className="reviewer-name">{r.client}</div>
                        <div className="reviewer-meta">→ {r.trainer} · {r.date}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div className="rev-stars">{stars(r.stars)}</div>
                        <span className={`badge ${r.type === 'public' ? 'badge-green' : 'badge-orange'}`}>{r.type === 'public' ? '🌍 Public' : '🔒 Private'}</span>
                      </div>
                    </div>
                    <div className="review-text">{r.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PURCHASES */}
        {currentPage === 'purchases' && (
          <div className="content active" id="page-purchases">
            <div className="section-label">Purchases <span>&amp; Sales</span></div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>Edit cells directly. Add rows with the button below.</div>
              <div style={{ flex: 1 }}></div>
              <button className="btn btn-green" onClick={exportCSV}>⬇ Export CSV</button>
              <button className="btn btn-cyan" onClick={addPurchaseRow}>+ Add Row</button>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="tbl-wrap" style={{ border: 'none' }}>
                <table id="purchasesTable">
                  <thead><tr><th>#</th><th>Date</th><th>Client</th><th>Item / Service</th><th>Category</th><th>Qty</th><th>Unit Price ($)</th><th>Total ($)</th><th>Status</th><th></th></tr></thead>
                  <tbody id="purchasesBody">
                    {purchases.map((p, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>{p.id}</td>
                        <td><span className="editable" contentEditable="true" onBlur={(e) => editPurchase(i, 'date', e.currentTarget.textContent)}>{p.date}</span></td>
                        <td><span className="editable" contentEditable="true" onBlur={(e) => editPurchase(i, 'client', e.currentTarget.textContent)}>{p.client}</span></td>
                        <td><span className="editable" contentEditable="true" onBlur={(e) => editPurchase(i, 'item', e.currentTarget.textContent)}>{p.item}</span></td>
                        <td><span className="editable" contentEditable="true" onBlur={(e) => editPurchase(i, 'cat', e.currentTarget.textContent)}>{p.cat}</span></td>
                        <td><span className="editable" contentEditable="true" onBlur={(e) => { editPurchase(i, 'qty', e.currentTarget.textContent); }}>{p.qty}</span></td>
                        <td><span className="editable" contentEditable="true" onBlur={(e) => { editPurchase(i, 'price', e.currentTarget.textContent); }}>${p.price}</span></td>
                        <td style={{ fontWeight: 600, color: 'var(--green)' }}>${(p.qty * p.price).toFixed(2)}</td>
                        <td><span className={`badge ${p.status === 'Paid' ? 'badge-green' : 'badge-orange'}`}>{p.status}</span></td>
                        <td><button className="tbl-btn del" onClick={() => deletePurchase(i)}>✕</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="g3" style={{ marginTop: '16px' }}>
              <div className="card">
                <div className="card-title">💰 Total Revenue</div>
                <div className="stat-num" style={{ color: 'var(--green)', fontSize: '32px' }}>${totals.total.toFixed(2)}</div>
              </div>
              <div className="card">
                <div className="card-title">📦 Total Transactions</div>
                <div className="stat-num" style={{ color: 'var(--cyan)', fontSize: '32px' }}>{totals.count}</div>
              </div>
              <div className="card">
                <div className="card-title">⏳ Pending Payments</div>
                <div className="stat-num" style={{ color: 'var(--orange)', fontSize: '32px' }}>${totals.pending.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* EQUIPMENT */}
        {currentPage === 'equipment' && (
          <div className="content active" id="page-equipment">
            <div className="section-label">Equipment <span>Ratings</span></div>
            <div className="g2">
              <div className="card">
                <div className="card-title">⭐ Rate Equipment (1–5 Stars)</div>
                <div id="equipList">
                  {equipment.map(e => (
                    <div className="equip-row" key={e.id}>
                      <div style={{ flex: 1 }}>
                        <div className="equip-name">{e.name}</div>
                        <div className="equip-cat">{e.cat}</div>
                      </div>
                      <div className="equip-stars-row" id={`stars_${e.id}`}>
                        {[1, 2, 3, 4, 5].map(i => (
                          <button className={`star-btn ${i <= e.rating ? 'lit' : ''}`} onClick={() => rateEquip(e.id, i)} key={i}>★</button>
                        ))}
                      </div>
                      <div className="equip-score" style={{ margin: '0 8px' }}>{e.rating}</div>
                      <div className="equip-status">
                        {e.rating < 4 ? <span className="badge badge-red">REPLACE</span> : <span className="badge badge-green">OK</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="add-row-btn" onClick={() => setAddEquipModalOpen(true)}>+ Add Equipment Item</button>
              </div>
              <div className="card" style={{ borderColor: 'rgba(255,51,85,0.3)' }}>
                <div className="card-title" style={{ color: 'var(--red)' }}>🚨 Priority Replacement List</div>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '14px' }}>Items rated below 4 stars automatically appear here.</p>
                <div id="priorityList">
                  {priorityItems().length > 0 ? priorityItems().map((p, i) => (
                    <div className="priority-item" key={i}>
                      <span className="p-icon">{p.manual ? '📋' : '⚠️'}</span>
                      <div style={{ flex: 1 }}>
                        <div className="p-name">{p.name}</div>
                        <div className="p-action" style={{ fontSize: '11px', color: 'var(--muted)' }}>{p.note}</div>
                      </div>
                      {p.manual && <button className="tbl-btn del" onClick={() => removePriority(i - equipment.filter(e => e.rating < 4).length)}>✕</button>}
                    </div>
                  )) : <div style={{ color: 'var(--muted)', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>No items flagged for replacement</div>}
                </div>
                <button className="add-row-btn" style={{ borderColor: 'rgba(255,51,85,0.2)', marginTop: '12px' }} onClick={() => setAddPriorityModalOpen(true)}>+ Add Manual Item to Priority</button>
              </div>
            </div>
          </div>
        )}

        {/* CLIENTS */}
        {currentPage === 'clients' && (
          <div className="content active" id="page-clients">
            <div className="section-label">Client <span>Overview</span></div>
            <div className="g4" style={{ marginBottom: '20px' }}>
              <div className="stat-card cyan"><div className="stat-num" style={{ color: 'var(--cyan)' }}>47</div><div className="stat-label">New (This Month)</div></div>
              <div className="stat-card green"><div className="stat-num" style={{ color: 'var(--green)' }}>312</div><div className="stat-label">Active</div></div>
              <div className="stat-card red"><div className="stat-num" style={{ color: 'var(--red)' }}>68</div><div className="stat-label">Inactive</div></div>
              <div className="stat-card orange"><div className="stat-num" style={{ color: 'var(--orange)' }}>427</div><div className="stat-label">Total Enrolled</div></div>
            </div>
            <div className="card">
              <div className="card-title">All Clients</div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="🔍 Search client…"
                  onChange={(e) => setClientSearch(e.target.value)}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 14px', borderRadius: '8px', fontFamily: "'Manrope', sans-serif", fontSize: '13px', outline: 'none', width: '220px' }}
                />
                <select
                  onChange={(e) => setClientStatusFilter(e.target.value)}
                  value={clientStatusFilter}
                  style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: '8px', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', outline: 'none' }}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="New">New</option>
                </select>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Status</th><th>Joined</th><th>Trainer</th><th>Plan</th><th>Last Visit</th><th>Goal Progress</th></tr></thead>
                  <tbody id="clientsBody">
                    {filteredClients().map((c, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{c.name}</td>
                        <td><span className={`badge ${c.status === 'Active' ? 'badge-green' : c.status === 'New' ? 'badge-cyan' : 'badge-red'}`}>{c.status}</span></td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>{c.joined}</td>
                        <td>{c.trainer}</td>
                        <td><span className="badge badge-purple">{c.plan}</span></td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>{c.last}</td>
                        <td>
                          <div style={{ background: 'var(--bg4)', borderRadius: '4px', height: '6px', width: '100px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${c.progress}%`, background: c.progress > 60 ? 'var(--green)' : c.progress > 30 ? 'var(--orange)' : 'var(--red)' }}></div>
                          </div>
                          <span style={{ fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", color: 'var(--muted)' }}>{c.progress}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EXCURSIONS */}
        {currentPage === 'excursions' && (
          <div className="content active" id="page-excursions">
            <div className="section-label">Gym <span>Excursions</span></div>
            <div style={{ marginBottom: '16px' }}>
              <button className="btn btn-cyan" onClick={() => setAddExcursionModalOpen(true)}>+ Add Excursion</button>
            </div>
            <div id="excursionGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {excursions.map((e, i) => (
                <div className="excursion-card" key={i}>
                  <div className="exc-img" style={{ fontSize: '50px' }}>{e.icon}</div>
                  <div className="exc-body">
                    <div className="exc-title">{e.title}</div>
                    <div className="exc-meta">📅 {e.date} · 📍 {e.location}</div>
                    <div className="exc-desc">{e.desc}</div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span className="badge badge-cyan">{e.enrolled}/{e.cap} enrolled</span>
                      <span className="badge badge-gold">${e.price}</span>
                    </div>
                    <div style={{ marginTop: '10px', display: 'flex', gap: '6px' }}>
                      <button className="btn btn-ghost" style={{ fontSize: '10px', padding: '5px 10px' }} onClick={() => deleteExcursion(i)}>Remove</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BIRTHDAYS */}
        {currentPage === 'birthdays' && (
          <div className="content active" id="page-birthdays">
            <div className="section-label">March <span>Birthdays 🎂</span></div>
            <div className="g2">
              <div className="card">
                <div className="card-title">🎉 Celebrating This Month</div>
                <div id="bdayList">
                  {birthdays.map((b, idx) => (
                    <div className="bday-item" key={idx}>
                      <div className="bday-avatar">{b.name.split(' ').map(x => x[0]).join('')}</div>
                      <div className="bday-info">
                        <div className="bday-name">{b.name}</div>
                        <div className="bday-date">🎂 {b.bday} · {b.daysLeft === 0 ? <span style={{ color: 'var(--gold)' }}>TODAY!</span> : b.daysLeft + ' days away'}</div>
                      </div>
                      <div className="bday-badge">{b.daysLeft === 0 ? '🎉' : '🎁'}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">📨 Send Birthday Message</div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="bdayClientSelect">Select Client</label>
                  <select
                    id="bdayClientSelect"
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '9px 12px', borderRadius: '8px', fontFamily: "'Manrope', sans-serif", fontSize: '13px', outline: 'none' }}
                  >
                    {birthdays.map((b, idx) => <option value={b.name} key={idx}>{b.name} ({b.bday})</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label htmlFor="bdayMsg">Message</label>
                  <textarea
                    id="bdayMsg"
                    value={bdayMessage}
                    onChange={(e) => setBdayMessage(e.target.value)}
                    style={{ background: 'var(--bg3)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: '8px', fontFamily: "'Manrope', sans-serif", fontSize: '13px', outline: 'none', resize: 'vertical', minHeight: '100px' }}
                  />
                </div>
                <button className="btn btn-cyan" onClick={sendBdayMsg}>🎁 Send Wishes</button>
                {bdaySent && <div id="bdaySentMsg" style={{ marginTop: '10px', fontSize: '12px', color: 'var(--green)', fontFamily: "'JetBrains Mono', monospace" }}>✓ Birthday message sent!</div>}
              </div>
            </div>
          </div>
        )}

        {/* SCHEDULE */}
        {currentPage === 'schedule' && (
          <div className="content active" id="page-schedule">
            <div className="section-label">Sessions <span>Schedule</span></div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <button className="btn btn-cyan" onClick={() => setAddSessionModalOpen(true)}>+ Add Session</button>
              <button className="btn btn-ghost" onClick={() => setScheduleFilter('all')}>All</button>
              <button className="btn btn-ghost" onClick={() => setScheduleFilter('Nutrition')}>🥗 Nutrition</button>
              <button className="btn btn-ghost" onClick={() => setScheduleFilter('Consultation')}>💬 Consultation</button>
              <button className="btn btn-ghost" onClick={() => setScheduleFilter('Training')}>🏋️ Training</button>
            </div>
            <div className="card">
              <div id="scheduleList">
                {filteredSchedule().map((s, idx) => (
                  <div className="schedule-item" key={idx}>
                    <div className="sched-time">{s.time}<br /><span style={{ fontSize: '10px', color: 'var(--muted)' }}>{s.date}</span></div>
                    <div className="sched-info" style={{ flex: 1 }}>
                      <div className="sched-title">{s.client} <span className={`badge ${seTypeBadge(s.type)} sched-type`}>{s.type}</span></div>
                      <div className="sched-meta">👤 {s.trainer} · ⏱ {s.dur}</div>
                      {s.notes && <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '3px' }}>📝 {s.notes}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {currentPage === 'orders' && (
          <div className="content active" id="page-orders">
            <div className="section-label">Order <span>Pickups</span></div>
            <div className="g2">
              <div>
                <div className="card-title" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '2px', color: 'var(--orange)', textTransform: 'uppercase', marginBottom: '14px' }}>⚠ Ready for Pickup</div>
                <div id="orderAlertList">
                  {orders.map((o, i) => (
                    <div className="order-alert" key={i}>
                      <div className="order-icon">📦</div>
                      <div className="order-info">
                        <div className="order-title">{o.id} — {o.client}</div>
                        <div className="order-detail">
                          📱 {o.phone}<br />
                          🛍 {o.items}<br />
                          💰 ${o.amount} · 📅 {o.date}<br />
                          {o.note && '📝 ' + o.note}
                        </div>
                      </div>
                      <div className="order-actions">
                        <button className="btn btn-green" style={{ fontSize: '10px', padding: '6px 10px' }} onClick={() => markCollected(i)}>✓ Collected</button>
                        <button className="btn btn-ghost" style={{ fontSize: '10px', padding: '6px 10px' }} onClick={() => notifyClient(o.client)}>📨 Notify</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="card-title">📋 Order History</div>
                <div className="tbl-wrap">
                  <table>
                    <thead><tr><th>Order #</th><th>Client</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody id="orderHistoryBody">
                      {orderHistory.map((o, idx) => (
                        <tr key={idx}>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>{o.id}</td>
                          <td>{o.client}</td>
                          <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{o.items}</td>
                          <td style={{ color: 'var(--green)', fontWeight: 600 }}>${o.amount}</td>
                          <td><span className={`badge ${o.status === 'Collected' ? 'badge-green' : 'badge-orange'}`}>{o.status}</span></td>
                          <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--muted)' }}>{o.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}

      {/* Trainer Assess Modal */}
      {trainerAssessModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setTrainerAssessModalOpen(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setTrainerAssessModalOpen(false)}>×</button>
            <div className="modal-title">Assess: <span id="assessTrainerName" style={{ color: 'var(--cyan)' }}>{currentAssessTrainer?.name}</span></div>
            <div id="trainerAssessSliders">
              {assessCats.map(c => {
                const val = assessScores[c.k];
                const pct = (val - 1) / 9 * 100;
                return (
                  <div className="assess-slider-wrap" key={c.k}>
                    <div className="assess-slider-header">
                      <span className="assess-slider-label">{c.l}</span>
                      <span className="assess-slider-val" id={`asv_${c.k}`}>{val}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.5"
                      value={val}
                      onChange={(e) => updateAssessScore(c.k, e.target.value)}
                      style={{ background: `linear-gradient(to right, var(--cyan) ${pct}%, var(--bg4) ${pct}%)` }}
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '1px', marginBottom: '4px' }}>AVERAGE SCORE</div>
                <div id="assessAvgDisplay" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '32px', color: 'var(--cyan)', fontWeight: 700 }}>{calcAssessAvg()}</div>
              </div>
              <div id="assessStandingDisplay" className={`badge ${getStanding(calcAssessAvg()).cls}`}>{getStanding(calcAssessAvg()).label}</div>
            </div>
            <button className="btn btn-cyan" style={{ width: '100%', justifyContent: 'center', marginTop: '14px', padding: '12px' }} onClick={submitTrainerAssess}>Submit Assessment</button>
          </div>
        </div>
      )}

      {/* Add Equipment Modal */}
      {addEquipModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setAddEquipModalOpen(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setAddEquipModalOpen(false)}>×</button>
            <div className="modal-title">Add Equipment Item</div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="newEquipName">Equipment Name</label><input type="text" id="newEquipName" placeholder="e.g. Treadmill #3" value={newEquip.name} onChange={(e) => setNewEquip({ ...newEquip, name: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="newEquipCat">Category</label>
                <select id="newEquipCat" value={newEquip.cat} onChange={(e) => setNewEquip({ ...newEquip, cat: e.target.value })}>
                  <option>Cardio</option><option>Strength</option><option>Flexibility</option><option>Free Weights</option><option>Machines</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}><label htmlFor="newEquipRating">Initial Rating (1–5)</label>
              <input type="number" id="newEquipRating" min="1" max="5" value={newEquip.rating} onChange={(e) => setNewEquip({ ...newEquip, rating: parseInt(e.target.value) || 3 })} />
            </div>
            <button className="btn btn-cyan" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} onClick={addEquipItem}>Add to List</button>
          </div>
        </div>
      )}

      {/* Add Priority Modal */}
      {addPriorityModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setAddPriorityModalOpen(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setAddPriorityModalOpen(false)}>×</button>
            <div className="modal-title">Add to Priority List</div>
            <div className="form-group" style={{ marginBottom: '12px' }}><label htmlFor="newPriorityName">Item Name</label><input type="text" id="newPriorityName" placeholder="e.g. Yoga Mats (10x)" value={newPriority.name} onChange={(e) => setNewPriority({ ...newPriority, name: e.target.value })} /></div>
            <div className="form-group" style={{ marginBottom: '14px' }}><label htmlFor="newPriorityNote">Reason / Notes</label><textarea id="newPriorityNote" placeholder="Why is this needed?" value={newPriority.note} onChange={(e) => setNewPriority({ ...newPriority, note: e.target.value })} /></div>
            <button className="btn btn-red" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} onClick={addPriorityItem}>Add to Priority</button>
          </div>
        </div>
      )}

      {/* Add Excursion Modal */}
      {addExcursionModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setAddExcursionModalOpen(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setAddExcursionModalOpen(false)}>×</button>
            <div className="modal-title">Add New Excursion</div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="excTitle">Title</label><input type="text" id="excTitle" placeholder="Hike & Trail Day" value={newExcursion.title} onChange={(e) => setNewExcursion({ ...newExcursion, title: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="excDate">Date</label><input type="date" id="excDate" value={newExcursion.date} onChange={(e) => setNewExcursion({ ...newExcursion, date: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="excLocation">Location</label><input type="text" id="excLocation" placeholder="Blue Mountains" value={newExcursion.location} onChange={(e) => setNewExcursion({ ...newExcursion, location: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="excCap">Max Capacity</label><input type="number" id="excCap" min="1" value={newExcursion.cap} onChange={(e) => setNewExcursion({ ...newExcursion, cap: e.target.value })} /></div>
            </div>
            <div className="form-group" style={{ marginBottom: '12px' }}><label htmlFor="excDesc">Description</label><textarea id="excDesc" placeholder="What's included…" value={newExcursion.desc} onChange={(e) => setNewExcursion({ ...newExcursion, desc: e.target.value })} /></div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="excPrice">Price ($)</label><input type="number" id="excPrice" value={newExcursion.price} onChange={(e) => setNewExcursion({ ...newExcursion, price: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="excIcon">Icon / Emoji</label><input type="text" id="excIcon" maxLength="4" value={newExcursion.icon} onChange={(e) => setNewExcursion({ ...newExcursion, icon: e.target.value })} /></div>
            </div>
            <button className="btn btn-cyan" style={{ width: '100%', justifyContent: 'center', padding: '11px', marginTop: '6px' }} onClick={addExcursion}>Publish Excursion</button>
          </div>
        </div>
      )}

      {/* Add Session Modal */}
      {addSessionModalOpen && (
        <div className="modal-overlay open" onClick={(e) => e.target === e.currentTarget && setAddSessionModalOpen(false)}>
          <div className="modal">
            <button className="modal-close" onClick={() => setAddSessionModalOpen(false)}>×</button>
            <div className="modal-title">Add Session</div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="newSchedType">Session Type</label>
                <select id="newSchedType" value={newSession.type} onChange={(e) => setNewSession({ ...newSession, type: e.target.value })}>
                  <option>Nutrition</option><option>Consultation</option><option>Training</option><option>Group Class</option>
                </select>
              </div>
              <div className="form-group"><label htmlFor="newSchedDate">Date</label><input type="date" id="newSchedDate" value={newSession.date} onChange={(e) => setNewSession({ ...newSession, date: e.target.value })} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="newSchedTime">Time</label><input type="time" id="newSchedTime" value={newSession.time} onChange={(e) => setNewSession({ ...newSession, time: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="newSchedDur">Duration</label>
                <select id="newSchedDur" value={newSession.dur} onChange={(e) => setNewSession({ ...newSession, dur: e.target.value })}>
                  <option>30 min</option><option>45 min</option><option>60 min</option><option>90 min</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label htmlFor="newSchedClient">Client Name</label><input type="text" id="newSchedClient" placeholder="Client name" value={newSession.client} onChange={(e) => setNewSession({ ...newSession, client: e.target.value })} /></div>
              <div className="form-group"><label htmlFor="newSchedTrainer">Trainer / Nutritionist</label><input type="text" id="newSchedTrainer" placeholder="Staff name" value={newSession.trainer} onChange={(e) => setNewSession({ ...newSession, trainer: e.target.value })} /></div>
            </div>
            <div className="form-group" style={{ marginBottom: '14px' }}><label htmlFor="newSchedNotes">Notes</label><textarea id="newSchedNotes" placeholder="Optional notes…" value={newSession.notes} onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })} /></div>
            <button className="btn btn-cyan" style={{ width: '100%', justifyContent: 'center', padding: '11px' }} onClick={addSession}>Schedule Session</button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div id="toast" className={toastMessage.show ? 'show' : ''}>✓ {toastMessage.text}</div>
    </>
  );
};

export default Admin;