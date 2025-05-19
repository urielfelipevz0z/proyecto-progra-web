import { createStore } from 'vuex'

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    users: JSON.parse(localStorage.getItem('users') || '[]'),
    pumps: JSON.parse(localStorage.getItem('bombs') || '[]')
  },
  getters: {
    isAuthenticated: state => !!state.user,
    getUserPumps: state => {
      // Make sure we have a user and pumps array exists
      if (!state.user || !Array.isArray(state.pumps)) {
        return [];
      }
      return state.pumps.filter(pump => pump.userId === state.user.id);
    }
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
      localStorage.setItem('user', JSON.stringify(user));
    },
    clearUser(state) {
      state.user = null;
      localStorage.removeItem('user');
    },
    addUser(state, user) {
      state.users.push(user);
      localStorage.setItem('users', JSON.stringify(state.users));
    },
    setPumps(state, pumps) {
      state.pumps = pumps;
      localStorage.setItem('bombs', JSON.stringify(pumps));
    },
    addPump(state, pump) {
      state.pumps.push(pump);
      localStorage.setItem('bombs', JSON.stringify(state.pumps));
    },
    deletePump(state, pumpId) {
      state.pumps = state.pumps.filter(pump => pump.id !== pumpId);
      localStorage.setItem('bombs', JSON.stringify(state.pumps));
    }
  },
  actions: {
    signup({ commit, state }, userData) {
      return new Promise((resolve, reject) => {
        // Verificar si el usuario ya existe
        const userExists = state.users.some(
          u => u.username === userData.username || u.email === userData.email
        );

        if (userExists) {
          reject(new Error('Username or email already exists'));
          return;
        }

        // Crear nuevo usuario
        const user = {
          id: Date.now(),
          username: userData.username,
          email: userData.email,
          password: userData.password // En una aplicación real, esto debería estar hasheado
        };

        // Guardar usuario
        commit('addUser', user);
        
        // Iniciar sesión automáticamente
        const sessionUser = {
          id: user.id,
          username: user.username,
          email: user.email
        };
        commit('setUser', sessionUser);
        resolve(sessionUser);
      });
    },
    login({ commit, state }, credentials) {
      return new Promise((resolve, reject) => {
        // Buscar usuario
        const user = state.users.find(
          u => u.username === credentials.username && u.password === credentials.password
        );

        if (!user) {
          reject(new Error('Invalid credentials'));
          return;
        }

        // Crear sesión
        const sessionUser = {
          id: user.id,
          username: user.username,
          email: user.email
        };
        commit('setUser', sessionUser);
        resolve(sessionUser);
      });
    },
    logout({ commit }) {
      commit('clearUser');
    },
    addPump({ commit, state }, pumpData) {
      const pump = {
        ...pumpData,
        id: Date.now(),
        userId: state.user.id
      };
      commit('addPump', pump);
      return pump;
    },
    deletePump({ commit, state }, pumpId) {
      return new Promise((resolve, reject) => {
        const pump = state.pumps.find(p => p.id === pumpId);
        
        if (!pump) {
          reject(new Error('Pump not found'));
          return;
        }

        if (pump.userId !== state.user.id) {
          reject(new Error('Unauthorized to delete this pump'));
          return;
        }

        commit('deletePump', pumpId);
        resolve();
      });
    }
  }
})
