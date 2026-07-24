import type { Metadata } from "next";
import "./globals.css";
import LenisProvider from "@/providers/LenisProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Preloader } from "@/components/ui/Preloader";
import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "AXRAY - The Flight Recorder for AI Coding Agents",
  description: "Record every decision, tool call, and trace. Bridge the gap between autonomous execution and human oversight.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className="bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary antialiased">
        <QueryProvider>
          <Preloader>
            <LenisProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </LenisProvider>
          </Preloader>
        </QueryProvider>
      </body>
    </html>
  );
}
