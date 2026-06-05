export function renderReservationForm(currentReservation = null, currentRole = "") {
    const isEdit = !!currentReservation;

    // Business Rule: Regular users can only modify reservations if they are 'Pending'
    const isUserRestricted = currentRole === "user" && isEdit && currentReservation.status !== "Pending";

    return `
        <form id="reservation-form">
            <h3>${isEdit ? "Edit Reservation" : "Create New Reservation"}</h3>
            
            <label>Shared Space:</label>
            <select id="form-space" required ${isUserRestricted ? "disabled" : ""}>
                <option value="">Select a space...</option>
                <option value="Private Offices" ${currentReservation?.space === "Private Offices" ? "selected" : ""}>Private Offices</option>
                <option value="Meeting Rooms" ${currentReservation?.space === "Meeting Rooms" ? "selected" : ""}>Meeting Rooms</option>
                <option value="Coworking Spaces" ${currentReservation?.space === "Coworking Spaces" ? "selected" : ""}>Coworking Spaces</option>
                <option value="Auditoriums" ${currentReservation?.space === "Auditoriums" ? "selected" : ""}>Auditoriums</option>
            </select><br><br>
            
            <label>Date:</label>
            <input type="date" id="form-date" value="${currentReservation?.date || ""}" required ${isUserRestricted ? "disabled" : ""}><br><br>
            
            <label>Start Time:</label>
            <input type="time" id="form-startTime" value="${currentReservation?.startTime || ""}" required ${isUserRestricted ? "disabled" : ""}><br><br>
            
            <label>End Time:</label>
            <input type="time" id="form-endTime" value="${currentReservation?.endTime || ""}" required ${isUserRestricted ? "disabled" : ""}><br><br>

            <label>Reason for Reservation:</label>
            <textarea id="form-reason" required ${isUserRestricted ? "disabled" : ""}>${currentReservation?.reason || ""}</textarea><br><br>
            
            ${
                isEdit && currentRole === "admin"
                    ? `
                <label>Reservation Status:</label>
                <select id="form-status">
                    <option value="Pending" ${currentReservation.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Approved" ${currentReservation.status === "Approved" ? "selected" : ""}>Approved</option>
                    <option value="Rejected" ${currentReservation.status === "Rejected" ? "selected" : ""}>Rejected</option>
                    <option value="Cancelled" ${currentReservation.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
                </select><br><br>
            `
                    : ""
            }

            ${isUserRestricted ? '<p style="color:red;">You can only modify reservations in Pending status.</p>' : '<button type="submit">Save Reservation</button>'}
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
            // Defaults to 'Pending' if no status field exists (user creation)
            status: document.getElementById("form-status")?.value || "Pending",
        };

        onSave(data);
    });
}   