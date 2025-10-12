export default function handler(req, res) {
  // This is a fallback API route for OAuth callback
  // In most cases, the client-side routing should handle this
  res.status(200).json({ 
    message: 'OAuth callback API route',
    redirect: '/auth/callback'
  });
}
