const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('==============================================================================');
console.log('🚀 [BUILD PORTAL BRAGANÇA]: INICIANDO COMPILAÇÃO GERAL PARA RAILWAY');
console.log('==============================================================================\n');

try {
  // 1. Build do aplicativo Mobile Web (Expo Web)
  console.log('1. Exportando o aplicativo Mobile Web (Expo Web)...');
  execSync('cd mobile && npm install && npx expo export -p web', { stdio: 'inherit' });

  // 2. Build da API TypeScript
  console.log('\n2. Compilando a API TypeScript backend...');
  execSync('cd api && npm install && npm run build', { stdio: 'inherit' });

  // 3. Copiar os arquivos gerados do Expo Web para a pasta public da API
  console.log('\n3. Integrando arquivos do aplicativo web na pasta pública da API...');
  const mobileDist = path.join(__dirname, '../mobile/dist');
  const apiPublic = path.join(__dirname, '../api/public');

  if (fs.existsSync(mobileDist)) {
    if (fs.existsSync(apiPublic)) {
      fs.rmSync(apiPublic, { recursive: true, force: true });
    }
    fs.cpSync(mobileDist, apiPublic, { recursive: true });
    console.log('✅ Aplicativo Mobile Web integrado com sucesso em api/public!');
  } else {
    console.warn('⚠️ AVISO: Diretório mobile/dist não encontrado.');
  }

  console.log('\n==============================================================================');
  console.log('✅ [BUILD PORTAL BRAGANÇA]: COMPILAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('==============================================================================');
} catch (err) {
  console.error('❌ Erro na compilação:', err.message);
  process.exit(1);
}
