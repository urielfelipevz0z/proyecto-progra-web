<template>
  <Line
    :data="chartData"
    :options="chartOptions"
  />
</template>

<script>
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default {
  name: 'LineChart',
  components: {
    Line
  },
  props: {
    chartData: {
      type: Object,
      required: true
    },
    chartOptions: {
      type: Object,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#666',
              font: { size: 10 }
            },
            grid: { color: '#f0f0f0' }
          },
          x: {
            grid: { display: false },
            ticks: {
              display: true,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 5,
              color: '#666',
              font: { size: 10 }
            }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            titleColor: '#2c3e50',
            bodyColor: '#2c3e50',
            borderColor: '#ddd',
            borderWidth: 1
          }
        }
      })
    }
  }
}
</script>
