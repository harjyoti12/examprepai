import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/providers/query-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const metadataBase =
  process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : new URL("http://localhost:3000");

export const metadata: Metadata = {
  metadataBase,

  title: {
    default: "ExamPrepAI — Turn Notes into Exam-Ready Answers",
    template: "%s | ExamPrepAI",
  },

  description:
    "Upload your class notes and let AI generate important questions, short answers, and revision notes instantly. Free to start.",

  applicationName: "ExamPrepAI",
  authors: [{ name: "ExamPrepAI Team" }],
  creator: "ExamPrepAI",
  publisher: "ExamPrepAI",
  generator: "Next.js",
  category: "Education",

  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },

  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: "/favicon.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/",
    },
  },

  openGraph: {
    title: "ExamPrepAI — AI-Powered Study Assistant",
    description:
      "Turn your notes into exam-ready answers in seconds. Free to use.",
    url: "/",
    siteName: "ExamPrepAI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ExamPrepAI — Turn Your Notes into Exam-Ready Answers",
        type: "image/png",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "ExamPrepAI — AI-Powered Study Assistant",
    description:
      "Turn your notes into exam-ready answers in seconds. Free to use.",
    images: ["/og-image.png"],
    // TODO: Add your Twitter @handle when available
    // site: "@examprepai",
    // creator: "@examprepai",
  },

  // TODO: Add verification codes when available
  // verification: {
  //   google: "your-google-verification-code",
  //   yandex: "your-yandex-verification-code",
  //   // microsoft: "your-bing-verification-code",
  // },
};

export const viewport: Viewport = {
  themeColor: "#5732DC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <JsonLd />
        <ClerkProvider
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  fontFamily:
                    '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
                  fontSize: "13px",
                  borderRadius: "12px",
                  border: "1px solid #EAECF0",
                  boxShadow: "0 4px 12px rgba(16,24,40,.08)",
                },
              }}
            />
          </QueryProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
