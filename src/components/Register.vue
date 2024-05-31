<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h4 class="mb-4">Регистрация</h4>
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="name" class="form-label">Имя</label>
            <input id="name" type="text" class="form-control" v-model="name" required autofocus>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">E-Mail</label>
            <input id="email" type="email" class="form-control" v-model="email" required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Пароль</label>
            <input id="password" type="password" class="form-control" v-model="password" required>
          </div>
          <div class="mb-3">
            <label for="password-confirm" class="form-label">Подтвердите пароль</label>
            <input id="password-confirm" type="password" class="form-control" v-model="password_confirmation" required>
          </div>
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="confirmCheckbox" v-model="confirmed">
            <label class="form-check-label" for="confirmCheckbox">Нажимая на кнопку, я даю свое <a class="doc-link" @click.prevent="openDocument1">согласие на обработку персональных
              данных</a> и соглашаюсь с условиями <a class="doc-link" @click.prevent="openDocument2">политики конфиденциальности</a></label>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="!confirmed">Зарегистрироваться</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["nextUrl"],
  data() {
    return {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      is_admin: null,
      confirmed: false
    };
  },
  methods: {
    openDocument1() {
      // Редирект на страницу с документом
      this.$router.push('/Consen-processing');
    },
    openDocument2() {
      // Редирект на страницу с документом
      this.$router.push('/Privacy-policy');
    },
    handleSubmit() {
      if (this.password === this.password_confirmation && this.password.length > 0 && this.confirmed) {
        let url = "http://localhost:3000/register";
        if (this.is_admin != null || this.is_admin == 1) url = "http://localhost:3000/register-admin";
        this.$http.post(url, {
            name: this.name,
            email: this.email,
            password: this.password,
            is_admin: this.is_admin
          })
          .then(response => {
            localStorage.setItem('user', JSON.stringify(response.data.user));
            localStorage.setItem('jwt', response.data.token);

            if (localStorage.getItem('jwt') != null) {
              this.$emit('loggedIn');
              if (this.$route.params.nextUrl != null) {
                this.$router.push(this.$route.params.nextUrl);
              } else {
                this.$router.push('/');
              }
            }
          })
          .catch(error => {
            console.error(error);
          });
      } else {
        this.password = "";
        this.passwordConfirm = "";
        alert("Passwords do not match or all fields are not filled");
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
}
.doc-link{
  cursor: pointer;
  color: #007bff;
  text-decoration:none
}
</style>
