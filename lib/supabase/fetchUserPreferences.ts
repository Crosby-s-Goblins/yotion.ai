//For settings retention
import { createClientComponent } from "@/lib/supabase/client";

export async function fetchUserPreferences(userId: string) {
  const supabase = createClientComponent();

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}