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

    // URLを文字列として構築
    let urlString: string;
    if (typeof input === "string") {
      urlString = input.startsWith("http") ? input : `${backendUrl}${input}`;
    } else {
      // Request オブジェクトの場合はURLを取得
      urlString = input.url;
    }

    // 本番環境でAPI Gateway用のAPIキーを追加
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_API_GATEWAY_KEY) {
      const urlObj = new URL(urlString);
      urlObj.searchParams.set('key', process.env.NEXT_PUBLIC_API_GATEWAY_KEY);
      urlString = urlObj.toString();
    }

    // 最終的なURLまたはRequestオブジェクトを決定
    const finalInput = typeof input === "string" ? urlString : new Request(urlString, input);

    return fetch(finalInput, {
      ...init,
      headers,
    });
  }
