import { reservationService } from '../services/reservationService.js';
import { renderReservationForm, setupFormSubmit } from '../components/reservationForm.js';
import { getSession } from '../utils/session.js';

export async function renderClient() {
    const container = document.getElementById('content');
    const session = getSession();

    container.innerHTML = `
        <h2>Panel de Reservas (Usuario: ${session.username})</h2>
        <div id="form-container"></div>
        <h3>Historial de mis Reservas</h3>
        <table border="1" style="width:100%; border-collapse: collapse; margin-top:10px;">
            <thead>
                <tr>
                    <th>Espacio</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="reservations-list">Cargando tus reservas...</tbody>
        </table>
    `;

    const formContainer = document.getElementById('form-container');
    const listContainer = document.getElementById('reservations-list');

    async function loadDashboard() {
        const allReservations = await reservationService.getAll();
        
        // Regla: Ver únicamente sus propias reservas
        const myReservations = allReservations.filter(r => r.userId == session.id);

        // Renderizar formulario limpio para crear una nueva reserva
        formContainer.innerHTML = renderReservationForm(null, 'user');
        
        setupFormSubmit(async (data) => {
            // Regla de Negocio: No duplicados para el mismo espacio, fecha y horario coincidente
            const isDuplicate = allReservations.some(r => 
                r.space === data.space && 
                r.date === data.date && 
                ((data.startTime >= r.startTime && data.startTime < r.endTime) || 
                 (data.endTime > r.startTime && data.endTime <= r.endTime))
            );

            if (isDuplicate) {
                alert("Error: Este espacio ya se encuentra reservado en el horario seleccionado.");
                return;
            }

            const newReservation = { 
                ...data, 
                status: 'Pendiente', 
                userId: session.id, 
                username: session.username 
            };
            await reservationService.create(newReservation);
            loadDashboard();
        });

        // Listar los datos en formato de filas estables
        listContainer.innerHTML = myReservations.map(r => `
            <tr>
                <td>${r.space}</td>
                <td>${r.date}</td>
                <td>${r.startTime} - ${r.endTime}</td>
                <td>${r.reason}</td>
                <td><strong>${r.status}</strong></td>
                <td>
                    ${r.status === 'Pendiente' ? `<button class="btn-edit" data-id="${r.id}">Editar</button>` : ''}
                    ${r.status === 'Aprobada' || r.status === 'Pendiente' ? `<button class="btn-cancel" data-id="${r.id}">Cancelar</button>` : ''}
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6">No tienes reservas registradas actualmente.</td></tr>';

        // Manejo de eventos dinámicos para Editar
        listContainer.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const resId = btn.getAttribute('data-id');
                const resToEdit = myReservations.find(r => r.id == resId);
                
                formContainer.innerHTML = renderReservationForm(resToEdit, 'user');
                setupFormSubmit(async (updatedData) => {
                    await reservationService.update(resId, { ...resToEdit, ...updatedData });
                    loadDashboard();
                });
            });
        });

        // Manejo de eventos dinámicos para Cancelar
        listContainer.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', async () => {
                const resId = btn.getAttribute('data-id');
                const resToCancel = myReservations.find(r => r.id == resId);
                if (confirm("¿Estás seguro de que deseas cancelar esta reserva?")) {
                    await reservationService.update(resId, { ...resToCancel, status: 'Cancelada' });
                    loadDashboard();
                }
            });
        });
    }

    await loadDashboard();
}