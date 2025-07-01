import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Pose } from "./types";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  pose: Pose;
  onClose: () => void;
}

export function ExpandedPoseCard ({ pose, onClose }: Props) {

  let benefits: string[] = [];


   if (pose.benefits) {
    if (Array.isArray(pose.benefits)) {
      benefits = pose.benefits;
    } else if (typeof pose.benefits === 'string' && pose.benefits.trim() !== '') {
      try {
        const parsed = JSON.parse(pose.benefits);
        if (Array.isArray(parsed)) {
          benefits = parsed;
        }
      } catch {
        // Fallback for non-JSON strings, or leave empty

      }
    }
  }
  

  return (
    <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden w-[90vw] max-w-4xl h-[80vh] max-h-[600px]"
      initial={{ scale: 0.8, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
          <div className="flex items-center gap-6 justify-center w-full">
            <h2 className="text-3xl font-bold">{pose.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex p-12 overflow-y-auto h-full w-full items-center gap-8">
          {/* Left side - image */}
          <div className="aspect-square w-1/2 h-full flex items-center justify-center">
            <img
                  src={pose.images}
                  alt={`${pose.name} reference`}
                  className="h-full w-full object-contain rounded-lg bg-black/25"
                  onError={(e) => {
                    e.currentTarget.parentElement!.style.display = 'none';
                  }}
                />
          </div>
          {/* Right side - details */}
          <div className="flex flex-col w-1/2 h-full justify-between">
            {pose.description && (
              <div className="">
                <h3 className="text-xl font-semibold">Description</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{pose.description}</p>
              </div>
            )}
            {benefits?.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold">Benefits</h3>
                <ul className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 text-lg">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button className="rounded-3xl h-12 bg-blue-500">
              <Link href={`/skele?poseId=${pose.id}`}>
                <p className="text-white text-lg">Start</p>
              </Link>   
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
  );
}
