import axios from 'axios';

export interface User {
  name: string;
}

export default {
  checkExistence: (username: string) => axios.head(`/api/users?username=${username}`),
  register: (data: { username: string, password: string }) => axios.post<{ user: User }>('/api/users', data),
};
