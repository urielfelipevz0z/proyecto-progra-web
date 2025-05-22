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
        powerRating: '', // en kW
        voltage: '', // en V
        current: '', // en A
        maxPressure: '', // en PSI
        minPressure: '', // en PSI
        efficiency: '', // en %
        maintenanceInterval: '', // en días
        lastMaintenance: ''
      },
      successMessage: '',
      showDeleteModal: false,
      pumpToDelete: null
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
    },
    confirmDelete(pump) {
      this.pumpToDelete = pump;
      this.showDeleteModal = true;
    },
    async handleDelete() {
      if (!this.pumpToDelete) return;
      
      try {
        await this.$store.dispatch('deletePump', this.pumpToDelete.id);
        this.successMessage = `Pump "${this.pumpToDelete.name}" has been deleted successfully!`;
        
        // Limpiar el modal
        this.showDeleteModal = false;
        this.pumpToDelete = null;

        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      } catch (error) {
        this.error = error.message;
      }
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.pumpToDelete = null;
    }
  },
  created() {
    if (!this.$store.getters.isAuthenticated) {
      this.$router.push('/login');
    }
  }
}
