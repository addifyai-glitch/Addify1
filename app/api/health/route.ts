// Liveness check for Coolify's health check and uptime monitoring.
// Deliberately touches no database or third-party service: it answers
// "is this container serving requests", so a Supabase blip never triggers
// a rollback of a healthy deploy.
export async function GET() {
  return Response.json(
    { status: "ok", time: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
