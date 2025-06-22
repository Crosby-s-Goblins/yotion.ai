// settings/page.tsx
import ProfileSettings from '@/components/romeoProfileSettings'
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    return (
        <ProfileSettings user={user}/>
    );
}
