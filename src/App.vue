<template>
  <div id="app">
    <SiteHeader />
    <div class="content">
      <router-view/>
    </div>
  </div>
</template>

<script>
import SiteHeader from "@/components/SiteHeader.vue";
export default {
  name: 'App',
  components: {
    SiteHeader
  }
}
</script>

<style>
body {
    display: block;
    margin: 0px;
    height: 1000px;
    background: linear-gradient(45deg, rgb(122, 7, 7), rgb(15, 15, 99));
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #ffffff;
  margin-top: 80px;
  
  
}
.content {
  margin-top: 100px;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 20px;
  flex: 1; /* Занимает всю доступную высоту */
}
</style>
