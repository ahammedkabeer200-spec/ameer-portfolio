export const config = {
  matcher: '/admin.html',
};

export default function middleware(request) {
  const authorization = request.headers.get('authorization');
  if (authorization) {
    const authValue = authorization.split(' ')[1];
    const decoded = atob(authValue);
    const [user, pwd] = decoded.split(':');
    if (user === 'ameer' && pwd === '2026') {
      return;
    }
  }
  return new Response('Authentication Required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Admin Studio"' }
  });
}
