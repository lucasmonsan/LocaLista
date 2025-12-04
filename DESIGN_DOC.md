# Documento de Design Técnico - LocaLista

**Versão:** 1.0
**Status:** Em Desenvolvimento

## 1. Visão Geral da Arquitetura
O LocaLista segue uma arquitetura **Reactive UI over Map**. O mapa é a fonte primária de estado. A UI (Botões, Modais, Toasts) reage aos eventos do mapa e vice-versa, mediados por Stores globais.

### Fluxo de Dados
`Leaflet Map Events` ↔ `Svelte Stores` ↔ `UI Components` ↔ `Supabase`

## 2. Decisões Técnicas Chaves

### 2.1 Gerenciamento de Estado (Stores)
Optamos por separar as stores por domínio para evitar acoplamento:
- **`map.ts`**: Fonte da verdade para coordenadas (`mapView`), centro atual (`currentMapCenter`) e geometria (`highlightGeometry`). Nenhuma lógica de UI reside aqui.
- **`ui.ts`**: Controla o estado visual (Toasts, Modais, Loading).
- **`auth.ts`**: Gerencia a sessão do usuário.

### 2.2 Estratégia de Geocodificação Híbrida
Abordagem em camadas para precisão sem custos:
1.  **Busca Textual:** Via **Photon API** (rápida, tolerante a erros).
2.  **Geometria:** Via **Nominatim** (apenas para desenhar polígonos de ruas/bairros).
3.  **Reverse Geocoding:** Conversão lat/lon em endereço legível ao clicar.
    * *Conflict Mode:* Se o clique difere drasticamente da busca, a UI pede desambiguação.

### 2.3 Renderização de Marcadores
- **Wrapper:** `Map.svelte` atua como wrapper, sincronizando Stores com métodos imperativos do Leaflet (`flyTo`, `addLayer`).
- **Performance:** Uso de Strings SVG otimizadas (`mapStyles.ts`) passadas para `L.divIcon`, evitando peso de componentes Svelte no mapa.

### 2.4 Segurança e Tipagem
- **TypeScript Strict Mode:** Interfaces centrais (`AppLocation`, `Review`) em `src/lib/types/`.
- **Proteção de UI:** Componentes usam renderização condicional (`{#if}`) para evitar erros com dados nulos.

## 3. Modelo de Dados (Supabase)

### Tabela: `locais`
Tabela pivô para evitar duplicidade.
- `id` (int8, PK)
- `osm_id` (string, Unique) - Chave de idempotência.
- `lat`, `lon` (float8)
- `nome`, `cidade`, `bairro` (text)

### Tabela: `reviews`
Avaliações dos usuários.
- `id` (int8, PK)
- `local_id` (FK -> locais.id)
- `user_id` (uuid, FK -> auth.users)
- `rating` (int2)
- `tags` (array de text)

## 4. Melhorias Futuras
- **Virtualização:** Implementar scroll virtual no `ReviewsList`.
- **Cache:** Service Worker para chamadas de API (Photon).
- **Clusterização:** `Leaflet.markercluster` para alta densidade de pinos.

## 5. Estrutura de Diretórios
A organização do código prioriza a separação de responsabilidades (Domain-Driven):

```text
src/lib/
├── components/     # Componentes Visuais (.svelte)
│   ├── map/        # Wrapper do Leaflet e lógica de pinos
│   ├── reviews/    # BottomSheet, Forms e Listas de avaliação
│   ├── layout/     # Footer, Barra de Busca
│   └── ui/         # Componentes Genéricos (Toast, Splash, Blur)
├── icons/          # Ícones SVG como componentes Svelte
├── services/       # Lógica externa (Supabase Client, Geocoding Service)
├── stores/         # Estado Global separado por contexto (Auth, Map, UI)
├── styles/         # CSS Global e Variáveis
├── types/          # Interfaces TypeScript (AppLocation, Review)
└── utils/          # Funções puras (Formatadores, Estilos de Mapa)