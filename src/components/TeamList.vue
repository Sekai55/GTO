<template>
    <div class="teams-container">
      <h2 class="teams-title">Список команд</h2>
      <ul class="teams-list">
        <li v-for="team in teams" :key="team.id" class="team-item">{{ team.name }}</li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        teams: []
      };
    },
    mounted() {
      this.fetchTeams();
    },
    methods: {
      fetchTeams() {
        axios.get('http://localhost:3000/teams')
          .then(response => {
            this.teams = response.data;
          })
          .catch(error => {
            console.error('Ошибка при получении списка команд:', error);
          });
      }
    }
  };
  </script>

<style scoped>
.teams-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.teams-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.teams-list {
  list-style-type: none;
  padding: 0;
}

.team-item {
  font-size: 18px;
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
}

.team-item:last-child {
  border-bottom: none;
}

.team-item:hover {
  background-color: #17334f;
  cursor: pointer;
}
</style>