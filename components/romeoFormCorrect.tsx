'use client'

import {
    FilesetResolver,
    DrawingUtils,
    PoseLandmarker
} from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';
import poseData from '@/app/pose/angles.json';
import { Button } from './ui/button';
import Image from 'next/image'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
  } from "@/components/ui/carousel"

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

    // text to speech 
    const [formText, setFormText] = useState<string | null>("no text yet");

    // manage state
    const [selectedPose, setSelectedPose] = useState<number>(0);

    const selectedPoseRef = useRef(selectedPose);

    useEffect(() => {
        selectedPoseRef.current = selectedPose;
    }, [selectedPose]);

    // Utility to calculate angle given points A, B, C
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

    function isVisible(...points: any[]): boolean {
        return points.every(p => p && p.visibility !== undefined && p.visibility > 0.5);
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

                    const rightElbowAngle = calculateAngle(
                        landmark[12],
                        landmark[14],
                        landmark[16]
                    );
                    setRightElbowAngle(Math.round(rightElbowAngle));
                    // if (!isVisible(landmark[12], landmark[14], landmark[16])) {
                    //     setRightElbowAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                    const leftElbowAngle = calculateAngle(
                        landmark[11],
                        landmark[13],
                        landmark[21]
                    );
                    setLeftElbowAngle(Math.round(leftElbowAngle));
                    // if (!isVisible(landmark[11], landmark[13], landmark[21])) {
                    //     setLeftElbowAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                    const rightKneeAngle = calculateAngle(
                        landmark[24],
                        landmark[26],
                        landmark[28]
                    );
                    setRightKneeAngle(Math.round(rightKneeAngle));
                    // if (!isVisible(landmark[24], landmark[26], landmark[28])) {
                    //     setRightKneeAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                    const leftKneeAngle = calculateAngle(
                        landmark[23],
                        landmark[25],
                        landmark[27]
                    );
                    setLeftKneeAngle(Math.round(leftKneeAngle));
                    // if (!isVisible(landmark[23], landmark[25], landmark[27])) {
                    //     setLeftKneeAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                    const rightShoulderAngle = calculateAngle(
                        landmark[14],
                        landmark[12],
                        landmark[24]
                    );
                    setRightShoulderAngle(Math.round(rightShoulderAngle));
                    // if (!isVisible(landmark[14], landmark[12], landmark[24])) {
                    //     setRightShoulderAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                    const leftShoulderAngle = calculateAngle(
                        landmark[13],
                        landmark[11],
                        landmark[23]
                    );
                    setLeftShoulderAngle(Math.round(leftShoulderAngle));
                    // if (!isVisible(landmark[13], landmark[11], landmark[23])) {
                    //     setLeftShoulderAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                    const rightHipAngle = calculateAngle(
                        landmark[12],
                        landmark[24],
                        landmark[26]
                    );
                    setRightHipAngle(Math.round(rightHipAngle));
                    // if (!isVisible(landmark[12], landmark[24], landmark[26])) {
                    //     setRightHipAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                    const leftHipAngle = calculateAngle(
                        landmark[11],
                        landmark[23],
                        landmark[25]
                    );
                    setLeftHipAngle(Math.round(leftHipAngle));
                    
                    if (!isVisible(landmark[13], landmark[11], landmark[23], landmark[14], landmark[12], landmark[24], landmark[23], landmark[25], landmark[27], landmark[12], landmark[14], landmark[16], landmark[11], landmark[13], landmark[21], landmark[24], landmark[26], landmark[28], landmark[11], landmark[23], landmark[25])) {
                        // setLeftHipAngle(null)
                        setFormText("Body not in frame")
                    } else {
                        const currentPose = poseData[selectedPoseRef.current];
                        
                        const rightElbowData = currentPose?.angles.find(a => a.joint === "rightElbow");
                        const leftElbowData = currentPose?.angles.find(a => a.joint === "leftElbow");
                        const rightShoulderData = currentPose?.angles.find(a => a.joint === "rightShoulder");
                        const leftShoulderData = currentPose?.angles.find(a => a.joint === "leftShoulder");
                        const rightKneeData = currentPose?.angles.find(a => a.joint === "rightKnee");
                        const leftKneeData = currentPose?.angles.find(a => a.joint === "leftKnee");
                        const rightHipData = currentPose?.angles.find(a => a.joint === "rightHip");
                        const leftHipData = currentPose?.angles.find(a => a.joint === "leftHip");
                    
                        if ( rightElbowData && rightElbowAngle < (rightElbowData.expected - rightElbowData.tolerance)) {
                            console.log(rightElbowData.expected - rightElbowData.tolerance)
                            setFormText("Open your right arm.");
                        } else if (rightElbowData && rightElbowAngle > (rightElbowData.expected + rightElbowData.tolerance)) {
                            setFormText("Close your right arm.");
                        } 
                        
                        else if (leftElbowData && leftElbowAngle < (leftElbowData.expected - leftElbowData.tolerance)) {
                            setFormText("Open your left arm.");
                        } else if (leftElbowData && leftElbowAngle > (leftElbowData.expected + leftElbowData.tolerance)) {
                            setFormText("Close left right arm.");
                        }

                        else if (rightShoulderData && rightShoulderAngle < (rightShoulderData.expected - rightShoulderData.tolerance)){
                            setFormText("Open your right shoulder.")
                        } else if (rightShoulderData && rightShoulderAngle > (rightShoulderData.expected + rightShoulderData.tolerance)) {
                            setFormText("Close your left shoulder.");
                        }

                        

                        else {
                            setFormText("Perfect!")
                        }
                          
                    }

                    // Get current pose data
                    const currentPose = poseData[selectedPoseRef.current];
                    
                    // Function to check if an angle is within tolerance
                    const isAngleCorrect = (angle: number | null, expected: number, tolerance: number) => {
                        if (angle === null) return false;
                        return Math.abs(angle - expected) <= tolerance;
                    };

                    // Draw landmarks with color coding
                    drawingUtils.drawLandmarks(landmark, {
                        radius: (data) =>
                            DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 10, 1),
                        color: (data) => {
                            const index = landmark.indexOf(data.from!);
                            
                            // Check each joint's angle and color
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
            <div className='flex justify-center'>
                <div className='absolute z-50 flex'>
                    <h1 className='m-3 text-white text-4xl font-bold'>{formText}</h1>
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
                    className="scale-x-[-1]"
                />
            </div>
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
                    <span>rightElbowAngle: {rightElbowAngle? rightElbowAngle : "invisible"}</span>
                    <span>leftElbowAngle: {leftElbowAngle? leftElbowAngle : "invisible"}</span>
                    <span>rightKneeAngle: {rightKneeAngle? rightKneeAngle : "invisible"}</span>
                    <span>leftKneeAngle: {leftKneeAngle? leftKneeAngle : "invisible"}</span>
                    <span>rightShoulderAngle: {rightShoulderAngle? rightShoulderAngle : "invisible"}</span>
                    <span>leftShoulderAngle: {leftShoulderAngle? leftShoulderAngle : "invisible"}</span>
                    <span>rightHipAngle: {rightHipAngle? rightHipAngle : "invisible"}</span>
                    <span>leftHipAngle: {leftHipAngle? leftHipAngle : "invisible"}</span>
                </div>
                <Carousel>
                    <CarouselContent>
                        <CarouselItem>
                            <div className='flex flex-col flex-1'>
                                <h2 className="text-xl font-bold mb-2">{poseData[selectedPose].pose} ({poseData[selectedPose].side})</h2>
                                {poseData[selectedPose].angles.map((angle, index) => (
                                    <span key={index}>
                                        {angle.joint}: {angle.expected}° (±{angle.tolerance}°)
                                    </span>
                                ))}
                            </div>
                        </CarouselItem>
                        <CarouselItem>
                            {
                                selectedPose === 0 ? (<Image className='absolute opacity-50' src='/warrior_2.gif' width={500} height={500} alt="warrior II gif"></Image>) : (<></>)
                            }
                        </CarouselItem>
                        <CarouselPrevious/>
                    </CarouselContent>
                </Carousel>
            </div>
        </div>
    );
}
