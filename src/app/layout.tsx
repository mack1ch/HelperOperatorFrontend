import type { Metadata } from "next";
import "./globals.scss";
import localFont from "next/font/local";
import { AppLayout } from "@/shared/layouts/modalLayout/ui/ui";
import { Header } from "@/entities/messanger-slice/header-slice/header";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const RF_Dewi = localFont({
  src: [
    {
      path: "../../public/font/RFDewi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/font/RFDewi-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/font/RFDewi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "Helper",
  description: "Helper",
};

// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={RF_Dewi.className}>
        <AntdRegistry>
          <AppLayout>
            <div className="app">
              {" "}
              {/* ⬅️ новый контейнер */}
              <Header />
              <main className="main">{children}</main>
            </div>
          </AppLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
