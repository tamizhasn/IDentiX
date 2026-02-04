import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import AuthModal from "../components/AuthModal"; // ✅ Import the Auth Modal

export default function MainLayout({ children }) {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false); // ✅ State for Navbar Login
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Listen for User Login/Logout
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) setShowAuth(false); // Close modal if user logs in
    });
    return () => unsubscribe();
  }, []);

  // 2. Handle Logout & Redirect
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // ✅ Force redirect to Home after logout
  };

  const isActive = (path) => 
    location.pathname === path 
      ? "text-blue-600 bg-blue-50 font-bold" 
      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative selection:bg-blue-100">
      
      {/* --- BACKGROUND ANIMATION (Global) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>
      </div>

      {/* --- NAVBAR --- */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* 1. Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-mono font-bold group-hover:bg-blue-600 transition-colors">
              ID
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">IDentiX</span>
          </Link>

          {/* 2. Desktop Navigation */}
          <div className="hidden md:flex gap-1">
            {[
              ['/dashboard', 'Dashboard'],
              ['/issuer-login', 'Issuer Portal'], // ✅ Fixed Route
              ['/verify', 'Verify ID'],
            ].map(([path, label]) => (
              <Link 
                key={path}
                to={path} 
                className={`px-4 py-2 rounded-lg text-sm transition-all ${isActive(path)}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* 3. Auth Buttons */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:block text-xs font-mono text-slate-400">
                  {user.email?.split('@')[0]}
                </span>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuth(true)} // ✅ Opens Modal
                className="px-5 py-2 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-lg hover:shadow-slate-300"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10">
        {children}
      </main>

      {/* --- AUTH MODAL (Global) --- */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      
    </div>
  );
}