import React from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isCameraOn: boolean;
  isLoading: boolean;
  error: string | null;
  startCamera: () => void;
}

export function CameraView({ 
  videoRef, 
  canvasRef, 
  isCameraOn, 
  isLoading, 
  error, 
  startCamera 
}: CameraViewProps) {
  return (
    <div className="absolute inset-0 bg-gray-400">
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        muted
        playsInline
        className="scale-x-[-1] absolute inset-0 w-full h-full object-cover"
      />
      <canvas
        ref={canvasRef}
        className="scale-x-[-1] absolute inset-0 w-full h-full object-cover"
      />

      {/* Loading/Error overlay */}
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <div className="text-center text-white">
            {isLoading ? (
              <>
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg font-medium">Accessing camera...</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg mb-4 font-medium">Camera not available</p>
                {error && (
                  <p className="text-red-400 text-sm mb-6 max-w-md mx-auto">
                    {error}
                  </p>
                )}
                <Button
                  onClick={startCamera}
                  className="bg-gradient-to-tr from-primary to-accent text-white px-8 py-4 rounded-full flex items-center gap-2 mx-auto shadow-glass hover:from-primary/90 hover:to-accent/90"
                >
                  <Camera className="w-4 h-4" />
                  Try Again
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}