<template>
  <header>
    <div class="navbar-links">
      <router-link to="/teams" class="nav-link">Список команд</router-link>
      <router-link to="/results" class="nav-link">Список результатов</router-link>
    </div>
    <div class="logo-container" @click="redirectToHome">
      <img src="../assets/logo.png" alt="Logo" class="logo">
      <h1 class="site-title">ФЕДЕРАЦИЯ МНОГОБОРЬЯ АМУРСКОЙ ОБЛАСТИ</h1>
    </div>
    <div class="auth-links">
      <router-link v-if="isAdmin" to="/admin" class="nav-link login">Админ</router-link>
      <router-link v-else="isAdmin" to="/register" class="nav-link login">Регистрация</router-link>
    </div>
    <div class="auth-links">
      <router-link v-if="!currentUser" to="/login" class="nav-link login">Войти</router-link>
      <a v-if="currentUser" class="nav-link logout" @click.prevent="logout">Выйти</a>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      currentUser: null,
      isAdmin: false
    };
  },
  created() {
    this.checkUserStatus();
  },
  methods: {
    checkUserStatus() {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        this.currentUser = true;
        this.isAdmin = user.is_admin === 1;
      } else {
        this.currentUser = false;
        this.isAdmin = false;
      }
    },
    redirectToHome() {
      this.$router.push('/');
    },
    logout() {

      localStorage.removeItem('jwt');
      localStorage.removeItem('user');

      this.currentUser = false;
      this.isAdmin = false;

      this.$router.push('/login');
    }
  },
  watch: {
    '$route'(to, from) {

      this.checkUserStatus();
    }
  }
};
</script>

<style scoped>
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #17033a;
  color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar-links {
  display: flex;
  gap: 1rem;
}

.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 140px;
}

.logo {
  height: 50px;
  margin-right: 10px;
}

.site-title {
  font-size: 1.5rem;
  margin: 0;
  white-space: nowrap;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.nav-link {
  text-decoration: none;
  color: #fff;
  font-weight: bold;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-link:hover {
  color: #f0a500;
}

@media (max-width: 1000px) {
  /* .navbar-links,
  .auth-links {
    display: none;
  } */

  .logo-container {
    margin: auto;
  }

  .logo-container .site-title {
    display: none;
  }
}

@media (max-width: 600px) {
  .logo {
    height: 40px;
  }
  
  header {
    padding: 0.5rem;
  }
}
@media (max-width: 1050px) {
  .logo-container {
  margin-right: 5px;
  margin-left: 5px;
}
}
</style>
