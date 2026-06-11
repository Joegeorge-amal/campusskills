import api from './api';

export const listingService = {
    createListing: async (listingData) => {
        const response = await api.post('/listings', listingData);
        // api.js response interceptor returns response.data directly, but let's be safe
        return response.data || response;
    },

    getListingById: async (id) => {
        const response = await api.get(`/listings/${id}`);
        return response.data || response;
    },

    updateListing: async (id, listingData) => {
        const response = await api.put(`/listings/${id}`, listingData);
        return response.data || response;
    },

    deactivateListing: async (id) => {
        const response = await api.delete(`/listings/${id}`);
        return response.data || response;
    },

    searchListings: async (filters = {}, page = 1, limit = 20) => {
        const params = { ...filters, page, limit };
        const response = await api.get('/listings', { params });
        return response.data || response;
    }
};
