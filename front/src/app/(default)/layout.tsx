import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Providers } from "../providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AuthGuard from "@/components/auth/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function MinimalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        <Header />
        <Providers>
          <AuthGuard>
          {children}
          </AuthGuard>
        </Providers>
        <Footer />
      </div>
  );
}
