import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import axios from "axios";
import {
  Camera,
  CheckCircle,
  ChevronRight,
  X,
  Sprout,
  UploadCloud,
  RotateCcw,
  AlertTriangle,
  Zap,
  Smartphone,
  Monitor,
  Image as ImageIcon,
  Scale,
} from "lucide-react";

function App() {
  const [mode, setMode] = useState("HOME");
  const [imgSrc, setImgSrc] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const videoConstraints = {
    facingMode: isMobile ? { exact: "environment" } : "user",
    aspectRatio: isMobile ? 9 / 16 : 16 / 9,
  };

  const dataURLtoBlob = (dataurl) => {
    try {
      let arr = dataurl.split(","),
        mime = arr[0].match(/:(.*?);/)[1];
      let bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setImgSrc(imageSrc);
      setMode("PREVIEW");
    }
  }, [webcamRef]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result);
        setMode("PREVIEW");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleScan = async () => {
    setLoading(true);
    const blob = dataURLtoBlob(imgSrc);
    if (!blob) {
      alert("Failed to process image.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", blob, "sample.jpg");

    try {
      const res = await axios.post(
        "https://kv72x06l-8000.asse.devtunnels.ms/scan",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setResult(res.data);
      setMode("RESULT");
    } catch (err) {
      console.error(err);
      alert("Connection Failed. Ensure Python Backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#f3f4f0] text-[#244219] font-sans overflow-hidden m-0 p-0">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="w-full h-full bg-white relative flex flex-col md:flex-row">
        {/* ================= MODE: HOME ================= */}
        {mode === "HOME" && (
          <>
            <div className="hidden md:flex flex-1 bg-[#244219] relative items-center justify-center overflow-hidden p-12">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#365223] rounded-full blur-[100px] opacity-60 translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#859D25] rounded-full blur-[80px] opacity-30 -translate-x-1/2 translate-y-1/2"></div>

              <div className="relative z-10 text-center text-white px-8">
                <div className="bg-[#365223] w-32 h-32 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_50px_rgba(133,157,37,0.4)] animate-bounce border border-[#506433]">
                  <Scale size={64} className="text-[#859D25]" />
                </div>
                <h1 className="text-5xl font-bold mb-6">Fair Trade for All</h1>
                <p className="text-[#859D25] text-xl leading-relaxed max-w-lg mx-auto">
                  "Innovations in agriculture are the only way to lift the
                  poorest out of poverty." <br />
                  <span className="text-sm opacity-80 mt-2 block">
                    — Bill Gates
                  </span>
                </p>
              </div>
            </div>

            <div className="flex-1 bg-white flex flex-col justify-center p-8 md:p-24 relative">
              <div className="md:hidden bg-[#f3f4f0] w-20 h-20 rounded-2xl flex items-center justify-center shadow-md mb-8 border border-[#859D25]">
                <Sprout size={40} color="#244219" />
              </div>

              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-[#f3f4f0] text-[#859D25] px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                    Accessible Precision
                  </span>
                  <span className="bg-[#f3f4f0] text-[#506433] px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">
                    Zero-Friction PWA
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-[#244219] mb-6 tracking-tighter leading-none">
                  Grain-O-Meter
                </h1>

                <p className="text-[#506433] text-lg md:text-xl font-medium leading-relaxed max-w-lg">
                  Transforming farmers from passive{" "}
                  <span className="text-red-500 font-bold decoration-red-200  decoration-2">
                    Price Takers
                  </span>{" "}
                  into empowered{" "}
                  <span className="text-[#859D25] font-bold decoration-[#859D25]  decoration-2">
                    Quality Makers
                  </span>
                  .
                </p>
              </div>

              <div className="flex flex-col gap-4 w-full md:w-auto md:max-w-md">
                <button
                  onClick={() => setMode("CAMERA")}
                  className="group w-full bg-[#244219] hover:bg-[#1b1d16] text-white font-bold py-6 px-8 rounded-2xl shadow-xl shadow-[#244219]/20 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-95"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#ffffff]/10 p-2 rounded-lg">
                      <Camera className="w-6 h-6 text-[#859D25]" />
                    </div>
                    <div className="text-left">
                      <span className="block text-xl leading-none">
                        Start Grading
                      </span>
                      <span className="text-xs font-normal opacity-70 text-[#859D25]">
                        Smart Analysis
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-[#859D25] opacity-70 group-hover:translate-x-2 transition-transform" />
                </button>

                <button
                  onClick={triggerFileUpload}
                  className="group w-full bg-[#859D25] hover:bg-[#6e821e] text-white font-bold py-5 px-8 rounded-2xl shadow-lg shadow-[#859D25]/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <ImageIcon className="w-6 h-6" />
                  <span className="text-lg">Upload Sample</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* ================= MODE: CAMERA ================= */}
        {mode === "CAMERA" && (
          <div className="w-full h-full relative bg-black flex flex-col">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="absolute inset-0 w-full h-full object-cover"
              onUserMediaError={() => alert("Camera permission denied.")}
            />

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-[80vw] h-[80vw] md:w-[600px] md:h-[600px] border-2 border-[#859D25] rounded-[2rem] relative shadow-[0_0_100vw_rgba(0,0,0,0.8)]">
                <div className="absolute -top-14 left-0 w-full text-center">
                  <span className="bg-[#859D25] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-xl border border-[#244219]">
                    SOP: Controlled Contrast
                  </span>
                </div>
                {/* Siku Dekoratif */}
                <div className="absolute top-0 left-0 w-10 h-10 border-l-8 border-t-8 border-[#859D25] -ml-1 -mt-1 rounded-tl-2xl"></div>
                <div className="absolute top-0 right-0 w-10 h-10 border-r-8 border-t-8 border-[#859D25] -mr-1 -mt-1 rounded-tr-2xl"></div>
                <div className="absolute bottom-0 left-0 w-10 h-10 border-l-8 border-b-8 border-[#859D25] -ml-1 -mb-1 rounded-bl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-10 h-10 border-r-8 border-b-8 border-[#859D25] -mr-1 -mb-1 rounded-br-2xl"></div>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full p-8 flex justify-between z-20 pointer-events-auto">
              <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-white text-xs font-bold">LIVE CAM</span>
              </div>
              <button
                onClick={() => setMode("HOME")}
                className="bg-black/40 p-3 rounded-full backdrop-blur-md text-white hover:bg-black/60 transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-10 flex flex-col items-center justify-end z-20 bg-gradient-to-t from-black/90 to-transparent pt-40 pointer-events-auto">
              <div className="flex items-center gap-6">
                <button
                  onClick={triggerFileUpload}
                  className="p-4 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-[#859D25] hover:text-white border border-white/20 transition-colors"
                >
                  <ImageIcon size={24} />
                </button>

                <button
                  onClick={capture}
                  className="w-24 h-24 bg-white rounded-full border-[8px] border-[#859D25]/50 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                >
                  <div className="w-20 h-20 bg-[#f3f4f0] rounded-full border-4 border-[#244219]"></div>
                </button>

                <div className="w-14"></div>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2">
                <p className="text-white text-sm flex items-center gap-2 font-medium opacity-90">
                  <AlertTriangle size={16} className="text-[#859D25]" />
                  Use Matte Dark Background
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE: PREVIEW ================= */}
        {mode === "PREVIEW" && imgSrc && (
          <div className="w-full h-full flex flex-col md:flex-row bg-[#1b1d16]">
            <div className="flex-[2] bg-black relative flex items-center justify-center p-0 md:p-12">
              <img
                src={imgSrc}
                alt="Preview"
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/20"
              />
              {loading && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
                  <div className="w-24 h-24 border-8 border-[#365223] border-t-[#859D25] rounded-full animate-spin mb-6"></div>
                  <h2 className="text-[#859D25] text-2xl font-black tracking-widest animate-pulse">
                    ANALYZING...
                  </h2>
                  <p className="text-white/50 text-sm mt-2">
                    Otsu Thresholding & Morphology
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1 bg-white p-10 md:p-16 flex flex-col justify-center z-10 shadow-[-20px_0_60px_rgba(0,0,0,0.3)]">
              <h3 className="text-3xl font-bold text-[#244219] mb-4">
                Verify Sample
              </h3>
              <p className="text-[#506433] text-lg mb-10 leading-relaxed">
                Are grains separated? (Required for Morphological Analysis)
              </p>

              <button
                onClick={handleScan}
                disabled={loading}
                className="w-full py-6 bg-[#244219] hover:bg-[#1b1d16] text-white font-bold rounded-2xl shadow-xl flex justify-center items-center gap-3 mb-4 transition-all disabled:opacity-50 text-xl"
              >
                <UploadCloud size={24} className="text-[#859D25]" />
                Run Analysis
              </button>

              <button
                onClick={() => setMode("CAMERA")}
                disabled={loading}
                className="w-full py-6 bg-transparent text-[#244219] font-bold rounded-2xl flex justify-center items-center gap-3 hover:bg-[#f3f4f0] border-2 border-[#244219]/20 text-xl"
              >
                <RotateCcw size={24} />
                Retake
              </button>
            </div>
          </div>
        )}

        {/* ================= MODE: RESULT ================= */}
        {mode === "RESULT" && result && (
          <div className="w-full h-full flex flex-col md:flex-row bg-[#f3f4f0] overflow-y-auto">
            <div className="md:w-[45%] bg-[#244219] p-10 flex flex-col justify-center items-center text-center relative overflow-hidden shrink-0 text-white">
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#365223] rounded-full blur-[120px] opacity-60 translate-x-1/2 -translate-y-1/2"></div>

              <button
                onClick={() => setMode("HOME")}
                className="md:hidden absolute top-6 right-6 bg-white/10 p-3 rounded-full hover:bg-white/20"
              >
                <X size={24} />
              </button>

              <div className="relative z-10 animate-[fadeIn_0.5s_ease-out]">
                <div className="inline-block bg-[#859D25] text-white px-6 py-2 rounded-full text-sm font-black tracking-widest uppercase mb-8 shadow-xl">
                  Digital Certificate
                </div>

                {result.processed_image && (
                  <img
                    src={result.processed_image}
                    alt="Analyzed"
                    className="mb-6 rounded-xl border-4 border-[#859D25] shadow-2xl max-h-64 object-contain mx-auto"
                  />
                )}

                <h2 className="text-7xl md:text-8xl font-black mb-4 tracking-tighter drop-shadow-2xl text-white">
                  {result.grade}
                </h2>

                <div className="mt-2 flex items-center justify-center gap-3 bg-[#365223] px-8 py-3 rounded-2xl border border-[#506433] shadow-lg">
                  <CheckCircle size={28} className="text-[#859D25]" />
                  <span className="text-2xl font-bold">
                    {result.percentage}% Head Rice
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 bg-white p-8 md:p-16 flex flex-col justify-center relative">
              <button
                onClick={() => setMode("HOME")}
                className="hidden md:block absolute top-10 right-10 bg-[#f3f4f0] hover:bg-[#e7e9e2] p-3 rounded-full transition text-[#365223]"
              >
                <X size={32} />
              </button>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="bg-[#fcfdfc] p-8 rounded-[2rem] border border-[#365223]/10 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-[#506433] font-bold uppercase tracking-wider mb-2">
                    Head Rice
                  </p>
                  <p className="text-5xl md:text-6xl font-black text-[#244219]">
                    {result.head_rice}
                  </p>
                  <p className="text-sm text-[#506433] mt-2 opacity-70">
                    Whole Kernels
                  </p>
                </div>
                <div className="bg-[#fcfdfc] p-8 rounded-[2rem] border border-[#365223]/10 shadow-sm hover:shadow-md transition-shadow">
                  <p className="text-sm text-[#506433] font-bold uppercase tracking-wider mb-2">
                    Broken Rice
                  </p>
                  <p className="text-5xl md:text-6xl font-black text-[#859D25]">
                    {result.broken_rice}
                  </p>
                  <p className="text-sm text-[#506433] mt-2 opacity-70">
                    Broken Kernels
                  </p>
                </div>
              </div>

              <div className="bg-[#f3f4f0] border-l-8 border-[#859D25] p-8 rounded-r-2xl mb-12">
                <h4 className="font-bold text-[#244219] mb-2 flex items-center gap-3 text-lg">
                  <Zap size={24} className="text-[#859D25]" /> Economic Pivot
                </h4>
                <p className="text-base text-[#365223] leading-relaxed">
                  Based on SNI 6128:2015, this harvest is{" "}
                  <strong>{result.grade}</strong>. Use this data to reject
                  unfair price deductions ("Rafaksi").
                </p>
              </div>

              <button
                onClick={() => setMode("CAMERA")}
                className="w-full bg-[#859D25] hover:bg-[#6e821e] text-white py-6 rounded-2xl font-bold shadow-2xl shadow-[#859D25]/20 flex items-center justify-center gap-3 transition-all active:scale-95 text-xl"
              >
                <Camera size={24} />
                Scan Next Sample
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
