from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = YOLO('Model/best.pt')

# Fallback names in case the model classes aren't named properly
# The user wants 7 zones:
ZONE_NAMES = {
    0: "โซนสะโพก (Hip Zone)",
    1: "ส่วนหลัง / สันนอก (Loin / Spine)",
    2: "โคนขาหลัง / น่อง (Rear Thigh / Shank)",
    3: "ไหล่ (Neck)",
    4: "สันคอ / น่องขาหน้า",
    5: "เนื้อใต้อก (Brisket)",
    6: "ส่วนท้อง (Belly / Midsection)"
}

ZONE_COLORS = [
    (0, 0, 255),    # 0: Red
    (0, 255, 0),    # 1: Green
    (0, 255, 255),  # 2: Yellow
    (255, 0, 0),    # 3: Blue
    (0, 165, 255),  # 4: Orange
    (255, 0, 255),  # 5: Purple
    (255, 255, 0),  # 6: Cyan
]

@app.get("/")
def read_root():
    return {"message": "BovWeight AI Backend is running (Multi-zone supported)"}

@app.post("/api/segment")
async def segment_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    results = model(img)
    
    overlay_img = img.copy()
    total_pixel_area = 0
    zone_stats = {}

    r = results[0]
    if r.masks is not None:
        masks = r.masks.data.cpu().numpy()
        classes = r.boxes.cls.cpu().numpy() if r.boxes is not None else []
        
        num_classes_in_model = len(model.names)
        is_single_class_model = num_classes_in_model == 1
        
        for i, mask in enumerate(masks):
            cls_id = int(classes[i]) if len(classes) > i else 0
            
            mask_resized = cv2.resize(mask, (img.shape[1], img.shape[0]))
            area = int(np.sum(mask_resized > 0.5))
            total_pixel_area += area
            
            # Determine color and name
            if is_single_class_model:
                color = (0, 255, 0) # Green for whole cow
                name = "ตัวโค (รวม)"
            else:
                color = ZONE_COLORS[cls_id % len(ZONE_COLORS)]
                name = ZONE_NAMES.get(cls_id, model.names.get(cls_id, f"Zone {cls_id}"))

            # Accumulate area per zone
            if name not in zone_stats:
                zone_stats[name] = {"area": 0, "color_hex": f"#{color[2]:02x}{color[1]:02x}{color[0]:02x}"}
            zone_stats[name]["area"] += area
            
            # Draw overlay
            overlay = np.zeros_like(img, dtype=np.uint8)
            overlay[mask_resized > 0.5] = color
            cv2.addWeighted(overlay, 0.5, overlay_img, 0.5, 0, overlay_img)

    _, buffer = cv2.imencode('.jpg', overlay_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    # Calculate percentages
    zones_list = []
    for name, data in zone_stats.items():
        percentage = (data["area"] / total_pixel_area * 100) if total_pixel_area > 0 else 0
        zones_list.append({
            "name": name,
            "area": data["area"],
            "percentage": round(percentage, 1),
            "color": data["color_hex"]
        })
        
    # Sort zones by area descending
    zones_list = sorted(zones_list, key=lambda x: x["area"], reverse=True)
    
    return {
        "success": True,
        "pixel_area": float(total_pixel_area),
        "image_base64": f"data:image/jpeg;base64,{img_base64}",
        "zones": zones_list,
        "is_single_class_model": (len(model.names) == 1)
    }
