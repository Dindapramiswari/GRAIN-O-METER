import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Gambar placeholder estetik untuk background & fitur
const HERO_IMG = "https://images.unsplash.com/photo-1535090467336-9501f96eef89?q=80&w=2000&auto=format&fit=crop";
const FEATURE_IMG = "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=800&auto=format&fit=crop";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('http://localhost:8000/scan', formData);
      setResult(res.data);
    } catch (err) { alert("Server belum aktif!"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-10 py-5 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="text-2xl font-black tracking-tighter text-emerald-900 italic">GRAIN-O-METER</div>
        <div className="hidden md:flex space-x-8 font-medium text-sm uppercase tracking-widest text-gray-500">
          <a href="#" className="hover:text-emerald-600 transition">Home</a>
          <a href="#" className="hover:text-emerald-600 transition">Standards</a>
          <a href="#" className="hover:text-emerald-600 transition">Technology</a>
        </div>
        <button className="bg-emerald-900 text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-emerald-800 transition shadow-lg shadow-emerald-200">
          GET IN TOUCH
        </button>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <img src={HERO_IMG} className="absolute inset-0 w-full h-full object-cover brightness-50" alt="Hero" />
        <div className="relative z-10 text-center px-5">
          <h2 className="text-yellow-400 font-bold tracking-widest uppercase mb-4 drop-shadow-md">Rooted in Science</h2>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">Driven by <br/><span className="italic">Innovation.</span></h1>
          <p className="text-gray-200 max-w-2xl mx-auto text-lg mb-8">
            Empowering smallholder farmers with accessible computer vision for standardized rice quality assessment[cite: 1, 24].
          </p>
        </div>
      </section>

      {/* ANALYSIS SECTION (MAIN FEATURE) */}
      <section className="py-20 px-10 max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h4 className="text-emerald-700 font-bold uppercase tracking-widest mb-2 text-sm">Agriculture Partner</h4>
          <h3 className="text-4xl font-black text-emerald-900 mb-6 leading-tight">Standardized Grading <br/>for Fair Trade.</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Unlike industrial grading machines, Grain-O-Meter utilizes simple morphological analysis to instantly quantify rice quality[cite: 25, 26]. 
            Transitioning farmers from "price takers" to "quality makers"[cite: 55].
          </p>
          
          {/* UPLOAD CARD */}
          <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-100/50">
             <div className="mb-6">
                <input 
                  type="file" 
                  id="grain-upload"
                  className="hidden" 
                  onChange={(e) => setFile(e.target.files[0])}
                />
                <label htmlFor="grain-upload" className="cursor-pointer group">
                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-10 text-center group-hover:bg-emerald-100/50 transition duration-300">
                    {preview ? (
                      <img src={preview} className="h-40 mx-auto rounded-lg shadow-md object-cover" />
                    ) : (
                      <div className="text-emerald-700 font-bold uppercase tracking-tighter text-sm">Click to Take Photo of Grain</div>
                    )}
                  </div>
                </label>
             </div>
             <button 
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full bg-yellow-400 text-emerald-900 py-4 rounded-2xl font-black text-lg hover:bg-yellow-500 transition shadow-lg shadow-yellow-200"
             >
                {loading ? "PROCESSING..." : "START SCANNING"}
             </button>
          </div>
        </div>

        {/* RESULTS CARD */}
        <div className="relative">
          {result ? (
            <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-gray-100 animate-fade-in relative z-10">
               <div className="flex justify-between items-start mb-8 text-sm font-bold text-gray-400 uppercase tracking-widest border-b pb-4">
                  <span>Quality Report</span>
                  <span className="text-emerald-600 font-black italic underline">Official SNI 6128</span>
               </div>
               <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 font-medium italic">Head Rice Count</span>
                    <span className="text-3xl font-black text-emerald-900 tracking-tighter">{result.head_rice} <small className="text-xs text-gray-400 font-normal italic">units</small></span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-gray-500 font-medium italic">Broken Rice Count</span>
                    <span className="text-3xl font-black text-orange-600 tracking-tighter">{result.broken_rice} <small className="text-xs text-gray-400 font-normal italic">units</small></span>
                  </div>
                  <div className="mt-10 py-8 bg-emerald-900 text-white rounded-3xl text-center">
                    <div className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-400 mb-2">Final Classification</div>
                    <div className="text-5xl font-black italic">{result.grade}</div>
                    <div className="mt-4 text-emerald-300 font-bold">{result.percentage}% Head Rice</div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="rounded-[40px] overflow-hidden shadow-2xl">
              <img src={FEATURE_IMG} className="w-full h-[500px] object-cover" />
              <div className="absolute inset-0 bg-emerald-900/40 flex items-center justify-center p-10 text-center">
                <p className="text-white text-xl font-bold italic leading-relaxed">
                  "Innovations in agriculture are the only way to meet the world's growing demand for food." [cite: 2]
                </p>
              </div>
            </div>
          )}
          {/* Dekorasi Bulatan Kuning */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-400 rounded-full -z-10 shadow-2xl shadow-yellow-200"></div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-emerald-950 text-white py-20 px-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center opacity-80 border-t border-emerald-800 pt-10">
          <div className="text-xl font-black italic mb-5 md:mb-0">GRAIN-O-METER</div>
          <div className="text-xs text-center md:text-right">
            Shaping Inclusive Development through Accessible Technology[cite: 28, 73]. <br/>
            © 2026 VerdaAgro Systems. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;