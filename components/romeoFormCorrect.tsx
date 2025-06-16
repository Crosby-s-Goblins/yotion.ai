'use client'

import {
    FilesetResolver,
    DrawingUtils,
    PoseLandmarker
} from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';
import poseData from '@/app/pose/angles.json';
import { Button } from './ui/button';

export default function poseDetection() {
    let poseLandmarker: PoseLandmarker | null = null;

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // all relevant angles
    const [rightElbowAngle, setRightElbowAngle] = useState<number | null>(null);
    const [leftElbowAngle, setLeftElbowAngle] = useState<number | null>(null);

    const [rightKneeAngle, setRightKneeAngle] = useState<number | null>(null);
    const [leftKneeAngle, setLeftKneeAngle] = useState<number | null>(null);

    const [rightHipAngle, setRightHipAngle] = useState<number | null>(null); 
    const [leftHipAngle, setLeftHipAngle] = useState<number | null>(null); 

    const [rightShoulderAngle, setRightShoulderAngle] = useState<number | null>(null);
    const [leftShoulderAngle, setLeftShoulderAngle] = useState<number | null>(null);

    // manage state
    const [pageFunc, setPageFunc] = useState<number>(-1);
    const [selectedPose, setSelectedPose] = useState<number>(0);

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
                    // Calculate all angles first
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

                    const rightKneeAngle = calculateAngle(
                        landmark[24], 
                        landmark[26],
                        landmark[28]  
                    );
                    setRightKneeAngle(Math.round(rightKneeAngle));

                    const leftKneeAngle = calculateAngle(
                        landmark[23], 
                        landmark[25], 
                        landmark[27]
                    );
                    setLeftKneeAngle(Math.round(leftKneeAngle));

                    const rightShoulderAngle = calculateAngle(
                        landmark[14], 
                        landmark[12], 
                        landmark[24]
                    );
                    setRightShoulderAngle(Math.round(rightShoulderAngle));

                    const leftShoulderAngle = calculateAngle(
                        landmark[13], 
                        landmark[11], 
                        landmark[23]
                    );
                    setLeftShoulderAngle(Math.round(leftShoulderAngle));

                    const rightHipAngle = calculateAngle(
                        landmark[12], 
                        landmark[24], 
                        landmark[26]
                    );
                    setRightHipAngle(Math.round(rightHipAngle));
                    
                    const leftHipAngle = calculateAngle(
                        landmark[11], 
                        landmark[23], 
                        landmark[25]
                    );
                    setLeftHipAngle(Math.round(leftHipAngle));

                    // Get current pose data
                    const currentPose = poseData[selectedPose];
                    
                    // Function to check if an angle is within tolerance
                    const isAngleCorrect = (angle: number | null, expected: number, tolerance: number) => {
                        if (angle === null) return false;
                        return Math.abs(angle - expected) <= tolerance;
                    };

                    // Draw landmarks with color coding
                    drawingUtils.drawLandmarks(landmark, {
                        radius: (data) =>
                            DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 10),
                        color: (data) => {
                            const index = landmark.indexOf(data.from!);
                            
                            // Check each joint's angle and color accordingly
                            if (index === 12 || index === 14 || index === 16) { // Right elbow
                                const angleData = currentPose.angles.find(a => a.joint === "rightElbow");
                                return isAngleCorrect(rightElbowAngle, angleData?.expected || 0, angleData?.tolerance || 0) ? 'green' : 'red';
                            }
                            if (index === 11 || index === 13 || index === 21) { // Left elbow
                                const angleData = currentPose.angles.find(a => a.joint === "leftElbow");
                                return isAngleCorrect(leftElbowAngle, angleData?.expected || 0, angleData?.tolerance || 0) ? 'green' : 'red';
                            }
                            if (index === 24 || index === 26 || index === 28) { // Right knee
                                const angleData = currentPose.angles.find(a => a.joint === "rightKnee");
                                return isAngleCorrect(rightKneeAngle, angleData?.expected || 0, angleData?.tolerance || 0) ? 'green' : 'red';
                            }
                            if (index === 23 || index === 25 || index === 27) { // Left knee
                                const angleData = currentPose.angles.find(a => a.joint === "leftKnee");
                                return isAngleCorrect(leftKneeAngle, angleData?.expected || 0, angleData?.tolerance || 0) ? 'green' : 'red';
                            }
                            if (index === 14 || index === 12 || index === 24) { // Right shoulder
                                const angleData = currentPose.angles.find(a => a.joint === "rightShoulder");
                                return isAngleCorrect(rightShoulderAngle, angleData?.expected || 0, angleData?.tolerance || 0) ? 'green' : 'red';
                            }
                            if (index === 13 || index === 11 || index === 23) { // Left shoulder
                                const angleData = currentPose.angles.find(a => a.joint === "leftShoulder");
                                return isAngleCorrect(leftShoulderAngle, angleData?.expected || 0, angleData?.tolerance || 0) ? 'green' : 'red';
                            }
                            if (index === 12 || index === 24 || index === 26) { // Right hip
                                const angleData = currentPose.angles.find(a => a.joint === "rightHip");
                                return isAngleCorrect(rightHipAngle, angleData?.expected || 0, angleData?.tolerance || 0) ? 'green' : 'red';
                            }
                            if (index === 11 || index === 23 || index === 25) { // Left hip
                                const angleData = currentPose.angles.find(a => a.joint === "leftHip");
                                return isAngleCorrect(leftHipAngle, angleData?.expected || 0, angleData?.tolerance || 0) ? 'green' : 'red';
                            }
                            
                            return 'blue'; // Default color for other landmarks
                        }
                    });
                    drawingUtils.drawConnectors(
                        landmark,
                        PoseLandmarker.POSE_CONNECTIONS
                    );
                }
            });
            
            requestAnimationFrame(renderLoop);
        }
    };

    return (
        <div>
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
                className="scale-x-[-1]"
            />
            <div className="flex gap-2 my-4">
                {poseData.map((pose, index) => (
                    <Button 
                        variant="outline"
                        key={index}
                        onClick={() => setSelectedPose(index)}
                    >
                        {pose.pose} ({pose.side})
                    </Button>
                ))}
            </div>
            <div className='flex'>
                <div className='flex flex-col flex-1'>
                    <h2 className="text-xl font-bold mb-2">Current Angles</h2>
                    <span>rightElbowAngle: {rightElbowAngle}</span>
                    <span>leftElbowAngle: {leftElbowAngle}</span>
                    <span>rightKneeAngle: {rightKneeAngle}</span>
                    <span>leftKneeAngle: {leftKneeAngle}</span>
                    <span>rightShoulderAngle: {rightShoulderAngle}</span>
                    <span>leftShoulderAngle: {leftShoulderAngle}</span>
                    <span>rightHipAngle: {rightHipAngle}</span>
                    <span>leftHipAngle: {leftHipAngle}</span>
                </div>
                <div className='flex flex-col flex-1'>
                    <h2 className="text-xl font-bold mb-2">{poseData[selectedPose].pose} ({poseData[selectedPose].side})</h2>
                    {poseData[selectedPose].angles.map((angle, index) => (
                        <span key={index}>
                            {angle.joint}: {angle.expected}° (±{angle.tolerance}°)
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
