import React, { useEffect } from 'react';
import { useTimer } from 'react-timer-hook';
import { Button } from './ui/button';

function MyTimer({ expiryTimestamp, onTimerUpdate }: { expiryTimestamp: Date, onTimerUpdate: (seconds: number) => void }) {
  const {
    totalSeconds,
    milliseconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    resume,
    restart,
  } = useTimer({ expiryTimestamp, onExpire: () => console.warn('onExpire called'), interval: 20, autoStart: false });

  useEffect(() => {
    onTimerUpdate(seconds);
  }, [seconds, onTimerUpdate]);

  return (
    <div style={{textAlign: 'center'}}>
      {seconds > 0 && (
        <div style={{fontSize: '100px'}}>
          <span>{seconds}</span>
        </div>
      )}
      {/* <p>{isRunning ? 'Running' : 'Not running'}</p> */}
      {
        (!isRunning && seconds !== 0) && (
            <Button variant="destructive" onClick={start}>Start</Button>
        )
      }
      {/* <button onClick={pause}>Pause</button> */}
      {/* <button onClick={resume}>Resume</button> */}
      {/* <button onClick={() => {
        // Restarts to 5 minutes timer
        const time = new Date();
        time.setSeconds(time.getSeconds() + 300);
        restart(time)
      }}>Restart</button> */}
    </div>
  );
}

export default function Timer({ onTimerUpdate }: { onTimerUpdate: (seconds: number) => void }) {
  const time = new Date();
  time.setSeconds(time.getSeconds() + 5); // 10 minutes timer
  return (
    <div>
      <MyTimer expiryTimestamp={time} onTimerUpdate={onTimerUpdate} />
    </div>
  );
}