import { Pose } from './types';
import { motion } from "framer-motion";

const difficultyColors = {
  Easy: 'bg-green-500',
  Medium: 'bg-yellow-500',
  Hard: 'bg-red-500',
} as const;

type PoseItemProps = Pose & {
  onClick: () => void;
  isExpanded: boolean;
};

export const PoseItem = ({ name, difficulty, onClick, isExpanded }: PoseItemProps) => (
  <motion.div 
    className="flex flex-col cursor-pointer"
    whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
    transition={{ duration: 0.2 }}
    onClick={onClick}
  >
    <div className="flex flex-row py-4 px-8 items-center justify-between">
      <p className="font-medium">{name}</p>
      <div className={`flex flex-row ${difficultyColors[difficulty]} px-6 py-2 rounded-full w-28 justify-center items-center`}>
        <p className="text-white text-sm font-medium">{difficulty}</p>
      </div>
    </div>
    {!isExpanded && <hr className="border-gray-200 -mx-8" />}
  </motion.div>
);
