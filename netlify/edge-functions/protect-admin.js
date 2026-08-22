// Netlify Edge Function: HTTP Basic Authentication for /admin.html
// Runs at the edge server level before serving static files

export default async (request, context) => {
  const authHeader = request.headers.get("authorization");

  // Authorized Admin Credentials
  const USERNAME = "ameer";
  const PASSWORD = "2026";
  const EXPECTED_AUTH = `Basic ${btoa(`${USERNAME}:${PASSWORD}`)}`;

  // If header is missing or does not match credentials
  if (!authHeader || authHeader !== EXPECTED_AUTH) {
    return new Response("Unauthorized Access. Access to this Admin Studio is restricted.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Restricted Admin Panel"',
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  // Credentials are valid, proceed to serve admin.html
  return context.next();
};

export const config = {
  path: "/admin.html",
};
