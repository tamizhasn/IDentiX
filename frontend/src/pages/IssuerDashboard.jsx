import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { db, auth } from "../firebase";
import { doc, getDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../abi";
import { uploadToIPFS } from "../utils/ipfs";
import MainLayout from "../layouts/MainLayout";
import PageTransition from "../components/PageTransition";
import { motion } from "framer-motion";

export default function IssuerDashboard() {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    name: "",
    course: "",
    date: "",
    university: "", 
    department: ""
  });

  useEffect(() => {
    const fetchIssuerProfile = async () => {
      if (auth.currentUser) {
        try {
          const docRef = doc(db, "users", auth.currentUser.uid);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            setFormData(prev => ({
              ...prev,
              university: data.university || "",
              department: data.department || ""
            }));
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setIsProfileLoaded(true);
        }
      }
    };
    fetchIssuerProfile();
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setWallet(signer);
      } catch (err) {
        alert("Connection failed: " + err.message);
      }
    } else {
      alert("Please install Metamask");
    }
  };

  const hashPDF = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return "0x" + hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  // 🆕 Helper: Generate Short Unique Token (e.g., IDX-A7B2)
  const generateToken = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; 
    let token = "IDX-";
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "loading", msg: "Hashing & Uploading..." });

    try {
      if (!wallet) throw new Error("Wallet disconnected");
      if (!file) throw new Error("Please upload a PDF");

      // 1. IPFS Upload
      const ipfsUrl = await uploadToIPFS(file);
      if (!ipfsUrl) throw new Error("IPFS Upload Failed");

      // 2. Generate Hashes & Token
      const pdfHash = await hashPDF(file);
      const studentIdHash = ethers.id(formData.studentId);
      const credentialToken = generateToken(); // 🆕 Generate Token

      // 3. Blockchain Transaction
      setStatus({ type: "loading", msg: "Please confirm in Metamask..." });
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
      const tx = await contract.issueCredential(studentIdHash, pdfHash);
      
      setStatus({ type: "loading", msg: "Waiting for Block Confirmation..." });
      await tx.wait();

      // 4. Save to Database (WITH TOKEN)
      setStatus({ type: "loading", msg: "Indexing Record..." });
      
      await addDoc(collection(db, "certificates"), {
        ...formData,
        credentialToken: credentialToken, // 🆕 Save the token!
        fileUrl: ipfsUrl,
        pdfHash: pdfHash,
        studentIdHash: studentIdHash,
        txHash: tx.hash,
        issuedBy: await wallet.getAddress(),
        issuerUid: auth.currentUser?.uid,
        timestamp: serverTimestamp(),
        status: "valid",
        storageType: "IPFS"
      });

      setStatus({ type: "success", msg: `Success! Token: ${credentialToken}` });
      
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) {
    return (
      <MainLayout>
        <PageTransition>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-10 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full"
            >
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🔐</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Issuer Authority</h2>
              <p className="text-slate-500 mb-8">Connect your organization's wallet to issue credentials.</p>
              <button onClick={connectWallet} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                Connect Metamask
              </button>
            </motion.div>
          </div>
        </PageTransition>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageTransition>
        <div className="max-w-3xl mx-auto py-8">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
          >
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Issue Credential</h2>
                <p className="text-slate-500 text-sm mt-1">Deploying to Ethereum & IPFS</p>
              </div>
              <div className="px-4 py-2 bg-green-50 border border-green-100 rounded-full text-xs font-mono font-medium text-green-700">
                {wallet.address.slice(0,6)}...{wallet.address.slice(-4)}
              </div>
            </div>

            <form onSubmit={handleIssue} className="space-y-6">
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Organization</label>
                  <input disabled value={isProfileLoaded ? (formData.university || "Not Set") : "Loading..."} className="w-full bg-transparent font-medium text-slate-700 outline-none"/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Department</label>
                  <input disabled value={isProfileLoaded ? (formData.department || "Not Set") : "Loading..."} className="w-full bg-transparent font-medium text-slate-700 outline-none"/>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student ID</label>
                  <input required className="w-full p-3 border border-slate-200 rounded-lg outline-none font-mono text-sm" placeholder="e.g. CS2024001" onChange={e => setFormData({...formData, studentId: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Student Name</label>
                  <input required className="w-full p-3 border border-slate-200 rounded-lg outline-none" placeholder="Full Name" onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Course / Degree</label>
                <input required className="w-full p-3 border border-slate-200 rounded-lg outline-none" placeholder="e.g. B.Tech Computer Science" onChange={e => setFormData({...formData, course: e.target.value})} />
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
                <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="space-y-2">
                  <div className="text-4xl">📄</div>
                  <div className="text-sm font-medium text-slate-600">{file ? <span className="text-blue-600">{file.name}</span> : "Click to upload PDF"}</div>
                </div>
              </div>

              <button disabled={loading} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg flex justify-center items-center gap-2">
                {loading ? "Processing..." : "Sign & Issue Credential"}
              </button>
            </form>

            {status && (
              <div className={`mt-6 p-4 rounded-xl border flex items-center gap-3 ${status.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                <div className="font-medium text-sm break-all">{status.msg}</div>
              </div>
            )}
          </motion.div>
        </div>
      </PageTransition>
    </MainLayout>
  );
}