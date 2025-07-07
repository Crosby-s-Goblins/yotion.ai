
import React from "react";
import { useTimer } from "../context/TimerContext";

export default function TimerSelect() {
  const { timerSeconds, setTimerSeconds } = useTimer();

  console.log("Current timerSeconds:", timerSeconds);

  return (
    <div>
      <label className="font-semibold mb-2 block">Timer Length</label>
      <select
        value={timerSeconds}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          console.log("Selected:", val);
          setTimerSeconds(val);
        }}
        className="w-full rounded-xl border py-2 px-3 cursor-pointer"
      >
        {[30, 60, 90, 120, 150].map((sec) => (
          <option key={sec} value={sec}>
            {sec} seconds
          </option>
        ))}
      </select>
    </div>
  );
}