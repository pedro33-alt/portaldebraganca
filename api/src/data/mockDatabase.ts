export const mockDb = {
  condominium: {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Residencial Portal de Bragança',
    slug: 'portal-de-braganca',
    cnpj: '12.345.678/0001-90',
    address: 'Avenida Salvador Markovicz, 1251 - Lagos de Santa Helena',
    city: 'Bragança Paulista',
    state: 'SP',
    primary_color: '#0E3B2E',
    secondary_color: '#D4AF37',
    logo_url: 'https://yata.s3-object.locaweb.com.br/7ffa955f0926123efc96099986ef2fd836e7f10cad485d19b0b3ef7cdcddff91',
    phone: '(11) 4033-2358'
  },
  notices: [
    {
      id: 'n-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      title: 'Assembleia Geral Ordinária (AGO)',
      content: 'Convocamos todos os condôminos para a AGO na próxima quinta-feira às 19h30 na Casa Sede Histórica para prestação de contas e planejamento anual.',
      priority: 'urgente',
      is_pinned: true,
      author_name: 'Ana Oliveira (Síndica)',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    },
    {
      id: 'n-2',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      title: 'Manutenção e Limpeza no Entorno dos 4 Lagos',
      content: 'Informamos que na terça-feira a equipe de meio ambiente fará poda preventiva e manutenção das margens dos lagos preservados.',
      priority: 'normal',
      is_pinned: false,
      author_name: 'Administração Residencial',
      created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    },
    {
      id: 'n-3',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      title: 'Domingo de Convivência na Alameda Principal',
      content: 'Lembramos que aos domingos a via central fica liberada para pedestres, ciclistas e lazer das crianças com total segurança.',
      priority: 'normal',
      is_pinned: false,
      author_name: 'Ana Oliveira (Síndica)',
      created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
    }
  ],
  news: [
    {
      id: 'news-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      title: 'Casa Sede da Antiga Fazenda Santa Petronila',
      summary: 'Histórica sede preservada e revitalizada como centro de convivência comunitária dos moradores.',
      content: 'Criado nas terras da histórica Fazenda Santa Petronila, famosa pela produção de café, nosso residencial orgulha-se de manter a Casa Sede preservada com eventos, encontros e convivência.',
      cover_image_url: 'https://yata.s3-object.locaweb.com.br/9352aae294fc6baecb7ca73ffe02235a1603662f1414062d39979dd432c27d71',
      published_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      id: 'news-2',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      title: 'Preservação dos 4 Lagos e da Biodiversidade',
      summary: 'Cuidado permanente com a fauna e flora nas alamedas do Portal de Bragança.',
      content: 'Os 4 lagos do residencial recebem cuidado diário de biólogos e técnicos ambientais, garantindo refúgio para aves, peixes e a vegetação nativa da região.',
      cover_image_url: 'https://yata.s3-object.locaweb.com.br/11fcf3e2c9e9597676fec76f5ff707830600e27c80cabd421996f07a471f156a',
      published_at: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
    },
    {
      id: 'news-3',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      title: 'Domingo da Família e Integração Comunitária',
      summary: 'Ruas tranquilas e seguras para a convivência de adultos e crianças.',
      content: 'A convivência é nossa maior prioridade. O programa dominical de interdição da via principal segue como modelo de sucesso e integração para as famílias.',
      cover_image_url: 'https://yata.s3-object.locaweb.com.br/36ad4caac07d52d7888f785ded8283ee8be0b4fae6c6ca111c1430f1cb633729',
      published_at: new Date(Date.now() - 96 * 3600 * 1000).toISOString()
    }
  ],
  commonAreas: [
    {
      id: 'ca-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      name: 'Casa Sede Histórica (Espaço Convivência)',
      description: 'Centro de convivência na sede colonial da Fazenda Santa Petronila climatizado para eventos.',
      capacity: 80,
      rules: 'Horário limite: 22h. Preservação do patrimônio histórico.',
      fee_amount: 150.00,
      photo_urls: ['https://yata.s3-object.locaweb.com.br/9352aae294fc6baecb7ca73ffe02235a1603662f1414062d39979dd432c27d71']
    },
    {
      id: 'ca-2',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      name: 'Deck e Quiosque dos Lagos',
      description: 'Área externa à beira dos lagos com mesas, churrasqueira e vista panorâmica.',
      capacity: 30,
      rules: 'Permitido até 20h. Proibido pescar sem autorização.',
      fee_amount: 80.00,
      photo_urls: ['https://yata.s3-object.locaweb.com.br/11fcf3e2c9e9597676fec76f5ff707830600e27c80cabd421996f07a471f156a']
    },
    {
      id: 'ca-3',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      name: 'Quadra Poliesportiva e Beach Tennis',
      description: 'Quadras esportivas com iluminação noturna de LED.',
      capacity: 20,
      rules: 'Uso gratuito mediante agendamento prévio.',
      fee_amount: 0.00,
      photo_urls: ['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800']
    }
  ],
  reservations: [
    {
      id: 'res-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      common_area_id: 'ca-1',
      common_area_name: 'Casa Sede Histórica (Espaço Convivência)',
      user_id: '20000000-0000-0000-0000-000000000001',
      user_name: 'Carlos Silva (Morador)',
      unit_label: 'Alameda dos Lagos - Casa 101',
      date: '2026-08-25',
      start_time: '18:00',
      end_time: '22:00',
      status: 'aprovada',
      notes: 'Aniversário de família'
    }
  ],
  occurrences: [
    {
      id: 'oc-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      user_id: '20000000-0000-0000-0000-000000000001',
      user_name: 'Carlos Silva',
      unit_label: 'Alameda dos Lagos - Casa 101',
      title: 'Lâmpada do poste na Alameda Central',
      category: 'Manutenção',
      description: 'A iluminação em frente ao acesso do lago 2 está apagada.',
      status: 'em_andamento',
      photo_urls: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=600'],
      admin_response: 'Equipe de manutenção já agendou a troca da lâmpada de LED para hoje às 15h.',
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    }
  ],
  visitors: [
    {
      id: 'vis-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      resident_id: '20000000-0000-0000-0000-000000000001',
      unit_label: 'Alameda dos Lagos - Casa 101',
      name: 'Mariana Lima',
      document_id: '12.345.678-9',
      vehicle_plate: 'BRA2E19',
      expected_start: '2026-08-20T14:00:00Z',
      expected_end: '2026-08-20T22:00:00Z',
      status: 'autorizado',
      qr_code_token: 'QR-VIS-8812'
    }
  ],
  deliveries: [
    {
      id: 'del-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      unit_label: 'Alameda dos Lagos - Casa 101',
      recipient_name: 'Carlos Silva',
      tracking_code: 'BR123456789SP',
      company: 'Mercado Livre',
      status: 'recebido_portaria',
      received_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    }
  ],
  magazines: [
    {
      id: 'mag-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      title: 'Revista Portal Bragança - Edição Residencial Portal de Bragança',
      edition_number: 1,
      publication_date: 'Agosto 2026',
      cover_image_url: 'https://yata.s3-object.locaweb.com.br/9352aae294fc6baecb7ca73ffe02235a1603662f1414062d39979dd432c27d71',
      pdf_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      description: 'Guia de serviços, gastronomia e novidades exclusivas para os moradores do Residencial Portal de Bragança.'
    }
  ],
  documents: [
    {
      id: 'doc-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      category: 'Regulamentos',
      title: 'Estatuto e Regulamento Interno da Associação Residencial Portal de Bragança',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: '2.4 MB',
      created_at: '2026-08-01'
    },
    {
      id: 'doc-2',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      category: 'Atas',
      title: 'Ata da Assembleia Geral Extraordinária - Julho 2026',
      file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      file_size: '1.1 MB',
      created_at: '2026-07-28'
    }
  ],
  advertisers: [
    {
      id: 'adv-1',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      name: 'Bragança Gourmet & Wine',
      category: 'Gastronomia',
      plan: 'premium',
      logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
      phone: '(11) 4033-1234',
      whatsapp: '5511999887766',
      instagram: '@bragancagourmet',
      website_url: 'https://bragancagourmet.com.br',
      address: 'Av. Salvador Markowicz, 450 - Taboão, Bragança Paulista',
      offer: {
        title: '15% OFF no Jantar Completo + Taça de Vinho Cortesia',
        discount: '15% OFF',
        coupon_code: 'PORTAL15',
        banner_url: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800'
      }
    },
    {
      id: 'adv-2',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      name: 'Bella Casa Design & Reformas',
      category: 'Arquitetura e Decoração',
      plan: 'intermediario',
      logo_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300',
      phone: '(11) 4032-5678',
      whatsapp: '5511988776655',
      instagram: '@bellacasadesign',
      website_url: 'https://bellacasadesign.com.br',
      address: 'Rua Coronel Teófilo Leme, 820 - Centro, Bragança Paulista',
      offer: {
        title: 'Consultoria de Iluminação Gratuita + 10% OFF em Marcenaria',
        discount: '10% OFF',
        coupon_code: 'BELLA10',
        banner_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'
      }
    },
    {
      id: 'adv-3',
      condominium_id: '00000000-0000-0000-0000-000000000001',
      name: 'PetCare Bragança 24h',
      category: 'Veterinária e Pet Shop',
      plan: 'basico',
      logo_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300',
      phone: '(11) 4034-9988',
      whatsapp: '5511977665544',
      instagram: '@petcarebraganca',
      website_url: 'https://petcarebraganca.com.br',
      address: 'Av. Dom Pedro I, 1200 - Bragança Paulista'
    }
  ]
};
