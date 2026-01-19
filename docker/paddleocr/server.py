"""
PaddleOCR API Server (Stable 2.x)
"""
import os
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from paddleocr import PaddleOCR

app = FastAPI(title="PaddleOCR API", version="2.7.3")

# Global OCR instance
ocr_engine = None

def get_ocr():
    """Initialize stable PaddleOCR"""
    global ocr_engine
    if ocr_engine is None:
        print("Loading Stable PaddleOCR 2.x...")
        ocr_engine = PaddleOCR(
            lang='th',
            use_angle_cls=True,
            use_gpu=False,
            show_log=False
        )
        print("PaddleOCR loaded successfully!")
    return ocr_engine

@app.on_event("startup")
async def startup():
    try:
        get_ocr()
    except Exception as e:
        print(f"Warning: {e}")

@app.get("/health")
async def health():
    return {"status": "ok", "engine": "PaddleOCR", "version": "2.x"}

@app.post("/ocr")
async def ocr(file: UploadFile = File(...)):
    try:
        engine = get_ocr()
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            # Stable 2.x API
            result = engine.ocr(tmp_path, cls=True)
            
            if not result or not result[0]:
                return JSONResponse(content={"success": True, "text": "", "blocks": []})
            
            blocks = []
            full_text_lines = []
            
            for line in result[0]:
                box = line[0]
                text = line[1][0]
                score = line[1][1]
                blocks.append({"text": text, "confidence": float(score), "box": box})
                full_text_lines.append(text)
            
            return JSONResponse(content={
                "success": True,
                "text": "\n".join(full_text_lines),
                "blocks": blocks,
                "filename": file.filename
            })
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ocr/slip")
async def ocr_slip(file: UploadFile = File(...)):
    try:
        engine = get_ocr()
        contents = await file.read()
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            result = engine.ocr(tmp_path, cls=True)
            
            if not result or not result[0]:
                return JSONResponse(content={"success": True, "text": "", "lines": []})
            
            lines_with_pos = []
            for line in result[0]:
                box = line[0]
                text = line[1][0]
                score = line[1][1]
                avg_y = sum(p[1] for p in box) / 4
                
                lines_with_pos.append({
                    "text": text,
                    "confidence": float(score),
                    "y_pos": avg_y
                })
            
            lines_with_pos.sort(key=lambda x: x["y_pos"])
            text_lines = [l["text"] for l in lines_with_pos]
            
            return JSONResponse(content={
                "success": True,
                "text": "\n".join(text_lines),
                "lines": [{"text": l["text"], "confidence": l["confidence"]} for l in lines_with_pos],
                "filename": file.filename
            })
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8082)
