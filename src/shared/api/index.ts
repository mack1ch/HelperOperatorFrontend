import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://api.rltorg.ru";

export const fetcher = (url: string) =>
  fetch(BASE_URL + url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  }).then((res) => res.json());

export const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  withCredentials: true,
});

// src/shared/api/fetcher.ts
export async function fetcherForCharts<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(BASE_URL + input, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
