import cv2
import os
import argparse
from tqdm import tqdm

def process_video(video_path, output_dir, target_fps=2, max_res=1080):
    """
    Extracts frames from a video file and saves them to an output directory.
    
    Args:
        video_path (str): Path to the input video file.
        output_dir (str): Directory to save the extracted frames.
        target_fps (float): Number of frames to extract per second of video.
        max_res (int): Maximum height/width of the output images (maintaining aspect ratio).
    """
    if not os.path.exists(video_path):
        print(f"Error: Video file not found at {video_path}")
        return

    # Create frames directory as expected by train.py
    frames_dir = os.path.join(output_dir, "images")
    os.makedirs(frames_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}")
        return

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if video_fps <= 0:
        print("Error: Could not detect video FPS.")
        return

    # Calculate frame skip
    frame_skip = max(1, int(video_fps / target_fps))
    
    print(f"Video Stats: {video_fps} FPS, {total_frames} total frames.")
    print(f"Extracting every {frame_skip} frames (Target: ~{target_fps} FPS).")

    count = 0
    saved_count = 0
    
    pbar = tqdm(total=total_frames)
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        if count % frame_skip == 0:
            h, w = frame.shape[:2]
            
            # Resize if necessary to stay within optimal reconstruction range (1-2MP)
            if max(h, w) > max_res:
                scale = max_res / max(h, w)
                new_w, new_h = int(w * scale), int(h * scale)
                frame = cv2.resize(frame, (new_w, new_h), interpolation=cv2.INTER_AREA)

            # Save as padded numerical filename for consistent sorting
            filename = f"frame_{saved_count:05d}.jpg"
            cv2.imwrite(os.path.join(frames_dir, filename), frame, [cv2.IMWRITE_JPEG_QUALITY, 95])
            saved_count += 1
        
        count += 1
        pbar.update(1)

    cap.release()
    pbar.close()
    print(f"\nSuccessfully extracted {saved_count} frames to {frames_dir}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Extract frames from video for Aether-Scan reconstruction.")
    parser.add_argument("--video", type=str, required=True, help="Path to input video file.")
    parser.add_argument("--out", type=str, required=True, help="Output directory for the project session.")
    parser.add_argument("--fps", type=float, default=3.0, help="Target frames per second to extract (default: 3.0).")
    parser.add_argument("--res", type=int, default=1080, help="Maximum resolution for extracted frames (default: 1080).")

    args = parser.parse_args()
    process_video(args.video, args.out, target_fps=args.fps, max_res=args.res)
