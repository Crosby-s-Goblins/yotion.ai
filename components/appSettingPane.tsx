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
  const {timerSeconds, setTimerSeconds} = useTimer();
  const { ttsEnabled, setTTSEnabled } = useTTS();

  const [localTimer, setLocalTimer] = useState<string | undefined>(undefined);
  const [localTTS, setLocalTTS] = useState<boolean | undefined>(undefined);
  const [reminders, setReminders] = useState<boolean | undefined>(undefined);
  const [motivation, setMotivation] = useState<boolean | undefined>(undefined);
  const [load, setLoad] = useState(true);

  const {setPreferences, loading, preferences} = useUserPreferences();

  useEffect(() => {
    if (!loading && preferences) {
      setLocalTimer((preferences.default_timer ?? 60).toString());
      setLocalTTS(preferences.tts_enabled ?? true);
      setReminders(preferences.reminders ?? false);
      setMotivation(preferences.motivation ?? false);
    }
  }, [loading, preferences]);

  useEffect(() => {
    const fetchOrInitPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No preferences found, create defaults
        const defaultPrefs = {
          id: user.id,
          default_timer: 60,
          tts_enabled: true,
          reminders: false,
          motivation: false,
        };
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPrefs);

        if (!insertError) {
          setPreferences(defaultPrefs);
          setLocalTimer('60');
          setLocalTTS(true);
          setReminders(false);
          setMotivation(false);
        }
      } else if (data) {
        // Preferences exist
        setPreferences(data);
        setLocalTimer((data.default_timer ?? 60).toString());
        setLocalTTS(data.tts_enabled ?? true);
        setReminders(data.reminders ?? false);
        setMotivation(data.motivation ?? false);
      }

      setLoad(false);
    };

    fetchOrInitPreferences();
  }, [setPreferences]);

  const handleSave = async () => {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return;

    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        id: user.data.user.id,
        default_timer: Number(localTimer),
        tts_enabled: localTTS,
        reminders: reminders,
        motivation: motivation,
      });

    if (error) {
      console.error("Failed to save:", error);
    } else {
      alert("Preferences saved!");
      setPreferences({
        default_timer: Number(localTimer),
        tts_enabled: localTTS,
        reminders: reminders,
        motivation: motivation,
      });
    }
  };

  useEffect(() => {
    setLocalTTS(ttsEnabled);
  }, [ttsEnabled]);

  useEffect(() => {
    setLocalTimer(timerSeconds.toString());
  }, [timerSeconds])

  if (
    loading ||
    localTimer === undefined ||
    localTTS === undefined ||
    reminders === undefined ||
    motivation === undefined
  ) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="text-lg font-medium">Loading preferences...</span>
      </div>
    );
  }

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
