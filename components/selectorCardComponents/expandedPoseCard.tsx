import { motion } from "framer-motion";
import { X } from "lucide-react";
import { Pose } from "./types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

interface Props {
  pose: Pose;
  onClose: () => void;
}

export function ExpandedPoseCard({ pose, onClose }: Props) {

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
        <div className="h-[80vh] max-h-[600px] overflow-y-auto">
          <div className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
            <div className="flex items-center gap-6 justify-center w-full">
              <h2 className="text-3xl font-bold">{pose.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {/* image */}
          <Image
            src={pose.images ?? "/nullImage.png"}
            alt={`${pose.name} reference`}
            width={800}
            height={600}
            className="h-full w-full object-contain rounded-lg bg-black/25"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement!.style.display = 'none';
            }}
            unoptimized
          />
          {/* Description */}
          <div className="flex flex-col h-full justify-between overflow-y-auto">
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
            <Button className="rounded-3xl h-12" asChild>
              <Link href={`/skele?poseId=${pose.id}`}>
                <p className="text-white text-lg">Start</p>
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
