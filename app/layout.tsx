import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Header from "../components/header";
import SignerProvider from "../providers/context.provider";
import TheApolloProvider from "../providers/apollo.provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Sidox Nft Marketplace",
  description: "Buy,Sell and Transfer nft ownership across the world",
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
        <SignerProvider>
          <TheApolloProvider>
            <Header />
            {children}
          </TheApolloProvider>
        </SignerProvider>
      </body>
    </html>
  );
}
