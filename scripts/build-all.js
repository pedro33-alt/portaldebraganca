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

  // 2. Compilar API TypeScript
  console.log('\n2. Compilando a API TypeScript backend...');
  execSync('npm install --include=dev && npx tsc', { cwd: apiDir, stdio: 'inherit' });

  // 3. Copiar os arquivos web compilados para api/public e api/dist/public
  console.log('\n3. Integrando arquivos do aplicativo web na pasta pública da API...');
  if (fs.existsSync(mobileDist)) {
    [apiPublic, apiDistPublic].forEach(dest => {
      if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
      }
      fs.mkdirSync(dest, { recursive: true });
      fs.cpSync(mobileDist, dest, { recursive: true });
    });
    console.log('✅ Aplicativo Mobile Web copiado com sucesso para api/public e api/dist/public!');
  } else {
    console.warn('⚠️ AVISO: Diretório mobile/dist não foi encontrado.');
  }

  console.log('\n==============================================================================');
  console.log('✅ [BUILD PORTAL BRAGANÇA]: COMPILAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('==============================================================================');
} catch (err) {
  console.error('❌ Erro na compilação:', err.message);
  process.exit(1);
}
