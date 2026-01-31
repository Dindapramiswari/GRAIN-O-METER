import cv2
import numpy as np
import base64
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(title="Grain-O-Meter API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scan")
async def scan_grain(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(status_code=400, detail="Invalid Image")

        # --- LANGKAH 1: PREPROCESSING ---
        # Ubah ke Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Gaussian Blur untuk hilangkan noise halus
        blurred = cv2.GaussianBlur(gray, (7, 7), 0)

        # --- LANGKAH 2: SEGMENTASI (OTSU) ---
        # Thresholding otomatis
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)

        # --- LANGKAH 3: PEMISAHAN BUTIR (PENTING!) ---
        # Morphological Opening: Erosi diikuti Dilasi untuk memisahkan butir yang nempel
        kernel = np.ones((3,3), np.uint8)
        # Iterations bisa dinaikkan jadi 2 atau 3 jika banyak yang nempel, tapi hati-hati butir jadi kecil
        opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2) 

        # --- LANGKAH 4: DETEKSI KONTUR ---
        # Cari kontur dari gambar hasil 'opening', bukan 'thresh' mentah
        contours, _ = cv2.findContours(opening, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        head_rice = 0
        broken_rice = 0
        
        # Copy gambar asli untuk digambar hasil visualisasinya
        result_img = img.copy()

        for cnt in contours:
            # Filter Noise: Abaikan jika area terlalu kecil (misal debu/sekam)
            # Nilai 150 bisa disesuaikan (dinaikkan jika banyak bintik kecil terdeteksi)
            area = cv2.contourArea(cnt)
            if area < 150: 
                continue
            
            # Fit Ellipse butuh minimal 5 titik
            if len(cnt) >= 5:
                ellipse = cv2.fitEllipse(cnt)
                (x, y), (axes, axes_minor), angle = ellipse
                
                major = max(axes, axes_minor)
                minor = min(axes, axes_minor)
                
                if minor == 0: continue

                # Hitung Rasio Panjang vs Lebar
                aspect_ratio = major / minor
                
                # --- VISUALISASI DEBUGGING ---
                # Gambar kontur aslinya (garis kuning tipis) untuk lihat apakah bentuknya pas
                cv2.drawContours(result_img, [cnt], -1, (0, 255, 255), 1)

                # KLASIFIKASI
                # Angka 2.0 bisa Anda tuning (misal jadi 1.8 atau 2.2) sesuai jenis beras
                if aspect_ratio > 2.0:
                    head_rice += 1
                    # Gambar Ellipse HIJAU (Head Rice) + Tebalkan
                    cv2.ellipse(result_img, ellipse, (0, 255, 0), 2)
                else:
                    broken_rice += 1
                    # Gambar Ellipse MERAH (Broken Rice) + Tebalkan
                    cv2.ellipse(result_img, ellipse, (0, 0, 255), 2)

        # Hitung Total & Persentase
        total = head_rice + broken_rice
        percentage = round((head_rice / total * 100), 2) if total > 0 else 0
        
        # Logika Grade SNI
        grade = "PREMIUM" if percentage >= 95 else "MEDIUM"

        # Encode gambar hasil ke Base64
        _, buffer = cv2.imencode('.jpg', result_img)
        img_base64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "status": "success",
            "head_rice": head_rice,
            "broken_rice": broken_rice,
            "total_grains": total,
            "percentage": percentage,
            "grade": grade,
            "processed_image": f"data:image/jpeg;base64,{img_base64}"
        }

    except Exception as e:
        print(f"Error Backend: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)