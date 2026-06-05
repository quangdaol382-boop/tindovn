import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://kvbtvjzkeukcjgqqdddu.supabase.co'
const SUPABASE_KEY = 'sb_publishable_t9L83Ag6Tbr3PK3_SNEIGw_uiKra69S'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)