'use client'
import Timer from '@/components/romeoTimer'

import {
    FilesetResolver,
    DrawingUtils,
    PoseLandmarker
} from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';

export default function poseDetection() {
    let poseLandmarker: PoseLandmarker | null = null;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // all relevant angles
    const [rightElbowAngle, setRightElbowAngle] = useState<number | null>(null);
    const [leftElbowAngle, setLeftElbowAngle] = useState<number | null>(null);

    // push up forms (up, down)
    const [form, setForm] = useState<number>(0);
    var [pushUpCount, setPushUpCount] = useState<number>(0);
    const prevFormRef = useRef<number | null>(null);
    const [timerSeconds, setTimerSeconds] = useState<number>(0);
    const timerSecondsRef = useRef<number>(0);

    const handleTimerUpdate = (seconds: number) => {
        setTimerSeconds(seconds);
        timerSecondsRef.current = seconds;
    };

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
                        color: 'blue'
                    });
                    drawingUtils.drawConnectors(
                        landmark,
                        PoseLandmarker.POSE_CONNECTIONS
                    );

                    // calculate the angles for each elbow
                    const rightElbowAngle = calculateAngle(
                        landmark[12], 
                        landmark[14], 
                        landmark[16]  
                    );
                    setRightElbowAngle(Math.round(rightElbowAngle));

                    const leftElbowAngle = calculateAngle(
                        landmark[11], 
                        landmark[13], 
                        landmark[21]  
                    );
                    setLeftElbowAngle(Math.round(leftElbowAngle));

                    if (leftElbowAngle !== null && rightElbowAngle !== null) {
                        const newForm = (leftElbowAngle > 100 && rightElbowAngle > 100) ? 0 : 1;
                        setForm(newForm);
                        console.log(timerSecondsRef.current)

                        if (timerSecondsRef.current === 0 && newForm === 1 && prevFormRef.current === 0) {
                            setPushUpCount(prev => prev + 1);
                        }

                        prevFormRef.current = newForm;
                    }   
                }
            });

            
            requestAnimationFrame(renderLoop);
        }
    };

    return (
            <div>
                <div className="mb-1 flex items-center justify-center">
                    <h1>count: </h1><span className="text-9xl">{pushUpCount}</span>
                </div>
                <div className="flex items-center justify-center">
                    <div className="absolute text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] z-50">
                        <Timer onTimerUpdate={handleTimerUpdate}/>
                    </div>
                    <video
                        ref={videoRef}
                        style={{ display: 'none' }}
                        muted
                        playsInline
                        className="scale-x-[-1]"
                    />
                    <canvas
                        id="output_canvas"
                        ref={canvasRef}
                        className="scale-x-[-1] z-0"
                    />
                </div>
                <div>
                    <h2>rightElbowAngle: {rightElbowAngle}</h2>
                    <h2>leftElbowAngle: {leftElbowAngle}</h2>
                </div>
            </div>
    );
}
