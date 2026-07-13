import apiClient from './apiClient';

// Placeholder pizza service — wire up real endpoints in Stage 2
const pizzaService = {
  getAll: () => apiClient.get('/pizzas'),
  getById: (id) => apiClient.get(`/pizzas/${id}`),
  getCustomizationOptions: () => apiClient.get('/pizzas/customization-options'),
};

export default pizzaService;
