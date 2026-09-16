from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import base64

app = FastAPI()

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the YOLO segmentation model
# The model will be mounted via Docker volumes at /app/Model/best.pt
model = YOLO('Model/best.pt')

@app.get("/")
def read_root():
    return {"message": "BovWeight AI Backend is running"}

@app.post("/api/segment")
async def segment_image(file: UploadFile = File(...)):
    contents = await file.read()
    
    # Convert image for OpenCV
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run YOLO Prediction
    results = model(img)
    
    pixel_area = 0
    overlay_img = img.copy()
    
    # Process results
    for r in results:
        if r.masks is not None:
            # Get masks
            masks = r.masks.data.cpu().numpy()
            
            # Find the largest mask
            if len(masks) > 0:
                mask = masks[0]
                mask_resized = cv2.resize(mask, (img.shape[1], img.shape[0]))
                
                # Calculate pixel area
                pixel_area = np.sum(mask_resized > 0.5)
                
                # Create a colored overlay
                color = (0, 255, 0)
                overlay = np.zeros_like(img, dtype=np.uint8)
                overlay[mask_resized > 0.5] = color
                
                # Blend the original image and the overlay
                alpha = 0.5
                cv2.addWeighted(overlay, alpha, overlay_img, 1 - alpha, 0, overlay_img)

    # Convert the processed image to base64
    _, buffer = cv2.imencode('.jpg', overlay_img)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    
    return {
        "success": True,
        "pixel_area": float(pixel_area),
        "image_base64": f"data:image/jpeg;base64,{img_base64}"
    }
