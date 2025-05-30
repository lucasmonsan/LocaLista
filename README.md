# **Documento do Projeto - Mapa de Reviews de Aluguéis**

---

## **0. Pré-requisitos**

- [] Appwrite
- [] Node.js 18+
- [] Git
- [] Zed/VSCodium + Prettier
- [] Bun

## **1. Objetivo**

Desenvolver um web app onde usuários:

- Pesquisem reviews por **cidade**
- Visualizem um **pin único** no centro do município
- Filtrem reviews por **bairro ou rua** diretamente no modal
- Cadastre sua própria review

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
| UI        | Styled Components        | Controle total sobre estilos   |
| Fonte     | Manrope                  | Google Fonts                   |
| Deploy    | Surge.sh                 | Open-source sempre             |

---

## **4. Modelo de Dados**

reviews (TODOS OBRIGATÓRIOS)
| Campo | Tipo |
|--------------|----------|
| city | string |
| neighborhood | string |
| street | string |
| number | number |
| rating | number |
| comentary | string |
| userId | string |
| createdAt | DateTime |
| updatedAt | DateTime |

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
- - Setup do projeto React + TypeScript
- - Configuração do Appwrite Cloud (Database + Auth)
- - Telas de login/cadastro/recuperação com React Hook Form
- - Roteamento básico
- Dia 2
- - Integração do Leaflet (Mapa base + controles)
- - Lógica de centralização por cidade
- - Pin único com tooltip ao passar o mouse e evento de clique
- - Modal de reviews com busca interna
- Dia 3
- - Formulário de novo review com validação
- - Integração com API do Appwrite
- - Polimento UI e Responsividade mobile básica
- - Deploy (Surge.sh + Appwrite)

---
