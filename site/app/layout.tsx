import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Tom Trader',
    description: 'The little monkey that trades on Solana - AI-powered memecoin trading bot',
    keywords: ['solana', 'memecoin', 'trading', 'bot', 'ai', 'pump.fun', 'tom', 'monkey'],
    openGraph: {
        title: 'Tom Trader',
        description: 'The little monkey that trades on Solana',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tom Trader',
        description: 'The little monkey that trades on Solana',
    },
    icons: {
        icon: '/logo.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
