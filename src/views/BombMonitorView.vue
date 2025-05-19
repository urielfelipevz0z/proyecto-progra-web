`<template>
  <div class="bomb-monitor">
    <header class="header">
      <h1>Pump Monitor: {{ pump?.name }}</h1>
      <button @click="goBack" class="back-button">Back to List</button>
    </header>

    <div class="monitor-content" v-if="pump">
      <div class="info-panel">
        <h2>Pump Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Name:</label>
            <span>{{ pump.name }}</span>
          </div>
          <div class="info-item">
            <label>Location:</label>
            <span>{{ pump.location }}</span>
          </div>
          <div class="info-item">
            <label>Capacity:</label>
            <span>{{ pump.capacity }} L/min</span>
          </div>
        </div>
      </div>

      <div class="monitor-panel">
        <h2>Real-time Monitoring</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <h3>Current Flow Rate</h3>
            <div class="metric-value">{{ metrics.flowRate.toFixed(2) }} L/min</div>
            <div class="metric-status" :class="getStatusClass(metrics.flowRate, pump.capacity)">
              {{ getStatusText(metrics.flowRate, pump.capacity) }}
            </div>
          </div>

          <div class="metric-card">
            <h3>Pressure</h3>
            <div class="metric-value">{{ metrics.pressure.toFixed(2) }} PSI</div>
            <div class="metric-status" :class="getPressureStatusClass(metrics.pressure)">
              {{ getPressureStatusText(metrics.pressure) }}
            </div>
          </div>

          <div class="metric-card">
            <h3>Temperature</h3>
            <div class="metric-value">{{ metrics.temperature.toFixed(1) }}°C</div>
            <div class="metric-status" :class="getTemperatureStatusClass(metrics.temperature)">
              {{ getTemperatureStatusText(metrics.temperature) }}
            </div>
          </div>

          <div class="metric-card">
            <h3>Operational Status</h3>
            <div class="metric-value">{{ metrics.isOperating ? 'Running' : 'Stopped' }}</div>
            <div class="metric-status" :class="metrics.isOperating ? 'status-good' : 'status-critical'">
              {{ metrics.isOperating ? 'Active' : 'Inactive' }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="error-message">
      Pump not found
    </div>
  </div>
</template>

<script>
export default {
  name: 'BombMonitorView',
  data() {
    return {
      pump: null,
      metrics: {
        flowRate: 0,
        pressure: 0,
        temperature: 0,
        isOperating: false
      },
      updateInterval: null
    }
  },
  computed: {
    pumps() {
      return this.$store.getters.getUserPumps;
    }
  },
  methods: {
    goBack() {
      this.$router.push('/bombs');
    },
    getStatusClass(current, max) {
      const ratio = current / max;
      if (ratio >= 0.9) return 'status-critical';
      if (ratio >= 0.7) return 'status-warning';
      return 'status-good';
    },
    getStatusText(current, max) {
      const ratio = current / max;
      if (ratio >= 0.9) return 'Critical';
      if (ratio >= 0.7) return 'Warning';
      return 'Normal';
    },
    getPressureStatusClass(pressure) {
      if (pressure > 80) return 'status-critical';
      if (pressure > 60) return 'status-warning';
      return 'status-good';
    },
    getPressureStatusText(pressure) {
      if (pressure > 80) return 'High Pressure';
      if (pressure > 60) return 'Warning';
      return 'Normal';
    },
    getTemperatureStatusClass(temp) {
      if (temp > 75) return 'status-critical';
      if (temp > 60) return 'status-warning';
      return 'status-good';
    },
    getTemperatureStatusText(temp) {
      if (temp > 75) return 'Overheating';
      if (temp > 60) return 'Warning';
      return 'Normal';
    },
    updateMetrics() {
      // Simulate real-time data updates
      this.metrics = {
        flowRate: Math.random() * this.pump.capacity,
        pressure: 40 + Math.random() * 50,
        temperature: 35 + Math.random() * 50,
        isOperating: Math.random() > 0.1 // 90% chance of being operational
      };
    }
  },
  created() {
    if (!this.$store.getters.isAuthenticated) {
      this.$router.push('/login');
      return;
    }

    // Find the pump in the store
    this.pump = this.pumps.find(p => p.id.toString() === this.$route.params.id);

    if (this.pump) {
      // Start updating metrics
      this.updateMetrics();
      this.updateInterval = setInterval(this.updateMetrics, 5000); // Update every 5 seconds
    }
  },
  beforeUnmount() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
</script>

<style lang="scss" scoped>
.bomb-monitor {
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

.monitor-content {
  display: grid;
  gap: 2rem;
}

.info-panel, .monitor-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.info-item {
  label {
    font-weight: bold;
    color: #666;
    margin-right: 0.5rem;
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.metric-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 6px;
  text-align: center;

  h3 {
    color: #2c3e50;
    margin: 0 0 1rem;
    font-size: 1.1rem;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    margin: 0.5rem 0;
  }

  .metric-status {
    display: inline-block;
    padding: 0.25rem 1rem;
    border-radius: 1rem;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.status-good {
  background-color: #d4edda;
  color: #155724;
}

.status-warning {
  background-color: #fff3cd;
  color: #856404;
}

.status-critical {
  background-color: #f8d7da;
  color: #721c24;
}

.back-button {
  padding: 0.75rem 1.5rem;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #5a6268;
  }
}

.error-message {
  text-align: center;
  color: #721c24;
  background-color: #f8d7da;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 2rem;
}
</style>`
