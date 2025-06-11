'use client'

import {
  FilesetResolver,
  DrawingUtils,
  PoseLandmarker
} from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';

export default function poseDetection(){
    let poseLandmarker: PoseLandmarker | null = null;
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const vision = await FilesetResolver.forVisionTasks(
            "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
                modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
            },
            runningMode: "VIDEO",
        });

        await poseLandmarker.setOptions({ runningMode: "VIDEO" });

        let lastVideoTime = -1;
        let startTimeMs = performance.now();
        const canvas = document.createElement("canvas");
        const canvasCtx = canvas.getContext("2d");
        const canvasElement = document.getElementById(
            "output_canvas"
        ) as HTMLCanvasElement;

        if (!canvasCtx) return;
        const drawingUtils = new DrawingUtils(canvasCtx);
        
        function renderLoop(): void {
        const video = document.getElementById("video") as HTMLVideoElement;

        if (lastVideoTime !== video.currentTime) {
            lastVideoTime = video.currentTime;
            poseLandmarker?.detectForVideo(video, startTimeMs, (result) => {
              canvasCtx?.save();
              canvasCtx?.clearRect(0, 0, canvasElement.width, canvasElement.height);
              for (const landmark of result.landmarks) {
                drawingUtils.drawLandmarks(landmark, {
                  radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
                });
                drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
              }
              canvasCtx?.restore();
            });
          }

            requestAnimationFrame(() => {
                renderLoop();
            });
        }
    };
    

    return (
        <div>
            <h1>Pose Detection</h1>
        </div>
    );
}
