import api from "./api";

export const authService = {
  async login(username, password) {
    const { data } = await api.post("/auth/login/", { username, password });
    return data;
  },

  async register(payload) {
    const { data } = await api.post("/auth/register/", payload);
    return data;
  },
};
