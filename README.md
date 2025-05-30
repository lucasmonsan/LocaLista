# **Documento do Projeto - LocaLista**

O LocaLista é um app simples para ajudar pessoas a encontrar imóveis com base em reviews de outros usuários. A ideia é permitir que o usuário busque por cidade, bairro ou endereço, veja avaliações detalhadas (rating e comentários) e localize os imóveis em um mapa. O foco é uma interface limpa, funcional e fácil de usar, com filtros úteis e informações confiáveis.

---

## **0. Pré-requisitos**

- [x] Appwrite
- [x] Node.js 18+
- [x] Git
- [x] Zed/VSCodium + Prettier
- [x] Bun

## **1. Funcionalidades**

Desenvolver um web app onde usuários:

- Pesquisem reviews por **cidade** _Implementado parcialmente: busca por `cityId` manual em `AuthTest.tsx`._
- Visualizem um **pin único** no centro do município _Implementado em `MapTest.tsx` para Divinópolis, com pin e tooltip._
- Filtrem reviews por **bairro ou rua** diretamente no modal
- Cadastre sua própria review _Implementado em `AuthTest.tsx`, com `cityId`, `neighborhoodId`, `street`, `number`, `rating` (0-10), `commentary`, e `userId`._
- Pesquisar cidades e bairros primeiro no Appwrite
- Se não encontrado cidade e bairro no Appwrite, pesquisar no Nominatim e adicionar no Appwrite

---

## **2. Fluxo Principal**

```mermaid
flowchart TD
  A[Página Inicial] --> B[Campo de busca: "Digite uma cidade"]
  B --> C[Mapa mostra pin no centro da cidade]
  C --> D[Clique no pin abre modal]
  D --> E[Campo de busca: "Filtrar por bairro/rua"]
  E --> F[Lista dinâmica de reviews]
```

---

## **3. Tecnologias**

| Categoria | Tecnologias Escolhidas   | Justificativa                  |
| --------- | ------------------------ | ------------------------------ |
| Frontend  | React + TypeScript + Bun | Tipagem estática + componentes |
| Mapas     | Leaflet + OpenStreetMap  | Open-source + leve             |
| Backend   | Appwrite Cloud           | Autenticação + DB pronto       |
| Busca     | Nominatim                | Busca de endereços             |
| UI        | Styled Components        | Controle total sobre estilos   |
| Fonte     | Manrope                  | Google Fonts                   |
| Deploy    | Surge.sh                 | Open-source sempre             |

---

## **4. Modelo de Dados**

reviews (TODOS OBRIGATÓRIOS)
| Campo | Tipo |
|----------------|--------|
| cityId | string |
| neighborhoodId | string |
| street | string |
| number | number |
| rating | number |
| commentary | string |
| userId | string |

cities (TODOS OBRIGATÓRIOS)
| Campo | Tipo |
|-------|--------|
| name | string U |
| lat | float |
| lon | float |

neighborhoods (TODOS OBRIGATÓRIOS)
| Campo | Tipo |
|------------|--------|
| name | string U |
| cityId | string |

---

## **5. Regras de Buscas**

- Passo 1: Busca por cidade → mostra pin no centro geográfico e centraliza a cidade no mapa
  map.setView([-20.1396, -44.8902], 14); // Exemplo: Centralizar mapa em Divinópolis
- Passo 2: No modal, filtrar no Appwrite assim:
  await databases.listDocuments(
  'reviews_db',
  'reviews_coll',
  [
  Query.equal('city', selectedCity),
  Query.or([
  Query.search('neighborhood', searchTerm),
  Query.search('street', searchTerm),
  Query.equal('number', parseInt(searchTerm))
  ])
  ]
  );

---

## **6. Checklist de Implementação**

- Dia 1
  - [x] Setup do projeto React + TypeScript
  - [x] Configuração do Appwrite Cloud (Database + Auth)
  - [x] Telas de login/cadastro/recuperação com React Hook Form
  - [ ] Roteamento básico
- Dia 2
  - [x] Integração do Leaflet (Mapa base + controles)
  - [x] Lógica de centralização por cidade
  - [x] Pin único com tooltip ao passar o mouse e evento de clique
  - [ ] Modal de reviews com busca interna
- Dia 3
  - [x] Formulário de novo review com validação
  - [x] Integração com API do Appwrite
  - [ ] Polimento UI e Responsividade mobile básica
  - [ ] Deploy (Surge.sh + Appwrite)

---

## **7. Progresso Atual**

- **Autenticação**: Implementada em `AuthTest.tsx`. Suporta cadastro, login, logout, restauração de sessão e criação de reviews com `userId`. Três reviews cadastradas (Divinópolis, Belo Horizonte, São Paulo, ratings 6, 10, 8).
- **Mapa**: `MapTest.tsx` exibe mapa Leaflet com pin centralizado em Divinópolis (`lat: -20.1396`, `lon: -44.8902`), com tooltip mostrando o nome.
- **Reviews**: Formulário em `AuthTest.tsx` permite criar reviews com `cityId` e `neighborhoodId` manuais, vinculadas ao `userId`. Rating ajustado para 0-10.
- **Próximos Passos**:
  - Adicionar modal de reviews ao clicar no pin, com busca por bairro/rua.
  - Implementar lista de reviews com filtros.
  - Configurar busca por cidade/bairro com Nominatim.
  - Adicionar roteamento básico.
  - Iniciar estilização com Styled Components e Manrope.
