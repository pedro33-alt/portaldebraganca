import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERRO: SUPABASE_URL ou Chave do Supabase não configurada no .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabase() {
  console.log("=== INICIANDO TESTES DE BANCO DE DADOS (CRUD) ===");
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("AVISO: Teste executado com ANON_KEY. Pode falhar devido às políticas de RLS.");
  } else {
    console.log("INFO: Teste executado com SERVICE_ROLE_KEY (RLS bypass ativado).");
  }

  try {
    // 1. READ: Buscar Condomínios
    console.log("\n1. Testando Leitura (READ) - Condomínios:");
    const { data: condos, error: readError } = await supabase
      .from('condominiums')
      .select('*');
    
    if (readError) throw readError;
    console.log(`Sucesso: ${condos?.length || 0} condomínio(s) encontrado(s).`);
    if (condos && condos.length > 0) {
      console.log(`- ${condos[0].name}`);
    }

    // Se estivermos usando ANON_KEY, as próximas operações de INSERT/UPDATE podem falhar por causa do RLS.
    // O ideal é testar apenas se tivermos a SERVICE ROLE KEY.

    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // 2. CREATE: Inserir uma categoria de teste
      console.log("\n2. Testando Criação (CREATE) - Categoria de Teste:");
      const { data: newCategory, error: createError } = await supabase
        .from('categories')
        .insert([{ name: 'Categoria Teste API', type: 'news' }])
        .select()
        .single();
      
      if (createError) throw createError;
      console.log(`Sucesso: Categoria criada com ID ${newCategory.id}`);

      // 3. UPDATE: Atualizar a categoria
      console.log("\n3. Testando Atualização (UPDATE) - Categoria de Teste:");
      const { data: updatedCategory, error: updateError } = await supabase
        .from('categories')
        .update({ name: 'Categoria Atualizada' })
        .eq('id', newCategory.id)
        .select()
        .single();
      
      if (updateError) throw updateError;
      console.log(`Sucesso: Categoria atualizada para '${updatedCategory.name}'`);

      // 4. DELETE: Excluir a categoria
      console.log("\n4. Testando Exclusão (DELETE) - Categoria de Teste:");
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', newCategory.id);
      
      if (deleteError) throw deleteError;
      console.log(`Sucesso: Categoria de teste excluída.`);
    }

    console.log("\n=== TODOS OS TESTES PASSARAM COM SUCESSO ===");
  } catch (error) {
    console.error("\n❌ ERRO DURANTE OS TESTES:");
    console.error(error);
  }
}

testDatabase();
