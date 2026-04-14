import subprocess
import time
import sys
import os
import webbrowser
import signal

# Configuration
API_PORT = 8001
STUDIO_PORT = 3001
API_URL = f"http://localhost:{API_PORT}"
STUDIO_URL = f"http://localhost:{STUDIO_PORT}"

processes = []

def signal_handler(sig, frame):
    print("\n[*] Terminating all Studio components...")
    for p in processes:
        p.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

def launch():
    print("--- AETHER-SCAN PRO STUDIO ---")
    print("[*] Launching Industrial Backbone (API)...")
    
    # Start API
    api_proc = subprocess.Popen(
        [sys.executable, "api_server.py"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    processes.append(api_proc)
    
    print("[*] Launching Next.js Studio...")
    # Start Studio (forcing port 3001)
    studio_proc = subprocess.Popen(
        ["npm", "run", "dev", "--", "-p", str(STUDIO_PORT)],
        cwd=os.path.join(os.getcwd(), "aether-studio"),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=True
    )
    processes.append(studio_proc)
    
    print("[*] Waiting for systems to warm up...")
    time.sleep(5)
    
    print(f"[+] Studio Live: {STUDIO_URL}")
    print(f"[+] API Live: {API_URL}")
    
    # Auto-open browser as requested
    webbrowser.open(STUDIO_URL)
    
    print("\n[!] Keep this window open while using the Studio.")
    print("[!] Press CTRL+C to stop all services.")
    
    # Keep main thread alive
    while True:
        time.sleep(1)

if __name__ == "__main__":
    launch()
