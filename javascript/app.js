// Importando o Firebase SDK da nuvem
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// import "../html/index.html"
// import "../css/index.css"
// COLOQUE SUAS CREDENCIAIS REAIS DO FIREBASE AQUI:
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializando o Firebase e o Banco de Dados (Firestore)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- SINCRONIZAÇÃO DE ELEMENTOS HTML COM O JAVASCRIPT ---

// 1. Alternância de Abas (Interface)
const btnUserTab = document.getElementById('btnUserTab');
const btnAdminTab = document.getElementById('btnAdminTab');
const userPanel = document.getElementById('user-panel');
const adminPanel = document.getElementById('admin-panel');

btnUserTab.addEventListener('click', () => {
    btnUserTab.classList.add('active');
    btnAdminTab.classList.remove('active');
    userPanel.classList.add('active');
    adminPanel.classList.remove('active');
});

btnAdminTab.addEventListener('click', () => {
    btnAdminTab.classList.add('active');
    btnUserTab.classList.remove('active');
    adminPanel.classList.add('active');
    userPanel.classList.remove('active');
});

// 2. Envio de Cadastro do Usuário (Entrada de Dados)
const userForm = document.getElementById('userForm');
const userFeedback = document.getElementById('userFeedback');

userForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Evita recarregar a página

    // Capturando os valores dos inputs do HTML
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const msg = document.getElementById('userMsg').value;

    try {
        // Gravando na nuvem (Firestore)
        await addDoc(collection(db, "clientes"), {
            name: name,
            email: email,
            msg: msg,
            createdAt: serverTimestamp()
        });

        userFeedback.style.color = '#10b981';
        userFeedback.innerText = 'Cadastro realizado e sincronizado com sucesso!';
        userForm.reset(); // Limpa o formulário
    } catch (error) {
        console.error("Erro ao salvar no Firebase: ", error);
        userFeedback.style.color = '#ef4444';
        userFeedback.innerText = 'Erro ao enviar dados. Verifique a conexão.';
    }
});

// 3. Área do Administrador (Validação de Acesso e Saída de Dados)
const btnLoginAdmin = document.getElementById('btnLoginAdmin');
const adminPassInput = document.getElementById('adminPass');
const loginBox = document.getElementById('login-box');
const adminContent = document.getElementById('adminContent');
const clientList = document.getElementById('clientList');

btnLoginAdmin.addEventListener('click', async () => {
    const password = adminPassInput.value;

    // Senha simples de demonstração (em produção, usar Firebase Auth)
    if (password === 'admin123') {
        loginBox.style.display = 'none';
        adminContent.style.display = 'block';
        await carregarPacientesAdmin();
    } else {
        alert('Senha de administrador incorreta!');
    }
});

// Função para buscar e exibir os dados do banco na tela do Admin
export async function carregarPacientesAdmin() {
    clientList.innerHTML = 'Buscando dados na nuvem...';

    try {
        const querySnapshot = await getDocs(collection(db, "clientes"));

        if (querySnapshot.empty) {
            clientList.innerHTML = '<p>Nenhum paciente cadastrado até o momento.</p>';
            return;
        }

        clientList.innerHTML = ''; // Limpa a lista antes de preencher

        // Varre cada documento retornado do banco e injeta dinamicamente no HTML
        querySnapshot.forEach((doc) => {
            const cliente = doc.data();

            const divItem = document.createElement('div');
            divItem.className = 'client-item';
            divItem.innerHTML = `
                <strong>Nome:</strong> ${cliente.name} <br>
                <strong>E-mail:</strong> ${cliente.email} <br>
                <strong>Objetivo/Dúvida:</strong> ${cliente.msg}
            `;

            clientList.appendChild(divItem);
        });

    } catch (error) {
        console.error("Erro ao carregar dados do admin:", error);
        clientList.innerHTML = '<p style="color: red;">Erro ao carregar as informações do banco.</p>';
    }
}
