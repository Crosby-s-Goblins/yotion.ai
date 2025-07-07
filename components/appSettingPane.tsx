'use client';

import { useState, useEffect } from 'react';
import {
  Switch,
} from '@/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTimer } from '@/context/TimerContext';
import { useTTS } from '@/context/TextToSpeechContext';

export default function SettingsPane() {
  const {timerSeconds, setTimerSeconds} = useTimer();
  const { ttsEnabled, setTTSEnabled } = useTTS();

  const [localTimer, setLocalTimer] = useState(timerSeconds.toString());
  const [localTTS, setLocalTTS] = useState(ttsEnabled);
  const [reminders, setReminders] = useState(true);
  const [motivation, setMotivation] = useState(false);

  const handleSave = () => {
    setTimerSeconds(Number(localTimer)); // safely cast from string to number
    setTTSEnabled(localTTS);
    alert(`Settings saved!`);
  };

  useEffect(() => {
    setLocalTTS(ttsEnabled);
  }, [ttsEnabled]);

  useEffect(() => {
    setLocalTimer(timerSeconds.toString());
  }, [timerSeconds])

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-8">
      <section>
        <Label htmlFor="timer" className="mb-2 block font-semibold">
          Default Timer (seconds)
        </Label>
        <Select value={localTimer} onValueChange={setLocalTimer}>
          <SelectTrigger>
            <SelectValue placeholder="Select timer" />
          </SelectTrigger>
          <SelectContent>
            {[30, 60, 90, 120, 150].map((sec) => (
              <SelectItem key={sec} value={sec.toString()}>
                {sec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between gap-6">
            <Label htmlFor="reminders" className="font-semibold text-lg">
            Workout Reminders
            </Label>
            <div className="px-4">
            <Switch id="reminders" checked={reminders} onCheckedChange={setReminders} />
            </div>
        </div>

        <div className="flex items-center justify-between gap-6">
            <Label htmlFor="motivation" className="font-semibold text-lg">
            Motivational Messages
            </Label>
            <div className="px-4">
            <Switch id="motivation" checked={motivation} onCheckedChange={setMotivation} />
            </div>
        </div>
    </section>


    <section className="space-y-8">
        <div className="flex items-center justify-between gap-6">
            <Label htmlFor="audio-feedback" className="font-semibold text-lg">
            Audio Feedback
            </Label>
            <div className="px-4">
            <Switch
                id="audio-feedback"
                checked={localTTS}
                onCheckedChange={setLocalTTS}
            />
            </div>
        </div>
    </section>

      <Separator />

      <Button className="w-full py-4 font-semibold rounded-xl" onClick={handleSave}>
        Save Settings
      </Button>
    </div>
  );
}

// TODO: Connect functionality (Make default timer persistent)
// Reminders/Messages are sent via email?
