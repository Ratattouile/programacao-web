# Arquitetura de Armazenamento no Browser — GREENHERB

Este documento descreve a estratégia de armazenamento do lado do cliente (browser) da aplicação GREENHERB, conforme exigido nos requisitos técnicos.

---

## 1. Mecanismos utilizados

| Mecanismo | O que guarda | Porquê |
| --- | --- | --- |
| **sessionStorage** | Token JWT e dados do utilizador autenticado (`utilizadorAcesso`) | Dados de sessão que devem desaparecer ao fechar o separador. |
| **IndexedDB** (`greenherb-db`) | Cache de leitura das entidades (lotes, plantas, planos, medições, tarefas, alertas) e fila de operações pendentes (`pendingOps`) | Dados estruturados, consultáveis offline e suporte a funcionamento degradado. |
| **Cache API** (Service Worker) | Recursos estáticos (HTML, CSS, JS) e respostas GET selecionadas da API | Permitir que a aplicação carregue e funcione sem rede. |

---

## 2. Estrutura do IndexedDB

Base de dados `greenherb-db`, com os seguintes object stores:

- **Cache de leitura** (keyPath `_id`): `lotes`, `plantas`, `planos`, `medicoes`, `tarefas`, `alertas`
- **Fila de escrita offline** (keyPath `id`, autoIncrement): `pendingOps` — cada entrada guarda `{ url, method, body, timestamp }`

---

## 3. Política de expiração e invalidação

- **Cache de leitura:** estratégia *network-first*. Sempre que um pedido GET à API tem sucesso, o store correspondente é limpo (`clear()`) e regravado com os dados frescos. Garante que o cache reflete sempre o último estado conhecido do servidor.
- **Cache API (Service Worker):** o nome da cache é versionado (`greenherb`, `greenherb-api`). Ao mudar recursos estáticos, incrementa-se a versão, e no evento `activate` as caches antigas são eliminadas.
- **Fila `pendingOps`:** cada operação é removida individualmente assim que é sincronizada com sucesso (resposta HTTP OK).

---

## 4. Estratégia de sincronização com a API

1. Em condições normais (online), todas as operações vão diretamente à API.
2. Se um pedido de escrita (POST/PATCH/DELETE) falha por ausência de rede, a operação é guardada em `pendingOps` e a alteração é refletida imediatamente no cache local (*optimistic update*), aparecendo marcada como "A sincronizar".
3. A sincronização da fila ocorre:
   - no evento `window 'online'` (quando a ligação real é restabelecida);
   - no arranque de cada página, caso existam operações pendentes.
4. A função de sincronização tem uma *flag* de bloqueio (`_aSincronizar`) que impede execuções concorrentes, evitando o envio duplicado da mesma operação.

---

## 5. Comportamento em caso de falha de rede

- **Leitura:** a aplicação serve os dados do cache do IndexedDB e mostra um indicador visual "(Offline)".
- **Escrita (criar/alterar):** a operação é colocada em fila e a alteração aparece de imediato na interface (optimistic update), com indicação de estado pendente. É sincronizada automaticamente quando a rede volta.
- **Recursos estáticos:** servidos pelo Service Worker a partir da Cache API, permitindo navegar entre páginas sem rede.
- **Operações sensíveis** (gestão de utilizadores: criar, alterar cargo, eliminar) **não** são colocadas em fila offline — exigem sempre confirmação do servidor por motivos de segurança e integridade.

---

## 6. Decisão sobre armazenamento do token JWT

O token JWT é guardado em **sessionStorage** (e não em localStorage nem cookies).

**Justificação:**
- **vs localStorage:** o `sessionStorage` é limpo automaticamente ao fechar o separador, reduzindo a janela de exposição do token. O localStorage persiste indefinidamente, aumentando o risco caso o dispositivo seja partilhado ou comprometido.
- **vs cookies:** optou-se por não usar cookies de sessão para evitar a complexidade de proteção contra CSRF; como o token é enviado manualmente no cabeçalho `Authorization: Bearer`, não é submetido automaticamente em pedidos cross-site.
- **Risco residual (XSS):** qualquer armazenamento acessível por JavaScript é vulnerável a XSS. Mitiga-se com a expiração do token (8h) e a limpeza ao fechar o separador.
