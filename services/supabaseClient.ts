
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://azhhadsavqsxtdphrvgr.supabase.co';
const supabaseAnonKey = 'sb_publishable_bNruY7eQPaEaJgXqKhp3Sg_9tazsylw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
