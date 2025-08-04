// src/types/next-auth.d.ts などを作成して以下を記述

import NextAuth, { DefaultSession} from "next-auth";

declare module "next-auth"{
  interface Session {
    accessToken?: string;
    user: {
      id:string;
      provider?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accessToken?: string;
    provider?: string;
  }
}

declare module "next-auth/jwt"{
  interface JWT{
    accessToken?: string;
    provider?: string;
  }
}


