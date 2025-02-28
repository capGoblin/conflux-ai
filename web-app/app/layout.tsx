import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SecretjsContextProvider } from "../components/secretJs/SecretjsContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Conflux AI - Collaborative AI Trading",
  description: "Collaborative AI Trading, Privately Secured",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SecretjsContextProvider>{children}</SecretjsContextProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
