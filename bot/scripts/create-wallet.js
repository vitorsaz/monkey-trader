import { Keypair } from '@solana/web3.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate new keypair
const keypair = Keypair.generate();

// Get the secret key as array
const secretKey = Array.from(keypair.secretKey);

// Get the public key (wallet address)
const publicKey = keypair.publicKey.toBase58();

console.log('='.repeat(60));
console.log('NEW SOLANA WALLET CREATED');
console.log('='.repeat(60));
console.log('');
console.log('PUBLIC KEY (Wallet Address):');
console.log(publicKey);
console.log('');
console.log('PRIVATE KEY (Keep this SECRET!):');
console.log(JSON.stringify(secretKey));
console.log('');
console.log('='.repeat(60));
console.log('IMPORTANT: Save the private key securely!');
console.log('Add SOLANA_PRIVATE_KEY to your .env file');
console.log('='.repeat(60));

// Save to a file for reference
const walletInfo = {
    publicKey,
    secretKey,
    createdAt: new Date().toISOString()
};

const walletPath = path.join(__dirname, '..', 'wallet.json');
fs.writeFileSync(walletPath, JSON.stringify(walletInfo, null, 2));
console.log('');
console.log(`Wallet saved to: ${walletPath}`);
console.log('DELETE THIS FILE AFTER COPYING THE KEYS!');
