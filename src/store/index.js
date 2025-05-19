import { createStore } from 'vuex'

export default createStore({
  state: {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    pumps: JSON.parse(localStorage.getItem('bombs') || '[]')
  },
  getters: {
    isAuthenticated: state => !!state.user,
    getUserPumps: state => state.pumps.filter(pump => pump.userId === state.user?.id)
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
    setPumps(state, pumps) {
      state.pumps = pumps;
      localStorage.setItem('bombs', JSON.stringify(pumps));
    },
    addPump(state, pump) {
      state.pumps.push(pump);
      localStorage.setItem('bombs', JSON.stringify(state.pumps));
    }
  },
  actions: {
    login({ commit }, credentials) {
      // In a real application, this would make an API call
      const user = {
        id: Date.now(),
        username: credentials.username
      };
      commit('setUser', user);
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
    }
  }
})
