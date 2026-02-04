import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

import Home from "./pages/Home";
import IssuerDashboard from "./pages/IssuerDashboard";
import IssuerLogin from "./pages/IssuerLogin"; // NEW separate login
import Verifier from "./pages/Verifier";
import StudentDashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";

// Guard Component: Checks if user is actually an Issuer
const IssuerRoute = ({ children }) => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        setRole(snap.data()?.role);
      }
      setLoading(false);
    };
    checkRole();
  }, []);

  if (loading) return <div className="p-10 text-center">Verifying Credentials...</div>;
  return role === "issuer" ? children : <Navigate to="/issuer-login" />;
};

export default function App() {
  const location = useLocation();

  return (
    // AnimatePresence enables the exit animations
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/issuer-login" element={<IssuerLogin />} />
        <Route path="/verify" element={<Verifier />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        
        {/* Protected Issuer Route */}
        <Route 
          path="/issuer" 
          element={
            <IssuerRoute>
              <IssuerDashboard />
            </IssuerRoute>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}