import dotenv from 'dotenv';
dotenv.config();

const API_BASE = process.env.API_URL || 'http://127.0.0.1:3000/api';

async function runResidentFlowTests() {
  console.log('==============================================================================');
  console.log('🧪 SUÍTE DE TESTES DE SEGURANÇA E FLUXO COMPLETO DE MORADORES');
  console.log('==============================================================================\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASSED: ${testName}`);
      if (detail) console.log(`   └─ ${detail}`);
      passedTests++;
    } else {
      console.error(`❌ FAILED: ${testName}`);
      if (detail) console.error(`   └─ ${detail}`);
      failedTests++;
    }
  }

  try {
    // --------------------------------------------------------------------------
    // TESTE 1: Login do Administrador
    // --------------------------------------------------------------------------
    console.log('\n--- TESTE 1: Login do Administrador (Síndico) ---');
    const adminLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'sindico@portalbraganca.com.br',
        password: '123456'
      })
    });
    const adminLoginData = await adminLoginRes.json();
    const adminToken = adminLoginData.token;

    assert(
      adminLoginRes.ok && adminLoginData.user?.role === 'sindico',
      'Login do Administrador',
      `Usuário: ${adminLoginData.user?.name} | Role: ${adminLoginData.user?.role}`
    );

    // --------------------------------------------------------------------------
    // TESTE 2: Login do Morador de Teste (Residencial Rosário de Fátima)
    // --------------------------------------------------------------------------
    console.log('\n--- TESTE 2: Login do Morador de Teste (Rosário de Fátima) ---');
    const testResidentLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'morador.teste@rosariofatima.com.br',
        password: '123456'
      })
    });
    const testResidentData = await testResidentLoginRes.json();
    const testResidentToken = testResidentData.token;

    assert(
      testResidentLoginRes.ok && testResidentData.user?.role === 'morador',
      'Login do Morador de Teste',
      `Usuário: ${testResidentData.user?.name} | Condomínio: ${testResidentData.user?.condominium_id}`
    );

    // --------------------------------------------------------------------------
    // TESTE 3: Cadastro de Novo Morador
    // --------------------------------------------------------------------------
    console.log('\n--- TESTE 3: Cadastro de Novo Morador ---');
    const newResidentEmail = `morador.novo.${Date.now()}@rosariofatima.com.br`;
    const regRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Fernanda Oliveira Teste',
        email: newResidentEmail,
        password: 'SenhaForte123',
        phone: '(11) 97766-5544',
        block: 'Bloco B',
        unit_number: '204',
        condominium_id: '00000000-0000-0000-0000-000000000002'
      })
    });
    const regData = await regRes.json();

    assert(
      regRes.status === 201 && regData.user?.role === 'morador',
      'Cadastro de Novo Morador',
      `Novo usuário ID: ${regData.user?.id} | E-mail: ${regData.user?.email}`
    );

    // --------------------------------------------------------------------------
    // TESTE 4: Login do Novo Morador Recém-cadastrado
    // --------------------------------------------------------------------------
    console.log('\n--- TESTE 4: Login do Novo Morador ---');
    const newResidentLoginRes = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newResidentEmail,
        password: 'SenhaForte123'
      })
    });
    const newResidentLoginData = await newResidentLoginRes.json();
    const newResidentToken = newResidentLoginData.token;

    assert(
      newResidentLoginRes.ok && newResidentLoginData.user?.role === 'morador',
      'Login do Novo Morador Recém-cadastrado',
      `Sucesso no login! E-mail: ${newResidentLoginData.user?.email}`
    );

    // --------------------------------------------------------------------------
    // TESTE 5: Tentativa de Criar Conta Enviando Role de Administrador (Spoofing)
    // --------------------------------------------------------------------------
    console.log('\n--- TESTE 5: Tentativa de Elevação de Role no Cadastro (Security Check) ---');
    const maliciousEmail = `hack.admin.${Date.now()}@teste.com`;
    const exploitRoleRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tentativa Invasor Admin',
        email: maliciousEmail,
        password: 'SenhaForte123',
        role: 'admin_ding', // Tentativa de injeção de role privilegiada
        unit_number: '999'
      })
    });
    const exploitRoleData = await exploitRoleRes.json();

    assert(
      exploitRoleData.user?.role === 'morador',
      'Impedir manipulação pública de Role',
      `Permissão atribuída pelo backend: "${exploitRoleData.user?.role}" (Esperado: morador)`
    );

    // --------------------------------------------------------------------------
    // TESTE 6: Tentativa de Alterar Condominium_ID (Scoping Check)
    // --------------------------------------------------------------------------
    console.log('\n--- TESTE 6: Proteção contra alteração arbitrária de condominium_id ---');
    const maliciousCondoEmail = `hack.condo.${Date.now()}@teste.com`;
    const exploitCondoRes = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tentativa Invasor Condo',
        email: maliciousCondoEmail,
        password: 'SenhaForte123',
        condominium_id: 'ffffffff-ffff-ffff-ffff-ffffffffffff', // ID arbitrário inválido
        unit_number: '888'
      })
    });
    const exploitCondoData = await exploitCondoRes.json();

    assert(
      exploitCondoData.user?.condominium_id === '00000000-0000-0000-0000-000000000001',
      'Sanitização e Scoping de condomínio',
      `Condomínio retornado: "${exploitCondoData.user?.condominium_id}"`
    );

    // --------------------------------------------------------------------------
    // TESTE 7: Tentativa de Acessar Rota Administrativa como Morador (RBAC Check)
    // --------------------------------------------------------------------------
    console.log('\n--- TESTE 7: Bloqueio de Acesso a Rota Administrativa para Morador ---');
    const adminEndpointRes = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newResidentToken}` // Token de morador comum
      },
      body: JSON.stringify({
        title: 'Aviso Falso de Morador Sem Permissão',
        content: 'Tentativa não autorizada',
        priority: 'urgente'
      })
    });

    assert(
      adminEndpointRes.status === 403,
      'Bloqueio RBAC em Endpoint Administrativo',
      `Status HTTP retornado: ${adminEndpointRes.status} (Esperado: 403 Forbidden)`
    );

    console.log('\n==============================================================================');
    console.log(`📊 RESULTADO FINAL: ${passedTests} TESTES PASSARAM | ${failedTests} FALHARAM`);
    console.log('==============================================================================');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('❌ Erro na execução dos testes:', err.message);
    process.exit(1);
  }
}

runResidentFlowTests();
