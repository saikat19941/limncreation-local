const read = (key: string, fallback = "") => process.env[key] ?? fallback;

export const env = {
  appName: "limncreartion-local",
  appSessionSecret: read("APP_SESSION_SECRET", read("JWT_SECRET", "limncreation-local-session")),
  backendJwtSecret: read("BACKEND_JWT_SECRET"),
  backendUrl: read("NEXT_PUBLIC_API_URL", "http://localhost:5000"),
  dbDatabase: read("DB_DATABASE", "limncreation_local"),
  dbHost: read("DB_HOST", "localhost"),
  dbPassword: read("DB_PASSWORD", ""),
  dbPort: Number(read("DB_PORT", "3306")),
  dbUser: read("DB_USER", "root"),
  sessionCookieName: "limncreation_local_session",
} as const;

