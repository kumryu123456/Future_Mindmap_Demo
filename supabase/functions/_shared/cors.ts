// 🔧 FIX: Environment-based CORS configuration for better security
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173', // Vite dev server
  'http://127.0.0.1:5173'
]

// Add production origins from environment variable
// 🔧 FIX: Trim origins and filter empty strings to avoid unwanted spaces
const productionOrigins = Deno.env.get('ALLOWED_ORIGINS')?.split(',').map(o => o.trim()).filter(Boolean) || []
const allAllowedOrigins = [...allowedOrigins, ...productionOrigins]

export function getCorsHeaders(origin?: string): Record<string, string> {
  // Check if origin is allowed
  const isAllowed = !origin || allAllowedOrigins.includes(origin) || 
    // Allow localhost and 127.0.0.1 with any port for development
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)

  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 
      'authorization, x-client-info, apikey, content-type, x-requested-with',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400', // 24 hours
    'Vary': 'Origin'
  }

  // 🔧 FIX: Only set credentials when origin is present to comply with CORS spec
  if (origin && isAllowed) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Access-Control-Allow-Credentials'] = 'true'
  } else if (isAllowed) {
    headers['Access-Control-Allow-Origin'] = '*'
    // Don't set credentials header when using '*' origin
  } else {
    headers['Access-Control-Allow-Origin'] = 'null'
  }

  return headers
}

// 🔧 FIX: Remove corsHeaders constant to prevent wildcard conflicts
// Use getCorsHeaders() function for consistent CORS handling
// For backward compatibility, provide a helper function:
export function getDefaultCorsHeaders(): Record<string, string> {
  return getCorsHeaders() // Returns appropriate headers based on no origin (wildcard)
}