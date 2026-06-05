export function renderReservationForm(currentReservation = null, currentRole = "") {
    const isEdit = !!currentReservation;

    // Regla de negocio: El usuario común solo puede modificar reservas si están 'Pendiente'
    const isUserRestricted = currentRole === "user" && isEdit && currentReservation.status !== "Pendiente";

    return `
        <form id="reservation-form">
            <h3>${isEdit ? "Editar Reserva" : "Crear Nueva Reserva"}</h3>
            
            <label>Espacio Compartido:</label>
            <select id="form-space" required ${isUserRestricted ? "disabled" : ""}>
                <option value="">Selecciona un espacio...</option>
                <option value="Oficinas privadas" ${currentReservation?.space === "Oficinas privadas" ? "selected" : ""}>Oficinas privadas</option>
                <option value="Salas de reuniones" ${currentReservation?.space === "Salas de reuniones" ? "selected" : ""}>Salas de reuniones</option>
                <option value="Espacios de coworking" ${currentReservation?.space === "Espacios de coworking" ? "selected" : ""}>Espacios de coworking</option>
                <option value="Auditorios" ${currentReservation?.space === "Auditorios" ? "selected" : ""}>Auditorios</option>
            </select><br><br>
            
            <label>Fecha:</label>
            <input type="date" id="form-date" value="${currentReservation?.date || ""}" required ${isUserRestricted ? "disabled" : ""}><br><br>
            
            <label>Hora Inicio:</label>
            <input type="time" id="form-startTime" value="${currentReservation?.startTime || ""}" required ${isUserRestricted ? "disabled" : ""}><br><br>
            
            <label>Hora Finalización:</label>
            <input type="time" id="form-endTime" value="${currentReservation?.endTime || ""}" required ${isUserRestricted ? "disabled" : ""}><br><br>

            <label>Motivo de la Reserva:</label>
            <textarea id="form-reason" required ${isUserRestricted ? "disabled" : ""}>${currentReservation?.reason || ""}</textarea><br><br>
            
            ${
                isEdit && currentRole === "admin"
                    ? `
                <label>Estado de la Reserva:</label>
                <select id="form-status">
                    <option value="Pendiente" ${currentReservation.status === "Pendiente" ? "selected" : ""}>Pendiente</option>
                    <option value="Aprobada" ${currentReservation.status === "Aprobada" ? "selected" : ""}>Aprobada</option>
                    <option value="Rechazada" ${currentReservation.status === "Rechazada" ? "selected" : ""}>Rechazada</option>
                    <option value="Cancelada" ${currentReservation.status === "Cancelada" ? "selected" : ""}>Cancelada</option>
                </select><br><br>
            `
                    : ""
            }

            ${isUserRestricted ? '<p style="color:red;">Solo puedes modificar reservas en estado Pendiente.</p>' : '<button type="submit">Guardar Reserva</button>'}
        </form>
    `;
}

export function setupFormSubmit(onSave) {
    const form = document.getElementById("reservation-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const data = {
            space: document.getElementById("form-space")?.value || "",
            date: document.getElementById("form-date")?.value || "",
            startTime: document.getElementById("form-startTime")?.value || "",
            endTime: document.getElementById("form-endTime")?.value || "",
            reason: document.getElementById("form-reason")?.value || "",
            status: document.getElementById("form-status")?.value || "Pendiente",
        };

        onSave(data);
    });
}