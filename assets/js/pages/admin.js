import { reservationService } from "../services/reservationService.js";
import { renderReservationForm, setupFormSubmit } from "../components/reservationForm.js";

export async function renderAdmin() {
    const container = document.getElementById("content");

    container.innerHTML = `
        <h2>Panel de Administración Global</h2>
        <div id="form-container"></div>
        <h3>Control de Todas las Reservas del Sistema</h3>
        <table border="1" style="width:100%; border-collapse: collapse; margin-top:10px;">
            <thead>
                <tr>
                    <th>Usuario</th>
                    <th>Espacio</th>
                    <th>Fecha</th>
                    <th>Horario</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody id="reservations-list">Cargando gestión general...</tbody>
        </table>
    `;

    const formContainer = document.getElementById("form-container");
    const listContainer = document.getElementById("reservations-list");

    async function loadDashboard() {
        const reservations = await reservationService.getAll();

        // CORRECCIÓN: El administrador ahora ve el formulario limpio por defecto para CREAR reservas
        formContainer.innerHTML = renderReservationForm(null, "admin");
        
        // Configurar la acción de CREAR nueva reserva por el admin
        setupFormSubmit(async (data) => {
            // Validar duplicados en el sistema antes de crear
            const isDuplicate = reservations.some(r => 
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
                userId: "admin", 
                username: "Administrador" 
            };
            await reservationService.create(newReservation);
            loadDashboard(); // Recargar la vista y la tabla
        });

        // VISUALIZACIÓN: Renderizar la lista con absolutamente todas las reservas del sistema
        listContainer.innerHTML = reservations.map(r => `
            <tr>
                <td>${r.username || 'Desconocido'}</td>
                <td>${r.space}</td>
                <td>${r.date}</td>
                <td>${r.startTime} - ${r.endTime}</td>
                <td>${r.reason}</td>
                <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
                <td>
                    <button class="btn-admin-edit" data-id="${r.id}">Gestionar</button>
                    <button class="btn-admin-delete" data-id="${r.id}" style="color:red; margin-left: 5px;">Eliminar</button>
                </td>
            </tr>
        `).join("") || '<tr><td colspan="7">No existen solicitudes de reserva en el sistema.</td></tr>';

        // ACCIÓN: Gestionar (Editar, Aprobar o Rechazar el estado de una reserva existente)
        listContainer.querySelectorAll('.btn-admin-edit').forEach(btn => {
            btn.addEventListener('click', () => {
                const resId = btn.getAttribute('data-id');
                const resToEdit = reservations.find(r => r.id == resId);

                // Cargar la reserva seleccionada en el formulario con los controles de Admin habilitados
                formContainer.innerHTML = renderReservationForm(resToEdit, "admin");
                
                setupFormSubmit(async (updatedData) => {
                    await reservationService.update(resId, { ...resToEdit, ...updatedData });
                    loadDashboard();
                });
            });
        });

        // ACCIÓN: Eliminar definitivamente una reserva del sistema
        listContainer.querySelectorAll('.btn-admin-delete').forEach(btn => {
            btn.addEventListener('click', async () => {
                const resId = btn.getAttribute('data-id');
                if (confirm("¿Estás completamente seguro de eliminar permanentemente esta reserva del registro?")) {
                    await reservationService.delete(resId);
                    loadDashboard();
                }
            });
        });
    }

    await loadDashboard();
}