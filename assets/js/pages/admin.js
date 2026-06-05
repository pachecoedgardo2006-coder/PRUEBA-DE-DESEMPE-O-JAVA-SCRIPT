import { reservationService } from "../services/reservationService.js";
import { renderReservationForm, setupFormSubmit } from "../components/reservationForm.js";

export async function renderAdmin() {
  const container = document.getElementById("content");
  
  // UI Strings translated to English
  container.innerHTML = `
    <h2>Global Administration Panel</h2>
    <div id="form-container"></div>
    <h3>Control of All System Reservations</h3>
    <table border="1" style="width:100%; border-collapse: collapse; margin-top:10px;">
      <thead>
        <tr>
          <th>User</th>
          <th>Space</th>
          <th>Date</th>
          <th>Time Slot</th>
          <th>Reason</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody id="reservations-list">Loading general management...</tbody>
    </table>
  `;

  const formContainer = document.getElementById("form-container");
  const listContainer = document.getElementById("reservations-list");

  async function loadDashboard() {
    const reservations = await reservationService.getAll();

    // CORRECTION: The administrator now sees the clean form by default to CREATE reservations
    formContainer.innerHTML = renderReservationForm(null, "admin");

    // Configure the action to CREATE a new reservation by the admin
    setupFormSubmit(async (data) => {
      // Validate duplicates in the system before creating
      const isDuplicate = reservations.some(r => 
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
        userId: "admin",
        username: "Administrator"
      };

      await reservationService.create(newReservation);
      loadDashboard(); // Reload the view and the table
    });

    // VISUALIZATION: Render the list with absolutely all reservations in the system
    listContainer.innerHTML = reservations.map(r => `
      <tr>
        <td>${r.username || 'Unknown'}</td>
        <td>${r.space}</td>
        <td>${r.date}</td>
        <td>${r.startTime} - ${r.endTime}</td>
        <td>${r.reason}</td>
        <td><span class="status-badge ${r.status.toLowerCase()}">${r.status}</span></td>
        <td>
          <button class="btn-admin-edit" data-id="${r.id}">Manage</button>
          <button class="btn-admin-delete" data-id="${r.id}" style="color:red; margin-left: 5px;">Delete</button>
        </td>
      </tr>
    `).join("") || '<tr><td colspan="7">No reservation requests exist in the system.</td></tr>';

    // ACTION: Manage (Edit, Approve, or Reject the status of an existing reservation)
    listContainer.querySelectorAll('.btn-admin-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const resId = btn.getAttribute('data-id');
        const resToEdit = reservations.find(r => r.id == resId);

        // Load the selected reservation into the form with Admin controls enabled
        formContainer.innerHTML = renderReservationForm(resToEdit, "admin");

        setupFormSubmit(async (updatedData) => {
          await reservationService.update(resId, { ...resToEdit, ...updatedData });
          loadDashboard();
        });
      });
    });

    // ACTION: Permanently delete a reservation from the system
    listContainer.querySelectorAll('.btn-admin-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const resId = btn.getAttribute('data-id');
        if (confirm("Are you completely sure you want to permanently delete this reservation from the record?")) {
          await reservationService.delete(resId);
          loadDashboard();
        }
      });
    });
  }

  await loadDashboard();
}