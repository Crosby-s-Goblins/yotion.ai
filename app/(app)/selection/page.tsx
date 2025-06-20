import { BreathIndication } from "@/components/breathingIndicatorLineBall";
import SelectionComponents from "@/components/expandedPoseCard";

export default function PracticePage() {
  
  return (
    <main>
      <SelectionComponents /> 
      <BreathIndication duration={10} />
    </main>
    
  );
}