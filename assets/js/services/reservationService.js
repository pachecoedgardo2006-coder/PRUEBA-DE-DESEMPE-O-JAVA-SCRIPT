import { httpClient } from './httpClient.js';

export const reservationService = {
    // === RESERVAS ===
    async getAll() {
        const response = await httpClient.data.get('/reservations');
        return response.data;
    },
    async getById(id) {
        const response = await httpClient.data.get(`/reservations/${id}`);
        return response.data;
    },
    async create(reservationData) {
        const response = await httpClient.data.post('/reservations', reservationData);
        return response.data;
    },
    async update(id, reservationData) {
        const response = await httpClient.data.put(`/reservations/${id}`, reservationData);
        return response.data;
    },
    async delete(id) {
        const response = await httpClient.data.delete(`/reservations/${id}`);
        return response.data;
    },

    // === ESPACIOS (Puntos Extra) ===
    async getSpaces() {
        const response = await httpClient.data.get('/spaces');
        return response.data;
    }
};