# GREENHERB - Sistema de Gestão de Estufa

Este é o repositório central do projeto GREENHERB, dividido entre **Frontend** (Interface do Utilizador) e **Backend** (Servidor API em Node.js).

---

## Estrutura do Projeto

- **/frontend**: Contém todos os ficheiros HTML, CSS e JavaScript (interface visual e lógicas de cliente).
- **/backend**: Contém o servidor Express, configurações e rotas da API.

---

## Como Preparar o Projeto (Para a Equipa)

Quando fizerem o *Pull* deste repositório para o vosso computador, o Frontend já está pronto a usar, mas o Backend precisa de uma pequena configuração inicial. 

Vão reparar que a pasta `node_modules` (onde ficam as bibliotecas do servidor) não está no GitHub. Isto é propositado para não sobrecarregar o repositório.

### Passo a passo para instalar o Backend:

**1. Instalar as dependências (`node_modules`)**
Em vez de enviarmos a pasta pesada, enviamos o ficheiro `package.json`, que funciona como uma "lista de compras" automática. Para descarregarem os ficheiros para o vosso PC, façam o seguinte:
- Abram o terminal no VS Code.
- Entrem na pasta do backend: `cd backend`
- Corram o comando:
  ```bash
  npm install