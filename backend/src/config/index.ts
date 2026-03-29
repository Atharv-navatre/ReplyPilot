// Centralized configuration
// All environment variables are loaded here

export const config = {
  // Server
  port: parseInt(process.env.PORT || "3001", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  
  // AI Provider: "groq" or "openai"
  aiProvider: (process.env.AI_PROVIDER || "groq") as "groq" | "openai",
  
  // Groq (default for MVP)
  groqApiKey: process.env.GROQ_API_KEY || "",
  
  // OpenAI (alternative)
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  
  // Supabase (for V2)
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseKey: process.env.SUPABASE_ANON_KEY || "",
  
  // Helpers
  isDev: process.env.NODE_ENV !== "production",
  isProd: process.env.NODE_ENV === "production"
}
