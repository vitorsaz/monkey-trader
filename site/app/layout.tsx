import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Tom Trader',
    description: 'O macaquinho que faz trade na Solana - AI-powered memecoin trading bot',
    keywords: ['solana', 'memecoin', 'trading', 'bot', 'ai', 'pump.fun', 'tom', 'monkey'],
    openGraph: {
        title: 'Tom Trader',
        description: 'O macaquinho que faz trade na Solana',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Tom Trader',
        description: 'O macaquinho que faz trade na Solana',
    },
    icons: {
        icon: '/logo.png',
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="pt-BR">
            <body>
                {children}
            </body>
        </html>
    );
}
