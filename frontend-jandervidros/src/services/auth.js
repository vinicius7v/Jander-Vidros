export const authService = {
  initializeUsers: () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const defaultUser = {
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        email: 'admin@jandervidros.com'
      };
      localStorage.setItem('users', JSON.stringify([defaultUser]));
    }
  },

  login: (username, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(
      u => u.username === username && u.password === password
    );
    return user || null;
  },

  logout: () => {
    localStorage.removeItem('currentUser');
  },

  isAuthenticated: () => {
    return localStorage.getItem('currentUser') !== null;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
};