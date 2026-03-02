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

const Excursions = () => {
  const [selectedExcursion, setSelectedExcursion] = useState(null);
  const [step, setStep] = useState(1);
  const [userInfo, setUserInfo] = useState({
    name: "",
    phone: "",
    email: ""
  });

  // frontend sample for pretty 
  const excursions = [
    {
      id: 1,
      name: "Blue Mountain Peak Hike",
      description: "Summit Jamaica’s highest peak. 7‑mile round trip, challenging AND rewarding.",
      date: "2026-04-15",
      time: "6:00 AM",
      spots: 12,
      price: "$67",
      coords: [18.0468, -76.5789]
    },
    {
      id: 2,
      name: "Reach Falls Trail Run",
      description: "Trail run through lush forest ending at a beautiful waterfall.",
      date: "2026-04-22",
      time: "7:30 AM",
      spots: 8,
      price: "$41",
      coords: [18.0167, -76.3167]
    },
    {
      id: 3,
      name: "Holywell Night Hike",
      description: "Guided night hike with stunning views of Kingston.",
      date: "2026-05-05",
      time: "6:00 PM",
      spots: 15,
      price: "$1",
      coords: [18.0833, -76.6667]
    }
  ];

  // Kingston JA
  const kingstonCenter = [18.0179, -76.8099];

  const handleSelectExcursion = (excursion) => {
    setSelectedExcursion(excursion);
    setStep(2);
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
    // send ts to backend one day
    setStep(3);
  };

  const resetBooking = () => {
    setSelectedExcursion(null);
    setStep(1);
    setUserInfo({ name: "", phone: "", email: "" });
  };

  return (
    <div className="excursions-container-wrapper">
      <div className="excursions-background-accent excursions-accent-top"></div>
      <div className="excursions-background-accent excursions-accent-bottom"></div>

      <section className="excursions-hero">
        <div className="excursions-overlay">
          {/* back to front page*/}
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

            {/* kool map of kingston :> */}
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

            {/* sxcursion cards */}
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
                      className="excursions-select-btn"
                      onClick={() => handleSelectExcursion(exc)}
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && selectedExcursion && (
          <div className="excursions-card">
            <h2>Your Information</h2>
            <div className="excursions-selected-summary">
              <p><strong>Excursion:</strong> {selectedExcursion.name}</p>
              <p><strong>Date:</strong> {selectedExcursion.date} at {selectedExcursion.time}</p>
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
          <div className="excursions-card">
            <h2>Booking Confirmed!</h2>
            <div className="excursions-summary">
              <p><strong>Excursion:</strong> {selectedExcursion.name}</p>
              <p><strong>Date:</strong> {selectedExcursion.date} at {selectedExcursion.time}</p>
              <p><strong>Name:</strong> {userInfo.name}</p>
              <p><strong>Phone:</strong> {userInfo.phone}</p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Total:</strong> {selectedExcursion.price}</p>
            </div>
            <p className="excursions-thanks">
              Thank you for booking! You will receive a confirmation email shortly.
            </p>
            <button className="excursions-primary-btn" onClick={resetBooking}>
              Book Another Excursion
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Excursions;