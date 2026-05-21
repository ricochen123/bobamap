import api from "./api";

export const favoriteService = {
  async list() {
    const { data } = await api.get("/favorites/");
    return data;
  },

  async add(shop) {
    const { data } = await api.post("/favorites/", {
      yelp_id: shop.id,
      shop_name: shop.name,
      shop_image_url: shop.image_url || "",
      shop_rating: shop.rating,
      shop_address: shop.address,
      latitude: shop.latitude,
      longitude: shop.longitude,
    });
    return data;
  },

  async removeByYelpId(yelpId) {
    await api.delete(`/favorites/yelp/${yelpId}/`);
  },

  async remove(id) {
    await api.delete(`/favorites/${id}/`);
  },
};
