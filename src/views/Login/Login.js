export default {
  name: 'LoginView',
  data() {
    return {
      username: '',
      password: '',
      error: ''
    }
  },
  methods: {
    async handleLogin() {
      if (this.username && this.password) {
        try {
          await this.$store.dispatch('login', {
            username: this.username,
            password: this.password
          });
          this.$router.push('/bombs');
        } catch (error) {
          this.error = 'Login failed. Please try again.';
        }
      } else {
        this.error = 'Please fill in all fields';
      }
    }
  },
  created() {
    if (this.$store.getters.isAuthenticated) {
      this.$router.push('/bombs');
    }
  }
}
