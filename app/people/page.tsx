import { createClient } from '@/utils/supabase/server';

export default async function People() {
  const supabase = await createClient();
  const { data: people } = await supabase.from("people").select();

  return <pre>{JSON.stringify(people, null, 2)}</pre>
}