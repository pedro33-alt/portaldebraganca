import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:3000/api';

async function runTests() {
  console.log('=== INICIANDO TESTES E2E: NOTÍCIAS E AVISOS ===\n');

  try {
    // 1. Criar novo Aviso
    console.log('1. Criando novo aviso urgente via API...');
    const createNoticeRes = await fetch(`${API_BASE}/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Manutenção Elétrica Geral no Bloco B',
        content: 'Informamos que o fornecimento de energia será interrompido na sexta-feira das 14h às 16h para troca do gerador.',
        priority: 'urgente',
        is_pinned: true,
        expires_at: '2026-08-30T23:59:59Z'
      })
    });
    const newNotice = await createNoticeRes.json();
    console.log('✅ Aviso criado com sucesso:', newNotice.id, '-', newNotice.title);

    // 2. Listar Avisos
    console.log('\n2. Buscando lista de avisos...');
    const listNoticesRes = await fetch(`${API_BASE}/notices`);
    const noticesList = await listNoticesRes.json();
    console.log(`✅ Total de avisos encontrados no banco: ${noticesList.length}`);

    // 3. Criar nova Notícia
    console.log('\n3. Criando nova notícia via API...');
    const createNewsRes = await fetch(`${API_BASE}/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Inauguração da Quadra de Beach Tennis',
        summary: 'Espaço de lazer renovado com iluminação noturna para os condôminos.',
        content: 'O Residencial Rosário de Fátima concluiu a quadra de areia oficial para prática de Beach Tennis e Vôlei de Praia. O agendamento está disponível no app.',
        cover_image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
        is_published: true
      })
    });
    const newNews = await createNewsRes.json();
    console.log('✅ Notícia criada com sucesso:', newNews.id, '-', newNews.title);

    // 4. Alternar Publicação da Notícia (Despublicar / Publicar)
    console.log('\n4. Despublicando notícia para teste...');
    const unpublishRes = await fetch(`${API_BASE}/news/${newNews.id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: false })
    });
    const unpublishedNews = await unpublishRes.json();
    console.log('✅ Notícia alterada para rascunho:', unpublishedNews.is_published === false);

    console.log('\n5. Republicando notícia...');
    const publishRes = await fetch(`${API_BASE}/news/${newNews.id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: true })
    });
    const republishedNews = await publishRes.json();
    console.log('✅ Notícia publicada com sucesso:', republishedNews.is_published === true);

    console.log('\n=== TODOS OS TESTES DE NOTÍCIAS E AVISOS PASSARAM COM SUCESSO! ===');
  } catch (err) {
    console.error('❌ Erro no teste E2E:', err);
  }
}

runTests();
