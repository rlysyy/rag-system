import type { Metadata } from "next";
import localFont from 'next/font/local';
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider"
import SessionProvider from "@/components/providers/session-provider"
import { Toaster } from "@/components/ui/toaster"

// 定义字体
const notoSans = localFont({
  src: '../public/fonts/NotoSans-Regular.ttf',
  display: 'swap',
  variable: '--font-noto-sans',
});

const notoSansSC = localFont({
  src: '../public/fonts/NotoSansSC-Regular.ttf',
  display: 'swap',
  variable: '--font-noto-sans-sc',
});

const notoSansJP = localFont({
  src: '../public/fonts/NotoSansJP-Regular.ttf',
  display: 'swap',
  variable: '--font-noto-sans-jp',
});

export const metadata: Metadata = {
  title: "OMR设备维修系统",
  description: "OMR设备维修系统",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoSans.variable} ${notoSansSC.variable} ${notoSansJP.variable}`}>
          <SessionProvider>
            <ThemeProvider 
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
              storageKey="theme"
            >
              {children}
            </ThemeProvider>
          </SessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
