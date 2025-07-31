'use client'
import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";
import { Loader2Icon } from "lucide-react";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  isLoading,
}: {
  onChange?: (files: File[]) => void;
  isLoading?: boolean;
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (onChange) onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: () => {
      // Handle rejected files silently
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div onClick={handleClick} whileHover="animate" className="pb-4">
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center cursor-pointer">
          <div className="relative w-full max-w-xl mx-auto">
            {files.length > 0 && (
              <motion.div
                key="file-upload"
                layoutId="file-upload"
                className={cn(
                  "relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
                  "shadow-sm"
                )}
              >
                <div className="flex flex-col justify-between w-full items-center gap-4">
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                  >
                    {files[0].name}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    layout
                    className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 bg-neutral-800 text-white shadow-input"
                  >
                    {isLoading ? (
                      <Loader2Icon size={20} className="animate-spin" />
                    ) : (
                      <>Updated!</>
                    )}
                  </motion.p>
                </div>
              </motion.div>
            )}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl z-40 bg-black dark:bg-neutral-900 flex items-center justify-center min-h-32 h-full mt-4 w-full rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                )}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-3">
                    <IconUpload className="h-4 w-4 text-neutral-300 dark:text-neutral-300" />
                    <p className="text-white font-regular text-xs opacity-75 text-center">
                      Drag & drop or tap here to upload
                    </p>
                    <p className="text-white text-xs opacity-75 font-light italic">
                      Max: 5MB
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center min-h-32 h-full mt-4 w-full rounded-md"
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};