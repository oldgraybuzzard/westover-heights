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