from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import shutil
import os
import uuid
import subprocess
import json
import time
import zipfile


app = FastAPI(title="Aether-Scan API")

# Enable CORS for the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_ROOT = "data/sessions"
os.makedirs(DATA_ROOT, exist_ok=True)

class SessionManager:
    def __init__(self, session_id):
        self.session_id = session_id
        self.path = os.path.join(DATA_ROOT, session_id)
        self.log_file = os.path.join(self.path, "process.log")
        os.makedirs(self.path, exist_ok=True)

    def write_log(self, message):
        with open(self.log_file, "a") as f:
            f.write(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {message}\n")

    def get_status(self):
        if not os.path.exists(self.log_file):
            return "queued"
        # Simple heuristic for status
        with open(self.log_file, "r") as f:
            lines = f.readlines()
            if not lines: return "starting"
            last_line = lines[-1]
            if "COMPLETE" in last_line: return "complete"
            if "RECONSTRUCTION_STARTED" in last_line: return "training"
            if "FRAMES_EXTRACTED" in last_line: return "ready_for_training"
        return "processing"

@app.post("/upload")
async def upload_data(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    manager = SessionManager(session_id)
    
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext == ".zip":
        zip_path = os.path.join(manager.path, "input_images.zip")
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        manager.write_log("ZIP_UPLOADED_EXTRACTING")
        valid_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                temp_extract = os.path.join(manager.path, "temp_extract")
                os.makedirs(temp_extract, exist_ok=True)
                zip_ref.extractall(temp_extract)
                
                images_dir = os.path.join(manager.path, "images")
                os.makedirs(images_dir, exist_ok=True)
                
                image_count = 0
                for root, _, files in os.walk(temp_extract):
                    for f in sorted(files):
                        if os.path.splitext(f)[1].lower() in valid_extensions:
                            # Normalize filename for consistent sorting in the pipeline
                            new_name = f"view_{image_count:05d}{os.path.splitext(f)[1].lower()}"
                            shutil.move(os.path.join(root, f), os.path.join(images_dir, new_name))
                            image_count += 1
                
                # Cleanup
                shutil.rmtree(temp_extract)
                
                if image_count == 0:
                    manager.write_log("ERROR: No valid images found in ZIP")
                    return {"error": "No valid images (.jpg, .png, etc.) found in the uploaded ZIP."}
                
                manager.write_log(f"IMAGES_READY: {image_count} images prepared from ZIP")
                background_tasks.add_task(run_processing_pipeline, session_id, skip_extraction=True)
        except Exception as e:
            manager.write_log(f"ERROR: ZIP processing failed: {str(e)}")
            return {"error": f"Failed to process ZIP: {str(e)}"}
    else:
        video_path = os.path.join(manager.path, "input_video.mp4")
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        manager.write_log("VIDEO_UPLOADED")
        background_tasks.add_task(run_processing_pipeline, session_id, skip_extraction=False)
    
    return {"session_id": session_id, "status": "processing"}

@app.get("/status/{session_id}")
async def get_status(session_id: str):
    manager = SessionManager(session_id)
    return {
        "session_id": session_id,
        "status": manager.get_status(),
        "log": open(manager.log_file, "r").readlines() if os.path.exists(manager.log_file) else []
    }

def run_processing_pipeline(session_id: str, skip_extraction: bool = False):
    manager = SessionManager(session_id)
    output_dir = manager.path
    
    if not skip_extraction:
        video_path = os.path.join(manager.path, "input_video.mp4")
        manager.write_log("EXTRACTING_FRAMES")
        proc = subprocess.run([
            "python", "scripts/video_processor.py",
            "--video", video_path,
            "--out", output_dir,
            "--fps", "3.0"
        ], capture_output=True, text=True)
        
        if proc.returncode != 0:
            manager.write_log(f"ERROR: Frame extraction failed: {proc.stderr}")
            return
        manager.write_log("FRAMES_EXTRACTED")
    else:
        manager.write_log("SKIPPING_EXTRACTION_USING_UPLOADED_IMAGES")
    
    manager.write_log("RECONSTRUCTION_STARTED")
    model_path = os.path.join(output_dir, "model")
    train_proc = subprocess.Popen([
        "python", "train.py",
        "-s", output_dir,
        "-m", model_path,
        "--viewer_mode", "web",
        "--port", "6009"
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

    for line in iter(train_proc.stdout.readline, ""):
        manager.write_log(f"TRAIN: {line.strip()}")
    
    train_proc.wait()
    if train_proc.returncode == 0:
        manager.write_log("COMPLETE")
    else:
        manager.write_log(f"ERROR: Reconstruction failed with code {train_proc.returncode}")

@app.get("/export/{session_id}")
async def export_session(session_id: str):
    manager = SessionManager(session_id)
    if not os.path.exists(manager.path):
        raise HTTPException(status_code=404, detail="Session not found")
    
    zip_path = os.path.join(DATA_ROOT, f"{session_id}_export.zip")
    
    # Create the zip archive
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(manager.path):
            for file in files:
                # Don't include the source video in the export if it's large
                if file == "input_video.mp4": continue
                
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, manager.path)
                zipf.write(full_path, rel_path)
    
    return FileResponse(
        path=zip_path,
        filename=f"AetherScan_{session_id[:8]}.zip",
        media_type='application/zip'
    )

@app.get("/sessions")

async def list_sessions():
    sessions = os.listdir(DATA_ROOT)
    return {"sessions": sessions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
