<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h4 class="mb-4">Вход</h4>
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="email" class="form-label">E-Mail</label>
            <input id="email" type="email" class="form-control" v-model="email" required autofocus>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Пароль</label>
            <input id="password" type="password" class="form-control" v-model="password" required>
          </div>
          <button type="submit" class="btn btn-primary">Войти</button>
        </form>
        <div v-if="error" class="alert alert-danger mb-3" role="alert">
            Неверный адрес электронной почты или пароль.
          </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: "",
      password: "",
      error: false
    };
  },
  methods: {
    handleSubmit() {
      if (this.password.length > 0) {
        this.$http.post('http://localhost:3000/login', {
          email: this.email,
          password: this.password
        })
        .then(response => {
          let is_admin = response.data.user.is_admin;
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('jwt', response.data.token);
          if (localStorage.getItem('jwt') != null) {
            this.$emit('loggedIn');
            if (this.$route.params.nextUrl != null) {
              this.$router.push(this.$route.params.nextUrl);
            } else {
              if (is_admin == 1) {
                this.$router.push('admin');
              } else {
                this.$router.push('/');
              }
            }
          }
        }).catch(error => {
          this.error = true; // Устанавливаем состояние ошибки в true
          console.error("Ошибка входа:", error);
        });
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
}

.btn-primary {
  width: 100%;
  margin-top: 20px;
}
.mt-5 {
    margin-top: 7rem !important;
}
</style>
