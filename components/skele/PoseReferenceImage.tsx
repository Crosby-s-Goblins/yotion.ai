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
          absolute top-1/2 right-8 -translate-y-1/2 pointer-events-auto
          transition-all duration-300
          ${showImageRef
            ? 'opacity-100 scale-100 translate-x-0'
            : 'opacity-0 scale-95 translate-x-full'}
        `}
        style={{ transitionProperty: 'opacity, transform' }}
      >
        {/* image card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/40 flex flex-col items-center">
          <Image
            src={pose.images}
            alt={`${pose.name} reference`}
            width={224}
            height={224}
            className={`w-56 h-56 object-contain rounded-xl border-2 border-white/40 shadow-lg ${isReversed ? 'scale-x-[-1]' : ''}`}
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
            }}
            unoptimized
          />
          <p className="text-black text-lg text-center mt-2 font-semibold drop-shadow">{pose.name}</p>
        </div>
      </div>
    </div>
  );
}