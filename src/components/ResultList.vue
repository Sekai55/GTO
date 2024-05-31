<template>
    <div class="container">
      <h2 class="mt-4">Результаты</h2>
      <div class="form-group mt-3">
        <label for="eventSelect">Выберите комплекс:</label>
        <select v-model="selectedEvent" @change="fetchResults" class="form-control" id="eventSelect">
          <option disabled value="">Выберите комплекс</option>
          <option v-for="event in events" :key="event.id" :value="event.id">{{ event.name }}</option>
        </select>
      </div>
      <div v-if="results.length > 0" class="mt-4">
        <div class="form-group">
          <label for="sortSelect">Сортировать по:</label>
          <select v-model="sortBy" @change="sortResults" class="form-control" id="sortSelect">
            <option value="place">Месту</option>
            <option value="name">Названию команды</option>
          </select>
        </div>
        <ul v-if="selectedEvent <= eventsN" class="list-group">
          <li class="list-group-item result-item" v-for="result in sortedResults" :key="result.team_id">
            <span class="team-name">{{ getTeamName(result.team_id) }}</span>
            <span class="result-info">Время: {{ result.time }}, Баллы: {{ result.score }}, Место: {{ result.place }}</span>
          </li>
        </ul>
        <ul v-else class="list-group">
          <li class="list-group-item result-item" v-for="result in sortedResults" :key="result.team_id">
            <span class="team-name">{{ getTeamName(result.team_id) }}</span>
            <span class="result-info">Баллы: {{ result.total_score }}, Место: {{ result.place }}</span>
          </li>
        </ul>
      </div>
      <p v-else class="mt-4">Выберите комплекс для просмотра результатов.</p>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        eventsN: 6,
        events: [],
        teams: {},
        selectedEvent: null,
        results: [],
        sortBy: 'place'
      };
    },
    computed: {
      sortedResults() {
        return this.results.slice().sort((a, b) => {
          if (this.sortBy === 'place') {
            return a.place - b.place;
          } else if (this.sortBy === 'name') {
            const nameA = this.getTeamName(a.team_id).toUpperCase();
            const nameB = this.getTeamName(b.team_id).toUpperCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
          }
        });
      }
    },
    mounted() {
      this.fetchEvents();
      this.fetchTeams();
    },
    methods: {
        fetchEvents() {
    let nextId = 1; // Начальное значение для идентификатора

    // Загрузка данных основной таблицы
    axios.get('http://localhost:3000/events')
        .then(response => {
            this.events = response.data.map(event => ({ ...event, id: nextId++ }));
        })
        .catch(error => {
            console.error('Ошибка при получении мероприятий:', error);
        });

    // Загрузка данных из другой таблицы
    axios.get('http://localhost:3000/groupevent')
        .then(response => {
            const updatedEvents = response.data.map(event => ({ ...event, id: nextId++ }));
            this.events.push(...updatedEvents);
        })
        .catch(error => {
            console.error('Ошибка при получении мероприятий:', error);
        });
},
      fetchTeams() {
        axios.get('http://localhost:3000/teams')
          .then(response => {
            response.data.forEach(team => {
              this.teams[team.id] = team.name;
            });
          })
          .catch(error => {
            console.error('Ошибка при получении команд:', error);
          });
      },
      fetchResults() {
        if (this.selectedEvent) {
            if (this.selectedEvent <= this.eventsN) {
                axios.get(`http://localhost:3000/results/${this.selectedEvent}`)
                    .then(response => {
                    this.results = response.data;
                    })
                    .catch(error => {
                    console.error('Ошибка при получении результатов:', error);
                    });
            }else{
                axios.get(`http://localhost:3000/summary/${this.selectedEvent-this.eventsN}`)
                    .then(response => {
                    this.results = response.data;
                    })
                    .catch(error => {
                    console.error('Ошибка при получении результатов:', error);
                    });
            }
        } else {
          this.results = [];
        }
      },
      getTeamName(teamId) {
        return this.teams[teamId] || 'Unknown Team';
      },
      sortResults() {

      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
    margin: 0 auto;
    margin-top: -50px;
    padding: 20px;
  }
  
  .list-group {
    margin-top: 20px;
  }
  
  .result-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
  }
  
  
  
  .result-info {
    margin-left: 20px;
  }
  
  @media (max-width: 767px) {
    .container {
      padding: 10px;
    }
  }
  </style>
  