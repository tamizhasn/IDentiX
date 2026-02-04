import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser, loginUser } from "../services/auth";
import MainLayout from "../layouts/MainLayout";
import PageTransition from "../components/PageTransition";

export default function IssuerLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", orgName: "", licenseCode: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isRegister) {
        // Simple mock check: In reality, you'd check this code against a database of valid universities
        if (formData.licenseCode !== "EDU-SECURE-2026") {
          throw new Error("Invalid Organization License Code");
        }
        await signupUser(formData.email, formData.password, { 
          name: formData.orgName, 
          role: "issuer",
          verified: true 
        });
      } else {
        await loginUser(formData.email, formData.password);
      }
      navigate("/issuer");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <MainLayout>
      <PageTransition>
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Issuer Portal</h1>
              <p className="text-slate-500 text-sm mt-2">For Universities & Government Authorities Only</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <input 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    placeholder="Organization Name"
                    onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                  />
                  <input 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono text-sm"
                    placeholder="License Code (e.g. EDU-SECURE...)"
                    onChange={(e) => setFormData({...formData, licenseCode: e.target.value})}
                  />
                </>
              )}
              
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Official Email"
                type="email"
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                placeholder="Password"
                type="password"
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />

              {error && <div className="text-red-600 text-sm bg-red-50 p-2 rounded text-center">{error}</div>}

              <button className="w-full py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all shadow-lg">
                {isRegister ? "Register Organization" : "Access Dashboard"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setIsRegister(!isRegister)}
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                {isRegister ? "Already registered? Login" : "Apply for Issuer Access"}
              </button>
            </div>
          </div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}