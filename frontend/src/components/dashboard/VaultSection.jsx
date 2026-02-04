import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { uploadToIPFS } from "../../utils/ipfs";

export default function VaultSection({ userId }) {
  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("loading"); // 'setup' | 'locked' | 'unlocked' | 'forgot'
  
  // User Data from DB
  const [dbProfile, setDbProfile] = useState(null);

  // Inputs
  const [inputPin, setInputPin] = useState("");
  const [setupPin, setSetupPin] = useState("");
  const [setupQuestion, setSetupQuestion] = useState("What was the name of your first pet?");
  const [setupAnswer, setSetupAnswer] = useState("");
  const [recoveryAnswer, setRecoveryAnswer] = useState("");

  // Vault Files
  const [uploads, setUploads] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    const checkVaultStatus = async () => {
      if (!userId) return;
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setDbProfile(data);

          // Check if PIN and Security Question are set in DB
          if (data.vaultPin && data.securityQuestion && data.securityAnswer) {
            setView("locked");
          } else {
            setView("setup"); // Force setup if missing
          }
        }
      } catch (err) {
        console.error("Error loading vault profile:", err);
      } finally {
        setLoading(false);
      }
    };
    checkVaultStatus();
  }, [userId]);

  // --- 2. SETUP (Set PIN + Question + Answer) ---
  const handleSetup = async (e) => {
    e.preventDefault();
    
    if (setupPin.length !== 4) return alert("PIN must be exactly 4 digits.");
    if (!setupAnswer.trim()) return alert("Security Answer is required.");

    try {
      setLoading(true);
      
      // Save directly to Firestore (No hashing as requested)
      const vaultData = {
        vaultPin: setupPin,
        securityQuestion: setupQuestion,
        securityAnswer: setupAnswer.toLowerCase().trim() // Normalize for easy matching
      };

      await updateDoc(doc(db, "users", userId), vaultData);
      
      // Update local state
      setDbProfile({ ...dbProfile, ...vaultData });
      setView("unlocked");
      fetchUploads();
      alert("✅ Vault Setup Complete!");
    } catch (err) {
      console.error(err);
      alert("Setup Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. UNLOCK (Check PIN against DB) ---
  const handleUnlock = (e) => {
    e.preventDefault();
    if (inputPin === dbProfile.vaultPin) {
      setView("unlocked");
      fetchUploads();
      setInputPin("");
    } else {
      alert("❌ Incorrect PIN");
      setInputPin("");
    }
  };

  // --- 4. RECOVERY (Verify Answer -> Reset PIN) ---
  const handleRecoveryVerification = async (e) => {
    e.preventDefault();
    
    const storedAnswer = dbProfile.securityAnswer; // Already lowercase from DB
    const inputClean = recoveryAnswer.toLowerCase().trim();

    if (storedAnswer === inputClean) {
      if (window.confirm("Answer Correct! Do you want to reset your PIN?")) {
        // Reset DB Pin
        await updateDoc(doc(db, "users", userId), { vaultPin: null });
        
        // Go back to Setup Mode
        setView("setup");
        setRecoveryAnswer("");
        setSetupPin("");
        alert("Please set a new PIN.");
      }
    } else {
      alert("❌ Incorrect Answer. Try again.");
    }
  };

  // --- 5. FILE OPERATIONS (IPFS + Firestore) ---
  const fetchUploads = async () => {
    try {
      const snap = await getDocs(collection(db, `users/${userId}/vault`));
      setUploads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !file) return alert("Missing title or file");
    
    setUploading(true);
    try {
      const ipfsUrl = await uploadToIPFS(file);
      if (!ipfsUrl) throw new Error("IPFS Upload Failed");

      await addDoc(collection(db, `users/${userId}/vault`), {
        title,
        fileUrl: ipfsUrl,
        fileName: file.name,
        date: new Date().toLocaleDateString(),
        type: "Personal",
        fileType: file.type || "unknown",
        storage: "IPFS"
      });

      setTitle("");
      setFile(null);
      fetchUploads();
    } catch (err) {
      alert("Upload Error: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId) => {
    if (window.confirm("Delete this file permanently?")) {
      await deleteDoc(doc(db, `users/${userId}/vault`, docId));
      fetchUploads();
    }
  };

  // --- RENDER VIEWS ---

  if (loading) return <div className="p-10 text-center animate-pulse">🔄 Loading Vault Security...</div>;

  // 1. SETUP VIEW (Set PIN & Security Q)
  if (view === "setup") {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl mb-4">🛡️</div>
        <h2 className="text-xl font-bold text-slate-900">Configure Vault</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-sm text-center">
          Set a PIN and Security Question to protect your private documents.
        </p>

        <form onSubmit={handleSetup} className="w-full max-w-sm px-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Create 4-Digit PIN</label>
            <input 
              type="password" maxLength="4" required
              className="w-full p-3 border rounded-lg text-center tracking-widest text-lg font-bold"
              placeholder="0000"
              value={setupPin}
              onChange={e => setSetupPin(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Security Question</label>
            <select 
              className="w-full p-3 border rounded-lg text-sm bg-white"
              value={setupQuestion}
              onChange={e => setSetupQuestion(e.target.value)}
            >
              <option>What was the name of your first pet?</option>
              <option>What city were you born in?</option>
              <option>What is your mother's maiden name?</option>
              <option>What was your favorite school subject?</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Security Answer</label>
            <input 
              type="text" required
              className="w-full p-3 border rounded-lg text-sm"
              placeholder="Enter answer..."
              value={setupAnswer}
              onChange={e => setSetupAnswer(e.target.value)}
            />
          </div>

          <button className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg">
            Save Configuration
          </button>
        </form>
      </div>
    );
  }

  // 2. FORGOT PASSWORD VIEW
  if (view === "forgot") {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-red-50 rounded-2xl border border-red-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl mb-4">❓</div>
        <h2 className="text-xl font-bold text-slate-900">Recover Access</h2>
        <p className="text-slate-500 text-sm mb-6">Answer your security question to reset PIN.</p>

        <form onSubmit={handleRecoveryVerification} className="w-full max-w-sm px-4 space-y-4">
          <div className="bg-white p-3 rounded-lg border border-red-100 text-center">
            <p className="text-xs font-bold text-red-400 uppercase">Question</p>
            <p className="font-medium text-slate-800">{dbProfile?.securityQuestion}</p>
          </div>

          <input 
            type="text" required autoFocus
            className="w-full p-3 border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            placeholder="Your Answer"
            value={recoveryAnswer}
            onChange={e => setRecoveryAnswer(e.target.value)}
          />

          <div className="flex gap-3">
            <button type="button" onClick={() => setView("locked")} className="flex-1 py-3 bg-slate-200 text-slate-700 font-bold rounded-xl">
              Back
            </button>
            <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg">
              Verify
            </button>
          </div>
        </form>
      </div>
    );
  }

  // 3. LOCKED VIEW
  if (view === "locked") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-3xl mb-6 text-white">🔒</div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Vault Locked</h2>
        <form onSubmit={handleUnlock} className="flex flex-col items-center gap-4">
          <div className="flex gap-2">
            <input 
              type="password" maxLength="4" autoFocus
              className="w-32 text-center text-xl tracking-widest p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="••••"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
            />
            <button className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 shadow-lg">
              Unlock
            </button>
          </div>
          <button type="button" onClick={() => setView("forgot")} className="text-sm text-slate-400 hover:text-slate-600 hover:underline">
            Forgot PIN?
          </button>
        </form>
      </div>
    );
  }

  // 4. UNLOCKED VIEW (Files)
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personal Vault</h2>
          <p className="text-sm text-slate-500">Files stored permanently on IPFS.</p>
        </div>
        <button 
          onClick={() => { setView("locked"); setInputPin(""); }} 
          className="text-sm text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors font-bold"
        >
          Lock Vault 🔒
        </button>
      </div>

      {/* Upload Form */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">Add Document</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            className="flex-[2] p-3 border border-slate-200 rounded-lg text-sm bg-white outline-none"
            placeholder="Document Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="flex-1 relative">
            <input type="file" id="vault-file" className="hidden" onChange={e => setFile(e.target.files[0])} />
            <label htmlFor="vault-file" className={`block w-full p-3 border border-slate-200 rounded-lg text-sm cursor-pointer text-center truncate ${file ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500'}`}>
              {file ? file.name : "📁 Select File"}
            </label>
          </div>
          <button onClick={handleUpload} disabled={uploading} className="px-8 py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md flex items-center justify-center min-w-[120px]">
            {uploading ? "..." : "Upload"}
          </button>
        </div>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        {uploads.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-200 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg">{item.fileType?.includes('image') ? '🖼️' : '📄'}</div>
              <div>
                <h4 className="font-bold text-slate-900">{item.title}</h4>
                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline">View on IPFS ↗</a>
              </div>
            </div>
            <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 p-2">✕</button>
          </div>
        ))}
        {uploads.length === 0 && <p className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-100 rounded-xl">Vault is empty.</p>}
      </div>
    </div>
  );
}