#!/usr/bin/env node
/**
 * Setup automatico do projeto
 * Uso: node scripts/setup.js
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║           SETUP AUTOMATICO - MONKEY TRADER                 ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

async function setup() {
    // 1. Verificar se .env existe
    if (!fs.existsSync('.env')) {
        console.log('[1/4] Criando .env a partir do .env.example...');

        if (fs.existsSync('.env.example')) {
            fs.copyFileSync('.env.example', '.env');
            console.log('      OK - .env criado!');
            console.log('      AVISO: Preencha as variaveis do Supabase no .env');
        } else {
            console.log('      ERRO - .env.example nao encontrado!');
            process.exit(1);
        }
    } else {
        console.log('[1/4] OK - .env ja existe');
    }

    // 2. Instalar dependencias
    console.log('');
    console.log('[2/4] Instalando dependencias...');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('      OK - Dependencias instaladas!');
    } catch (e) {
        console.log('      ERRO ao instalar dependencias');
        process.exit(1);
    }

    // 3. Criar pasta de logs
    console.log('');
    console.log('[3/4] Criando pasta de logs...');
    if (!fs.existsSync('./logs')) {
        fs.mkdirSync('./logs');
    }
    console.log('      OK - Pasta logs/ criada');

    // 4. Verificar variaveis obrigatorias
    console.log('');
    console.log('[4/4] Verificando variaveis de ambiente...');

    const envContent = fs.readFileSync('.env', 'utf-8');
    const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'BIRDEYE_API_KEY', 'HELIUS_API_KEY'];
    const missing = [];

    for (const varName of required) {
        const regex = new RegExp(`^${varName}=.+`, 'm');
        if (!regex.test(envContent)) {
            missing.push(varName);
        }
    }

    if (missing.length > 0) {
        console.log('      AVISO - Variaveis faltando no .env:');
        missing.forEach(v => console.log(`         - ${v}`));
        console.log('');
        console.log('      Preencha essas variaveis e rode novamente.');
    } else {
        console.log('      OK - Todas as variaveis configuradas!');
    }

    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Setup concluido! Proximos passos:');
    console.log('');
    console.log('1. Preencha as variaveis no .env (se ainda nao preencheu)');
    console.log('2. Execute: node scripts/test-connections.js');
    console.log('3. Se tudo OK, execute: npm start');
    console.log('═══════════════════════════════════════════════════════════════');
}

setup().catch(console.error);
