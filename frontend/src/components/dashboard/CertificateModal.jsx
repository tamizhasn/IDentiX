import { motion, AnimatePresence } from "framer-motion";
import { auth } from "../../firebase"; // ✅ Import Auth for Security Check

export default function CertificateModal({ cert, onClose }) {
  if (!cert) return null;

  // ⬇️ DOWNLOAD HANDLER (With Security Check)
  const handleDownload = () => {
    // 1. Security: Check if user is logged in
    if (!auth.currentUser) {
      alert("🔒 Access Denied: You must be logged in to download this credential.");
      return;
    }

    // 2. Validation: Check if file link exists
    if (!cert.fileUrl) {
      alert("⚠️ Error: File not found. The certificate might be processing.");
      return;
    }

    // 3. Action: Open the PDF
    window.open(cert.fileUrl, "_blank");
  };

  // 🔗 VERIFY HANDLER
  const handleVerify = () => {
    if (!cert.txHash) {
      alert("Transaction is pending blockchain confirmation.");
      return;
    }
    // Opens the transaction on Etherscan (Sepolia Testnet)
    window.open(`https://sepolia.etherscan.io/tx/${cert.txHash}`, "_blank");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        
        {/* Backdrop (Click to Close) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden z-10"
        >
          {/* Top Gradient Bar */}
          <div className="h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600" />

          <div className="p-8 md:p-12 text-center">
            
            {/* Icon */}
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl shadow-inner border border-blue-100">
              🎓
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 font-serif mb-3">
              Certificate of Completion
            </h2>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-bold uppercase tracking-widest mb-10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Blockchain Verified
            </div>

            {/* Certificate Details */}
            <div className="space-y-8 mb-12">
              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide font-bold mb-2">This certifies that</p>
                <p className="text-3xl font-bold text-slate-900">{cert.name}</p>
              </div>

              <div>
                <p className="text-slate-400 text-sm uppercase tracking-wide font-bold mb-2">Has successfully completed</p>
                <p className="text-2xl font-bold text-indigo-600">{cert.course}</p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-4 text-left bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Student ID</p>
                <p className="font-mono text-sm text-slate-700 font-medium">{cert.studentId}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Issued On</p>
                <p className="font-mono text-sm text-slate-700 font-medium">
                  {cert.timestamp?.toDate ? cert.timestamp.toDate().toLocaleDateString() : "Just Now"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Issuer Organization</p>
                <p className="font-medium text-sm text-slate-700 truncate">{cert.university || "University Authority"}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Department</p>
                <p className="font-medium text-sm text-slate-700">{cert.department || "Academic Dept"}</p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
              <button
                onClick={handleVerify}
                className="px-8 py-4 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 group"
              >
                <span>🔗</span> 
                <span className="group-hover:underline">Verify on Etherscan</span>
              </button>
              
              <button
                onClick={handleDownload}
                className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                <span>⬇️</span> 
                Download PDF
              </button>
            </div>
          </div>

          {/* Close 'X' Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}