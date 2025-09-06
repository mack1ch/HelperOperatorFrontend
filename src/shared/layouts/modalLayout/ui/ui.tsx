// shared/layouts/modalLayout/ui/ui.tsx  (твой AppLayout)
"use client";

import { ConfigProvider, ThemeConfig } from "antd";
import { CSSProperties, ReactNode } from "react";
import styles from "./ui.module.scss";
import { CookiesProvider } from "react-cookie";
import { SWRConfig } from "swr";
import { instance } from "@/shared/api";

// универсальный fetcher под SWR: поддерживает ключ-строку и ключ-массив [url, params]
async function swrFetcher(key: string | [string, Record<string, any>]) {
  if (Array.isArray(key)) {
    const [url, params] = key;
    const { data } = await instance.get(url, { params, withCredentials: true });
    return data;
  }
  const { data } = await instance.get(key, { withCredentials: true });
  return data;
}

export const AppLayout = ({
  children,
  style,
}: Readonly<{ children: ReactNode; style?: CSSProperties }>) => {
  return (
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <ConfigProvider theme={globalTheme}>
        <SWRConfig
          value={{
            fetcher: swrFetcher,
            revalidateOnFocus: false,
            dedupingInterval: 10_000,
            shouldRetryOnError: true,
            errorRetryCount: 2,
          }}
        >
          <div style={style} className={styles.page}>
            {children}
          </div>
        </SWRConfig>
      </ConfigProvider>
    </CookiesProvider>
  );
};

export const globalTheme: ThemeConfig = {
  token: { colorPrimary: "#6CACE4" },
};
