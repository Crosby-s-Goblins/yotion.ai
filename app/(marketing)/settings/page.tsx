// settings/page.tsx
import ProfileSettings from '@/components/settingsPage/profileSettings'
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return user ? <ProfileSettings user={user} /> : null;
}
