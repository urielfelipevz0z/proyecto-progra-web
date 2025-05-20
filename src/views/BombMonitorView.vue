<template>
  <div class="bomb-monitor">
    <header class="header">
      <div class="header-left">
        <button @click="goBack" class="back-button">
          Back
        </button>
        <h1>Pump Monitor: {{ pump?.name }}</h1>
      </div>
      <div class="header-right">
        <div class="operational-badge" :class="metrics.isOperating ? 'operational' : 'stopped'">
          {{ metrics.isOperating ? 'Operational' : 'Stopped' }}
        </div>
      </div>
    </header>

    <div class="monitor-content" v-if="pump">
      <div class="info-sections">
        <!-- Basic Information Panel -->
        <div class="info-panel basic-info">
          <div class="panel-header">
            <h2>Basic Information</h2>
            <span class="last-updated">Last updated: {{ lastUpdated }}</span>
          </div>
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
              <label>Manufacturer:</label>
              <span>{{ pump.manufacturer }}</span>
            </div>
            <div class="info-item">
              <label>Model:</label>
              <span>{{ pump.model }}</span>
            </div>
          </div>
        </div>

        <!-- Technical Specifications Panel -->
        <div class="info-panel technical-specs">
          <div class="panel-header">
            <h2>Technical Specifications</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Nominal Capacity:</label>
              <span>{{ pump.capacity }} L/min</span>
            </div>
            <div class="info-item">
              <label>Power Rating:</label>
              <span>{{ pump.powerRating }} kW</span>
            </div>
            <div class="info-item">
              <label>Voltage:</label>
              <span>{{ pump.voltage }} V</span>
            </div>
            <div class="info-item">
              <label>Current:</label>
              <span>{{ pump.current }} A</span>
            </div>
            <div class="info-item">
              <label>Efficiency:</label>
              <span>{{ pump.efficiency }}%</span>
            </div>
          </div>
        </div>

        <!-- Maintenance Panel -->
        <div class="info-panel maintenance-info">
          <div class="panel-header">
            <h2>Maintenance Information</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <label>Installation Date:</label>
              <span>{{ formatDate(pump.installationDate) }}</span>
            </div>
            <div class="info-item">
              <label>Last Maintenance:</label>
              <span>{{ formatDate(pump.lastMaintenance) }}</span>
            </div>
            <div class="info-item">
              <label>Next Maintenance:</label>
              <span>{{ calculateNextMaintenance }}</span>
            </div>
            <div class="info-item maintenance-status">
              <label>Status:</label>
              <span :class="getMaintenanceStatusClass">
                {{ daysUntilMaintenance }} days until next maintenance
              </span>
            </div>
          </div>
        </div>

        <!-- Performance Monitor Panel -->
        <div class="info-panel performance-monitor">
          <div class="panel-header">
            <div class="header-content">
              <h2>Real-time Performance</h2>
              <span class="last-updated">Last updated: {{ lastUpdated }}</span>
            </div>
          </div>

          <div class="metrics-grid">
            <div v-for="(metric, index) in displayMetrics" :key="index" 
                 class="metric-card" :class="[metric.statusClass, { 'warning': metric.status === 'Warning' }]">
              <div class="metric-header">
                <h3>{{ metric.title }}</h3>
                <div class="metric-status-badge" :class="metric.statusClass">
                  {{ metric.status }}
                </div>
              </div>
              
              <div class="metric-content">
                <div class="metric-info">
                  <div class="metric-value">{{ metric.value }}</div>
                  <div class="metric-details">
                    <div class="metric-range" v-if="metric.range">
                      <span>Range: {{ metric.range }}</span>
                    </div>
                    <div class="metric-trend" v-if="metric.trend">
                      <span :class="metric.trend.direction">
                        {{ metric.trend.value }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div class="metric-chart">
                  <div class="chart-container">
                    <LineChart 
                      v-if="metric.history && metric.history.length > 0"
                      :chartData="{
                        labels: metric.history.map(h => h.time),
                        datasets: [{
                          label: metric.title,
                          data: metric.history.map(h => h.value),
                          borderColor: '#42b983',
                          tension: 0.1,
                          fill: false,
                          pointRadius: 2,
                          borderWidth: 2
                        }]
                      }"
                      :chartOptions="chartOptions"
                      class="chart"
                    />
                    <div v-else class="no-data">
                      Collecting data...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>  
  </div>
</template>

<script>
import LineChart from '../components/LineChart.vue';
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default {
  name: 'BombMonitorView',
  components: {
    LineChart
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();

    const pump = ref(null);
    const metrics = ref({
      flowRate: 0,
      pressure: 0,
      temperature: 0,
      isOperating: false,
      powerConsumption: 0,
      currentEfficiency: 0
    });
    const metricsHistory = ref({
      flowRate: [],
      powerConsumption: [],
      temperature: [],
      currentEfficiency: []
    });
    const maxHistoryLength = 20;
    const updateInterval = ref(null);
    const showTechnicalDetails = ref(false);
    const showMaintenanceModal = ref(false);
    const maintenanceDate = ref('');
    const maintenanceNotes = ref('');
    const refreshInterval = ref('4000');
    const lastUpdated = ref(new Date().toLocaleTimeString());
    const displayMetrics = ref([]);
    
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 500
      },
      elements: {
        line: {
          borderWidth: 2,
          tension: 0.1
        },
        point: {
          radius: 0,
          hoverRadius: 4
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#666',
            font: {
              size: 10
            }
          },
          grid: {
            color: '#f0f0f0'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            display: true,
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 5,
            color: '#666',
            font: {
              size: 10
            }
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          titleColor: '#2c3e50',
          bodyColor: '#2c3e50',
          borderColor: '#ddd',
          borderWidth: 1,
          padding: 8,
          boxPadding: 4,
          usePointStyle: true,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += context.parsed.y.toFixed(2);
              }
              return label;
            }
          }
        }
      }
    };

    function getChartData(history, label) {
      if (!Array.isArray(history) || history.length === 0) {
        return {
          labels: [],
          datasets: [{
            label,
            data: [],
            fill: false,
            borderColor: '#42b983',
            tension: 0.1,
            pointRadius: 2,
            borderWidth: 2
          }]
        };
      }

      const times = history.map(h => h.time);
      const values = history.map(h => h.value);

      return {
        labels: times,
        datasets: [
          {
            label,
            data: values,
            fill: false,
            borderColor: '#42b983',
            tension: 0.1,
            pointRadius: 2,
            borderWidth: 2
          }
        ]
      };
    }

    function updateMetrics() {
      const efficiency = Number(pump.value?.efficiency || 0);
      const timestamp = new Date().toLocaleTimeString();

      // Make sure metricsHistory is properly initialized
      if (!metricsHistory.value) {
        metricsHistory.value = {
          flowRate: [],
          powerConsumption: [],
          temperature: [],
          currentEfficiency: []
        };
      }

      // Generate new metrics
      const newMetrics = {
        flowRate: Math.random() * (pump.value?.capacity || 100),
        pressure: (pump.value?.minPressure || 0) + Math.random() * ((pump.value?.maxPressure || 100) - (pump.value?.minPressure || 0)),
        temperature: 35 + Math.random() * 50,
        isOperating: Math.random() > 0.1,
        powerConsumption: (pump.value?.powerRating || 10) * (0.7 + Math.random() * 0.3),
        currentEfficiency: efficiency * (0.85 + Math.random() * 0.15)
      };

      // Update current metrics
      metrics.value = newMetrics;

      // Update history for each metric
      ['flowRate', 'powerConsumption', 'temperature', 'currentEfficiency'].forEach(key => {
        if (!Array.isArray(metricsHistory.value[key])) {
          metricsHistory.value[key] = [];
        }

        metricsHistory.value[key].push({
          value: newMetrics[key],
          time: timestamp
        });

        // Keep only the last maxHistoryLength points
        if (metricsHistory.value[key].length > maxHistoryLength) {
          metricsHistory.value[key].shift();
        }
      });

      // Force Vue to update the charts
      metricsHistory.value = { ...metricsHistory.value };
      updateDisplayMetrics();
    }

    function updateDisplayMetrics() {
      const getTrend = (current, history) => {
        if (!Array.isArray(history) || history.length < 2) return null;
        const previous = history[history.length - 2]?.value || 0;
        const diff = ((current - previous) / previous * 100).toFixed(1);
        return {
          direction: current > previous ? 'up' : 'down',
          value: `${Math.abs(diff)}% ${current > previous ? '↑' : '↓'}`
        };
      };

      displayMetrics.value = [
        {
          title: 'Flow Rate',
          value: `${metrics.value.flowRate.toFixed(2)} L/min`,
          status: getStatusText(metrics.value.flowRate, pump.value?.capacity),
          statusClass: getStatusClass(metrics.value.flowRate, pump.value?.capacity),
          history: metricsHistory.value.flowRate,
          range: `0 - ${pump.value?.capacity} L/min`,
          trend: getTrend(metrics.value.flowRate, metricsHistory.value.flowRate)
        },
        {
          title: 'Power Consumption',
          value: `${metrics.value.powerConsumption.toFixed(2)} kW`,
          status: getPowerStatusText(metrics.value.powerConsumption),
          statusClass: getPowerStatusClass(metrics.value.powerConsumption),
          history: metricsHistory.value.powerConsumption,
          range: `0 - ${pump.value?.powerRating} kW`,
          trend: getTrend(metrics.value.powerConsumption, metricsHistory.value.powerConsumption)
        },
        {
          title: 'Temperature',
          value: `${metrics.value.temperature.toFixed(1)}°C`,
          status: getTemperatureStatusText(metrics.value.temperature),
          statusClass: getTemperatureStatusClass(metrics.value.temperature),
          history: metricsHistory.value.temperature,
          range: '35°C - 85°C',
          trend: getTrend(metrics.value.temperature, metricsHistory.value.temperature)
        },
        {
          title: 'Operating Efficiency',
          value: `${metrics.value.currentEfficiency.toFixed(1)}%`,
          status: getEfficiencyStatusText(metrics.value.currentEfficiency),
          statusClass: getEfficiencyStatusClass(metrics.value.currentEfficiency),
          history: metricsHistory.value.currentEfficiency,
          range: '0% - 100%',
          trend: getTrend(metrics.value.currentEfficiency, metricsHistory.value.currentEfficiency)
        }
      ];
      lastUpdated.value = new Date().toLocaleTimeString();
    }

    function updateMetricsWithInterval() {
      if (updateInterval.value) {
        clearInterval(updateInterval.value);
      }
      updateMetrics();
      updateInterval.value = setInterval(() => {
        updateMetrics();
      }, Number(refreshInterval.value));
    }

    // Status helper functions
    const getStatusClass = (current, max) => {
      const ratio = current / (max || 100);
      if (ratio >= 0.9) return 'status-critical';
      if (ratio >= 0.7) return 'status-warning';
      return 'status-good';
    };

    const getStatusText = (current, max) => {
      const ratio = current / (max || 100);
      if (ratio >= 0.9) return 'Critical';
      if (ratio >= 0.7) return 'Warning';
      return 'Normal';
    };

    const getPowerStatusClass = (power) => {
      const ratio = power / (pump.value?.powerRating || 100);
      if (ratio > 0.95) return 'status-critical';
      if (ratio > 0.85) return 'status-warning';
      return 'status-good';
    };

    const getPowerStatusText = (power) => {
      const ratio = power / (pump.value?.powerRating || 100);
      if (ratio > 0.95) return 'High Power Usage';
      if (ratio > 0.85) return 'Warning';
      return 'Normal';
    };

    const getTemperatureStatusClass = (temp) => {
      if (temp > 75) return 'status-critical';
      if (temp > 60) return 'status-warning';
      return 'status-good';
    };

    const getTemperatureStatusText = (temp) => {
      if (temp > 75) return 'Overheating';
      if (temp > 60) return 'Warning';
      return 'Normal';
    };

    const getEfficiencyStatusClass = (efficiency) => {
      if (efficiency < 70) return 'status-critical';
      if (efficiency < 85) return 'status-warning';
      return 'status-good';
    };

    const getEfficiencyStatusText = (efficiency) => {
      if (efficiency < 70) return 'Low Efficiency';
      if (efficiency < 85) return 'Moderate';
      return 'Optimal';
    };

    const goBack = () => {
      router.push('/bombs');
    };

    // Date formatting and maintenance functions
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString();
    };

    const calculateNextMaintenance = computed(() => {
      if (!pump.value?.lastMaintenance || !pump.value?.maintenanceInterval) return 'N/A';
      const lastMaintenance = new Date(pump.value.lastMaintenance);
      const nextMaintenance = new Date(lastMaintenance);
      nextMaintenance.setDate(nextMaintenance.getDate() + Number(pump.value.maintenanceInterval));
      return formatDate(nextMaintenance);
    });

    const daysUntilMaintenance = computed(() => {
      if (!pump.value?.lastMaintenance || !pump.value?.maintenanceInterval) return 0;
      const nextMaintenance = new Date(pump.value.lastMaintenance);
      nextMaintenance.setDate(nextMaintenance.getDate() + Number(pump.value.maintenanceInterval));
      const today = new Date();
      const diffTime = nextMaintenance - today;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });

    const getMaintenanceStatusClass = computed(() => {
      const days = daysUntilMaintenance.value;
      if (days < 0) return 'status-critical';
      if (days < 7) return 'status-warning';
      return 'status-good';
    });

    const today = computed(() => {
      return new Date().toISOString().split('T')[0];
    });

    const scheduleMaintenance = () => {
      showMaintenanceModal.value = true;
    };

    const saveMaintenanceSchedule = () => {
      // TODO: Implement maintenance scheduling logic
      showMaintenanceModal.value = false;
    };

    onMounted(() => {
      // Get the pump ID from the route
      const pumpId = route.params.id;
      // Find the pump in the store
      pump.value = store.getters.getUserPumps.find(p => p.id.toString() === pumpId);

      if (!pump.value) {
        router.push('/bombs');
        return;
      }

      // Start monitoring when component is mounted
      updateMetricsWithInterval();
    });

    onBeforeUnmount(() => {
      // Clean up interval when component is unmounted
      if (updateInterval.value) {
        clearInterval(updateInterval.value);
      }
    });

    return {
      pump,
      metrics,
      metricsHistory,
      showTechnicalDetails,
      showMaintenanceModal,
      maintenanceDate,
      maintenanceNotes,
      refreshInterval,
      lastUpdated,
      displayMetrics,
      chartOptions,
      getChartData,
      updateMetrics,
      updateMetricsWithInterval,
      getStatusClass,
      getStatusText,
      getPowerStatusClass,
      getPowerStatusText,
      getTemperatureStatusClass,
      getTemperatureStatusText,
      getEfficiencyStatusClass,
      getEfficiencyStatusText,
      goBack,
      formatDate,
      calculateNextMaintenance,
      daysUntilMaintenance,
      getMaintenanceStatusClass,
      today,
      scheduleMaintenance,
      saveMaintenanceSchedule
    };
  }
};
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

  &-left {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  &-right {
    display: flex;
    align-items: center;
  }

  h1 {
    margin: 0;
    color: #2c3e50;
  }
}

.back-button {
  background-color: #0b5d38;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #36a76a;
  }
}

.operational-badge {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-weight: 500;
  
  &.operational {
    background-color: #d4edda;
    color: #155724;
  }
  
  &.stopped {
    background-color: #f8d7da;
    color: #721c24;
  }
}

.monitor-content {
  display: grid;
  gap: 2rem;
}

.info-sections {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.info-panel {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.toggle-details {
  cursor: pointer;
  color: #42b983;
  font-size: 0.9rem;
  
  &:hover {
    text-decoration: underline;
  }
}

.info-grid {
  display: grid;
  gap: 1rem;

  &.expanded {
    .info-item {
      padding: 1rem 0;
    }
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }

  label {
    font-weight: 500;
    color: #6c757d;
  }

  span {
    color: #2c3e50;
  }
}

.performance-monitor {
  .panel-header {
    .header-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  }
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.metric-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &.status-critical {
    border-left: 4px solid #dc3545;
  }

  &.status-warning {
    border-left: 4px solid #ffc107;
  }

  &.status-good {
    border-left: 4px solid #28a745;
  }
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  h3 {
    color: #2c3e50;
    margin: 0;
    font-size: 1.1rem;
  }
}

.metric-status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  font-weight: 500;

  &.status-critical {
    background-color: #dc354522;
    color: #dc3545;
  }

  &.status-warning {
    background-color: #ffc10722;
    color: #ffc107;
  }

  &.status-good {
    background-color: #28a74522;
    color: #28a745;
  }
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.metric-info {
  text-align: left;
}

.metric-value {
  font-size: 2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0.5rem 0;
}

.metric-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #666;
}

.metric-range {
  color: #666;
}

.metric-trend {
  span {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 500;

    &.up {
      background-color: #28a74522;
      color: #28a745;
    }

    &.down {
      background-color: #dc354522;
      color: #dc3545;
    }
  }
}

.metric-chart {
  height: 120px;
  position: relative;
  background-color: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;

  .chart-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chart {
    width: 100% !important;
    height: 100% !important;
  }
}

.refresh-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  label {
    color: #666;
    font-size: 0.9rem;
  }
  
  select {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    border: 1px solid #ddd;
    background-color: white;
    color: #2c3e50;
    font-size: 0.9rem;
    
    &:focus {
      outline: none;
      border-color: #42b983;
    }
  }
}

.last-updated {
  font-size: 0.8rem;
  color: #666;
}

.error-message {
  text-align: center;
  color: #721c24;
  background-color: #f8d7da;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 2rem;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  font-size: 0.9rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>
