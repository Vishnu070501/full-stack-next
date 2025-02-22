import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
//jff
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tasks App For Edtech",
  description: "Use CRUD methods on your Tasks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
       <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
