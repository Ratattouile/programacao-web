document.addEventListener('DOMContentLoaded', async () => {
    const utilizadorAcesso = sessionStorage.getItem('utilizadorAcesso');
    if (!utilizadorAcesso) { window.location.href = '/frontend/views/login.html'; return; }

    const utilizador = JSON.parse(utilizadorAcesso);
    if (utilizador.cargo !== 'Administrador') {
        window.location.href = '/frontend/views/home.html';
        return;
    }

    document.getElementById('userDisplay').textContent = utilizador.nome;
    const initials = utilizador.nome.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
    document.getElementById('navAvatar').textContent = initials;
    document.getElementById('settingsBtn').style.display = 'inline-flex';

    document.getElementById('logoutBtn').addEventListener('click', () => {
        sessionStorage.removeItem('utilizadorAcesso');
        sessionStorage.removeItem('token');
        window.location.href = '/frontend/views/login.html';
    });

    await carregarUtilizadores();

    // Modal Novo Utilizador
    const modalNovo = document.getElementById('modalNovoUtilizador');
    document.getElementById('btnNovoUtilizador').addEventListener('click', () => modalNovo.style.display = 'flex');
    document.getElementById('btnCancelarNovoUtilizador').addEventListener('click', () => modalNovo.style.display = 'none');

    document.getElementById('formNovoUtilizador').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem('token');
        const body = {
            nome: document.getElementById('uNome').value.trim(),
            username: document.getElementById('uUsername').value.trim(),
            password: document.getElementById('uPassword').value,
            cargo: document.getElementById('uCargo').value
        };
        const res = await fetch('http://localhost:5000/api/auth/utilizadores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });
        const json = await res.json();
        if (!json.sucesso) { alert(json.erro); return; }
        modalNovo.style.display = 'none';
        e.target.reset();
        await carregarUtilizadores();
    });

    // Modal Editar Cargo
    const modalEditar = document.getElementById('modalEditarCargo');
    document.getElementById('btnCancelarEditarCargo').addEventListener('click', () => modalEditar.style.display = 'none');

    document.getElementById('formEditarCargo').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem('token');
        const id = document.getElementById('editCargoId').value;
        const cargo = document.getElementById('editCargo').value;
        const res = await fetch(`http://localhost:5000/api/auth/utilizadores/${id}/cargo`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ cargo })
        });
        const json = await res.json();
        if (!json.sucesso) { alert(json.erro); return; }
        modalEditar.style.display = 'none';
        await carregarUtilizadores();
    });

    // Modal Eliminar
    const modalEliminar = document.getElementById('modalEliminar');
    document.getElementById('btnCancelarEliminar').addEventListener('click', () => modalEliminar.style.display = 'none');
});

async function carregarUtilizadores() {
    const token = sessionStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/auth/utilizadores', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const { dados: utilizadores } = await res.json();
    //const json = await res.json();
    console.log(utilizadores);
    if (!utilizadores) return;

    animarContador(document.getElementById('statTotal'), utilizadores.length);
    animarContador(document.getElementById('statAdmins'), utilizadores.filter(u => u.cargo === 'Administrador').length);
    animarContador(document.getElementById('statTecnicos'), utilizadores.filter(u => u.cargo === 'Técnico').length);
    animarContador(document.getElementById('statResp'), utilizadores.filter(u => u.cargo === 'Responsavel Tecnico').length);
    animarContador(document.getElementById('contUtilizadores'), utilizadores.length);


    const tbody = document.getElementById('tabelaUtilizadores');
    tbody.innerHTML = '';
    utilizadores.forEach((u, index) => {
        const dataRegisto = new Date(u.dataRegisto).toLocaleDateString('pt-PT');
        const tr = document.createElement('tr');
        tr.style.animationDelay = `${250 + index * 100}ms`;
        tr.innerHTML = `
            <td>${u.nome}</td>
            <td class="lot-id">${u.username}</td>
            <td><span class="badge ${badgeClass(u.cargo)}">${u.cargo}</span></td>
            <td>${dataRegisto}</td>
            <td>
                <div class="actions-group">
                    <button class="btn-action green" onclick="abrirEditarCargo('${u._id}', '${u.nome}', '${u.cargo}')">Editar Cargo</button>
                    <button class="btn-action ghost" onclick="abrirEliminar('${u._id}', '${u.nome}')">Eliminar</button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function badgeClass(cargo) {
    if (cargo === 'Administrador') return 'active';
    if (cargo === 'Responsavel Tecnico') return 'warning';
    if (cargo === 'Técnico') return 'concluded';
    return '';
}

function abrirEditarCargo(id, nome, cargoAtual) {
    document.getElementById('editCargoId').value = id;
    document.getElementById('editCargoSubtitle').textContent = nome;
    document.getElementById('editCargo').value = cargoAtual;
    document.getElementById('modalEditarCargo').style.display = 'flex';
}

function abrirEliminar(id, nome) {
    document.getElementById('eliminarNome').textContent = nome;
    document.getElementById('modalEliminar').style.display = 'flex';

    document.getElementById('btnConfirmarEliminar').onclick = async () => {
        const token = sessionStorage.getItem('token');
        const res = await fetch(`http://localhost:5000/api/auth/utilizadores/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (!json.sucesso) { alert(json.erro); return; }
        document.getElementById('modalEliminar').style.display = 'none';
        await carregarUtilizadores();
    };
}
