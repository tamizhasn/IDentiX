import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import PageTransition from "../components/PageTransition";

// Sections
import ProfileSection from "../components/dashboard/ProfileSection";
import CertificatesSection from "../components/dashboard/CertificatesSection";
import VaultSection from "../components/dashboard/VaultSection";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  // 🔄 REAL-TIME AUTH LISTENER (Fixes the Refresh Issue)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUserId(currentUser.uid);
        await fetchUserProfile(currentUser.uid);
      } else {
        // User logged out or session expired
        setUserData(null);
        setUserId(null);
        navigate("/"); 
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [navigate]);

  // Helper to fetch data (Can be called from child components)
  const fetchUserProfile = async (uid) => {
    try {
      const docRef = doc(db, "users", uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setUserData(snap.data());
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const tabs = [
    { id: "profile", label: "👤 Identity", icon: "🆔" },
    { id: "certificates", label: "Credentials", icon: "🎓" },
    { id: "vault", label: "Secure Vault", icon: "🔒" },
  ];

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500 font-mono text-sm">Synchronizing Blockchain Identity...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto min-h-[80vh]">
          {/* Header Area */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 pb-6 border-b border-slate-200 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
              <p className="text-slate-500 mt-1">Manage your decentralized identity and assets.</p>
            </div>
            
            {/* User Quick Info */}
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              {userData?.photoUrl ? (
                <img src={userData.photoUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {userData?.name?.charAt(0) || "U"}
                </div>
              )}
              <div className="text-sm">
                <p className="font-bold text-slate-900 leading-none">{userData?.name || "Student"}</p>
                <p className="text-xs text-slate-500 font-mono mt-1">{auth.currentUser?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105"
                    : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm min-h-[500px] p-6 md:p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

            {activeTab === "profile" && (
              <ProfileSection 
                userData={userData} 
                refreshProfile={() => fetchUserProfile(userId)} 
              />
            )}
            
            {activeTab === "certificates" && (
              <CertificatesSection studentId={userData?.studentId} />
            )}
            
            {activeTab === "vault" && (
              <VaultSection userId={userId} />
            )}
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}