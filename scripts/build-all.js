const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==============================================================================');
console.log('🚀 [BUILD PORTAL BRAGANÇA]: INICIANDO COMPILAÇÃO GERAL PARA RAILWAY');
console.log('==============================================================================\n');

try {
  const rootDir = path.resolve(__dirname, '..');
  const mobileDir = path.join(rootDir, 'mobile');
  const apiDir = path.join(rootDir, 'api');
  const mobileDist = path.join(mobileDir, 'dist');
  const apiPublic = path.join(apiDir, 'public');
  const apiDistPublic = path.join(apiDir, 'dist', 'public');

  // 1. Exportar aplicativo Mobile Web (Expo Web)
  console.log('1. Exportando o aplicativo Mobile Web (Expo Web)...');
  execSync('npm install --include=dev && npx expo export -p web', { cwd: mobileDir, stdio: 'inherit' });

  // 1.5 Exportar Painel Admin (Vite)
  const adminDir = path.join(rootDir, 'admin-web');
  const adminDist = path.join(adminDir, 'dist');
  console.log('\n1.5 Compilando o Painel Admin (Vite)...');
  execSync('npm install --include=dev && npm run build', { cwd: adminDir, stdio: 'inherit' });

  // 2. Compilar API TypeScript
  console.log('\n2. Compilando a API TypeScript backend...');
  execSync('npm install --include=dev && npm run build', { cwd: apiDir, stdio: 'inherit' });

  // 3. Copiar os arquivos web compilados para api/public e api/dist/public
  console.log('\n3. Integrando arquivos do aplicativo web na pasta pública da API...');
  
  // App Morador
  if (fs.existsSync(mobileDist)) {
    [apiPublic, apiDistPublic].forEach(dest => {
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
      fs.mkdirSync(dest, { recursive: true });
      fs.cpSync(mobileDist, dest, { recursive: true });
    });
    console.log('✅ Aplicativo Mobile Web copiado com sucesso!');
  } else {
    console.warn('⚠️ AVISO: Diretório mobile/dist não foi encontrado.');
  }

  // Painel Admin
  const apiAdminPublic = path.join(apiDir, 'public-admin');
  const apiDistAdminPublic = path.join(apiDir, 'dist', 'public-admin');
  if (fs.existsSync(adminDist)) {
    [apiAdminPublic, apiDistAdminPublic].forEach(dest => {
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
      fs.mkdirSync(dest, { recursive: true });
      fs.cpSync(adminDist, dest, { recursive: true });
    });
    console.log('✅ Painel Admin copiado com sucesso para public-admin!');
  } else {
    console.warn('⚠️ AVISO: Diretório admin-web/dist não foi encontrado.');
  }

  console.log('\n==============================================================================');
  console.log('✅ [BUILD PORTAL BRAGANÇA]: COMPILAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('==============================================================================');
} catch (err) {
  console.error('❌ Erro na compilação:', err.message);
  process.exit(1);
}
