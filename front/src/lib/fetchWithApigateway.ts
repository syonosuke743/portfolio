import { getSession } from "next-auth/react";

export async function fetchWithApigateway(
    input: RequestInfo,
    init: RequestInit = {}
  ): Promise<Response> {
    const session = await getSession();

    // 新しい Headers オブジェクトを作る
    const headers = new Headers(init.headers);

    headers.set("Content-Type", "application/json");

    if (session?.accessToken) {
      headers.set("Authorization", `Bearer ${session.accessToken}`);
    }

    const backendUrl =
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_BACKEND_URL_PROD
        : process.env.NEXT_PUBLIC_BACKEND_URL_DEV;

    const url =
      typeof input === "string" && !input.startsWith("http")
        ? `${backendUrl}${input}`
        : input;

    return fetch(url, {
      ...init,
      headers,
    });
  }

