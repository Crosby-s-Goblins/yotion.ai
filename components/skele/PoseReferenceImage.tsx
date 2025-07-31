import React from 'react';
import Image from 'next/image';
import { Pose } from '@/components/selectorCardComponents/types';

interface PoseReferenceImageProps {
  pose: Pose | null;
  showImageRef: boolean;
  isReversed: boolean;
}

export function PoseReferenceImage({ pose, showImageRef, isReversed }: PoseReferenceImageProps) {
  if (!pose?.images) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30">
      <div
        className={`
          absolute top-1/2 right-2 sm:right-4 lg:right-8 -translate-y-1/2 pointer-events-auto
          transition-all duration-300
          ${showImageRef
            ? 'opacity-100 scale-100 translate-x-0'
            : 'opacity-0 scale-95 translate-x-full'}
        `}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        {/* image card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-xl sm:rounded-2xl p-2 sm:p-3 lg:p-4 shadow-2xl border border-white/40 flex flex-col items-center">
          <Image
            src={pose.images}
            alt={`${pose.name} reference`}
            width={224}
            height={224}
            className={`w-32 h-32 sm:w-40 sm:h-40 lg:w-56 lg:h-56 object-contain rounded-lg sm:rounded-xl border-2 border-white/40 shadow-lg ${isReversed ? 'scale-x-[-1]' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
            }}
            unoptimized
          />
          <p className="text-black text-sm sm:text-base lg:text-lg text-center mt-1 sm:mt-2 font-semibold drop-shadow max-w-32 sm:max-w-40 lg:max-w-56 break-words">
            {pose.name}
          </p>
        </div>
      </div>
    </div>
  );
}