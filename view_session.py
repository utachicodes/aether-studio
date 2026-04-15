import os
import torch
import argparse
from scene.scene_model import SceneModel
from webviewer.webviewer import WebViewer

def get_session_args(session_path):
    # Minimal args needed for SceneModel.from_scene
    class Args:
        def __init__(self):
            self.anchor_overlap = 0.3
            self.sh_degree = 3
    return Args()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--session_dir", type=str, required=True)
    parser.add_argument("--ip", type=str, default="0.0.0.0")
    parser.add_argument("--port", type=int, default=6009)
    args_cmd = parser.parse_args()

    print(f"Loading Session from: {args_cmd.session_dir}")
    
    # SceneModel.from_scene expects a path where metadata.json lives
    # Our session structure: data/sessions/{id}/model/metadata.json
    model_dir = os.path.join(args_cmd.session_dir, "model")
    if not os.path.exists(model_dir):
        # Fallback if model is at root of session
        model_dir = args_cmd.session_dir

    scene_args = get_session_args(model_dir)
    
    # Load the scene
    scene_model = SceneModel.from_scene(model_dir, scene_args)
    
    print(f"Starting WebViewer on {args_cmd.ip}:{args_cmd.port}...")
    viewer = WebViewer(scene_model, args_cmd.ip, args_cmd.port)
    viewer.run()
旋
