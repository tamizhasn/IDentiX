import { useState } from "react";
import { signupUser, loginUser } from "../services/auth";
import ForgotPassword from "./ForgotPassword"; 

export default function AuthModal({ onClose }) {
  const [view, setView] = useState("login"); // login, signup, forgot
  const [formData, setFormData] = useState({ 
    email: "", password: "", name: "", role: "student",
    securityQuestion: "What is your pet's name?", securityAnswer: "" 
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (view === "signup") {
        if (!formData.securityAnswer) throw new Error("Security answer is required");
        
        await signupUser(formData.email, formData.password, { 
          name: formData.name, 
          role: formData.role,
          securityQuestion: formData.securityQuestion,
          securityAnswer: formData.securityAnswer.toLowerCase().trim(), // Normalize answer
          verified: false // Default to unverified
        });
        onClose();
      } else {
        await loginUser(formData.email, formData.password);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError(err.message.replace("Firebase:", "").trim());
    } finally {
      setLoading(false);
    }
  };

  if (view === "forgot") {
    return <ForgotPassword onBack={() => setView("login")} />;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 border border-slate-100">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">✕</button>
        
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">
          {view === "signup" ? "Create Identity" : "Access Vault"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === "signup" && (
            <input 
              type="text" placeholder="Full Name" required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}

          <input 
            type="email" placeholder="Email Address" required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <input 
            type="password" placeholder="Password" required
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          {view === "signup" && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase">Security Question (For Recovery)</p>
              <select 
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                onChange={(e) => setFormData({...formData, securityQuestion: e.target.value})}
              >
                <option>What is your pet's name?</option>
                <option>What is your mother's maiden name?</option>
                <option>What was your first car?</option>
              </select>
              <input 
                type="text" placeholder="Your Answer" required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none text-sm"
                onChange={(e) => setFormData({...formData, securityAnswer: e.target.value})}
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}

          <button disabled={loading} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all">
            {loading ? "Processing..." : (view === "signup" ? "Register" : "Login")}
          </button>
        </form>

        <div className="mt-4 text-center text-sm space-y-2">
          {view === "login" && (
            <button onClick={() => setView("forgot")} className="text-slate-500 hover:text-slate-800">
              Forgot Password?
            </button>
          )}
          <p className="text-slate-500">
            {view === "signup" ? "Already have an account?" : "No account yet?"} 
            <button onClick={() => setView(view === "signup" ? "login" : "signup")} className="ml-2 text-blue-600 font-bold hover:underline">
              {view === "signup" ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}