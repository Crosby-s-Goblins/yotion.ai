// poseCorrection component for Skele page
'use client'

import {
    FilesetResolver,
    DrawingUtils,
    PoseLandmarker
} from '@mediapipe/tasks-vision';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

type PoseAngle = {
    joint: string;
    expected: number;
    tolerance: number;
};
type PoseAngles = PoseAngle[];



export function usePoseCorrection(selectedPose: number, timerStartedRef: React.RefObject<number>, isReversed?: boolean) {
    
    let poseLandmarker: PoseLandmarker | null = null;

    const [poseAngles, setPoseAngles] = useState<PoseAngles | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Store previous landmarks for smoothing
    const previousLandmarksRef = useRef<PoseLandmark[]>([]);

    //Bulk values for timer start? -- Redundant with above, pick one later
    const rightElbowAngleRef = useRef<number | null>(null);
    const leftElbowAngleRef = useRef<number | null>(null);
    const rightKneeAngleRef = useRef<number | null>(null);
    const leftKneeAngleRef = useRef<number | null>(null);
    const rightHipAngleRef = useRef<number | null>(null);
    const leftHipAngleRef = useRef<number | null>(null);
    const rightShoulderAngleRef = useRef<number | null>(null);
    const leftShoulderAngleRef = useRef<number | null>(null);



    const selectedPoseRef = useRef<PoseAngles | null>(null);

    // score system - accuracy
    const [score, setScore] = useState<number>(100);
    const scoreRef = useRef(score);
    useEffect(() => {
      scoreRef.current = score;
    }, [score]);
    const lastScoreUpdateRef = useRef(Date.now());

    const animationFrameRef = useRef<number | null>(null);
    const runningRef = useRef(true); // control loop state

    const closePose = useCallback(() => {
        poseLandmarker?.close?.();
        poseLandmarker = null;
    }, [poseLandmarker]);

    useEffect(() => {
        runningRef.current = true;
        const detectLoop = () => {
            if (!runningRef.current) return;
            // your pose detection logic...
            animationFrameRef.current = requestAnimationFrame(detectLoop);
        };
        detectLoop();
        return () => {
            runningRef.current = false;
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            closePose(); // Optional: close detector on unmount
        };
    }, [closePose]);

    const stop = () => {
        runningRef.current = false;
        if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        }
        closePose(); // or cleanup logic here
    };

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

        let angles = Array.isArray(parsed) ? parsed : null;
        if (angles && isReversed) {
            angles = angles.map(a => {
                if (a.joint.startsWith('left')) return { ...a, joint: a.joint.replace('left', 'right') };
                if (a.joint.startsWith('right')) return { ...a, joint: a.joint.replace('right', 'left') };
                return a;
            });
        }
        setPoseAngles(angles);
        } catch (e) {
            console.error("Failed to parse angles JSON:", e);
            setPoseAngles(null);
        }

    };
    if (selectedPose) fetchPose();
    }, [selectedPose, isReversed]);


    // Utility to calculate angle given points A, B, C
    function calculateAngle(
        A: { x: number; y: number; z?: number; visibility?: number },
        B: { x: number; y: number; z?: number; visibility?: number },
        C: { x: number; y: number; z?: number; visibility?: number }
    ): number {
        const AB = { x: A.x - B.x, y: A.y - B.y };
        const CB = { x: C.x - B.x, y: C.y - B.y };
        const dot = AB.x * CB.x + AB.y * CB.y;
        const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
        const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);
        const cosineAngle = dot / (magAB * magCB);
        const angleRad = Math.acos(Math.max(-1, Math.min(1, cosineAngle)));
        return angleRad * (180 / Math.PI);
    }

    // Define a type for pose landmarks
    type PoseLandmark = { x: number; y: number; z: number; visibility: number };

    function isVisible(...points: PoseLandmark[]): boolean {
        return points.every(p => p && p.visibility !== undefined && p.visibility > 0.5);
    }

    // Smooth landmarks using Exponential Moving Average (EMA)
    function smoothLandmarks(current: PoseLandmark[], previous: PoseLandmark[], alpha: number = 0.5): PoseLandmark[] {
        if (!previous || previous.length === 0) return current;

        return current.map((currPoint, i) => {
            const prevPoint = previous[i];
            if (!prevPoint || !currPoint) return currPoint;
            
            return {
                x: alpha * currPoint.x + (1 - alpha) * prevPoint.x,
                y: alpha * currPoint.y + (1 - alpha) * prevPoint.y,
                z: alpha * (currPoint.z ?? 0) + (1 - alpha) * (prevPoint.z ?? 0),
                visibility: currPoint.visibility ?? 1,
            };
        });
    }    

    useEffect(() => {
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
                for (const originalLandmark of result.landmarks) {
                    // Apply smoothing to landmarks
                    const smoothedLandmarks = smoothLandmarks(originalLandmark, previousLandmarksRef.current);
                    previousLandmarksRef.current = smoothedLandmarks;
                    
                    // Use smoothed landmarks for all calculations
                    const landmark = smoothedLandmarks;

                    rightElbowAngleRef.current = Math.round(calculateAngle(landmark[12],
                        landmark[14],
                        landmark[16]));

                     leftElbowAngleRef.current = Math.round(calculateAngle(landmark[11],
                        landmark[13],
                        landmark[21]));

                     rightKneeAngleRef.current = Math.round(calculateAngle(landmark[24],
                        landmark[26],
                        landmark[28]));

                     leftKneeAngleRef.current = Math.round(calculateAngle(landmark[23],
                        landmark[25],
                        landmark[27]));

                     rightShoulderAngleRef.current = Math.round(calculateAngle(landmark[14],
                        landmark[12],
                        landmark[24]));

                     leftShoulderAngleRef.current = Math.round(calculateAngle(landmark[13],
                        landmark[11],
                        landmark[23]));

                     rightHipAngleRef.current = Math.round(calculateAngle(landmark[12],
                        landmark[24],
                        landmark[26]));

                     leftHipAngleRef.current = Math.round(calculateAngle(landmark[11],
                        landmark[23],
                        landmark[25]));
                    
                    if (isVisible(landmark[13], landmark[11], landmark[23], landmark[14], landmark[12], landmark[24], landmark[23], landmark[25], landmark[27], landmark[12], landmark[14], landmark[16], landmark[11], landmark[13], landmark[21], landmark[24], landmark[26], landmark[28], landmark[11], landmark[23], landmark[25])) {
                                                // All text feedback removed - pose detection continues silently
                          
                    }

                    // calculate the accuracy score for each joint
                    const joints = [
                        { ref: rightElbowAngleRef, name: "rightElbow" },
                        { ref: leftElbowAngleRef, name: "leftElbow" },
                        { ref: rightKneeAngleRef, name: "rightKnee" },
                        { ref: leftKneeAngleRef, name: "leftKnee" },
                        { ref: rightShoulderAngleRef, name: "rightShoulder" },
                        { ref: leftShoulderAngleRef, name: "leftShoulder" },
                        { ref: rightHipAngleRef, name: "rightHip" },
                        { ref: leftHipAngleRef, name: "leftHip" },
                    ];
                    if (selectedPoseRef.current) {
                        for (const joint of joints) {
                            const current = joint.ref.current;
                            const expected = selectedPoseRef.current.find(a => a.joint === joint.name)?.expected;
                            const tolerance = selectedPoseRef.current.find(a => a.joint === joint.name)?.tolerance;
                            if (
                                typeof current === "number" &&
                                typeof expected === "number" &&
                                typeof tolerance === "number"
                            ) {
                                scoreCalcAccuracy(current, expected, tolerance);
                            }
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
                                
                                if (angleData) {
                                    const isCorrect = isAngleCorrect(angle, angleData.expected, angleData.tolerance);
                                    return isCorrect ? '#00ff00' : '#ff0000';
                                }
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
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (poseLandmarkerInstance) poseLandmarkerInstance.close();
        };
    }, []);

    // Function to check if an angle is within tolerance
    function isAngleCorrect(angle: number | null, expected: number, tolerance: number) {
        if (angle === null) return false;
        return Math.abs(angle - expected) <= tolerance;
    };

    function correctPose() {
        const currentPose = selectedPoseRef.current;

        // Helper to get the correct joint name and value, swapping left/right if isReversed
        function getJoint(joint: string) {
            if (!isReversed) return joint;
            if (joint.startsWith('left')) return joint.replace('left', 'right');
            else if (joint.startsWith('right')) return joint.replace('right', 'left');
            return joint;
        }
        function getRef(joint: string) {
            switch (joint) {
                case 'rightElbow': return isReversed ? leftElbowAngleRef : rightElbowAngleRef;
                case 'leftElbow': return isReversed ? rightElbowAngleRef : leftElbowAngleRef;
                case 'rightKnee': return isReversed ? leftKneeAngleRef : rightKneeAngleRef;
                case 'leftKnee': return isReversed ? rightKneeAngleRef : leftKneeAngleRef;
                case 'rightShoulder': return isReversed ? leftShoulderAngleRef : rightShoulderAngleRef;
                case 'leftShoulder': return isReversed ? rightShoulderAngleRef : leftShoulderAngleRef;
                case 'rightHip': return isReversed ? leftHipAngleRef : rightHipAngleRef;
                case 'leftHip': return isReversed ? rightHipAngleRef : leftHipAngleRef;
                default: return null;
            }
        }

        const requiredJoints = [
            'rightElbow', 'leftElbow', 'rightKnee', 'leftKnee',
            'rightShoulder', 'leftShoulder', 'rightHip', 'leftHip',
        ];

        for (const joint of requiredJoints) {
            const ref = getRef(joint);
            const value = ref?.current;
            const angleData = currentPose?.find(a => a.joint === getJoint(joint));
            if (!isAngleCorrect(value ?? null, angleData?.expected || 0, angleData?.tolerance || 0)) {
                return false;
            }
        }
        return true;
    }

    function scoreCalcAccuracy(current: number, expected: number, tol: number) {
        const para = expected - current;
        let pointLoss = 0;
        if (((para < -tol) || (para > tol)) && timerStartedRef.current == 2) {
            pointLoss = 0.000001 * (para ** 2);
        }
        if (typeof pointLoss === 'number' && !isNaN(pointLoss)) {
            const now = Date.now();
            const newScore = Math.max(0, scoreRef.current - pointLoss);
            if (scoreRef.current !== newScore && now - lastScoreUpdateRef.current > 200) {
                setScore(newScore);
                lastScoreUpdateRef.current = now;
            }
        }
        return pointLoss;
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
        videoRef,
        canvasRef,
        score,
        setScore,
        closePose,
        correctPose,
        stop,
    };
}