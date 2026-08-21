const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==============================================================================');
console.log('🚀 [BUILD PORTAL BRAGANÇA]: INICIANDO COMPILAÇÃO GERAL PARA RAILWAY');
console.log('==============================================================================\n');

const rootDir = path.resolve(__dirname, '..');
const apiDir = path.join(rootDir, 'api');
const adminDir = path.join(rootDir, 'admin-web');
const mobileDir = path.join(rootDir, 'mobile');

const apiDist = path.join(apiDir, 'dist');
const adminDist = path.join(adminDir, 'dist');
const mobileDist = path.join(mobileDir, 'dist');

const apiPublic = path.join(apiDir, 'public');
const apiDistPublic = path.join(apiDir, 'dist', 'public');
const apiAdminPublic = path.join(apiDir, 'dist', 'public-admin');

// ------------------------------------------------------------------------------
// PASSO 1: COMPILAR A API BACKEND (ESSENCIAL - CRÍTICO)
// ------------------------------------------------------------------------------
console.log('1. Compilando a API TypeScript backend (MANDATÓRIO)...');
try {
  execSync('npm install --include=dev && npm run build', { cwd: apiDir, stdio: 'inherit' });
  console.log('✅ API backend compilada com sucesso!');
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
// PASSO 4: INTEGRAR ARQUIVOS ESTÁTICOS
// ------------------------------------------------------------------------------
console.log('\n4. Integrando arquivos web na estrutura da API...');

// Copiar Painel Admin
if (fs.existsSync(adminDist)) {
  const adminDestinations = [
    path.join(apiDir, 'public-admin'),
    path.join(apiDir, 'dist', 'public-admin')
  ];
  adminDestinations.forEach(dest => {
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(adminDist, dest, { recursive: true });
  });
  console.log('✅ Painel Admin integrado com sucesso em public-admin!');
}

// Copiar App Morador Mobile
if (fs.existsSync(mobileDist)) {
  const mobileDestinations = [
    path.join(apiDir, 'public'),
    path.join(apiDir, 'dist', 'public')
  ];
  mobileDestinations.forEach(dest => {
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(dest, { recursive: true });
    fs.cpSync(mobileDist, dest, { recursive: true });
  });
  console.log('✅ Aplicativo Mobile Web integrado com sucesso em public!');
}

// Verificação Final
if (fs.existsSync(apiDist) && fs.existsSync(path.join(apiDist, 'index.js'))) {
  console.log('\n📁 Verificação do build da API: OK (index.js presente em api/dist)');
} else {
  console.error('\n❌ ERRO CRÍTICO: api/dist/index.js não existe após a compilação!');
  process.exit(1);
}

console.log('\n==============================================================================');
console.log('✅ [BUILD PORTAL BRAGANÇA]: COMPILAÇÃO GERAL CONCLUÍDA!');
console.log('==============================================================================');
