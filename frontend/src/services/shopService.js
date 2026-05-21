import api from "./api";

export const shopService = {
  async search(params) {
    const { data } = await api.get("/shops/", { params });
    return data;
  },

  async getById(id) {
    const { data } = await api.get(`/shops/${id}/`);
    return data;
  },
};
