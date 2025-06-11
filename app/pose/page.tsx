'use client'

import {
  FilesetResolver,
  DrawingUtils,
  PoseLandmarker
} from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';

export default function poseDetection() {
  let poseLandmarker: PoseLandmarker | null = null;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    // Load model
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
      },
      runningMode: "VIDEO",
    });

    await poseLandmarker.setOptions({ runningMode: "VIDEO" });

    // Setup webcam
    const video = videoRef.current;
    if (video) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      video.onloadedmetadata = () => {
        video.play();
        renderLoop();
      };
    }

    let lastVideoTime = -1;

    function renderLoop(): void {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (!canvas || !video || !poseLandmarker) return;

      const canvasCtx = canvas.getContext("2d");
      if (!canvasCtx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const drawingUtils = new DrawingUtils(canvasCtx);
      const now = performance.now();

      if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;

        poseLandmarker.detectForVideo(video, now, (result) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          for (const landmark of result.landmarks) {
            drawingUtils.drawLandmarks(landmark, {
              radius: (data) =>
                DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
            });
            drawingUtils.drawConnectors(
              landmark,
              PoseLandmarker.POSE_CONNECTIONS
            );
          }
          canvasCtx.restore();
        });
      }

      requestAnimationFrame(renderLoop);
    }
  };

  return (
    <div style={{ position: 'relative', width: 'fit-content' }}>
      <h1>Pose Detection</h1>
      <video
        id="video"
        ref={videoRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
        muted
        playsInline
      />
      <canvas
        id="output_canvas"
        ref={canvasRef}
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
    </div>
  );
}
