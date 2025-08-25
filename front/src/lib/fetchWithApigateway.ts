import { getSession } from "next-auth/react";

export async function fetchWithApigateway(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  const session = await getSession();

  // Headers を作成
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  // NextAuth の accessToken があれば Authorization に追加
  if (session?.accessToken) {
    headers.set("Authorization", `Bearer ${session.accessToken}`);
  }

  // バックエンド URL は本番・開発で共通
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;

  // URL を文字列として構築
  let urlString: string;
  if (typeof input === "string") {
    urlString = input.startsWith("http") ? input : `${backendUrl}${input}`;
  } else {
    urlString = input.url;
  }

  // 本番環境のみ API Gateway 用のキーを URL に追加
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_API_GATEWAY_KEY) {
    const urlObj = new URL(urlString);
    urlObj.searchParams.set("key", process.env.NEXT_PUBLIC_API_GATEWAY_KEY);
    urlString = urlObj.toString();
  }

  // Request オブジェクトに変換
  const finalInput = typeof input === "string" ? urlString : new Request(urlString, input);

  return fetch(finalInput, {
    ...init,
    headers,
  });
}
