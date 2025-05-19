import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next();
    
    // Create server-side Supabase client
    const supabase = createServerComponentClient({ 
      cookies: () => cookies() 
    });

    // Get session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error:', error);
      return handleNoSession(request);
    }

    const path = request.nextUrl.pathname;
    
    // Allow access to maintenance page
    if (path === '/maintenance') {
      return NextResponse.next();
    }
    
    const protectedPaths = ['/admin', '/forum/new'];

    if (protectedPaths.some(p => path.startsWith(p)) && !session) {
      return handleNoSession(request);
    }

    if (path.startsWith('/forum/new') && session) {
      // Check if user can post
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('can_post')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        return handleNoSession(request);
      }
    }

    // Handle password reset redirects
    if (path === '/' && request.nextUrl.searchParams.has('token')) {
      const token = request.nextUrl.searchParams.get('token');
      console.log('Redirecting token from homepage to reset-password page:', token);
      return NextResponse.redirect(new URL(`/reset-password?token=${token}`, request.url));
    }

    // Handle auth callback redirects
    if (path.startsWith('/auth/callback')) {
      console.log('Auth callback path detected in middleware');
      return NextResponse.next();
    }

    // Handle email verification links that might be malformed
    if (path === '/' && (
      request.nextUrl.searchParams.has('type') || 
      request.nextUrl.searchParams.has('code')
    )) {
      const type = request.nextUrl.searchParams.get('type');
      const code = request.nextUrl.searchParams.get('code');
      
      if (type === 'signup' || type === 'recovery' || code) {
        console.log('Redirecting auth params from homepage to callback page');
        const redirectUrl = new URL('/auth/callback', request.url);
        
        // Copy all query parameters without using iterator
        const params = request.nextUrl.searchParams;
        // Get all parameter names and copy them individually
        const paramKeys = Array.from(params.keys());
        paramKeys.forEach(key => {
          const value = params.get(key);
          if (value !== null) {
            redirectUrl.searchParams.set(key, value);
          }
        });
        
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Remove this problematic code block that uses verificationStatus
    // if (path.startsWith('/auth/callback') && verificationStatus === 'success') {
    //   return NextResponse.redirect(new URL('/login?verified=true', request.url));
    // }

    return res;
  } catch (e) {
    console.error('Middleware error:', e);
    return handleNoSession(request);
  }
}

function handleNoSession(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('returnTo', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/forum/new'],
}; 
