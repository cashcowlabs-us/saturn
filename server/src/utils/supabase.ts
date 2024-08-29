import { createClient } from "@supabase/supabase-js"
import config from "./config"
import type { Database } from "../database.types"

const supabase = createClient<Database>(config.supabaseUrl, config.supabaseKey)

export default supabase