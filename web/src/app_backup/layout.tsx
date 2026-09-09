import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";

const kanit = Kanit({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-kanit",
});

export const metadata: Metadata = {
  title: "Smart CattleWeight AI",
  description: "AI-powered cattle weight estimation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${kanit.variable} font-sans antialiased bg-zinc-900 flex justify-center`}
      >
        {/* Mobile Device Simulation Container */}
        <div className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl relative mx-auto overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
