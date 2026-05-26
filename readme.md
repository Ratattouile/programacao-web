# GREENHERB - Sistema de Gestão de Estufa

Este é o repositório central do projeto GREENHERB, que se encontra dividido entre o **Frontend** (Interface de Utilizador) e o **Backend** (Servidor API em Node.js).

---

## Tecnologias

**Frontend:** HTML, CSS, JavaScript

**Backend:** Node.js, Express

**Base de Dados:** MongoDB Atlas (Mongoose)

**Autenticação:** JWT + bcrypt

---

## Estrutura do Projeto

```text
programacao-web/
├── frontend/
│   ├── views/          # Páginas HTML
│   ├── js/             # Lógica do frontend
│   └── css/            # Estilos
└── backend/
    └── src/
        ├── controllers/    # Lógica de negócio
        ├── models/         # Modelos Mongoose
        ├── routes/         # Rotas da API
        └── middleware/     # JWT e verificação de cargos

```

---

## Instalação e Configuração

### Pré-requisitos

* Node.js v18 ou superior
* Conta no MongoDB Atlas

### 1. Clonar o repositório

```bash
git clone https://github.com/Ratattouile/programacao-web.git
cd programacao-web

```

### 2. Instalar dependências (Backend)

```bash
cd backend
npm install

```

### 3. Configurar variáveis de ambiente

Cria um ficheiro chamado .env na pasta backend com o seguinte conteúdo:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/greenherb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=umasecretmuitoforte

```

### 4. Iniciar o servidor

```bash
node src/index.js

```

O servidor ficará disponível em http://localhost:5000.

### 5. Abrir o frontend

Abre o ficheiro frontend/views/login.html no teu browser ou, em alternativa, utiliza a extensão *Live Preview* do *VS Code*.

---

## API - Endpoints

Todas as rotas, com exceção de /api/auth, requerem o seguinte cabeçalho (header):
Authorization: Bearer 

### Autenticação

| Método | Rota | Descrição |
| --- | --- | --- |
| POST | /api/auth/register | Criar conta |
| POST | /api/auth/login | Iniciar sessão |

### Planos de Cultivo

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | /api/planos | Todos |
| POST | /api/planos | Responsável Técnico, Administrador |
| PATCH | /api/planos/:id/autorizar | Responsável Técnico, Administrador |

### Lotes de Cultivo

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | /api/lotes | Todos |
| POST | /api/lotes | Responsável Técnico, Administrador |
| POST | /api/lotes/:id/dividir | Responsável Técnico, Administrador |
| POST | /api/lotes/:id/perdas | Técnico, Responsável Técnico, Administrador |

### Tarefas

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | /api/tarefas | Todos |
| POST | /api/tarefas | Responsável Técnico, Administrador |
| PATCH | /api/tarefas/:id/executar | Técnico, Responsável Técnico, Administrador |

### Alertas

| Método | Rota | Acesso |
| --- | --- | --- |
| GET | /api/alertas | Todos |
| PATCH | /api/alertas/:id/resolver | Técnico, Responsável Técnico, Administrador |
| PATCH | /api/alertas/:id/ignorar | Técnico, Responsável Técnico, Administrador |

---

## Perfis de Utilizador

| Cargo | Permissões |
| --- | --- |
| **Técnico** | Executar tarefas, registar perdas, resolver/ignorar alertas |
| **Responsável Técnico** | Tudo do Técnico + criar planos/lotes, autorizar planos pontuais |
| **Administrador** | Acesso total + gerir utilizadores |