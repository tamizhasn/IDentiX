import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import CertificateModal from "./CertificateModal";

export default function CertificatesSection({ studentId }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!studentId) return;
      try {
        const q = query(collection(db, "certificates"), where("studentId", "==", studentId));
        const querySnapshot = await getDocs(q);
        
        const certs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCertificates(certs);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [studentId]);

  const handleDownload = (url) => {
    if (!url) {
      alert("File URL missing.");
      return;
    }
    window.open(url, "_blank");
  };

  if (loading) return <div className="p-10 text-center animate-pulse">🎓 Loading Credentials...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Credentials</h2>
          <p className="text-sm text-slate-500">Blockchain-verified certificates issued to you.</p>
        </div>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="text-4xl mb-4">📭</div>
          <h3 className="text-lg font-bold text-slate-700">No Certificates Yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Once your university issues a credential, it will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <div 
              key={cert.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-2xl">
                    🎓
                  </div>
                  {cert.status === 'valid' && (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide flex items-center gap-1">
                      <span>✓</span> Verified
                    </div>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-900 text-lg mb-1 leading-tight group-hover:text-blue-600 transition-colors">
                  {cert.course}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  Issued by {cert.university || "University"}
                </p>

                <div className="flex flex-col gap-1 text-xs text-slate-400 font-mono">
                  <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{cert.timestamp?.toDate ? cert.timestamp.toDate().toLocaleDateString() : "Recent"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ID:</span>
                    <span>{cert.studentId}</span>
                  </div>
                </div>
              </div>

              {/* 🆕 Token Display Section */}
              <div className="px-6 pb-4">
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Verification Token</p>
                    <p className="font-mono font-bold text-blue-600 tracking-wider">
                      {cert.credentialToken || "N/A"}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                        navigator.clipboard.writeText(cert.credentialToken);
                        alert("Token copied!");
                    }}
                    className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded hover:bg-slate-100"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Card Actions */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setSelectedCert(cert)}
                  className="flex-1 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg hover:bg-slate-800 transition-colors"
                >
                  View Details
                </button>
                <button 
                  onClick={() => handleDownload(cert.fileUrl)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg hover:bg-slate-100 transition-colors"
                  title="Download PDF"
                >
                  ⬇
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CertificateModal 
        cert={selectedCert} 
        onClose={() => setSelectedCert(null)} 
      />
    </div>
  );
}