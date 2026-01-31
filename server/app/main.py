import cv2
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import io

# 1. Inisialisasi FastAPI
app = FastAPI(title="Grain-O-Meter API")

# 2. Konfigurasi CORS agar bisa diakses oleh React (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Mengizinkan semua akses (penting untuk development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Grain-O-Meter Server is Running!"}

@app.post("/scan")
async def scan_grain(file: UploadFile = File(...)):
    try:
        # Baca file gambar yang diupload
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="File gambar tidak valid")

        # --- ALUR SESUAI ESAY ---
        
        # 1. Preprocessing: Grayscale & Gaussian Blur
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # Menghilangkan noise (debu/sekam) sesuai poin 1 di esay
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)

        # 2. Segmentation: Otsu’s Binarization
        # Otomatis menghitung threshold optimal (poin 2 di esay)
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # 3. Classification: Geometric Morphology (Ellipse Fitting)
        # Mencari kontur butiran beras
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        head_rice = 0
        broken_rice = 0

        for cnt in contours:
            # Filter objek yang terlalu kecil (noise/pixel kotor)
            if cv2.contourArea(cnt) < 100:
                continue
            
            # Fit Ellipse minimal butuh 5 titik kontur
            if len(cnt) >= 5:
                ellipse = cv2.fitEllipse(cnt)
                (x, y), (axes, axes_minor), angle = ellipse
                
                major_axis = max(axes, axes_minor)
                minor_axis = min(axes, axes_minor)
                
                # Hitung Aspect Ratio (poin 3 di esay)
                aspect_ratio = major_axis / minor_axis if minor_axis != 0 else 0
                
                # Logika Klasifikasi: > 2.0 Head Rice, < 2.0 Broken Rice
                if aspect_ratio > 2.0:
                    head_rice += 1
                else:
                    broken_rice += 1

        # --- PERHITUNGAN STANDAR SNI ---
        total = head_rice + broken_rice
        percentage = round((head_rice / total * 100), 2) if total > 0 else 0
        
        # Grade berdasarkan persentase beras utuh
        grade = "PREMIUM" if percentage >= 95 else "MEDIUM / STANDAR"

        return {
            "status": "success",
            "head_rice": head_rice,
            "broken_rice": broken_rice,
            "total_grains": total,
            "percentage": percentage,
            "grade": grade
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}

# 3. Bagian untuk Menjalankan Server
if __name__ == "__main__":
    print("--- GRAIN-O-METER SERVER STARTING ---")
    print("Akses di: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)