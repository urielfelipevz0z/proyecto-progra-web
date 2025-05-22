import LineChart from '../../components/LineChart.vue';
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
