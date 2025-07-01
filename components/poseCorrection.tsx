'use client'

import {
    FilesetResolver,
    DrawingUtils,
    PoseLandmarker
} from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type PoseAngle = {
    joint: string;
    expected: number;
    tolerance: number;
};
type PoseAngles = PoseAngle[];

function useTextToSpeech(text: string) {
    useEffect(() => {
        if (text) {
            const synth = window.speechSynthesis;
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            synth.speak(utterance);
        }
    }, [text]);
}

export function usePoseCorrection(selectedPose: number) {
    let poseLandmarker: PoseLandmarker | null = null;
    let temp : string;

    const [poseAngles, setPoseAngles] = useState<PoseAngles | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    // all relevant angles
    // const [rightElbowAngle, setRightElbowAngle] = useState<number | null>(null);
    // const [leftElbowAngle, setLeftElbowAngle] = useState<number | null>(null);

    // const [rightKneeAngle, setRightKneeAngle] = useState<number | null>(null);
    // const [leftKneeAngle, setLeftKneeAngle] = useState<number | null>(null);

    // const [rightHipAngle, setRightHipAngle] = useState<number | null>(null); 
    // const [leftHipAngle, setLeftHipAngle] = useState<number | null>(null); 

    // const [rightShoulderAngle, setRightShoulderAngle] = useState<number | null>(null);
    // const [leftShoulderAngle, setLeftShoulderAngle] = useState<number | null>(null);

    //Bulk values for timer start? -- Redundant with above, pick one later
    const rightElbowAngleRef = useRef<number | null>(null);
    const leftElbowAngleRef = useRef<number | null>(null);
    const rightKneeAngleRef = useRef<number | null>(null);
    const leftKneeAngleRef = useRef<number | null>(null);
    const rightHipAngleRef = useRef<number | null>(null);
    const leftHipAngleRef = useRef<number | null>(null);
    const rightShoulderAngleRef = useRef<number | null>(null);
    const leftShoulderAngleRef = useRef<number | null>(null);

    // text to speech 
    const [formText, setFormText] = useState<string | null>("no text yet");
    useTextToSpeech(formText ?? "");

    const selectedPoseRef = useRef<PoseAngles | null>(null);

    useEffect(() => {
        selectedPoseRef.current = poseAngles;
    }, [poseAngles]);

    useEffect(() => {
    async function fetchPose() {
        const supabase = createClient();

        const { data, error } = await supabase
        .from('poseLibrary')
        .select('angles')
        .eq('id', selectedPose)
        .single();

        
        if (error) {
            console.error("Supabase error:", error.message);
            setPoseAngles(null);
            return;
        }

        if (!data || !data.angles) {
            setPoseAngles(null);
            return;
        }

        try {
        const parsed = typeof data.angles === "string"
            ? JSON.parse(data.angles.trim())
            : data.angles;

            setPoseAngles(Array.isArray(parsed) ? parsed : null);
        } catch (e) {
            console.error("Failed to parse angles JSON:", e);
            setPoseAngles(null);
        }


    };
    if (selectedPose) fetchPose();
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
        let isMounted = true;
        let animationFrameId: number;
        let poseLandmarkerInstance: PoseLandmarker | null = null;

        async function init() {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );
            poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath:
                        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
                },
                runningMode: "VIDEO",
            });
            await poseLandmarkerInstance.setOptions({ runningMode: "VIDEO" });

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
        }

        function renderLoop(): void {            
            const canvas = canvasRef.current;
            const video = videoRef.current;

            if (!canvas || !video || !poseLandmarkerInstance) {
                animationFrameId = requestAnimationFrame(renderLoop);
                return;
            }

            const canvasCtx = canvas.getContext("2d");
            if (!canvasCtx) {
                animationFrameId = requestAnimationFrame(renderLoop);
                return;
            }

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw the current video frame to the canvas
            canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
            canvasCtx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const drawingUtils = new DrawingUtils(canvasCtx);
            const now = performance.now();

            poseLandmarkerInstance.detectForVideo(video, now, (result) => {
                for (const landmark of result.landmarks) {

                    // const rightElbowAngle = calculateAngle(
                    //     landmark[12],
                    //     landmark[14],
                    //     landmark[16]
                    // );
                    // setRightElbowAngle(Math.round(rightElbowAngle));
                    // if (!isVisible(landmark[12], landmark[14], landmark[16])) {
                    //     setRightElbowAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                    rightElbowAngleRef.current = Math.round(calculateAngle(landmark[12],
                        landmark[14],
                        landmark[16]));

                    // const leftElbowAngle = calculateAngle(
                    //     landmark[11],
                    //     landmark[13],
                    //     landmark[21]
                    // );
                    // setLeftElbowAngle(Math.round(leftElbowAngle));
                    // if (!isVisible(landmark[11], landmark[13], landmark[21])) {
                    //     setLeftElbowAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                     leftElbowAngleRef.current = Math.round(calculateAngle(landmark[11],
                        landmark[13],
                        landmark[21]));

                    // const rightKneeAngle = calculateAngle(
                    //     landmark[24],
                    //     landmark[26],
                    //     landmark[28]
                    // );
                    // setRightKneeAngle(Math.round(rightKneeAngle));
                    // if (!isVisible(landmark[24], landmark[26], landmark[28])) {
                    //     setRightKneeAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                     rightKneeAngleRef.current = Math.round(calculateAngle(landmark[24],
                        landmark[26],
                        landmark[28]));

                    // const leftKneeAngle = calculateAngle(
                    //     landmark[23],
                    //     landmark[25],
                    //     landmark[27]
                    // );
                    // setLeftKneeAngle(Math.round(leftKneeAngle));
                    // if (!isVisible(landmark[23], landmark[25], landmark[27])) {
                    //     setLeftKneeAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                     leftKneeAngleRef.current = Math.round(calculateAngle(landmark[23],
                        landmark[25],
                        landmark[27]));

                    // const rightShoulderAngle = calculateAngle(
                    //     landmark[14],
                    //     landmark[12],
                    //     landmark[24]
                    // );
                    // setRightShoulderAngle(Math.round(rightShoulderAngle));
                    // if (!isVisible(landmark[14], landmark[12], landmark[24])) {
                    //     setRightShoulderAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                     rightShoulderAngleRef.current = Math.round(calculateAngle(landmark[14],
                        landmark[12],
                        landmark[24]));

                    // const leftShoulderAngle = calculateAngle(
                    //     landmark[13],
                    //     landmark[11],
                    //     landmark[23]
                    // );
                    // setLeftShoulderAngle(Math.round(leftShoulderAngle));
                    // if (!isVisible(landmark[13], landmark[11], landmark[23])) {
                    //     setLeftShoulderAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                     leftShoulderAngleRef.current = Math.round(calculateAngle(landmark[13],
                        landmark[11],
                        landmark[23]));

                    // const rightHipAngle = calculateAngle(
                    //     landmark[12],
                    //     landmark[24],
                    //     landmark[26]
                    // );
                    // setRightHipAngle(Math.round(rightHipAngle));
                    // if (!isVisible(landmark[12], landmark[24], landmark[26])) {
                    //     setRightHipAngle(null)
                    //     setFormText("Body not in frame")
                    // }

                     rightHipAngleRef.current = Math.round(calculateAngle(landmark[12],
                        landmark[24],
                        landmark[26]));

                    // const leftHipAngle = calculateAngle(
                    //     landmark[11],
                    //     landmark[23],
                    //     landmark[25]
                    // );
                    // setLeftHipAngle(Math.round(leftHipAngle));

                     leftHipAngleRef.current = Math.round(calculateAngle(landmark[11],
                        landmark[23],
                        landmark[25]));
                    
                    if (!isVisible(landmark[13], landmark[11], landmark[23], landmark[14], landmark[12], landmark[24], landmark[23], landmark[25], landmark[27], landmark[12], landmark[14], landmark[16], landmark[11], landmark[13], landmark[21], landmark[24], landmark[26], landmark[28], landmark[11], landmark[23], landmark[25])) {
                        // setLeftHipAngle(null)
                        setFormText("Body not in frame")
                    } else {
                        const rightElbowData = selectedPoseRef.current?.find(a => a.joint === "rightElbow");
                        const leftElbowData = selectedPoseRef.current?.find(a => a.joint === "leftElbow");
                        const rightShoulderData = selectedPoseRef.current?.find(a => a.joint === "rightShoulder");
                        const leftShoulderData = selectedPoseRef.current?.find(a => a.joint === "leftShoulder");
                        const rightKneeData = selectedPoseRef.current?.find(a => a.joint === "rightKnee");
                        const leftKneeData = selectedPoseRef.current?.find(a => a.joint === "leftKnee");
                        const rightHipData = selectedPoseRef.current?.find(a => a.joint === "rightHip");
                        const leftHipData = selectedPoseRef.current?.find(a => a.joint === "leftHip");
                    
                        if ( rightElbowData && rightElbowAngleRef.current < (rightElbowData.expected - rightElbowData.tolerance)) {
                            setFormText("Open your right arm.");
                        } else if (rightElbowData && rightElbowAngleRef.current > (rightElbowData.expected + rightElbowData.tolerance)) {
                            setFormText("Close your right arm.");
                        } 
                        
                        else if (leftElbowData && leftElbowAngleRef.current < (leftElbowData.expected - leftElbowData.tolerance)) {
                            setFormText("Open your left arm.");
                        } else if (leftElbowData && leftElbowAngleRef.current > (leftElbowData.expected + leftElbowData.tolerance)) {
                            setFormText("Close left right arm.");
                        }

                        else if (rightShoulderData && rightShoulderAngleRef.current < (rightShoulderData.expected - rightShoulderData.tolerance)){
                            setFormText("Open your right shoulder.")
                        } else if (rightShoulderData && rightShoulderAngleRef.current > (rightShoulderData.expected + rightShoulderData.tolerance)) {
                            setFormText("Close your right shoulder.");
                        }

                        else if (leftShoulderData && leftShoulderAngleRef.current < (leftShoulderData.expected - leftShoulderData.tolerance)){
                            setFormText("Open your left shoulder.")
                        } else if (leftShoulderData && leftShoulderAngleRef.current > (leftShoulderData.expected + leftShoulderData.tolerance)) {
                            setFormText("Close your left shoulder.");
                        }

                        else if (rightHipData && rightHipAngleRef.current < (rightHipData.expected - rightHipData.tolerance)){
                            setFormText("Open your right hip.")
                        } else if (rightHipData && rightHipAngleRef.current > (rightHipData.expected + rightHipData.tolerance)) {
                            setFormText("Close your right hip.");
                        }
                        
                        else if (leftHipData && leftHipAngleRef.current < (leftHipData.expected - leftHipData.tolerance)){
                            setFormText("Open your left hip.")
                        } else if (leftHipData && leftHipAngleRef.current > (leftHipData.expected + leftHipData.tolerance)) {
                            setFormText("Close your left hip.");
                        }

                        else if (rightKneeData && rightKneeAngleRef.current < (rightKneeData.expected - rightKneeData.tolerance)){
                            setFormText("Open your right knee.")
                        } else if (rightKneeData && rightKneeAngleRef.current > (rightKneeData.expected + rightKneeData.tolerance)) {
                            setFormText("Close your right knee.");
                        }

                        else if (leftKneeData && leftKneeAngleRef.current < (leftKneeData.expected - leftKneeData.tolerance)){
                            setFormText("Open your left knee.")
                        } else if (leftKneeData && leftKneeAngleRef.current > (leftKneeData.expected + leftKneeData.tolerance)) {
                            setFormText("Close your left knee.");
                        }

                        else {
                            setFormText("Perfect!")
                        }
                          
                    }

                    
                    // Get current pose data
                    const currentPose = selectedPoseRef.current;

                    // Filter out face landmarks (indices 0-10) and only keep body landmarks
                    const bodyLandmarks = landmark.filter((_, index) => 
                        index > 10 && 
                        ![17, 18, 19, 20, 21, 22, 29, 30, 31, 32].includes(index)
                    );

                    // Draw landmarks with color coding (only body landmarks)
                    drawingUtils.drawLandmarks(bodyLandmarks, {
                        radius: (data) => {
                            // Increase base radius for better visibility
                            const baseRadius = DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 15, 3);
                            // Make key joints (shoulders, elbows, hips, knees) larger
                            const originalIndex = landmark.indexOf(data.from!);
                            if ([11, 12, 13, 14, 23, 24, 25, 26, 27, 28].includes(originalIndex)) {
                                return baseRadius * 1.3; // 30% larger for key joints
                            }
                            return baseRadius;
                        },
                        color: (data) => {
                            const originalIndex = landmark.indexOf(data.from!);
                            
                            const jointMap: Record<number, { joint: string, angle: number | null }> = {
                                14: { joint: "rightElbow", angle: rightElbowAngleRef.current },
                                13: { joint: "leftElbow", angle: leftElbowAngleRef.current },
                                26: { joint: "rightKnee", angle: rightKneeAngleRef.current },
                                25: { joint: "leftKnee", angle: leftKneeAngleRef.current },
                                12: { joint: "rightShoulder", angle: rightShoulderAngleRef.current },
                                11: { joint: "leftShoulder", angle: leftShoulderAngleRef.current },
                                24: { joint: "rightHip", angle: rightHipAngleRef.current },
                                23: { joint: "leftHip", angle: leftHipAngleRef.current },
                            };

                            if (jointMap[originalIndex]) {
                                const { joint, angle } = jointMap[originalIndex];
                                const angleData = currentPose?.find(a => a.joint === joint);
                                const isCorrect = isAngleCorrect(angle, angleData?.expected ?? 0, angleData?.tolerance ?? 0);
                                return isCorrect ? '#00ff00' : '#ff0000';
                            }

                            if (originalIndex === 15 || originalIndex === 16) {
                                return '#0066ff'; // wrists
                            }

                            return '#0066ff'; // Brighter blue for other landmarks
                            
                        }
                        
                    });

                    // Filter connections to only include body landmarks (exclude face connections)
                    const bodyConnections = PoseLandmarker.POSE_CONNECTIONS.filter(connection => 
                        connection.start > 10 && connection.end > 10
                    );
                    
                    // Draw thicker, more visible connections
                    drawingUtils.drawConnectors(
                        landmark,
                        bodyConnections,
                        {
                            color: '#ffffff', // White lines for better contrast
                            lineWidth: 3 // Thicker lines
                        }
                    );
                }
            });
            
            animationFrameId = requestAnimationFrame(renderLoop);
        }

        init();
        return () => {
            isMounted = false;
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (poseLandmarkerInstance) poseLandmarkerInstance.close();
        };
    }, [selectedPose]);

    // Function to check if an angle is within tolerance
    function isAngleCorrect(angle: number | null, expected: number, tolerance: number){
        if (angle === null) return false;
        return Math.abs(angle - expected) <= tolerance;
    };

    function closePose(){
        poseLandmarker?.close?.();
        poseLandmarker = null;
    }

    function correctPose(){
        const currentPose = selectedPoseRef.current;

        const requiredJoints = [
            { joint: "rightElbow", value: rightElbowAngleRef.current },
            { joint: "leftElbow", value: leftElbowAngleRef.current },
            { joint: "rightKnee", value: rightKneeAngleRef.current },
            { joint: "leftKnee", value: leftKneeAngleRef.current },
            { joint: "rightShoulder", value: rightShoulderAngleRef.current },
            { joint: "leftShoulder", value: leftShoulderAngleRef.current },
            { joint: "rightHip", value: rightHipAngleRef.current },
            { joint: "leftHip", value: leftHipAngleRef.current },
        ];

        for (const { joint, value } of requiredJoints) {
            const angleData = currentPose?.find(a => a.joint === joint);
            if (!isAngleCorrect(value, angleData?.expected || 0, angleData?.tolerance || 0)) {
                return false;
            }
        }
        return true;
    }

    return {
        rightElbowAngleRef,
        leftElbowAngleRef,
        rightKneeAngleRef,
        leftKneeAngleRef,
        rightHipAngleRef,
        leftHipAngleRef,
        rightShoulderAngleRef,
        leftShoulderAngleRef,
        formText,
        videoRef,
        canvasRef,
        setFormText,
        // setRightElbowAngle,
        // setLeftElbowAngle,
        // setRightKneeAngle,
        // setLeftKneeAngle,
        // setRightHipAngle,
        // setLeftHipAngle,
        // setRightShoulderAngle,
        // setLeftShoulderAngle,
        closePose,
        correctPose,
    };
}