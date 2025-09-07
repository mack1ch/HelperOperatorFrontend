"use client";

import { ConfigProvider, ThemeConfig, App as AntdApp } from "antd";
import ruRU from "antd/locale/ru_RU"; // ✅ локаль AntD
import dayjs from "dayjs";
import "dayjs/locale/ru"; // ✅ локаль dayjs
import { CSSProperties, ReactNode } from "react";
import styles from "./ui.module.scss";
import { CookiesProvider } from "react-cookie";
import { SWRConfig } from "swr";
import { instance } from "@/shared/api";
import "@ant-design/v5-patch-for-react-19";

// универсальный fetcher под SWR
async function swrFetcher(key: string | [string, Record<string, unknown>]) {
  if (Array.isArray(key)) {
    const [url, params] = key;
    const { data } = await instance.get(url, { params, withCredentials: true });
    return data;
  }
  const { data } = await instance.get(key, { withCredentials: true });
  return data;
}

// применяем локаль dayjs глобально
dayjs.locale("ru");

export const AppLayout = ({
  children,
  style,
}: Readonly<{ children: ReactNode; style?: CSSProperties }>) => {
  return (
    <CookiesProvider defaultSetOptions={{ path: "/" }}>
      <ConfigProvider theme={globalTheme} locale={ruRU}>
        <AntdApp>
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
        </AntdApp>
      </ConfigProvider>
    </CookiesProvider>
  );
};

export const globalTheme: ThemeConfig = {
  token: { colorPrimary: "#6CACE4" },
};
