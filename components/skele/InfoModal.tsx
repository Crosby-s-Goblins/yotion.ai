import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Pose } from '@/components/selectorCardComponents/types';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  pose: Pose | null;
  isLoadingPose: boolean;
  dbError: string | null;
}

export function InfoModal({ isOpen, onClose, pose, isLoadingPose, dbError }: InfoModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-auto" 
      onClick={onClose}
    >
      <div
        className="relative bg-white/90 border border-white/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-10 max-w-lg w-full mx-4 shadow-2xl flex flex-col min-h-[400px] sm:min-h-[480px]"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="icon"
          aria-label="Close info modal"
          className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-6 lg:right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/80 text-black border border-white/40 shadow-lg hover:bg-white z-10"
          onClick={onClose}
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" />
        </Button>
        
        <div className="flex-grow flex flex-col justify-center pt-8 sm:pt-0">
          {isLoadingPose ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground text-sm sm:text-base">Loading Pose Information...</p>
              </div>
            </div>
          ) : pose ? (
            <>
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent mb-2 drop-shadow">
                  {pose.name}
                </h2>
                <p className="text-sm sm:text-base lg:text-lg text-black/80 mb-4">{pose.description || "No description available."}</p>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-2 sm:space-y-3">
                  <h3 className="font-semibold text-black text-sm sm:text-base">Instructions</h3>
                  <div className="text-sm sm:text-base text-black/80 space-y-1 sm:space-y-2">
                    <p>• Follow the visual indicator on the left side.</p>
                    <p>• Breathe in as the ball moves up.</p>
                    <p>• Breathe out as the ball moves down.</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="font-semibold text-red-500 text-sm sm:text-base">Unable to load pose information.</p>
                {dbError && <p className="text-xs sm:text-sm text-muted-foreground mt-2">{dbError}</p>}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 sm:mt-10 pt-4 sm:pt-6 border-t border-white/40">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-tr from-primary to-accent text-white py-3 sm:py-4 px-6 sm:px-8 rounded-full font-semibold shadow-lg hover:from-primary/90 hover:to-accent/90 transition-all duration-200 text-sm sm:text-base"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  );
}