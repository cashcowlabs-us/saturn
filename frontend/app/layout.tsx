"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginProvider } from "./loginContext";

const inter = Inter({ subsets: ["latin"] });

const queryClient = new QueryClient()
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <QueryClientProvider client={queryClient}>
        <LoginProvider>
          <body className={inter.className}>{children}</body>
        </ LoginProvider>
      </QueryClientProvider>
    </html>
  );
}
