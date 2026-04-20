// src/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./footer";

export default function Layout( { useNavbar = true }) {
  return (
    <>
      {useNavbar && <Navbar />}
      <main className="main-content" style={{ paddingTop: "72px" }}> {/* matches navbar height */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
}