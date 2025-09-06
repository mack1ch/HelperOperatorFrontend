import axios, { AxiosInstance } from "axios";

const BASE_URL = "https://api.rltorg.ru/";

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

