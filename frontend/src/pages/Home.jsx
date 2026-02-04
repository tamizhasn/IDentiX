import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import AuthModal from "../components/AuthModal"; // ✅ Import the Modal

// --- 1. ABSTRACT BACKGROUND ANIMATION (The "Matrix" Effect) ---
const CryptoStream = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-white">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-slate-200 font-mono text-[10px] md:text-xs select-none opacity-30"
          initial={{ y: -100, x: Math.random() * 100 + "%" }}
          animate={{ y: "120vh" }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 5
          }}
        >
          {Math.random() > 0.5 
            ? "0x" + Math.random().toString(16).substr(2, 12) 
            : "101101001010110"}
        </motion.div>
      ))}
    </div>
  );
};

// --- 2. HERO SECTION: 3D Code Block (Updated with Modal Trigger) ---
const HeroSection = ({ onOpenAuth }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <CryptoStream />
      
      {/* Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-blue-400/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-400/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Content */}
        <motion.div style={{ y: y1 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "auto" }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 bg-blue-50/50 backdrop-blur-md mb-8 overflow-hidden whitespace-nowrap"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span className="text-sm font-bold text-blue-800">Protocol Live on Sepolia</span>
          </motion.div>

          <h1 className="text-7xl md:text-9xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
            TRUST <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              IS CODE.
            </span>
          </h1>

          <p className="text-xl text-slate-500 font-light mb-10 max-w-lg leading-relaxed">
            The era of paper is over. IDentix issues cryptographically secured, 
            permanently accessible credentials on the Ethereum Blockchain.
          </p>

          <div className="flex flex-wrap gap-4">
            {/* ✅ FIXED: Button triggers modal instead of bad link */}
            <button 
              onClick={onOpenAuth}
              className="px-10 py-4 bg-slate-900 text-white font-bold rounded-full hover:scale-105 hover:shadow-2xl transition-all"
            >
              Launch App
            </button>
            <Link to="/verify" className="px-10 py-4 bg-white border border-slate-200 text-slate-900 font-bold rounded-full hover:bg-slate-50 transition-all">
              Verify Doc
            </Link>
          </div>
        </motion.div>

        {/* Right Animation: The "Genesis Block" */}
        <div className="relative h-[500px] flex items-center justify-center perspective-1000">
          <motion.div
            animate={{ rotateY: 360, rotateX: 10 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="relative w-64 h-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700 shadow-2xl flex flex-col items-center justify-center p-6 preserve-3d"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front Face Details */}
            <div className="w-16 h-16 bg-blue-500 rounded-2xl mb-6 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/50">
              🔗
            </div>
            <div className="w-full h-2 bg-slate-700 rounded-full mb-3 overflow-hidden">
               <motion.div animate={{ width: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} className="h-full bg-blue-500"/>
            </div>
            <div className="space-y-2 w-full">
              <div className="h-2 w-3/4 bg-slate-700 rounded"></div>
              <div className="h-2 w-1/2 bg-slate-700 rounded"></div>
            </div>
            <p className="mt-8 font-mono text-xs text-blue-400">HASH: 0x7F...3A</p>
            
            {/* Floating Elements behind */}
            <motion.div 
               animate={{ z: -50, x: 40, y: -40 }} 
               className="absolute inset-0 bg-slate-200 rounded-3xl -z-10 opacity-30" 
            />
             <motion.div 
               animate={{ z: -100, x: -40, y: 40 }} 
               className="absolute inset-0 bg-slate-300 rounded-3xl -z-20 opacity-20" 
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- 3. PROBLEM SECTION: The "Glitch" ---
const ProblemSection = () => {
  return (
    <section className="py-32 bg-black text-white relative z-20 overflow-hidden">
      {/* Background Noise */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="mb-24">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-5xl md:text-8xl font-bold tracking-tighter"
          >
            SYSTEM <span className="text-red-600">FAILURE</span>
          </motion.h2>
          <div className="h-1 w-32 bg-red-600 mt-6"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 border-t border-slate-800 pt-12">
          {[
            { id: "01", title: "Forgery", desc: "Photoshop AI creates undetectable fake degrees in seconds." },
            { id: "02", title: "Decay", desc: "Servers crash. Paper burns. Centralized data is not permanent." },
            { id: "03", title: "Friction", desc: "Manual verification takes weeks. The modern world needs instant truth." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.2 }}
              className="group"
            >
              <div className="text-red-500 font-mono text-sm mb-4">ERR_Code_{item.id}</div>
              <h3 className="text-3xl font-bold mb-4 group-hover:text-red-500 transition-colors">{item.title}</h3>
              <p className="text-slate-400 text-lg leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- 4. SOLUTION: "Building the Trust" ---
const SolutionSection = () => {
  const steps = [
    { title: "Digitize", icon: "📄", desc: "Issuer uploads PDF. We generate a SHA-256 fingerprint." },
    { title: "Decentralize", icon: "📦", desc: "File stored on IPFS. No central server owner." },
    { title: "Immutable", icon: "🔒", desc: "Fingerprint minted to Ethereum. Cannot be edited." }
  ];

  return (
    <section className="py-32 bg-slate-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20">
          
          <div className="lg:w-1/3">
            <span className="text-blue-600 font-bold uppercase tracking-widest text-sm">Architecture</span>
            <h2 className="text-5xl font-bold mt-4 mb-8 text-slate-900">Proof, <br/>Not Promises.</h2>
            <p className="text-slate-600 text-lg leading-relaxed">
              We leverage a hybrid architecture. Heavy files live on IPFS. 
              The "Truth" lives on Ethereum. This ensures cheap storage with military-grade security.
            </p>
          </div>

          <div className="lg:w-2/3 grid gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex items-center gap-8"
              >
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shrink-0">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-500">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

// --- 5. INTERACTIVE TERMINAL ---
const TerminalSection = () => {
  return (
    <section className="py-32 bg-slate-900 text-white font-mono">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div className="ml-4 text-xs text-slate-500">verification_logic.sol</div>
            </div>
            <div className="p-8 text-sm md:text-base text-blue-300 overflow-x-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 2 }}
              >
<pre>{`// The Core Truth Engine

function verifyCertificate(string memory _id, string memory _hash) 
    public view returns (bool) {
    
    // 1. Fetch Immutable Record from Blockchain
    bytes32 storedHash = certificates[_id].fileHash;

    // 2. Cryptographic Comparison
    if (storedHash == keccak256(abi.encodePacked(_hash))) {
        return true; // ✅ MATH MATCHES
    }

    return false; // ❌ TAMPER DETECTED
}`}</pre>
              </motion.div>
            </div>
          </div>
          <p className="text-center text-slate-500 mt-8 text-sm">
            * Smart Contract Logic running on Sepolia Testnet
          </p>
        </div>
      </div>
    </section>
  );
};

// --- 6. ROADMAP ---
const Roadmap = () => {
  return (
    <section className="py-32 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-20">The Vision</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { year: "2024", title: "Genesis", active: true },
            { year: "2025", title: "Testnet Pilot", active: true },
            { year: "2026", title: "Mainnet Beta", active: false },
            { year: "2027", title: "Global Standard", active: false }
          ].map((item, i) => (
            <div key={i} className="relative">
              <div className={`h-1 w-full mb-6 ${item.active ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
              <h3 className="text-lg font-bold text-slate-400 mb-2">{item.year}</h3>
              <h4 className={`text-2xl font-bold ${item.active ? 'text-slate-900' : 'text-slate-300'}`}>{item.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// --- 7. FINAL CTA (Updated with Modal Trigger) ---
const FinalCTA = ({ onOpenAuth }) => {
  return (
    <section className="py-40 relative bg-slate-900 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.2),transparent_70%)]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <h2 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter">
          START NOW.
        </h2>
        <div className="flex justify-center gap-6">
          <button 
            onClick={onOpenAuth}
            className="px-12 py-6 bg-white text-slate-900 font-bold text-xl rounded-full hover:scale-105 transition-transform"
          >
            Launch Platform
          </button>
        </div>
      </div>
    </section>
  );
};

// --- MAIN COMPONENT ---
export default function Home() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  const [showAuth, setShowAuth] = useState(false); // ✅ Manage Modal State

  return (
    <MainLayout>
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 origin-left z-50" 
        style={{ scaleX }} 
      />
      
      <div className="bg-white">
        {/* Pass trigger to sections */}
        <HeroSection onOpenAuth={() => setShowAuth(true)} />
        <ProblemSection />
        <SolutionSection />
        <TerminalSection />
        <Roadmap />
        <FinalCTA onOpenAuth={() => setShowAuth(true)} />
      </div>

      {/* ✅ Render Modal when state is true */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </MainLayout>
  );
}