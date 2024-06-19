document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    fetch('./json/users.json')
        .then(response => response.json())
        .then(users => {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('management-section').style.display = 'block';
                loadMembers();
            } else {
                alert('Usuário ou senha incorretos!');
            }
        });
});

function loadMembers() {
    fetch('./json//members.json')
        .then(response => response.json())
        .then(members => {
            const memberList = document.getElementById('member-list');
            memberList.innerHTML = '';
            members.forEach((member, index) => {
                const li = document.createElement('li');
                li.innerHTML = `${member.name} - ${member.platforms.join(', ')} - R$${member.value.toFixed(2)} 
                                <button class="remove-btn" onclick="removeMember(${index})">Remover</button>`;
                memberList.appendChild(li);
            });
        });
}

document.getElementById('member-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('member-name').value;
    const platforms = Array.from(document.querySelectorAll('.platform-checkbox:checked')).map(checkbox => checkbox.value);
    const value = parseFloat(document.getElementById('member-value').value);

    fetch('members.json')
        .then(response => response.json())
        .then(members => {
            members.push({ name, platforms, value });
            return updateMembersOnGithub(members);
        })
        .then(() => {
            loadMembers();
            document.getElementById('member-form').reset();
        })
        .catch(error => console.error('Erro ao atualizar os membros:', error));
});

function removeMember(index) {
    fetch('members.json')
        .then(response => response.json())
        .then(members => {
            members.splice(index, 1);
            return updateMembersOnGithub(members);
        })
        .then(() => {
            loadMembers();
        })
        .catch(error => console.error('Erro ao remover o membro:', error));
}

function updateMembersOnGithub(members) {
    return fetch('https://api.github.com/repos/SEU_USUARIO/SEU_REPOSITORIO/contents/members.json', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer SEU_TOKEN_GITHUB'
        },
        body: JSON.stringify({
            message: 'Atualização dos membros',
            content: btoa(JSON.stringify(members)),
            sha: '' // SHA do commit anterior, deve ser obtido via GitHub API
        })
    })
    .then(response => response.json());
}
