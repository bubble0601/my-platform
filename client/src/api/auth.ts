import axios from 'axios';
import { User } from './user';

export default {
    init: () => axios.get<{ user: User, token: string }>('/api/auth/init'),
    signIn: (data: { username: string, password: string }) => axios.post<{ user: User }>('/api/auth/login', data),
    signOut: () => axios.get('/api/auth/logout'),
};
