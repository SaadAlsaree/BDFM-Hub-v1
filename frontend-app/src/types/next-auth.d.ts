import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    roles?: Role[];
    error?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      fullName?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    fullName?: string | null;
    accessToken?: string;
    roles?: Role[];
  }
}

export interface Role {
  id: string;
  name: string;
  value: string;
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    roles?: Role[];
    error?: string;
    accessTokenExpires?: number;
  }
}
