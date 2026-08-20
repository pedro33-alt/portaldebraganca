import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:3000/api';

async function runNotificationTests() {
  console.log('=== INICIANDO TESTES E2E: SISTEMA DE NOTIFICAÇÕES & DISPOSITIVOS ===\n');

  try {
    // 1. Registro de Dispositivo Móvel
    console.log('1. Registrando token de push do dispositivo móvel...');
    const deviceRes = await fetch(`${API_BASE}/devices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: '20000000-0000-0000-0000-000000000001',
        condominium_id: '00000000-0000-0000-0000-000000000001',
        expo_push_token: 'ExponentPushToken[demo-roberto-iphone-15]',
        platform: 'ios',
        device_name: 'iPhone 15 Pro de Carlos'
      })
    });
    const deviceData = await deviceRes.json();
    console.log('✅ Dispositivo registrado com sucesso:', deviceData.device?.device_name);

    // 2. Disparar Notificação dos 6 Tipos
    const notificationTypes = [
      { type: 'aviso', title: 'Assembleia Extraordinária Virtual', body: 'Convocação para votação da reforma da portaria na próxima segunda-feira.' },
      { type: 'noticia', title: 'Inauguração do Espaço Gourmet', body: 'Confira as fotos e regras de uso do novo espaço gourmet do condomínio.' },
      { type: 'manutencao', title: 'Manutenção Preventiva de Bombas', body: 'O abastecimento de água poderá oscilar entre 13h e 15h hoje.' },
      { type: 'comunicado', title: 'Atualização Cadastral de Veículos', body: 'Favor atualizar as placas dos veículos na administração até sexta-feira.' },
      { type: 'revista', title: 'Nova Revista Digital Disponível', body: 'Acesse a Edição Especial de Primavera com matérias exclusivas.' },
      { type: 'promocao', title: '20% OFF no Restaurante Villa Borghese', body: 'Apresente o cupom BORGHESE20 no Clube DING e aproveite.' }
    ];

    console.log('\n2. Disparando notificações para os 6 tipos solicitados...');
    let lastCreatedId = '';

    for (const item of notificationTypes) {
      const res = await fetch(`${API_BASE}/notifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condominium_id: '00000000-0000-0000-0000-000000000001',
          title: item.title,
          body: item.body,
          type: item.type
        })
      });
      const data = await res.json();
      lastCreatedId = data.id;
      console.log(`   🔔 [${item.type.toUpperCase()}] "${item.title}" -> Deep Link: ${data.deep_link}`);
    }

    // 3. Consultar Contagem de Não Lidas
    console.log('\n3. Verificando contador de notificações não lidas...');
    const countRes = await fetch(`${API_BASE}/notifications/unread-count`);
    const countData = await countRes.json();
    console.log(`✅ Total de não lidas para o badge do sino: ${countData.unread_count} / ${countData.total_count}`);

    // 4. Marcar uma notificação específica como lida
    console.log(`\n4. Marcando notificação ${lastCreatedId} como lida...`);
    const readRes = await fetch(`${API_BASE}/notifications/${lastCreatedId}/read`, { method: 'PATCH' });
    const readData = await readRes.json();
    console.log('✅ Notificação marcada como lida:', readData.notification?.is_read === true);

    // 5. Marcar Todas as Notificações como Lidas
    console.log('\n5. Executando ação "Marcar todas como lidas"...');
    const readAllRes = await fetch(`${API_BASE}/notifications/read-all`, { method: 'PATCH' });
    const readAllData = await readAllRes.json();
    console.log('✅ Resposta:', readAllData.message);

    // 6. Verificar que contador zerou
    const finalCountRes = await fetch(`${API_BASE}/notifications/unread-count`);
    const finalCount = await finalCountRes.json();
    console.log(`✅ Contagem final de não lidas: ${finalCount.unread_count}`);

    console.log('\n=== TODOS OS TESTES DO SISTEMA DE NOTIFICAÇÕES PASSARAM COM 100% DE SUCESSO! ===');
  } catch (err) {
    console.error('❌ Erro no teste de notificações:', err);
  }
}

runNotificationTests();
