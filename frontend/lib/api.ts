const API_BASE_URL = 'http://localhost:8080/api';

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export const apiClient = {
  // Business APIs
  async createBusiness(data: any) {
    const response = await fetch(`${API_BASE_URL}/business`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create business');
    }

    return response.json();
  },

  async getBusiness() {
    const response = await fetch(`${API_BASE_URL}/business`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 400) {
        return null;
      }
      throw new Error('Failed to fetch business');
    }

    return response.json();
  },

  async updateBusiness(data: any) {
    const response = await fetch(`${API_BASE_URL}/business`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update business');
    }

    return response.json();
  },

  // Customer APIs
  async createCustomer(data: any) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create customer');
    }

    return response.json();
  },

  async getAllCustomers() {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch customers');
    }

    return response.json();
  },

  async searchCustomers(query: string) {
    const response = await fetch(
      `${API_BASE_URL}/customers/search?query=${encodeURIComponent(query)}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search customers');
    }

    return response.json();
  },

  // Invoice APIs
  async createInvoice(data: any) {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create invoice');
    }

    return response.json();
  },

  async getInvoiceById(id: number) {
    const response = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }

    return response.json();
  },

  async getAllInvoices() {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }

    return response.json();
  },
};
