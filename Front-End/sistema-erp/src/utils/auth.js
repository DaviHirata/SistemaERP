export const authUtils = {
  // Verificar se está logado
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

  // Obter token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Obter dados do usuário
  getUser: () => {
    const userData = localStorage.getItem('usuario');
    try {
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  // Fazer logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    window.location.href = '/login';
  }
};