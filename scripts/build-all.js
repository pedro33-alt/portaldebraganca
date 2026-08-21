const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==============================================================================');
console.log('🚀 [BUILD PORTAL BRAGANÇA]: INICIANDO COMPILAÇÃO GERAL PARA RAILWAY');
console.log('==============================================================================\n');

const rootDir = path.resolve(__dirname, '..');
const rootDist = path.join(rootDir, 'dist');
const apiDir = path.join(rootDir, 'api');
const adminDir = path.join(rootDir, 'admin-web');
const mobileDir = path.join(rootDir, 'mobile');

const apiDist = path.join(apiDir, 'dist');
const adminDist = path.join(adminDir, 'dist');
const mobileDist = path.join(mobileDir, 'dist');

// ------------------------------------------------------------------------------
// PASSO 1: COMPILAR A API BACKEND (MANDATÓRIO)
// ------------------------------------------------------------------------------
console.log('1. Compilando a API TypeScript backend (MANDATÓRIO)...');
try {
  execSync('npm install --include=dev && npm run build', { cwd: apiDir, stdio: 'inherit' });
  console.log('✅ API backend compilada com sucesso em api/dist!');
} catch (err) {
  console.error('❌ ERRO CRÍTICO NA COMPILAÇÃO DA API:', err.message);
  process.exit(1);
}

// ------------------------------------------------------------------------------
// PASSO 2: COMPILAR O PAINEL ADMIN (VITE)
// ------------------------------------------------------------------------------
console.log('\n2. Compilando o Painel Admin (Vite)...');
try {
  execSync('npm install --include=dev && npm run build', { cwd: adminDir, stdio: 'inherit' });
  console.log('✅ Painel Admin compilado com sucesso!');
} catch (err) {
  console.warn('⚠️ AVISO: Falha ao compilar Painel Admin (Vite):', err.message);
}

// ------------------------------------------------------------------------------
// PASSO 3: COMPILAR O APLICATIVO MOBILE WEB (EXPO WEB)
// ------------------------------------------------------------------------------
console.log('\n3. Exportando o aplicativo Mobile Web (Expo Web)...');
try {
  execSync('npm install --include=dev && npx expo export -p web', { cwd: mobileDir, stdio: 'inherit' });
  console.log('✅ Aplicativo Mobile Web exportado com sucesso!');
} catch (err) {
  console.warn('⚠️ AVISO: Falha ao exportar aplicativo Mobile Web:', err.message);
}

// ------------------------------------------------------------------------------
// PASSO 4: ESPELHAR BUILD NA RAIZ (REQUISITO FUNDAMENTAL DO NIXPACKS / RAILWAY)
// ------------------------------------------------------------------------------
console.log('\n4. Espelhando estrutura de build na raiz (/dist, /public, /public-admin)...');

// Espelhar api/dist para /app/dist e /app/api/dist
if (fs.existsSync(apiDist)) {
  const distTargets = [rootDist, apiDist];
  distTargets.forEach(target => {
    if (target !== apiDist) {
      if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
      fs.mkdirSync(target, { recursive: true });
      fs.cpSync(apiDist, target, { recursive: true });
    }
  });
  console.log('✅ Pasta dist espelhada na raiz (/dist e /api/dist)!');
}

// Espelhar Painel Admin para /app/public-admin e /app/api/public-admin
if (fs.existsSync(adminDist)) {
  const adminTargets = [
    path.join(rootDir, 'public-admin'),
    path.join(apiDir, 'public-admin'),
    path.join(rootDist, 'public-admin'),
    path.join(apiDist, 'public-admin')
  ];
  adminTargets.forEach(target => {
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(target, { recursive: true });
    fs.cpSync(adminDist, target, { recursive: true });
  });
  console.log('✅ Painel Admin integrado em todas as pastas public-admin!');
}

// Espelhar App Morador para /app/public e /app/api/public
if (fs.existsSync(mobileDist)) {
  const mobileTargets = [
    path.join(rootDir, 'public'),
    path.join(apiDir, 'public'),
    path.join(rootDist, 'public'),
    path.join(apiDist, 'public')
  ];
  mobileTargets.forEach(target => {
    if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
    fs.mkdirSync(target, { recursive: true });
    fs.cpSync(mobileDist, target, { recursive: true });
  });
  console.log('✅ Aplicativo Mobile Web integrado em todas as pastas public!');
}

// Verificação Final
const rootIndex = path.join(rootDist, 'index.js');
const apiIndex = path.join(apiDist, 'index.js');

if (fs.existsSync(rootIndex) && fs.existsSync(apiIndex)) {
  console.log('\n📁 Verificação do build da API: OK (index.js presente em dist/index.js e api/dist/index.js)');
} else {
  console.error('\n❌ ERRO CRÍTICO: index.js não foi encontrado após o espelhamento!');
  process.exit(1);
}

console.log('\n==============================================================================');
console.log('✅ [BUILD PORTAL BRAGANÇA]: COMPILAÇÃO GERAL CONCLUÍDA!');
console.log('==============================================================================');
