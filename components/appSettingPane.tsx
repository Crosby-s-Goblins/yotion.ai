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
import { useUser } from './user-provider';
import { Input } from './ui/input';

const supabase = createClient();

export default function SettingsPane() {
  const {timerSeconds, setTimerSeconds} = useTimer();
  const { ttsEnabled, setTTSEnabled } = useTTS();

  const [localTimer, setLocalTimer] = useState<string | undefined>(undefined);
  const [localTTS, setLocalTTS] = useState<boolean | undefined>(undefined);
  const [reminders, setReminders] = useState<boolean | undefined>(undefined);
  const [motivation, setMotivation] = useState<boolean | undefined>(undefined);
  const [load, setLoad] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

  const {setPreferences, loading, preferences} = useUserPreferences();
  const [weight, setWeight] = useState<number>(0);
  const user = useUser();

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

        if (insertError) {
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
        setTTSEnabled(data.tts_enabled ?? true);
        setReminders(data.reminders ?? false);
        setMotivation(data.motivation ?? false);
      }

      setLoad(false);
    };

    fetchOrInitPreferences();
  }, [setPreferences, user]);

  const handleChangeWeight = async (newWeight: number) => {
    if (!user?.id) return;

    const { error } = await supabase
      .from('user_preferences')
      .update({ weight: newWeight })
      .eq('id', user.id);

    if (error) {
      console.log(error)
    } else {
      setHasSubmitted(true);
    }
  }

  const handleSave = async () => {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Timer Settings Card */}
      <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
              Session Settings
            </h3>
            <p className="text-sm text-muted-foreground">Configure your practice experience</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
            <span className="text-primary text-xl">⏱️</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="timer" className="text-sm font-medium text-muted-foreground">
            Default Timer (seconds)
          </Label>
          <Select value={localTimer} onValueChange={setLocalTimer}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select timer duration"/>
            </SelectTrigger>
            <SelectContent className="bg-white border border-border shadow-lg">
              {[30, 60, 90, 120, 150].map((sec) => (
                <SelectItem key={sec} value={sec.toString()}>
                  {sec} seconds ({Math.floor(sec / 60) > 0 ? `${Math.floor(sec / 60)}m ` : ''}{sec % 60 > 0 ? `${sec % 60}s` : ''})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="bg-card.glass flex flex-row justify-between rounded-2xl p-6 border border-border/50 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent">
              Change Weight
            </h3>
            <p className="text-sm text-muted-foreground">Configure your weight for calorie calculations.</p>
          </div>
        </div>
        
        <form
          onSubmit={e => {
            e.preventDefault();
            handleChangeWeight(weight);
          }}
          className="flex items-center gap-7"
        >
          <div className='flex items-center gap-2'>
            <Input
              placeholder='150'
              className='rounded-md w-[75px] text-center'
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
            />
            <p className='font-regular text-xl'>lbs</p>
          </div>
            <Button disabled={hasSubmitted}>
              {hasSubmitted ? "Changed!" : "Submit"}
            </Button>
        </form>
      </div>

      {/* Notifications Card */}
      <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-tr from-accent to-primary bg-clip-text text-transparent">
              Notifications
            </h3>
            <p className="text-sm text-muted-foreground">Manage your practice reminders and motivation</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-accent/10 to-primary/10 flex items-center justify-center">
            <span className="text-accent text-xl">🔔</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reminders" className="text-sm font-medium">
                Workout Reminders
              </Label>
              <p className="text-xs text-muted-foreground">Get notified to maintain your practice routine</p>
            </div>
            <Switch id="reminders" checked={reminders} onCheckedChange={setReminders} />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="motivation" className="text-sm font-medium">
                Motivational Messages
              </Label>
              <p className="text-xs text-muted-foreground">Receive encouraging messages during practice</p>
            </div>
            <Switch id="motivation" checked={motivation} onCheckedChange={setMotivation} />
          </div>
        </div>
      </div>

      {/* Audio Settings Card */}
      <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold bg-gradient-to-tr from-green-600 to-green-500 bg-clip-text text-transparent">
              Audio Settings
            </h3>
            <p className="text-sm text-muted-foreground">Configure voice guidance and feedback</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green-600/10 to-green-500/10 flex items-center justify-center">
            <span className="text-green-600 text-xl">🔊</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="audio-feedback" className="text-sm font-medium">
              Audio Feedback
            </Label>
            <p className="text-xs text-muted-foreground">Enable voice guidance during poses</p>
          </div>
          <Switch
            id="audio-feedback"
            checked={localTTS}
            onCheckedChange={setLocalTTS}
          />
        </div>
      </div>

      {/* Save Button Card */}
      <div className="bg-card.glass rounded-2xl p-6 border border-border/50 shadow-card">
        <Button 
          className="w-full bg-gradient-to-tr from-primary to-accent text-white py-4 px-8 rounded-full font-semibold shadow-lg hover:from-primary/90 hover:to-accent/90 transition-all duration-200" 
          onClick={handleSave}
        >
          Save Settings
        </Button>
      </div>
    </div>
  );
}

// TODO: Connect functionality (Make default timer persistent)
// Reminders/Messages are sent via email?
