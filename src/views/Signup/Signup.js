export default {
  name: 'SignupView',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: ''
    }
  },
  methods: {
    async handleSignup() {
      // Validaciones básicas
      if (!this.username || !this.email || !this.password || !this.confirmPassword) {
        this.error = 'Please fill in all fields';
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      if (this.password.length < 6) {
        this.error = 'Password must be at least 6 characters long';
        return;
      }

      try {
        await this.$store.dispatch('signup', {
          username: this.username,
          email: this.email,
          password: this.password
        });
        this.$router.push('/bombs');
      } catch (error) {
        this.error = error.message || 'Registration failed. Please try again.';
      }
    }
  },
  created() {
    if (this.$store.getters.isAuthenticated) {
      this.$router.push('/bombs');
    }
  }
}
