const API_URL = import.meta.env.VITE_API_BASE_URL;  
  
// Helper function to get request options with cookie-based authentication  
const getRequestOptions = (method: string = 'GET', body?: any): RequestInit => {  
  const options: RequestInit = {  
    method,  
    credentials: 'include', // Include cookies for authentication  
    headers: {  
      'Content-Type': 'application/json',  
    },  
  };  
  
  if (body) {  
    options.body = JSON.stringify(body);  
  }  
  
  return options;  
};  
  
export const updateAuthorProfile = async (userId: string, data: { bio?: string; avatar?: string }) => {  
  try {  
    const response = await fetch(`${API_URL}/api/users/${userId}`, getRequestOptions('PUT', data));  
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
    const response = await fetch(`${API_URL}/api/users/${userId}`, getRequestOptions());  
    return await response.json();  
  } catch (error) {  
    console.error('Error fetching user profile:', error);  
    throw error;  
  }  
};  
  
export const getAllAuthors = async () => {  
  try {  
    const response = await fetch(`${API_URL}/api/users`, getRequestOptions());  
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
    // Use the correct admin endpoint for creating users  
    const response = await fetch(`${API_URL}/api/admin/users`, getRequestOptions('POST', userData));  
    return await response.json();  
  } catch (error) {  
    console.error('Error creating author:', error);  
    throw error;  
  }  
};  
  
export const deleteAuthor = async (userId: string) => {  
  try {  
    const response = await fetch(`${API_URL}/api/users/${userId}`, getRequestOptions('DELETE'));  
  
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
