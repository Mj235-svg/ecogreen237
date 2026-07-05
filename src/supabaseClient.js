import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ceci s'affiche si le fichier .env n'a pas été rempli avec vos vraies clés Supabase.
  console.error(
    "Supabase n'est pas configuré. Copiez .env.example vers .env et renseignez vos clés."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
