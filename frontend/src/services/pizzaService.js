import apiClient from './apiClient';

// Placeholder pizza service — wire up real endpoints in Stage 2
const pizzaService = {
  getAll: () => apiClient.get('/pizzas'),
  getById: (id) => apiClient.get(`/pizzas/${id}`),
};

export default pizzaService;
