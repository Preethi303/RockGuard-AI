from email.mime import image

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
from PIL import Image
import io
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

app = FastAPI()

# ✅ allow React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import tensorflow as tf
import os

model = tf.keras.models.load_model("rockfall_final.h5", compile=False)
print("✅ Model loaded successfully")

class_names = ["High Risk", "Safe", "Warning"]

@app.get("/")
def root():
    return {"status": "backend ready"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
    image = image.resize((224, 224))
    img_array = np.array(image)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0) 

    preds = model.predict(img_array)
    high, safe, warning = preds[0]

    # 🔥 smarter decision logic
    if high > 0.40:
        label = "High Risk"
        confidence = high
    elif warning > 0.40:
        label = "Warning"
        confidence = warning
    else:
        label = "Safe"
        confidence = safe

    return {
        "class": label,
        "confidence": float(confidence)
    }