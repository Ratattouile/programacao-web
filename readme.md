# GREENHERB - Sistema de Gestão de Estufa

Este é o repositório central do projeto GREENHERB, dividido entre **Frontend** (Interface do Utilizador) e **Backend** (Servidor API em Node.js).

---

## Tecnologias

**Frontend:** HTML, CSS, JavaScript  
**Backend:** Node.js, Express  
**Base de Dados:** MongoDB Atlas (Mongoose)  
**Autenticação:** JWT + bcrypt 

---

## Estrutura do Projeto

```
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
        └── middleware/     # JWT e verificação de cargo
```

---

## Instalação e Configuração

### Pré-requesitos
- Node.js v18+
- Conta no MongoDB Atlas

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
Cria o ficheiro  `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/greenherb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=umasecretmuitoforte
```

### 4. Iniciar o servidor
```bash
node src/index.js
```

O servidor fica disponivel em `http://localhost:5000`.

### 5. Abrir o frontend
Abre `frontend/views/login.html` no browser ou em alternativa usa o *Live Preview* do *VS Code*.

---

## API - Endpoints
Todas as rotas exceto `/api/auth` rquerem o header:
`Authorization: Bearer <token>`

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Iniciar sessão |

### Planos de Cultivo
| Método | Rota | Acesso |
|--------|------|-----------|
| GET | `/api/planos` | Todos |
| POST | `/api/planos` | 	Responsavel Tecnico, Administrador |
| PATCH | `/api/planos/:id/autorizar` | Responsavel Tecnico, Administrador |

### Lotes de Cultivo
| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/lotes` | Todos |
| POST | `/api/lotes` | Responsavel Tecnico, Administrador |
| POST | `/api/lotes/:id/dividir` | Responsavel Tecnico, Administrador |
| POST | `/api/lotes/:id/perdas` | Técnico, Responsavel Tecnico, Administrador |

### Tarefas
| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/tarefas` | Todos |
| POST | `/api/tarefas` | Responsavel Tecnico, Administrador |
| PATCH | `/api/tarefas/:id/executar` | Técnico, Responsavel Tecnico, Administrador |

### Alertas
| Método | Rota | Acesso |
|--------|------|--------|
| GET | `/api/alertas` | Todos |
| PATCH | `/api/alertas/:id/resolver` | Técnico, Responsavel Tecnico, Administrador |
| PATCH | `/api/alertas/:id/ignorar` | Técnico, Responsavel Tecnico, Administrador |

---

## Perfis de Utilizador

| Cargo | Permissões |
|-------|------------|
| **Técnico** | Executar tarefas, registar perdas, resolver/ignorar alertas |
| **Responsavel Tecnico** | Tudo do Técnico + criar planos/lotes, autorizar planos pontuais |
| **Administrador** | Acesso total + gerir utilizadores |
