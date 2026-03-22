const PLACEHOLDER_VALUES = [
  "https://placeholder.supabase.co",
  "placeholder",
  "https://your-project.supabase.co",
  "your-anon-key",
  "",
]

export function validateEnv() {
  // Skip validation during build phase — env vars are injected at runtime on Vercel
  if (process.env.NEXT_PHASE === "phase-production-build") return

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

  const errors: string[] = []

  if (!url || PLACEHOLDER_VALUES.includes(url)) {
    errors.push("NEXT_PUBLIC_SUPABASE_URL is missing or set to a placeholder value")
  }

  if (!key || PLACEHOLDER_VALUES.includes(key)) {
    errors.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or set to a placeholder value")
  }

  if (errors.length > 0) {
    console.warn(
      `Environment variable warning:\n${errors.map((e) => `  - ${e}`).join("\n")}\n\nApp will run with static data. See .env.example for required variables.`
    )
  }
}
