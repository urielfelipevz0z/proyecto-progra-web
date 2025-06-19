# Integración Frontend Vue.js con Backend API

Esta guía te ayudará a migrar tu aplicación Vue.js para usar el backend API en lugar de LocalStorage.

## 🔧 Configuración del Cliente HTTP

### 1. Instalar Axios
```bash
cd ..  # Volver al directorio raíz del proyecto Vue
npm install axios
```

### 2. Crear servicio API
Crea `src/services/api.js`:

```javascript
import axios from 'axios'

// Configuración base de la API
const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    
    return Promise.reject(error.response?.data || error.message)
  }
)

export default api
```

## 🔐 Servicios de Autenticación

### 3. Crear servicio de autenticación
Crea `src/services/authService.js`:

```javascript
import api from './api'

export const authService = {
  async register(userData) {
    const response = await api.post('/auth/register', userData)
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  },

  async logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  async getProfile() {
    const response = await api.get('/auth/profile')
    return response
  },

  async verifyToken() {
    const response = await api.get('/auth/verify')
    return response
  },

  isAuthenticated() {
    return !!localStorage.getItem('token')
  },

  getUser() {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  }
}
```

### 4. Crear servicio de bombas
Crea `src/services/pumpService.js`:

```javascript
import api from './api'

export const pumpService = {
  async getPumps() {
    const response = await api.get('/pumps')
    return response.data.pumps
  },

  async getPump(id) {
    const response = await api.get(`/pumps/${id}`)
    return response.data.pump
  },

  async createPump(pumpData) {
    const response = await api.post('/pumps', pumpData)
    return response.data.pump
  },

  async updatePump(id, pumpData) {
    const response = await api.put(`/pumps/${id}`, pumpData)
    return response.data.pump
  },

  async deletePump(id) {
    const response = await api.delete(`/pumps/${id}`)
    return response
  }
}
```

### 5. Crear servicio de métricas
Crea `src/services/metricsService.js`:

```javascript
import api from './api'

export const metricsService = {
  async getCurrentMetrics(pumpId) {
    const response = await api.get(`/metrics/${pumpId}/current`)
    return response.data.metrics
  },

  async getMetricsHistory(pumpId, options = {}) {
    const params = new URLSearchParams()
    if (options.limit) params.append('limit', options.limit)
    if (options.hours) params.append('hours', options.hours)
    
    const response = await api.get(`/metrics/${pumpId}/history?${params}`)
    return response.data.metrics
  },

  async updateMetrics(pumpId, metricsData) {
    const response = await api.post(`/metrics/${pumpId}/update`, metricsData)
    return response.data.metrics
  },

  async simulateMetrics(pumpId) {
    const response = await api.post(`/metrics/${pumpId}/simulate`)
    return response.data.metrics
  }
}
```

## 🗄️ Actualizar Vuex Store

### 6. Modificar `src/store/index.js`:

```javascript
import { createStore } from 'vuex'
import { authService } from '@/services/authService'
import { pumpService } from '@/services/pumpService'
import { metricsService } from '@/services/metricsService'

export default createStore({
  state: {
    user: authService.getUser(),
    pumps: [],
    currentPump: null,
    loading: false,
    error: null
  },
  
  getters: {
    isAuthenticated: state => !!state.user,
    getUserPumps: state => state.pumps,
    getCurrentPump: state => state.currentPump,
    isLoading: state => state.loading,
    getError: state => state.error
  },
  
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    
    SET_ERROR(state, error) {
      state.error = error
    },
    
    SET_USER(state, user) {
      state.user = user
    },
    
    CLEAR_USER(state) {
      state.user = null
    },
    
    SET_PUMPS(state, pumps) {
      state.pumps = pumps
    },
    
    ADD_PUMP(state, pump) {
      state.pumps.push(pump)
    },
    
    UPDATE_PUMP(state, updatedPump) {
      const index = state.pumps.findIndex(p => p.id === updatedPump.id)
      if (index !== -1) {
        state.pumps.splice(index, 1, updatedPump)
      }
    },
    
    DELETE_PUMP(state, pumpId) {
      state.pumps = state.pumps.filter(p => p.id !== pumpId)
    },
    
    SET_CURRENT_PUMP(state, pump) {
      state.currentPump = pump
    }
  },
  
  actions: {
    async register({ commit, dispatch }, userData) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        const response = await authService.register(userData)
        commit('SET_USER', response.data.user)
        
        return response.data.user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async login({ commit }, credentials) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        const response = await authService.login(credentials)
        commit('SET_USER', response.data.user)
        
        return response.data.user
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async logout({ commit }) {
      try {
        await authService.logout()
      } finally {
        commit('CLEAR_USER')
        commit('SET_PUMPS', [])
        commit('SET_CURRENT_PUMP', null)
      }
    },

    async fetchPumps({ commit }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        const pumps = await pumpService.getPumps()
        commit('SET_PUMPS', pumps)
        
        return pumps
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async addPump({ commit }, pumpData) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        const pump = await pumpService.createPump(pumpData)
        commit('ADD_PUMP', pump)
        
        return pump
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async updatePump({ commit }, { id, pumpData }) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        const pump = await pumpService.updatePump(id, pumpData)
        commit('UPDATE_PUMP', pump)
        
        return pump
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deletePump({ commit }, pumpId) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        await pumpService.deletePump(pumpId)
        commit('DELETE_PUMP', pumpId)
        
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async fetchPump({ commit }, pumpId) {
      try {
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)
        
        const pump = await pumpService.getPump(pumpId)
        commit('SET_CURRENT_PUMP', pump)
        
        return pump
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // Acciones para métricas
    async getCurrentMetrics({ commit }, pumpId) {
      try {
        const metrics = await metricsService.getCurrentMetrics(pumpId)
        return metrics
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async getMetricsHistory({ commit }, { pumpId, options }) {
      try {
        const metrics = await metricsService.getMetricsHistory(pumpId, options)
        return metrics
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    },

    async simulateMetrics({ commit }, pumpId) {
      try {
        const metrics = await metricsService.simulateMetrics(pumpId)
        return metrics
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      }
    }
  }
})
```

## 📱 Actualizar Componentes

### 7. Actualizar `src/views/Login/Login.js`:

```javascript
export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      error: '',
      loading: false
    }
  },
  
  computed: {
    isLoading() {
      return this.$store.getters.isLoading || this.loading
    }
  },
  
  methods: {
    async handleLogin() {
      if (!this.username || !this.password) {
        this.error = 'Please fill in all fields'
        return
      }

      try {
        this.loading = true
        this.error = ''
        
        await this.$store.dispatch('login', {
          username: this.username,
          password: this.password
        })
        
        this.$router.push('/bombs')
      } catch (error) {
        this.error = error.message || 'Login failed. Please try again.'
      } finally {
        this.loading = false
      }
    }
  },
  
  created() {
    if (this.$store.getters.isAuthenticated) {
      this.$router.push('/bombs')
    }
  }
}
```

### 8. Actualizar `src/views/BombList/BombList.js`:

```javascript
export default {
  name: 'BombListView',
  data() {
    return {
      newPump: {
        name: '',
        location: '',
        capacity: '',
        model: '',
        manufacturer: '',
        installationDate: '',
        powerRating: '',
        voltage: '',
        current: '',
        maxPressure: '',
        minPressure: '',
        efficiency: '',
        maintenanceInterval: '',
        lastMaintenance: ''
      },
      successMessage: '',
      showDeleteModal: false,
      pumpToDelete: null
    }
  },
  
  computed: {
    pumps() {
      return this.$store.getters.getUserPumps
    },
    
    isLoading() {
      return this.$store.getters.isLoading
    },
    
    error() {
      return this.$store.getters.getError
    }
  },
  
  methods: {
    async addPump() {
      try {
        const pump = await this.$store.dispatch('addPump', this.newPump)
        
        this.successMessage = `Pump "${pump.name}" has been added successfully!`
        this.resetForm()
        
        setTimeout(() => {
          this.successMessage = ''
        }, 3000)
      } catch (error) {
        // Error is handled by the store
        console.error('Error adding pump:', error)
      }
    },
    
    async handleDelete() {
      if (!this.pumpToDelete) return
      
      try {
        await this.$store.dispatch('deletePump', this.pumpToDelete.id)
        
        this.successMessage = `Pump "${this.pumpToDelete.name}" has been deleted successfully!`
        this.showDeleteModal = false
        this.pumpToDelete = null
        
        setTimeout(() => {
          this.successMessage = ''
        }, 3000)
      } catch (error) {
        console.error('Error deleting pump:', error)
      }
    },
    
    resetForm() {
      this.newPump = {
        name: '',
        location: '',
        capacity: '',
        model: '',
        manufacturer: '',
        installationDate: '',
        powerRating: '',
        voltage: '',
        current: '',
        maxPressure: '',
        minPressure: '',
        efficiency: '',
        maintenanceInterval: '',
        lastMaintenance: ''
      }
    },
    
    viewPump(pumpId) {
      this.$router.push(`/bombs/${pumpId}`)
    },
    
    async logout() {
      await this.$store.dispatch('logout')
      this.$router.push('/login')
    },
    
    confirmDelete(pump) {
      this.pumpToDelete = pump
      this.showDeleteModal = true
    },
    
    cancelDelete() {
      this.showDeleteModal = false
      this.pumpToDelete = null
    }
  },
  
  async created() {
    if (!this.$store.getters.isAuthenticated) {
      this.$router.push('/login')
      return
    }
    
    try {
      await this.$store.dispatch('fetchPumps')
    } catch (error) {
      console.error('Error fetching pumps:', error)
    }
  }
}
```

## 🌐 Variables de Entorno

### 9. Crear archivo `.env` en el directorio raíz de Vue:

```env
VUE_APP_API_URL=http://localhost:3000/api
```

### 10. Para producción, crear `.env.production`:

```env
VUE_APP_API_URL=https://tu-dominio.com/api
```

## 🚀 Pasos de Migración

1. **Instalar axios**: `npm install axios`
2. **Crear los servicios** siguiendo los ejemplos anteriores
3. **Actualizar el store** con las nuevas acciones
4. **Actualizar componentes** uno por uno
5. **Probar cada funcionalidad** después de cada cambio
6. **Eliminar código de localStorage** una vez que todo funcione

## 🧪 Testing de la Migración

Para probar que todo funciona:

1. Inicia el backend: `cd backend && npm run dev`
2. Inicia el frontend: `npm run serve`
3. Verifica que no hay errores en la consola
4. Prueba todas las funcionalidades:
   - Registro/Login
   - Crear/Editar/Eliminar bombas
   - Ver métricas

## 💡 Tips de Desarrollo

- **Debugging**: Usa las dev tools del navegador para ver las requests
- **Errorhandling**: Todos los errores son manejados centralmente en el store
- **Loading states**: Los estados de carga están disponibles en todos los componentes
- **Token management**: Los tokens se manejan automáticamente
- **CORS**: Ya está configurado en el backend para localhost:8080

Con esta configuración, tu aplicación Vue.js estará completamente integrada con el backend API y ya no dependerá de LocalStorage para la persistencia de datos.
