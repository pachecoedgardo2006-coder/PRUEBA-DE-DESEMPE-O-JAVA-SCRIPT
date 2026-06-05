import { getSession } from '../utils/session.js';
import { navigateTo } from '../app.js';

export async function renderWelcome() {
    const container = document.getElementById('content');
    const session = getSession();

    container.innerHTML = `
        <div class="welcome-container">
            <h1>SPACE RESERVATION SYSTEM</h1>
            <p>WELCOME TO THE PLATAFORM FOR SUPPORT RESERVATIONS.</p>
            ${!session ? '<button id="btn-goto-login">Ir al Login</button>' : '<button id="btn-goto-dash">Go to your view</button>'}
        </div>
    `;

    if (!session) {
        document.getElementById('btn-goto-login').addEventListener('click', () => navigateTo('/login'));
    } else {
        document.getElementById('btn-goto-dash').addEventListener('click', () => {
            const path = session.role === 'admin' ? '/admin' : '/client';
            navigateTo(path);
        });
    }
}