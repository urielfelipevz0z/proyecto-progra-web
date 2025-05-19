<template>
  <div class="bomb-list">
    <header class="header">
      <h1>Pump Management</h1>
      <button @click="logout" class="logout-button">Logout</button>
    </header>

    <div class="content">
      <!-- Add New Pump Form -->
      <div class="add-pump-form">
        <h2>Add New Pump</h2>
        <form @submit.prevent="addPump">
          <div class="form-group">
            <label for="pumpName">Pump Name</label>
            <input 
              type="text" 
              id="pumpName" 
              v-model="newPump.name" 
              required
              placeholder="Enter pump name"
            >
          </div>
          <div class="form-group">
            <label for="pumpLocation">Location</label>
            <input 
              type="text" 
              id="pumpLocation" 
              v-model="newPump.location" 
              required
              placeholder="Enter pump location"
            >
          </div>
          <div class="form-group">
            <label for="pumpCapacity">Capacity (L/min)</label>
            <input 
              type="number" 
              id="pumpCapacity" 
              v-model="newPump.capacity" 
              required
              min="0"
              step="0.1"
            >
          </div>
          <button type="submit" class="add-button">Add Pump</button>
        </form>
        <p v-if="successMessage" class="success-message">{{ successMessage }}</p>
      </div>

      <!-- Pumps List -->
      <div class="pumps-list">
        <h2>Your Pumps</h2>
        <div class="pump-cards">
          <div v-for="pump in pumps" :key="pump.id" class="pump-card">
            <h3>{{ pump.name }}</h3>
            <p><strong>Location:</strong> {{ pump.location }}</p>
            <p><strong>Capacity:</strong> {{ pump.capacity }} L/min</p>
            <button @click="viewPump(pump.id)" class="view-button">
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BombListView',
  data() {
    return {
      newPump: {
        name: '',
        location: '',
        capacity: ''
      },
      successMessage: ''
    }
  },
  computed: {
    pumps() {
      return this.$store.getters.getUserPumps;
    }
  },
  methods: {
    async addPump() {
      const pump = await this.$store.dispatch('addPump', this.newPump);
      
      // Show success message
      this.successMessage = `Pump "${pump.name}" has been added successfully!`;
      
      // Reset form
      this.newPump = {
        name: '',
        location: '',
        capacity: ''
      };

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    },
    viewPump(pumpId) {
      this.$router.push(`/bombs/${pumpId}`);
    },
    logout() {
      this.$store.dispatch('logout');
      this.$router.push('/login');
    }
  },
  created() {
    if (!this.$store.getters.isAuthenticated) {
      this.$router.push('/login');
    }
  }
}
</script>

<style lang="scss" scoped>
.bomb-list {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    color: #2c3e50;
    margin: 0;
  }
}

.content {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.add-pump-form {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #2c3e50;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;

    &:focus {
      outline: none;
      border-color: #42b983;
    }
  }
}

.pump-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.pump-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 1rem;
    color: #2c3e50;
  }

  p {
    margin: 0.5rem 0;
    color: #666;
  }
}

.add-button, .view-button, .logout-button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button {
  width: 100%;
  background-color: #42b983;
  color: white;

  &:hover {
    background-color: #3aa876;
  }
}

.view-button {
  width: 100%;
  background-color: #3498db;
  color: white;

  &:hover {
    background-color: #2980b9;
  }
}

.logout-button {
  background-color: #e74c3c;
  color: white;

  &:hover {
    background-color: #c0392b;
  }
}

.success-message {
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: #dff0d8;
  color: #3c763d;
  border: 1px solid #d6e9c6;
  border-radius: 4px;
  text-align: center;
}
</style>
