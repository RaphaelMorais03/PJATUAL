# Portal Amor Saúde Pirituba

Portal interno com login (Firebase Auth) e 4 módulos sincronizados em tempo real via Firestore.

## Módulos disponíveis

| Módulo | Arquivo | O que faz |
|---|---|---|
| **Login** | `index.html` | Autenticação Firebase Auth (email/senha) |
| **Portal** | `portal.html` | Hub central com cards dos sistemas |
| **Cronograma** | `cronograma.html` | Agenda do dia, editor semanal e checklist de abertura |
| **Exames** | `exames.html` | Cadastro e retirada de exames em tempo real |
| **Fechamento** | `fechamento.html` | Repasses médicos com cálculo automático de impostos PJ |
| **Financeiro** | `financeiro.html` | Recibos de colaboradores (vale-transporte, bonificação, etc) |

## Estrutura de pastas

```
portal/
├── index.html
├── portal.html
├── cronograma.html
├── exames.html
├── fechamento.html
├── financeiro.html
├── README.md
├── css/
│   └── styles.css           ← design system compartilhado
├── js/
│   ├── firebase-config.js   ← credenciais (você preenche)
│   └── auth-guard.js        ← proteção de rotas + logout
└── assets/
    └── favicon.png          ← (opcional) seu logo
```

---

## Setup do Firebase

### 1. Criar projeto
1. Acesse https://console.firebase.google.com
2. Clique em **Adicionar projeto** e siga as instruções
3. Em **Configurações do projeto > Seus apps**, registre um app **Web** (ícone `</>`)
4. Copie as credenciais e cole em `js/firebase-config.js`

### 2. Ativar Authentication
1. **Build > Authentication > Sair do início**
2. Aba **Sign-in method** → habilite **E-mail/senha**
3. Aba **Users** → **Adicionar usuário** e crie as contas dos operadores

> Não há cadastro público no portal. Apenas o admin cria usuários direto no console.

### 3. Ativar Cloud Firestore
1. **Build > Firestore Database > Criar banco de dados**
2. Modo **produção** → escolha região `southamerica-east1` (São Paulo)
3. Aba **Regras** → cole as regras da próxima seção e publique

### 4. Regras de segurança do Firestore

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAuth() {
      return request.auth != null;
    }

    // ===== EXAMES =====
    // Cadastro livre, retirada controlada, deleção bloqueada (preserva histórico)
    match /exames/{examId} {
      allow read: if isAuth();
      allow create: if isAuth()
        && request.resource.data.createdByUid == request.auth.uid
        && request.resource.data.status == 'pendente';
      allow update: if isAuth()
        && resource.data.status == 'pendente'
        && request.resource.data.status == 'retirado'
        && request.resource.data.retrievedByUid == request.auth.uid;
      allow delete: if false;
    }

    // ===== CRONOGRAMA — semanal compartilhado =====
    // Documento único 'agenda' com a escala da semana toda
    match /cronograma/{docId} {
      allow read, write: if isAuth();
    }

    // ===== CRONOGRAMA — setup das salas (estado por dia) =====
    // 1 doc por dia: { rooms: { sala: bool } }
    match /cronograma_setup/{dateId} {
      allow read, write: if isAuth();
    }

    // ===== CRONOGRAMA — checklist abertura (estado por dia) =====
    // 1 doc por dia: { items: { id: bool } }
    match /cronograma_checklist/{dateId} {
      allow read, write: if isAuth();
    }

    // ===== FECHAMENTOS =====
    // Histórico de repasses — não pode editar nem apagar
    match /fechamentos/{fechId} {
      allow read: if isAuth();
      allow create: if isAuth()
        && request.resource.data.createdByUid == request.auth.uid;
      allow update, delete: if false;
    }

    // ===== FINANCEIRO — lançamentos =====
    // Histórico de recibos gerados — não pode editar nem apagar
    match /financeiro_lancamentos/{lancId} {
      allow read: if isAuth();
      allow create: if isAuth()
        && request.resource.data.createdByUid == request.auth.uid;
      allow update, delete: if false;
    }

    // ===== FINANCEIRO — colaboradores extras =====
    // Cadastrados via modal "Gerenciar"
    match /financeiro_colabs_extras/{colabId} {
      allow read: if isAuth();
      allow create, update, delete: if isAuth();
    }

  }
}
```

### 5. Índices compostos necessários

Na primeira vez que abrir cada módulo, o Firestore vai dar erro com um **link direto** para criar o índice. Clique no link e aguarde 1-2 minutos. Ou crie manualmente em **Firestore > Índices**:

| Coleção | Campos |
|---|---|
| `exames` | `status` Asc + `createdAt` Desc |
| `exames` | `status` Asc + `retrievedAt` Desc |
| `fechamentos` | `createdAt` Desc |
| `financeiro_lancamentos` | `createdAt` Desc |

---

## Modelo de dados

### `exames`
```js
{
  patient, examType, phone, obs,
  status: 'pendente' | 'retirado',
  createdAt, createdBy, createdByUid,
  retrievedAt, retrievedBy, retrievedByUid
}
```

### `cronograma/agenda` (doc único)
```js
{
  Segunda: [{ sala, doc, role }, ...],
  Terça:   [...],
  Quarta:  [...],
  Quinta:  [...],
  Sexta:   [...],
  Sábado:  [...],
  updatedAt, updatedBy
}
```

### `cronograma_setup/{YYYY-MM-DD}`
```js
{
  rooms: { '01': true, '02': false, ... },
  updatedAt, updatedBy
}
```

### `cronograma_checklist/{YYYY-MM-DD}`
```js
{
  items: { impressao: true, ac_recep: false, ... },
  updatedAt, updatedBy
}
```

### `fechamentos`
```js
{
  profNome, profDoc, profRegime,
  formaPagamento, pagoHoje,
  items: [{ qtd, descricao, valorUnitario, total }],
  subtotal, pis, csll, cofins, irrf, totDescontos, liquido,
  createdAt, createdBy, createdByUid
}
```

### `financeiro_lancamentos`
```js
{
  categoria, valor, formaPag,
  dtInicio, dtFim,
  colaboradores: [{ nome, cpf }],
  totalColabs, valorTotal,
  createdAt, createdBy, createdByUid
}
```

### `financeiro_colabs_extras`
```js
{
  nome, cpf,
  createdAt, createdBy
}
```

---

## Como rodar localmente

⚠️ **Não abra os arquivos com `file://`** — os módulos ES e o Firebase exigem servidor HTTP. Na pasta `portal/`:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve

# PHP
php -S localhost:8000
```

Acesse `http://localhost:8000`.

---

## Como funciona o tempo real

Todos os módulos usam `onSnapshot()` do Firestore. Quando qualquer usuário faz uma alteração — retirar um exame, salvar o cronograma, marcar uma sala como configurada, completar o checklist — **todos os outros operadores veem a mudança instantaneamente**, sem precisar atualizar a página.

Isso funciona com vários operadores ao mesmo tempo, em qualquer dispositivo (desktop, tablet, celular).

---

## Ferramentas portadas dos sistemas antigos

**Cronograma**
- Abas Agenda do dia / Semana / Abertura
- Editor de salas com reordenação (↑/↓), adição e remoção
- Checklist de abertura com 6 itens persistido por dia
- Marcar sala como "configurada" no dia atual

**Fechamento**
- Base de 61 profissionais com busca debounced
- Cálculo automático de impostos PJ Lucro Presumido:
  - PIS 0,65%, CSLL 1%, COFINS 3%
  - IRRF 1,5% acima de R$ 666,67
  - Base mínima R$ 215,05
- Recibo A4 imprimível (idêntico ao layout original)
- Histórico em tempo real dos últimos fechamentos

**Financeiro**
- Base de 33 colaboradores fixos + cadastro de extras (CRUD via modal)
- Multi-seleção com busca e "selecionar todos"
- 5 categorias: Bonificação, Vale-Transporte, Salário, Adiantamento, Cesta Básica
- Geração em lote de recibos A4 (4 por página) com valor por extenso
- Histórico em tempo real dos últimos lançamentos

## Não portado (pode ser adicionado depois)

- Cronograma: gerador de agenda imprimível por médico, importador de PDF, parser de fechamento de caixa, notas, vales
- Fechamento: tema escuro

---

## Próximos passos sugeridos

1. Cadastrar os usuários no Firebase Auth
2. Testar os 4 módulos em sequência com dois navegadores abertos lado a lado para confirmar a sincronização em tempo real
3. Adicionar o `favicon.png` em `assets/` (opcional)
4. Quando precisar de novos módulos, seguir o padrão: `requireAuth()` no topo, reutilizar `css/styles.css` e a topbar, criar coleções próprias no Firestore e adicionar as regras correspondentes
