<template>
  <div class="login-view">
    <form @submit.prevent="handleLogin" class="login-form">
      <h2>Login</h2>
      <div class="form-group">
        <label for="username">Username</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          required
          placeholder="Enter username"
        >
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          required
          placeholder="Enter password"
        >
      </div>
      <button type="submit" class="login-button">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script>
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
</script>

<style lang="scss" scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
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

.login-button {
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
</style>
