# 📍 LocaLista

> Uma plataforma colaborativa de avaliação de imóveis e locais baseada em mapas abertos.

O **LocaLista** permite que usuários explorem, avaliem e compartilhem experiências sobre endereços específicos (ruído, segurança, vizinhança) de forma anônima e geolocalizada. Construído com a filosofia *Open Source* em mente, utilizando dados do OpenStreetMap.

---

## 🚀 Funcionalidades Principais

- **Mapa Interativo:** Navegação fluida com marcadores dinâmicos indicando a qualidade dos locais.
- **Geocodificação Reversa:** Clique em qualquer lugar do mapa para identificar o endereço (via Photon API).
- **Sistema de Reviews:** Avaliação por estrelas, tags (ex: "Silencioso", "Perigoso") e comentários.
- **Modo Conflito Inteligente:** Resolve discrepâncias entre onde o usuário clicou e o endereço oficial da busca.
- **Autenticação:** Login via E-mail ou Google (Supabase Auth).
- **Perfil do Usuário:** Gerenciamento de avaliações próprias.
- **Responsividade:** Interface otimizada para Desktop e Mobile (PWA friendly).

## 🛠️ Tech Stack

- **Runtime:** Bun
- **Frontend:** SvelteKit + TypeScript
- **Mapas:** Leaflet + OpenStreetMap
- **Backend & Auth:** Supabase
- **Geocoding:** Photon API & Nominatim
- **Estilização:** CSS Puro (Variáveis CSS e Scoped Styles)

## 📦 Instalação e Uso

### Pré-requisitos
- Bun instalado
- Conta no Supabase (para backend)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/localista.git
cd localista
```

### 2. Instale as dependências
```bash
bun install
```

### 3. Configuração de Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com suas credenciais do Supabase:

```
PUBLIC_SUPABASE_URL=https://sua-url.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 4. Execute localmente
```bash
bun dev
```

Acesse http://localhost:5173.

---

## 🗄️ Estrutura do Banco de Dados (Supabase)

- **locais:** Armazena coordenadas e dados do endereço (único por OSM ID).
- **reviews:** Armazena avaliações vinculadas a um local_id e user_id.

---

## 🤝 Contribuição

1. Faça um Fork do projeto  
2. Crie sua Feature Branch (`git checkout -b feature/MinhaFeature`)  
3. Commit suas mudanças (`git commit -m 'Add: MinhaFeature'`)  
4. Push para a Branch (`git push origin feature/MinhaFeature`)  
5. Abra um Pull Request  

---

Desenvolvido com 💙 e Svelte.
