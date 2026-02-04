import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../firebase";


export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [securityData, setSecurityData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [error, setError] = useState("");

  const handleFindUser = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) throw new Error("User not found.");
      
      const userData = snapshot.docs[0].data();
      if (!userData.securityQuestion) throw new Error("No security question set for this account.");
      
      setSecurityData(userData);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (userAnswer.toLowerCase().trim() !== securityData.securityAnswer) {
      setError("Incorrect answer.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setStep(3);
    } catch (err) {
      setError("Failed to send reset email.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onBack}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Account Recovery</h2>

        {step === 1 && (
          <form onSubmit={handleFindUser} className="space-y-4">
            <p className="text-sm text-slate-500">Enter your email to retrieve your security question.</p>
            <input 
              type="email" placeholder="Email Address" required
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className="w-full py-3 bg-slate-900 text-white rounded-lg">Find Account</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs font-bold text-blue-600 uppercase">Security Question</p>
              <p className="font-medium text-slate-900">{securityData.securityQuestion}</p>
            </div>
            <input 
              type="text" placeholder="Your Answer" required
              className="w-full p-3 border rounded-lg"
              onChange={(e) => setUserAnswer(e.target.value)}
            />
            <button className="w-full py-3 bg-slate-900 text-white rounded-lg">Verify & Reset Password</button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto text-2xl">✅</div>
            <p className="text-slate-600">Password reset link sent to <b>{email}</b>. Please check your inbox.</p>
            <button onClick={onBack} className="text-blue-600 font-bold hover:underline">Return to Login</button>
          </div>
        )}

        {error && <p className="mt-4 text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
      </div>
    </div>
  );
}