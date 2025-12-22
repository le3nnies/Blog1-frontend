const API_URL = import.meta.env.REACT_APP_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

export const updateAuthorProfile = async (userId: string, data: { bio?: string; avatar?: string }) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating author profile:', error);
    throw error;
  }
};

// Additional helper that might be useful
export const getUserProfile = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: getAuthHeaders(),
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const getAllAuthors = async () => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeaders(),
    });
    const result = await response.json();

    // The backend returns { success: true, data: { users, pagination, statistics } }
    // We need to return the users array directly for compatibility
    if (result.success && result.data && result.data.users) {
      return {
        success: true,
        data: result.data.users
      };
    }

    return result;
  } catch (error) {
    console.error('Error fetching authors:', error);
    throw error;
  }
};

export const createAuthor = async (userData: { username: string; email: string; password?: string; role?: string }) => {
  try {
    // Use admin register endpoint for creating authors
    const response = await fetch(`${API_URL}/auth/admin/register`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating author:', error);
    throw error;
  }
};

export const deleteAuthor = async (userId: string) => {
  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    const result = await response.json();

    // If response is not ok, include the status for better error handling
    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Failed to delete author',
        status: response.status
      };
    }

    return result;
  } catch (error) {
    console.error('Error deleting author:', error);
    throw error;
  }
};

const userService = {
  updateAuthorProfile,
  getUserProfile,
  getAllAuthors,
  createAuthor,
  deleteAuthor
};

export default userService;