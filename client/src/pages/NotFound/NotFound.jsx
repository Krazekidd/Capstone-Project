import React from "react";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="notfound-wrapper">
      <div className="notfound-container">
        <h1 className="notfound-title">404</h1>
        <p className="notfound-message">Oops! The page you're looking for doesn't exist.</p>
        <a href="/" className="notfound-link">Return to Home</a>
      </div>
    </div>
  );
};

export default NotFound;
