import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import "leaflet/dist/leaflet.css";
import "./Excursions.css";

// fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// ─── Calendar Picker Component ───────────────────────────────────────────────
const CalendarPicker = ({ availableDates, onSelectDate, selectedDate }) => {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  const dayLabels = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  return (
    <div className="cal-wrap">
      <div className="cal-header">
        <button className="cal-nav" onClick={prevMonth}>&#8592;</button>
        <span className="cal-title">{monthNames[month]} {year}</span>
        <button className="cal-nav" onClick={nextMonth}>&#8594;</button>
      </div>

      <div className="cal-grid">
        {dayLabels.map(d => (
          <div key={d} className="cal-day-label">{d}</div>
        ))}
        {Array(firstDay).fill(null).map((_, i) => (
          <div key={`empty-${i}`} className="cal-day empty" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1;
          const mm = String(month + 1).padStart(2, "0");
          const dd = String(d).padStart(2, "0");
          const dateStr = `${year}-${mm}-${dd}`;
          const isAvail = availableDates.includes(dateStr);
          const isSel = dateStr === selectedDate;
          return (
            <div
              key={dateStr}
              className={`cal-day ${isSel ? "selected" : isAvail ? "available" : "unavailable"}`}
              onClick={() => isAvail && onSelectDate(dateStr)}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div className="cal-legend">
        <span><span className="dot dot-avail" /> Available</span>
        <span><span className="dot dot-unavail" /> Unavailable</span>
        <span><span className="dot dot-sel" /> Selected</span>
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const Excursions = () => {
  const [selectedExcursion, setSelectedExcursion] = useState(null);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });
  const [bookingId, setBookingId] = useState("");

  // Generate a random booking ID when we reach step 3 for now
  useEffect(() => {
    if (step === 3) {
      const id = 'BAD-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setBookingId(id);
    }
  }, [step]);

  // frontend sample for pretty
  const excursions = [
    {
      id: 1,
      name: "Blue Mountain Peak Hike",
      description: "Summit Jamaica's highest peak. 7‑mile round trip, challenging AND rewarding.",
      date: "2026-04-15",
      time: "6:00 AM",
      spots: 12,
      price: "$67",
      coords: [18.0468, -76.5789],
      address: "Blue Mountain Peak Trail, Portland, Jamaica",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 2,
      name: "Reach Falls Trail Run",
      description: "Trail run through lush forest ending at a beautiful waterfall.",
      date: "2026-04-22",
      time: "7:30 AM",
      spots: 8,
      price: "$41",
      coords: [18.0167, -76.3167],
      address: "Reach Falls, Portland, Jamaica",
      image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    },
    {
      id: 3,
      name: "Holywell Night Hike",
      description: "Guided night hike with stunning views of Kingston.",
      date: "2026-05-05",
      time: "6:00 PM",
      spots: 15,
      price: "$1",
      coords: [18.0833, -76.6667],
      address: "Holywell Recreation Area, Blue Mountains, Jamaica",
      image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    }
  ];

  // Kingston JA
  const kingstonCenter = [18.0179, -76.8099];

  const handleSelectExcursion = (excursion) => {
    if (selectedExcursion?.id === excursion.id) {
      // Toggle closed
      setSelectedExcursion(null);
      setSelectedDate("");
    } else {
      setSelectedExcursion(excursion);
      setSelectedDate("");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitInfo = () => {
    const { name, phone, email } = userInfo;
    if (!name || !phone || !email) {
      alert("Please fill in all fields.");
      return;
    }
    // send to backend one day
    setStep(3);
  };

  const resetBooking = () => {
    setSelectedExcursion(null);
    setStep(1);
    setSelectedDate("");
    setUserInfo({ name: "", phone: "", email: "" });
  };

  return (
    <div className="excursions-container-wrapper">
      <div className="excursions-background-accent excursions-accent-top"></div>
      <div className="excursions-background-accent excursions-accent-bottom"></div>

      <section className="excursions-hero">
        <div className="excursions-overlay">
          {/* back to front page */}
          <div className="excursions-home-link-container">
            <Link to="/" className="excursions-home-link">← Return to Home page</Link>
          </div>
          <h1>Outdoor Excursions</h1>
          <p>Explore Kingston and beyond with our guided adventures</p>
        </div>
      </section>

      <div className="excursions-progress-bar">
        <div className={`excursions-step ${step >= 1 ? "active" : ""}`}>
          <span>1</span> Choose Excursion
        </div>
        <div className={`excursions-step ${step >= 2 ? "active" : ""}`}>
          <span>2</span> Your Info
        </div>
        <div className={`excursions-step ${step >= 3 ? "active" : ""}`}>
          <span>3</span> Confirmation
        </div>
      </div>

      <section className="excursions-wrapper">
        {step === 1 && (
          <div className="excursions-card">
            <h2>Available Excursions in Kingston</h2>

            {/* map of kingston */}
            <div className="excursions-main-map">
              <MapContainer
                center={kingstonCenter}
                zoom={10}
                style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {excursions.map((exc) => (
                  <Marker key={exc.id} position={exc.coords}>
                    <Popup>
                      <strong>{exc.name}</strong><br />
                      {exc.date} at {exc.time}<br />
                      {exc.price} · {exc.spots} spots left
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* excursion cards */}
            <div className="excursions-grid">
              {excursions.map((exc) => (
                <div key={exc.id} className="excursions-card-item">
                  <div className="excursions-card-content">
                    <h3>{exc.name}</h3>
                    <p className="excursions-description">{exc.description}</p>
                    <div className="excursions-details">
                      <span>📅 {exc.date}</span>
                      <span>⏰ {exc.time}</span>
                      <span>👥 {exc.spots} left</span>
                      <span className="excursions-price">{exc.price}</span>
                    </div>

                    <button
                      className={`excursions-select-btn ${selectedExcursion?.id === exc.id ? "active" : ""}`}
                      onClick={() => handleSelectExcursion(exc)}
                    >
                      {selectedExcursion?.id === exc.id ? "Close" : "Select"}
                    </button>

                    {/* Calendar drops in when this card is selected */}
                    {selectedExcursion?.id === exc.id && (
                      <div className="excursions-calendar-inline">
                        <CalendarPicker
                          availableDates={[exc.date]}
                          selectedDate={selectedDate}
                          onSelectDate={(d) => {
                            setSelectedDate(d);
                            setStep(2);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedExcursion && (
          <div className="excursions-card">
            <h2>Your Information</h2>

            <div className="excursions-location-section">
              <h3>Meeting Point</h3>
              <p>{selectedExcursion.address}</p>
              <div className="excursions-location-map">
                <iframe
                  src={`https://www.google.com/maps?q=${selectedExcursion.coords[0]},${selectedExcursion.coords[1]}&z=14&output=embed`}
                  loading="lazy"
                  title={`Map of ${selectedExcursion.name}`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            <div className="excursions-selected-summary">
              <p><strong>Excursion:</strong> {selectedExcursion.name}</p>
              <p><strong>Date:</strong> {selectedDate} at {selectedExcursion.time}</p>
              <p><strong>Price:</strong> {selectedExcursion.price}</p>
            </div>

            <div className="excursions-form">
              <div className="excursions-input-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userInfo.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="excursions-input-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userInfo.phone}
                  onChange={handleInputChange}
                  placeholder="(876) 555‑1234"
                  required
                />
              </div>
              <div className="excursions-input-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userInfo.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="excursions-button-group">
              <button className="excursions-secondary-btn" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="excursions-primary-btn" onClick={handleSubmitInfo}>
                Confirm Booking
              </button>
            </div>
          </div>
        )}

        {step === 3 && selectedExcursion && (
          <div className="excursions-card booking-confirmed">
            <div className="booking-confirmed-content">
              {/* receipt above excursion name */}
              <div className="excursion-receipt">
                <span className="receipt-label">Booking Receipt</span>
                <div className="receipt-details">
                  <p><strong>Confirmation #:</strong> {bookingId}</p>
                  <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                  <p><strong>Status:</strong> Confirmed</p>
                </div>
              </div>

              <h2>Booking Confirmed!</h2>

              {/* Summary card with image */}
              <div className="excursions-summary with-image">
                <div className="summary-image">
                  <img src={selectedExcursion.image} alt={selectedExcursion.name} />
                </div>
                <div className="summary-details">
                  <p><strong>Excursion:</strong> {selectedExcursion.name}</p>
                  <p><strong>Date:</strong> {selectedDate} at {selectedExcursion.time}</p>
                  <p><strong>Name:</strong> {userInfo.name}</p>
                  <p><strong>Phone:</strong> {userInfo.phone}</p>
                  <p><strong>Email:</strong> {userInfo.email}</p>
                  <p><strong>Total:</strong> {selectedExcursion.price}</p>
                </div>
              </div>

              <p className="excursions-thanks">
                Thank you for booking! You will receive a confirmation email shortly.
              </p>

              <button className="excursions-primary-btn" onClick={resetBooking}>
                Book Another Excursion
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Excursions;