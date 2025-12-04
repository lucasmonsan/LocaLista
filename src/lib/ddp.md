📍 LocaLista - Documentação Mestra do Projeto
1. Visão Geral

O LocaLista é uma aplicação web Map-First (focada no mapa) que atua como um agregador de avaliações de imóveis e locais de aluguel. O objetivo é permitir que inquilinos compartilhem experiências (barulho, segurança, infraestrutura) sobre locais específicos, criando um "Glassdoor para Imóveis".

    Escopo Inicial: Brasil (MVP).

    Plataforma: Web App (PWA) com foco total em Mobile-First.

    Privacidade: Leitura pública; Escrita exige autenticação; Reviews anônimas para o público.

2. Stack Tecnológica & Arquitetura
Frontend

    Framework: SvelteKit (Svelte 5 syntax).

    Linguagem: TypeScript.

    Estilização: CSS Vanilla com variáveis CSS (variables.css, pallete.css) e design system próprio.

    Mapa: Leaflet (Raster Tiles via OpenStreetMap). Escolhido pela compatibilidade universal (sem WebGL obrigatório) e leveza.

    Ícones: SVGs inline ou componentes Svelte.

Backend & Dados

    BaaS (Backend as a Service): Supabase Cloud (Plano Free).

    Banco de Dados: PostgreSQL.

    Motor Geoespacial: PostGIS (Extensão ativada). Responsável por buscar pontos dentro do retângulo visível da tela (viewport) com alta performance.

    Autenticação: Supabase Auth (Email/Senha).

Serviços Externos

    Geocoding (Busca & Reverso): Photon API (baseada em OpenStreetMap).

        Vantagem: Gratuita, open source, sem chaves de API complexas.

        Limitação: Numeração de casas imprecisa no Brasil (contornado via UX).

3. Design de Interface (UI/UX)
3.1. Tela Principal (Mapa)

    Comportamento: Ocupa 100% da tela (z-index: 0).

    Interação:

        Clique (Tap): Seleciona um local. Se for vazio, cria um "Pin Fantasma". Se for pin existente, seleciona-o.

        Arrastar: Move o mapa e carrega novos pins dinamicamente (moveend).

    Pins:

        🟠 Laranja: Local salvo com reviews (Existente).

        🔘 Cinza/Pontilhado: Rascunho de local (Pin Fantasma - Seleção Temporária).

        🔵 Azul: Localização atual do usuário (GPS).

3.2. Rodapé (Footer) "Sanduíche"

Substitui a barra de pesquisa flutuante e botões soltos. Fixo na parte inferior.

    Estado Normal: Input de Busca + Botões de Ação (Perfil, GPS).

    Estado Expandido (Busca): Input + Lista de Resultados + Botões (O footer cresce verticalmente).

    Comportamento: Desliza para baixo (some) quando um local é selecionado no mapa.

3.3. Painel de Detalhes (Bottom Sheet)

Painel deslizante que sobe do rodapé ao selecionar um local.

    Estado 1 - Local Novo: Mostra endereço estimado e botão "Criar Primeira Review".

    Estado 2 - Local Existente: Mostra nota média, resumo e botão "Ver Reviews".

    Estado 3 - Formulário: Expande para permitir a escrita da avaliação.

3.4. Inicialização (Splash Screen)

    Logo e Loader.

    Lógica Inteligente:

        Tenta obter GPS em paralelo ao carregamento de Tiles.

        Possui tempo mínimo de exibição (2s) para evitar "piscada".

        Se GPS falhar ou demorar, carrega a visão padrão (SP) e libera o uso.

        Trava de UX: Se a localização chegar depois que o mapa já abriu, o mapa não se move sozinho. O botão de GPS apenas indica disponibilidade.

4. Estrutura de Banco de Dados (Schema)
Tabela: locais

Normaliza os endereços para evitar duplicatas.
SQL

id          BIGINT (PK)
osm_id      TEXT (Unique - ID do OpenStreetMap para evitar duplicidade)
nome        TEXT
lat         FLOAT
lon         FLOAT
endereco    JSONB (Cache do Photon completo)
location    GEOGRAPHY(Point) (PostGIS - Gerado via Trigger)
created_at  TIMESTAMP

Tabela: reviews

As avaliações vinculadas aos locais.
SQL

id          BIGINT (PK)
user_id     UUID (FK -> auth.users)
local_id    BIGINT (FK -> locais)
rating      INT (1-5)
tags        TEXT[] (Array de strings: 'Barulhento', 'Seguro', etc.)
comentario  TEXT
created_at  TIMESTAMP

5. Roadmap de Implementação (Passo a Passo)
Etapa 1: Fundação (Infraestrutura) ✅

    [x] Configuração do SvelteKit + TypeScript.

    [x] Configuração do CSS Global (Variáveis, Paleta, Reset).

    [x] Integração do Leaflet (Mapa Raster).

    [x] Lógica de Splash Screen com Promise.all e Stores.

    [x] Configuração do Supabase (Tabelas + PostGIS + RLS Policies).

Etapa 2: Navegação e Busca ✅

    [x] Implementação da API Photon (Busca + Location Bias).

    [x] Componente Footer com lógica "Sanduíche" (Expansão).

    [x] Tratamento de UX na busca (Zero State, Deduplicação de resultados).

    [x] Geolocalização passiva (Botão GPS muda de estado se localização chegar tarde).

    [x] Componente Blur para foco na pesquisa.

Etapa 3: Interação com o Mapa ✅

    [x] Carregamento de Pins do Supabase baseado no Viewport (get_locais_in_view).

    [x] Lógica de "Pin Fantasma" (Draft) ao clicar no mapa.

    [x] Reverse Geocoding (Converter clique lat/lon em nome de rua).

    [x] Componente BottomSheet básico (apenas visualização de estado Novo/Existente).

Etapa 4: Criação de Conteúdo (O Foco Agora) 🚧

    [ ] Formulário de Review:

        Transformar a Bottom Sheet em um formulário quando clicar em "Avaliar".

        Componente de Estrelas (Input Rating).

        Componente de Tags (Chips selecionáveis hardcoded).

        Textarea para comentário.

    [ ] Integração de Escrita:

        Lógica de "Upsert Local": Ao enviar, verificar se o local já existe no banco. Se não, criar.

        Criar a review vinculada ao ID do local.

        Feedback otimista (UI atualiza antes do banco confirmar).

Etapa 5: Autenticação e Perfil 🔜

    [ ] Sistema de Login:

        Tela de Login/Cadastro (Email + Senha) via Supabase Auth.

        Proteção de rotas (apenas usuários logados podem postar).

    [ ] Painel do Usuário:

        Bottom Sheet de Perfil (Minhas Reviews, Sair).

        Edição/Exclusão de reviews próprias.

Etapa 6: Refinamento e Polimento 🔜

    [ ] Design dos Pins: Substituir círculos por ícones de "Gota" (SVG) com cores baseadas na nota média.

    [ ] Listagem de Reviews: Tela completa para ler todas as reviews de um local.

    [ ] Mobile Touch: Melhorar gestos da Bottom Sheet (arrastar para fechar).

6. Regras de Ouro do Projeto (Diretrizes)

    Map-First: O mapa é a interface principal. Listas e menus são secundários e devem cobrir o mapa o mínimo possível.

    Nunca bloquear a navegação: Se o GPS demorar, o usuário navega manualmente. Se a busca demorar, o usuário pode cancelar.

    Respeito aos Termos: Não usar dados do Google Maps. Usar OpenStreetMap/Photon e aceitar as limitações de numeração (corrigíveis via input manual do usuário).

    Supabase Centric: Usar o poder do PostGIS para geo-queries. Não misturar com outros BaaS (AppWrite) para evitar complexidade e perda de performance espacial.

    Clean Code: Lógica complexa vai para stores.ts ou utils, componentes cuidam da UI.