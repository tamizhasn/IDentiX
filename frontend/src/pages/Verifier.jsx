import { useState } from "react";
import { ethers } from "ethers";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../abi";
import MainLayout from "../layouts/MainLayout";
import { motion, AnimatePresence } from "framer-motion";

export default function Verifier() {
  const [inputs, setInputs] = useState({ studentId: "", token: "" });
  const [status, setStatus] = useState("idle"); // idle, loading, valid, invalid, error
  const [certData, setCertData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setCertData(null);
    setErrorMsg("");

    try {
      // 1. Input Validation
      if (!inputs.studentId || !inputs.token) throw new Error("Please enter both ID and Token.");

      // 2. Fetch Metadata from Database using Token (The "Lookup" Phase)
      const q = query(collection(db, "certificates"), where("credentialToken", "==", inputs.token.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) throw new Error("Invalid Token. No certificate found.");
      
      const docData = querySnapshot.docs[0].data();

      // Check if Student ID matches (Double check)
      if (docData.studentId !== inputs.studentId.trim()) {
        throw new Error("Token does not belong to this Student ID.");
      }

      // 3. 🛡️ BLOCKCHAIN VERIFICATION
      // Now we take the Hash from the DB and ask the Blockchain: "Is this Hash valid for this Student?"
      
      let provider = window.ethereum 
        ? new ethers.BrowserProvider(window.ethereum)
        : new ethers.JsonRpcProvider("https://rpc.sepolia.org");
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const studentIdHash = ethers.id(docData.studentId);
      
      // Auto-scan IDs 0-20 (Simulated "Index" scan)
      let isValid = false;
      for (let i = 0; i < 20; i++) {
        try {
          // Verify Credential using the Hash from the database
          const check = await contract.verifyCredential(studentIdHash, i, docData.pdfHash);
          if (check === true) {
            isValid = true;
            break;
          }
        } catch (e) { break; }
      }

      if (!isValid) {
        setStatus("invalid");
        return;
      }

      // 4. Success! Show Preview
      setCertData(docData);
      setStatus("valid");

    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(err.message);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">Instant Verification</h1>
          <p className="text-slate-500">Enter the credentials provided by the student.</p>
        </div>

        {/* INPUT FORM */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Student ID</label>
                <input 
                  value={inputs.studentId}
                  onChange={e => setInputs({...inputs, studentId: e.target.value})}
                  placeholder="e.g. 7321..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Credential Token</label>
                <input 
                  value={inputs.token}
                  onChange={e => setInputs({...inputs, token: e.target.value})}
                  placeholder="e.g. IDX-A1B2..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
            </div>

            <button disabled={status === "loading"} className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-70">
              {status === "loading" ? "Verifying on Blockchain..." : "Verify Credential"}
            </button>
          </form>
        </motion.div>

        {/* RESULT: NON-DOWNLOADABLE PREVIEW */}
        <AnimatePresence>
          {status === "valid" && certData && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 flex items-center gap-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h3 className="font-bold text-green-800">Authentic Credential</h3>
                  <p className="text-sm text-green-700">Verified against Ethereum Ledger.</p>
                </div>
              </div>

              {/* Secure Preview Frame */}
              <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative group">
                {/* Overlay to prevent right-click/save */}
                <div className="absolute inset-0 z-10" onContextMenu={(e) => e.preventDefault()}></div>
                
                <div className="bg-slate-800 p-3 text-center text-xs text-slate-400 font-mono border-b border-slate-700">
                  READ-ONLY PREVIEW • DOWNLOAD DISABLED
                </div>
                
                {/* Embed PDF without toolbar */}
                <iframe 
                  src={`${certData.fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                  className="w-full h-[500px] bg-white pointer-events-none" 
                  title="Certificate Preview"
                />
              </div>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-red-50 text-red-700 text-center rounded-xl border border-red-100 font-medium">
              ⚠️ {errorMsg}
            </motion.div>
          )}

          {status === "invalid" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-red-50 text-red-700 text-center rounded-xl border border-red-100 font-medium">
              ❌ Verification Failed: The document hash does not match the blockchain record.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MainLayout>
  );
}