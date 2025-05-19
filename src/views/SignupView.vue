<template>
  <div class="signup-view">
    <form @submit.prevent="handleSignup" class="signup-form">
      <h2>Create Account</h2>
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          required
          placeholder="Choose a username"
        >
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          required
          placeholder="Enter your email"
        >
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required
          placeholder="Choose a password"
          minlength="6"
        >
      </div>
      <div class="form-group">
        <label for="confirmPassword">Confirm Password</label>
        <input 
          type="password" 
          id="confirmPassword" 
          v-model="confirmPassword" 
          required
          placeholder="Confirm your password"
          minlength="6"
        >
      </div>
      <button type="submit" class="signup-button">Sign Up</button>
      <p v-if="error" class="error">{{ error }}</p>
      <p class="login-link">
        Already have an account? 
        <router-link to="/login">Log in</router-link>
      </p>
    </form>
  </div>
</template>

<script>
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
</script>

<style lang="scss" scoped>
.signup-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.signup-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;

  h2 {
    text-align: center;
    margin-bottom: 2rem;
    color: #2c3e50;
  }
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

.signup-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3aa876;
  }
}

.error {
  color: #dc3545;
  text-align: center;
  margin-top: 1rem;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
  color: #6c757d;

  a {
    color: #42b983;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
