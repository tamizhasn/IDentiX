import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../../firebase";
import { uploadToIPFS } from "../../utils/ipfs";

export default function ProfileSection({ userData, refreshProfile }) {
  // State Management
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [form, setForm] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [imgError, setImgError] = useState(false); // New state for error handling

  // 🔄 Sync state when userData prop updates
  useEffect(() => {
    if (userData) {
      setForm(userData);
      setPreviewUrl(userData.photoUrl || "");
      setImgError(false); // Reset error on new data
    }
  }, [userData]);

  // 🖼️ Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return alert("Image must be under 5MB");
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setImgError(false);
    }
  };

  // 💾 Save Logic
  const handleSave = async () => {
    setSaving(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      let finalPhotoUrl = form.photoUrl || "";

      // 1. Upload new image to IPFS (only if changed)
      if (photoFile) {
        const ipfsLink = await uploadToIPFS(photoFile);
        if (!ipfsLink) throw new Error("Image upload failed");
        finalPhotoUrl = ipfsLink;
      }

      // 2. Prepare Clean Data Object
      const cleanData = {
        name: form.name || "",
        phone: form.phone || "",
        studentId: form.studentId || "",
        university: form.university || "",
        department: form.department || "",
        gradYear: form.gradYear || "",
        bio: form.bio || "",
        linkedIn: form.linkedIn || "",
        photoUrl: finalPhotoUrl,
        updatedAt: new Date().toISOString()
      };

      // 3. Update Database
      await updateDoc(userRef, cleanData);
      
      // 4. Update UI & Notify Parent
      setForm(prev => ({ ...prev, ...cleanData }));
      setIsEditing(false);
      setPhotoFile(null);
      
      if (refreshProfile) refreshProfile(); 

      alert("✅ Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-slate-100 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Identity Profile</h2>
          <p className="text-slate-500 text-sm mt-1">
            Your decentralized identity on the blockchain.
          </p>
        </div>
        
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${
            isEditing 
              ? "bg-green-600 text-white hover:bg-green-700 shadow-green-200" 
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
          }`}
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
              <span>Saving...</span>
            </>
          ) : (
            isEditing ? "💾 Save Changes" : "✏️ Edit Profile"
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT: Profile Picture */}
        <div className="md:col-span-1 flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center relative">
              {previewUrl && !imgError ? (
                <img 
                  src={previewUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                  onError={() => setImgError(true)} // 🟢 Fallback if IPFS is slow
                />
              ) : (
                <span className="text-4xl">👤</span>
              )}
              
              {/* Edit Overlay */}
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10">
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    📷 Change
                  </span>
                </label>
              )}
            </div>
            
            <div className="mt-4">
              <h3 className="font-bold text-slate-900 text-lg">{form.name || "Student Name"}</h3>
              <p className="text-slate-500 text-sm font-mono">{form.studentId || "No ID Set"}</p>
              {previewUrl && (
                <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded border ${imgError ? 'bg-red-50 text-red-500 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                  {imgError ? "Image Load Failed" : "IPFS Hosted 🌐"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Details Form */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Full Name</label>
             <input disabled={!isEditing} value={form.name || ""} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:bg-slate-50 font-medium" placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student ID</label>
            <input disabled={!isEditing} value={form.studentId || ""} onChange={e => setForm({...form, studentId: e.target.value})} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 font-mono text-sm" placeholder="CS-2024-001" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</label>
            <input disabled={!isEditing} value={form.phone || ""} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50" placeholder="+1 234 567 890" type="tel" />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">University</label>
             <input disabled={!isEditing} value={form.university || ""} onChange={e => setForm({...form, university: e.target.value})} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50" placeholder="University Name" />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Department</label>
             <input disabled={!isEditing} value={form.department || ""} onChange={e => setForm({...form, department: e.target.value})} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50" placeholder="Computer Science" />
          </div>

          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Graduation Year</label>
             <input disabled={!isEditing} value={form.gradYear || ""} onChange={e => setForm({...form, gradYear: e.target.value})} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50" placeholder="2026" type="number" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bio / Headline</label>
            <textarea disabled={!isEditing} value={form.bio || ""} onChange={e => setForm({...form, bio: e.target.value})} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl h-28 resize-none focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50" placeholder="Tell us about yourself..." />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">LinkedIn Profile</label>
            <input disabled={!isEditing} value={form.linkedIn || ""} onChange={e => setForm({...form, linkedIn: e.target.value})} className="w-full p-3.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-50 text-blue-600 underline" placeholder="https://linkedin.com/in/..." />
          </div>

        </div>
      </div>
    </div>
  );
}