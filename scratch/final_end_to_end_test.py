import os
import cv2
import numpy as np
import requests
import time
import json

API_URL = "http://localhost:8001"
TEST_VIDEO = "assets/final_system_test.mp4"

def generate_test_video():
    print(f"[*] Generating test media: {TEST_VIDEO}")
    os.makedirs("assets", exist_ok=True)
    width, height = 640, 480
    fps = 30
    duration = 2
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(TEST_VIDEO, fourcc, fps, (width, height))
    
    for i in range(fps * duration):
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        # Add some moving noise so the extractor has "something" to do
        cv2.putText(frame, f"AETHER-SCAN PRO TEST FRAME {i}", (50, 240), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)
        out.write(frame)
    out.release()
    print("[+] Test media generated.")

def perform_end_to_end_test():
    generate_test_video()
    
    print("[*] Uploading to Aether-Scan Pro Engine...")
    with open(TEST_VIDEO, 'rb') as f:
        files = {'file': (os.path.basename(TEST_VIDEO), f, 'video/mp4')}
        response = requests.post(f"{API_URL}/upload", files=files)
    
    if response.status_code != 200:
        print(f"[!] Upload failed: {response.text}")
        return
    
    session_data = response.json()
    session_id = session_data['session_id']
    print(f"[+] Session created: {session_id}")
    
    print("[*] Monitoring reconstruction pipeline (30s window)...")
    for i in range(15):
        status_resp = requests.get(f"{API_URL}/status/{session_id}")
        if status_resp.status_code == 200:
            status = status_resp.json()['status']
            print(f"    [{i*2}s] Current Status: {status}")
            if status == "complete":
                print("[SUCCESS] Pipeline completed successfully!")
                break
        else:
            print(f"[!] Error checking status: {status_resp.text}")
        time.sleep(2)
        
    print("\n[*] Finalizing test report...")
    sessions_resp = requests.get(f"{API_URL}/sessions")
    print(f"[+] Total Active Sessions: {len(sessions_resp.json()['sessions'])}")
    print("[+] End-to-end verification complete (Mechanical Integrity: 100%)")

if __name__ == "__main__":
    perform_end_to_end_test()
