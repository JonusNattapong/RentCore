"""
DeepSeek-OCR API Server
Exposes the DeepSeek-OCR model as a REST API for slip verification
"""
import os
import torch
import tempfile
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from transformers import AutoModel, AutoTokenizer
from PIL import Image
import io

app = FastAPI(title="DeepSeek-OCR API", version="1.0.0")

# Global model variables
model = None
tokenizer = None

def load_model():
    """Load the DeepSeek-OCR model"""
    global model, tokenizer
    
    if model is None:
        print("Loading DeepSeek-OCR model...")
        model_name = 'deepseek-ai/DeepSeek-OCR'
        
        tokenizer = AutoTokenizer.from_pretrained(
            model_name, 
            trust_remote_code=True
        )
        
        model = AutoModel.from_pretrained(
            model_name,
            trust_remote_code=True,
            use_safetensors=True
        )

        model = model.eval().to(torch.bfloat16)
        print("Model loaded successfully!")
    
    return model, tokenizer

@app.on_event("startup")
async def startup_event():
    """Load model on startup"""
    try:
        load_model()
    except Exception as e:
        print(f"Warning: Could not pre-load model: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "model_loaded": model is not None}

@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """
    Perform OCR on uploaded image
    Returns structured JSON with extracted text
    """
    try:
        # Load model if not loaded
        model_instance, tok = load_model()
        
        # Read and save uploaded file temporarily
        contents = await file.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            # Perform OCR with Thai-optimized prompt
            prompt = "<image>\nFree OCR. "
            
            result = model_instance.infer(
                tok,
                prompt=prompt,
                image_file=tmp_path,
                output_path='/tmp',
                base_size=1024,
                image_size=640,
                crop_mode=True,
                save_results=False,
                test_compress=False
            )
            
            # Parse the result to extract structured data
            ocr_text = str(result) if result else ""
            
            return JSONResponse(content={
                "success": True,
                "text": ocr_text,
                "filename": file.filename
            })
            
        finally:
            # Cleanup temp file
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ocr/slip")
async def ocr_slip(file: UploadFile = File(...)):
    """
    Specialized endpoint for Thai bank slip OCR
    Returns structured data: amount, sender, receiver, reference
    """
    try:
        model_instance, tok = load_model()
        
        contents = await file.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            tmp.write(contents)
            tmp_path = tmp.name
        
        try:
            # Use structured prompt for slip parsing
            prompt = """<image>
Extract the following information from this Thai bank transfer slip:
1. Amount (จำนวนเงิน)
2. Sender name (ชื่อผู้โอน)
3. Sender account (เลขบัญชีผู้โอน)
4. Sender bank (ธนาคารผู้โอน)
5. Receiver name (ชื่อผู้รับ)
6. Receiver account (เลขบัญชีผู้รับ)
7. Receiver bank (ธนาคารผู้รับ)
8. Reference number (รหัสอ้างอิง)
9. Date/Time (วันเวลา)

Return as JSON format.
"""
            
            result = model_instance.infer(
                tok,
                prompt=prompt,
                image_file=tmp_path,
                output_path='/tmp',
                base_size=1024,
                image_size=640,
                crop_mode=True,
                save_results=False,
                test_compress=False
            )
            
            ocr_text = str(result) if result else ""
            
            # Try to parse structured data from result
            return JSONResponse(content={
                "success": True,
                "raw_text": ocr_text,
                "filename": file.filename
            })
            
        finally:
            os.unlink(tmp_path)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
