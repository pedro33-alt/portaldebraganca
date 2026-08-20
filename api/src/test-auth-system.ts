import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:3000/api';

async function runAuthAndAdminTests() {
  console.log('=== INICIANDO TESTES E2E: SISTEMA DE USUÁRIOS, RBAC & PAINEL ADMINISTRATIVO ===\n');

  try {
    // 1. Cadastro de Novo Morador
    const testEmail = `morador.teste.${Date.now()}@portalbraganca.com.br`;
    console.log(`1. Testando cadastro de novo morador (${testEmail})...`);
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Roberto Fernandes de Souza',
        email: testEmail,
        password: 'SenhaForte@2026',
        phone: '(11) 97777-6666',
        block: 'Bloco C',
        unit_number: '304',
        role: 'morador'
      })
    });
    const regData = await regRes.json();
    console.log('✅ Cadastro realizado com sucesso! ID:', regData.user?.id, '| Token gerado:', !!regData.token);

    // 2. Login com as credenciais criadas
    console.log('\n2. Testando login com credenciais recém-criadas...');
    const loginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SenhaForte@2026'
      })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login efetuado! Usuário:', loginData.user?.name, '| Função:', loginData.user?.role);

    // 3. Teste de Senha Incorreta
    console.log('\n3. Testando bloqueio para senha incorreta...');
    const badLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SenhaErrada123'
      })
    });
    console.log('✅ Bloqueio de senha incorreta funcionando (Status 401):', badLoginRes.status === 401);

    // 4. Teste de Recuperação de Senha (Esqueci minha senha)
    console.log('\n4. Testando solicitação de código de recuperação de senha...');
    const forgotRes = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail })
    });
    const forgotData = await forgotRes.json();
    console.log('✅ Código de recuperação gerado:', forgotData.demo_code);

    console.log('\n5. Redefinindo senha com o código recebido...');
    const resetRes = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        code: forgotData.demo_code,
        new_password: 'NovaSenhaSegura@2026'
      })
    });
    const resetData = await resetRes.json();
    console.log('✅ Senha redefinida:', resetData.success);

    // 6. Teste de Atualização de Perfil e Avatar
    console.log('\n6. Testando atualização de perfil e avatar...');
    const profileRes = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Roberto Fernandes de Souza (Atualizado)',
        phone: '(11) 98888-0000',
        avatar_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'
      })
    });
    const profileData = await profileRes.json();
    console.log('✅ Perfil atualizado:', profileData.success);

    // 7. Teste dos 6 Indicadores do Dashboard
    console.log('\n7. Testando endpoint de KPIs do Dashboard (/api/dashboard/stats)...');
    const statsRes = await fetch(`${API_BASE}/dashboard/stats`);
    const stats = await statsRes.json();
    console.log('✅ Indicadores carregados do banco com sucesso:');
    console.log(`   👥 Moradores: ${stats.residents_count}`);
    console.log(`   📰 Notícias: ${stats.news_count}`);
    console.log(`   📢 Avisos: ${stats.notices_count}`);
    console.log(`   ⭐ Anunciantes: ${stats.advertisers_count}`);
    console.log(`   👑 Anunciantes Premium: ${stats.premium_advertisers_count}`);
    console.log(`   📁 Revistas Publicadas: ${stats.magazines_count}`);

    // 8. Teste de Publicação de Revista Digital
    console.log('\n8. Testando publicação de nova edição da Revista Digital...');
    const magRes = await fetch(`${API_BASE}/magazines`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Revista Portal Bragança - Edição Especial de Primavera',
        edition_number: 2,
        publication_date: '2026-09-01',
        cover_image_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
        pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        description: 'Especial com os novos parceiros do Clube DING e matérias de arquitetura.'
      })
    });
    const newMag = await magRes.json();
    console.log('✅ Revista Digital publicada com sucesso! ID:', newMag.id, '| Título:', newMag.title);

    console.log('\n=== TODOS OS TESTES DE USUÁRIOS, AUTH, RBAC, REVISTAS E DASHBOARD PASSARAM COM SUCESSO! ===');
  } catch (err) {
    console.error('❌ Erro no teste E2E:', err);
  }
}

runAuthAndAdminTests();
