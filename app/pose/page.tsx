'use client'

import {
    FilesetResolver,
    DrawingUtils,
    PoseLandmarker
} from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';
import poseData from '@/app/pose/angles.json';

export default function poseDetection() {
    let poseLandmarker: PoseLandmarker | null = null;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentPose, setCurrentPose] = useState<string | null>(null);

    // all relevant angles
    const [rightElbowAngle, setRightElbowAngle] = useState<number | null>(null);
    const [leftElbowAngle, setLeftElbowAngle] = useState<number | null>(null);

    const [rightKneeAngle, setRightKneeAngle] = useState<number | null>(null);
    const [leftKneeAngle, setLeftKneeAngle] = useState<number | null>(null);

    const [rightHipAngle, setRightHipAngle] = useState<number | null>(null); // for hips: implement two angles? One for forward/ backward ben and one for side to side
    const [leftHipAngle, setLeftHipAngle] = useState<number | null>(null); 

    const [rightShoulderAngle, setRightShoulderAngle] = useState<number | null>(null); // for shoulders: implement two angles? One for forward/ backward ben and one for side to side
    const [leftShoulderAngle, setLeftShoulderAngle] = useState<number | null>(null);


    // Utility to calculate angle at point B given A, B, C
    function calculateAngle(A: any, B: any, C: any): number {
        const AB = { x: A.x - B.x, y: A.y - B.y };
        const CB = { x: C.x - B.x, y: C.y - B.y };
        const dot = AB.x * CB.x + AB.y * CB.y;
        const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
        const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);
        const cosineAngle = dot / (magAB * magCB);
        const angleRad = Math.acos(Math.max(-1, Math.min(1, cosineAngle)));
        return angleRad * (180 / Math.PI);
    }

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

        function renderLoop(): void {
            const canvas = canvasRef.current;
            const video = videoRef.current;

            if (!canvas || !video || !poseLandmarker) {
                requestAnimationFrame(renderLoop);
                return;
            }

            const canvasCtx = canvas.getContext("2d");
            if (!canvasCtx) {
                requestAnimationFrame(renderLoop);
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the current video frame to the canvas
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const drawingUtils = new DrawingUtils(canvasCtx);
            const now = performance.now();

            poseLandmarker.detectForVideo(video, now, (result) => {
                for (const landmark of result.landmarks) {
                    drawingUtils.drawLandmarks(landmark, {
                        radius: (data) =>
                            DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1),
                    });
                    drawingUtils.drawConnectors(
                        landmark,
                        PoseLandmarker.POSE_CONNECTIONS
                    );

                    // calculate the angles for each body part

                    if (
                        landmark[12] && landmark[14] && landmark[16]
                    ) {
                        const rightElbowAngle = calculateAngle(
                            landmark[12], // right shoulder
                            landmark[14], // right elbow
                            landmark[16]  // right wrist
                        );
                        setRightElbowAngle(Math.round(rightElbowAngle));
                    }
                }
            });

            requestAnimationFrame(renderLoop);
        }
    };

    return (
        <div>
            <div className="mb-1">
                <span>Current pose: {currentPose}</span>
            </div>
            <div>
                <video
                    ref={videoRef}
                    style={{ display: 'none' }}
                    muted
                    playsInline
                />
                <canvas
                    width="320"
                    height="240"
                    id="output_canvas"
                    ref={canvasRef}
                />
            </div>
            {
                poseData.map((pose, index) => (
                    <button className='bg-blue-500 rounded m-1 p-1 hover:bg-blue-600' key={index} onClick={() => setCurrentPose(pose.pose.toString())}>{pose.pose} ({pose.side})</button>
                ))
            }
            <div>
                <h2>rightElbowAngle: {rightElbowAngle}</h2>
                <h2>leftElbowAngle: {leftElbowAngle}</h2>
                <h2>rightKneeAngle: {rightKneeAngle}</h2>
                <h2>leftKneeAngle: {leftKneeAngle}</h2>
                <h2>rightHipAngle: {rightHipAngle}</h2>
                <h2>leftHipAngle: {leftHipAngle}</h2>
                <h2>rightShoulderAngle: {rightShoulderAngle}</h2>
                <h2>leftShoulderAngle: {leftShoulderAngle}</h2>
            </div>
        </div>
    );
}
