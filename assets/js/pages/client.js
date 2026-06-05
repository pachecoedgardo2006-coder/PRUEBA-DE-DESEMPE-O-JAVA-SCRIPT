import { reservationService } from '../services/reservationService.js';
import { renderReservationForm, setupFormSubmit } from '../components/reservationForm.js';
import { getSession } from '../utils/session.js';

export async function renderClient() {
    const container = document.getElementById('content');
    const session = getSession();

    // UI Strings translated to English
    container.innerHTML = `
        <h2>Reservation Panel (User: ${session.username})</h2>
        <div id="form-container"></div>
        <h3>My Reservation History</h3>
        <table border="1" style="width:100%; border-collapse: collapse; margin-top:10px;">
            <thead>
                <tr>
                    <th>Space</th>
                    <th>Date</th>
                    <th>Time Slot</th>
                    <th>Reason</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="reservations-list">Loading your reservations...</tbody>
        </table>
    `;

    const formContainer = document.getElementById('form-container');
    const listContainer = document.getElementById('reservations-list');

    async function loadDashboard() {
        const allReservations = await reservationService.getAll();
        
        // Rule: View only your own reservations
        const myReservations = allReservations.filter(r => r.userId == session.id);

        // Render clean form to create a new reservation
        formContainer.innerHTML = renderReservationForm(null, 'user');
        
        setupFormSubmit(async (data) => {
            // Business Rule: No duplicates for the same space, date, and overlapping time
            const isDuplicate = allReservations.some(r => 
                r.space === data.space && 
                r.date === data.date && 
                ((data.startTime >= r.startTime && data.startTime < r.endTime) || 
                 (data.endTime > r.startTime && data.endTime <= r.endTime))
            );

            if (isDuplicate) {
                alert("Error: This space is already reserved for the selected time slot.");
                return;
            }

            const newReservation = { 
                ...data, 
                status: 'Pending', // Translated default status
                userId: session.id, 
                username: session.username 
            };
            await reservationService.create(newReservation);
            loadDashboard();
        });

        // List data in stable row format
        listContainer.innerHTML = myReservations.map(r => `
            <tr>
                <td>${r.space}</td>
                <td>${r.date}</td>
                <td>${r.startTime} - ${r.endTime}</td>
                <td>${r.reason}</td>
                <td><strong>${r.status}</strong></td>
                <td>
                    ${r.status === 'Pending' ? `<button class="btn-edit" data-id="${r.id}">Edit</button>` : ''}
                    ${(r.status === 'Approved' || r.status === 'Pending') ? `<button class="btn-cancel" data-id="${r.id}">Cancel</button>` : ''}
                </td>
            </tr>
        `).join('') || '<tr><td colspan="6">You currently have no registered reservations.</td></tr>';

        // Dynamic event handling for Edit
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

        // Dynamic event handling for Cancel
        listContainer.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', async () => {
                const resId = btn.getAttribute('data-id');
                const resToCancel = myReservations.find(r => r.id == resId);
                if (confirm("Are you sure you want to cancel this reservation?")) {
                    // Note: Ensure your backend/database accepts 'Cancelled' if you change the string here
                    await reservationService.update(resId, { ...resToCancel, status: 'Cancelled' }); 
                    loadDashboard();
                }
            });
        });
    }

    await loadDashboard();
}   