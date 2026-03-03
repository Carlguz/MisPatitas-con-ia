'use client'

import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export default function WalkerPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase]);

  return (
    <div>
      <h1>Walker Dashboard</h1>
      {user && <p>Welcome, {user.email}</p>}
    </div>
  );
}
