import NextAuth from 'next-auth';
console.log('[NEXT_AUTH_ROUTE] Importing authOption');
import authOption from '@/lib/auth-option';

const handler = NextAuth(authOption);

export { handler as GET, handler as POST };
