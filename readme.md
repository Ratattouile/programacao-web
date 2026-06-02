# GREENHERB - Sistema de Gestão de Estufa

Este é o repositório central do projeto GREENHERB, dividido entre o Frontend (Interface de Utilizador reativa com suporte offline-first) e o Backend (Servidor API em Node.js).

---

## Tecnologias

**Frontend:** HTML5, CSS3, JavaScript (com Web Storage API, IndexedDB, Cache API e Service Worker para suporte offline)
**Backend:** Node.js, Express
**Base de Dados:** MongoDB Atlas (Mongoose)
**Autenticação e Segurança:** JWT (JSON Web Tokens), bcrypt
**Documentação API:** OpenAPI 3.x (ficheiro api.yaml)
**Arquitetura de armazenamento no cliente:** documentada em ARQUITETURA.md

---

## Estrutura do Projeto

programacao-web/
├── frontend/
│   ├── views/          # Páginas HTML (login, home, lotes, plantas, planos, tarefas, alertas, utilizadores, register)
│   ├── js/             # Lógica do frontend (incluindo db.js para sincronização IndexedDB e ambient.js)
│   └── css/            # Estilos (style.css)
├── backend/
│   └── src/
│       ├── controllers/    # Lógica de negócio (auth, lotes, plantas, planos, tarefas, medicoes, alertas)
│       ├── models/         # Modelos Mongoose (Utilizador, Lote, Planta, Plano, Tarefa, Medicao, Alerta, LogsAuditoria)
│       ├── routes/         # Rotas da API
│       ├── middleware/     # JWT (authMiddleware.js) e verificação de cargos (verificarCargo.js)
│       ├── utils/          # Utilitários globais (auditoria.js)
│       └── db.js           # Configuração de ligação ao MongoDB
└── api.yaml            # Especificação integral da API REST

---

## Funcionalidades Principais Implementadas

* **Arquitetura Offline-First:** O frontend utiliza IndexedDB (orquestrado em db.js) para armazenar em cache os dados das entidades e enfileirar operações pendentes quando não há rede na estufa, sincronizando automaticamente com o backend assim que a conectividade é restabelecida. Um Service Worker (sw.js) faz cache dos recursos estáticos via Cache API.
* **Atualização Otimista (Optimistic UI):** As ações realizadas offline (criar lote, planta, plano, tarefa; executar tarefa; resolver/ignorar alerta) refletem-se de imediato na interface, marcadas como "A sincronizar", sem esperar pela rede.
* **Motor de Regras e Automação:** A submissão de medições ambientais valida os limites estabelecidos no plano de cultivo associado ao lote. Em modo **Manual**, o sistema sugere a ação (alerta); em modo **Automático**, cria automaticamente a tarefa operacional correspondente. Dados incoerentes ou falhas de sensor geram alertas críticos.
* **Rastreabilidade e Auditoria:** Operações sensíveis (divisão de lotes, registo de perdas, autorizações, gestão de utilizadores) geram um registo na coleção LogsAuditoria, consultável pelo administrador.
* **Controlo de Acessos Dinâmico:** Middlewares no servidor garantem que perfis não autorizados recebem erro HTTP 403, e o frontend adapta a visualização do DOM mediante o cargo presente no token JWT local.

---

## Instalação e Configuração

### Pré-requisitos
* Node.js v18 ou superior
* Conta e Cluster configurado no MongoDB Atlas

### 1. Clonar o repositório
git clone https://github.com/Ratattouile/programacao-web.git
cd programacao-web

### 2. Instalar dependências (Backend)
cd backend
npm install

### 3. Configurar variáveis de ambiente
Crie um ficheiro chamado .env na pasta backend com o seguinte conteúdo:
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/greenherb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=sua_secret_key_super_segura

### 4. Iniciar o servidor
node src/index.js
O servidor ficará disponível em http://localhost:5000.

### 5. Abrir o frontend
Abra o ficheiro frontend/views/login.html diretamente no seu browser ou, em alternativa, utilize a extensão Live Preview do VS Code para evitar problemas de CORS locais.

---

## API - Endpoints Principais

Todas as rotas (com exceção de /api/auth/login e /api/auth/register) requerem a inclusão do seguinte cabeçalho:
Authorization: Bearer <token>

### Autenticação e Utilizadores
| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | /api/auth/register | Público | Registar conta |
| POST | /api/auth/login | Público | Iniciar sessão e obter JWT |
| GET | /api/auth/utilizadores | Administrador | Listar todos os utilizadores |
| POST | /api/auth/utilizadores | Administrador | Criar conta de staff |
| PATCH | /api/auth/utilizadores/:id/cargo | Administrador | Alterar cargo de um utilizador |
| DELETE | /api/auth/utilizadores/:id | Administrador | Eliminar utilizador |
| GET | /api/auth/utilizadores/logs | Administrador | Consultar registos de auditoria |

### Plantas (Ervas Aromáticas)
| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | /api/plantas | Todos | Listar catálogo de plantas |
| POST | /api/plantas | Responsável Técnico, Administrador | Registar nova espécie |
| POST | /api/plantas/importar | Responsável Técnico, Administrador | Importar plantas via ficheiro CSV |
| DELETE | /api/plantas/:id | Responsável Técnico, Administrador | Eliminar planta |

### Planos de Cultivo
| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | /api/planos | Todos | Listar planos de cultivo |
| POST | /api/planos | Responsável Técnico, Administrador | Criar novo plano |
| PATCH | /api/planos/:id/autorizar | Responsável Técnico, Administrador | Aprovar planos pontuais |

### Lotes de Cultivo
| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | /api/lotes | Todos | Listar lotes e respetivos estados |
| POST | /api/lotes | Responsável Técnico, Administrador | Criar novo lote |
| POST | /api/lotes/:id/dividir | Responsável Técnico, Administrador | Dividir lote em sublotes |
| POST | /api/lotes/:id/perdas | Técnico, Responsável Técnico, Admin | Registar mortalidade |
| GET | /api/lotes/exportar | Todos | Exportar relatório de lotes em CSV |

### Medições Ambientais
| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | /api/medicoes | Todos | Consultar histórico de medições |
| POST | /api/medicoes | Técnico, Responsável Técnico, Admin | Registar dados ambientais |

### Tarefas
| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | /api/tarefas | Todos | Listar tarefas pendentes/concluídas |
| POST | /api/tarefas | Responsável Técnico, Administrador | Agendar nova tarefa |
| PATCH | /api/tarefas/:id/executar | Técnico, Responsável Técnico, Admin | Marcar como executada no terreno |

### Alertas
| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| GET | /api/alertas | Todos | Listar anomalias detetadas |
| PATCH | /api/alertas/:id/resolver | Técnico, Responsável Técnico, Admin | Assinalar anomalia como mitigada |
| PATCH | /api/alertas/:id/ignorar | Técnico, Responsável Técnico, Admin | Descartar alerta com justificação |

---

## Perfis de Utilizador

| Cargo | Permissões Efetivas |
| --- | --- |
| Técnico | Executar tarefas operacionais, submeter medições ambientais, reportar perdas nos lotes, resolver ou justificar (ignorar) alertas do sistema. Suporte offline garantido para estas ações. |
| Responsável Técnico | Todas as permissões de Técnico + gerir catálogo de plantas, criar novos planos de cultivo, criar e ramificar lotes, bem como autorizar planos pontuais. |
| Administrador | Acesso total e irrestrito ao sistema + registo de contas de staff e gestão da secção de utilizadores e auditoria. |