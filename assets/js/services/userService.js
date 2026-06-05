import { httpClient } from './httpClient.js';

export const userService = {
    async getAllUsers() {
        const response = await httpClient.auth.get('/users');
        return response.data;
    }
};