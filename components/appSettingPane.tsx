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
import { createClient } from '@/lib/supabase/client';
import { useUserPreferences } from '@/context/UserPreferencesContext';

const supabase = createClient();

export default function SettingsPane() {
  const { preferences, loading, setPreferences } = useUserPreferences();
  const { setTimerSeconds } = useTimer();
  const { setTTSEnabled } = useTTS();

  // Local states initialized to null for safe conditional rendering
  const [localTimer, setLocalTimer] = useState<string | null>(null);
  const [localTTS, setLocalTTS] = useState<boolean | null>(null);
  const [reminders, setReminders] = useState<boolean | null>(null);
  const [motivation, setMotivation] = useState<boolean | null>(null);

  // Load values from Supabase context preferences
  useEffect(() => {
    if (!loading && preferences && localTimer === null) {
      setLocalTimer(preferences.default_timer.toString());
      setLocalTTS(preferences.tts_enabled);
      setReminders(preferences.reminders);
      setMotivation(preferences.motivation ?? false);
    }
  }, [loading, preferences]);

  // Don't render until preferences are fully loaded
  if (
    loading 
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-medium">Loading preferences...</span>
      </div>
    );
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newPrefs = {
      id: user.id,
      default_timer: Number(localTimer),
      tts_enabled: localTTS,
      reminders,
      motivation,
    };

    const { error } = await supabase
      .from('user_preferences')
      .upsert(newPrefs);

    if (error) {
      console.error('Failed to save:', error);
    } else {
      // Update context providers
      setPreferences(newPrefs);
      setTimerSeconds(newPrefs.default_timer);
      setTTSEnabled(newPrefs.tts_enabled);

      alert('Preferences saved!');
    }
  };

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
            <Switch
              id="reminders"
              checked={reminders}
              onCheckedChange={setReminders}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-6">
          <Label htmlFor="motivation" className="font-semibold text-lg">
            Motivational Messages
          </Label>
          <div className="px-4">
            <Switch
              id="motivation"
              checked={motivation}
              onCheckedChange={setMotivation}
            />
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

      <Button
        className="w-full py-4 font-semibold rounded-xl"
        onClick={handleSave}
      >
        Save Settings
      </Button>
    </div>
  );
}

// TODO: Connect functionality (Make default timer persistent)
// Reminders/Messages are sent via email?


// TODO: Connect functionality (Make default timer persistent)
// Reminders/Messages are sent via email?
