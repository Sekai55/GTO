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
      <b-table :items="results" :fields="fields">
        <template #cell(teamName)="data">
          <span>{{ getTeamName(data.item.team_id) }}</span>
        </template>
        <template #cell(time)="data">
          <b-form-input v-if="data.item.isEdit && selectedCell === 'time'" type="text" v-model="data.item.time"></b-form-input>
          <span v-else @click="editCellHandler(data, 'time')">{{ data.value }}</span>
        </template>
        <template #cell(score)="data">
          <b-form-input v-if="data.item.isEdit && selectedCell === 'score'" type="number" v-model="data.item.score" @change="calculatePlaces"></b-form-input>
          <span v-else @click="editCellHandler(data, 'score')">{{ data.value }}</span>
        </template>
        <template #cell(place)="data">
          <span>{{ data.value }}</span>
        </template>
      </b-table>
      <button @click="saveResults" class="btn btn-primary mt-4">Сохранить</button>
      <!-- <ul class="list-group mt-4">
        <li class="list-group-item result-item" v-for="result in results" :key="result.team_id">
          <span class="team-name">{{ getTeamName(result.team_id) }}</span>
          <span class="result-info">Время: {{ result.time }}, Баллы: {{ result.score }}, Место: {{ result.place }}</span>
        </li>
      </ul> -->
    </div>
    <p v-else class="mt-4">Выберите комплекс для просмотра результатов.</p>
  </div>
</template>

<script>
import axios from 'axios';
import { BTable, BFormInput } from 'bootstrap-vue';

export default {
  components: {
    BTable,
    BFormInput
  },
  data() {
    return {
      events: [],
      teams: {},
      selectedEvent: null,
      results: [],
      selectedCell: null,
      fields: [
        { key: 'teamName', label: 'Команда' },
        { key: 'time', label: 'Время' },
        { key: 'score', label: 'Баллы' },
        { key: 'place', label: 'Место' },
        { key: 'edit', label: '' }
      ]
    };
  },
  mounted() {
    this.fetchEvents();
    this.fetchTeams();
  },
  methods: {
    fetchEvents() {
      let nextId = 1;

      axios.get('http://localhost:3000/events')
        .then(response => {
          this.events = response.data.map(event => ({ ...event, id: nextId++ }));
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
        axios.get(`http://localhost:3000/results/${this.selectedEvent}`)
          .then(response => {
            this.results = response.data.map(result => ({ ...result, isEdit: false }));
            this.calculatePlaces();
          })
          .catch(error => {
            console.error('Ошибка при получении результатов:', error);
          });
      } else {
        this.results = [];
      }
    },
    getTeamName(teamId) {
      return this.teams[teamId] || 'Unknown Team';
    },
    editCellHandler(data, name) {
      this.results.forEach(item => item.isEdit = false);
      this.results[data.index].isEdit = true;
      this.selectedCell = name;
    },
    calculatePlaces() {
      this.results.sort((a, b) => b.score - a.score);
      let currentPlace = 1;
      for (let i = 0; i < this.results.length; i++) {
        if (i > 0 && this.results[i].score === this.results[i - 1].score) {
          this.results[i].place = this.results[i - 1].place;
        } else {
          this.results[i].place = currentPlace;
        }
        currentPlace++;
      }
    },
    saveResults() {
      const resultsToSend = this.results.map(result => ({ ...result, score: Number(result.score) }));
      axios.post(`http://localhost:3000/results/${this.selectedEvent}`, { results: resultsToSend })
      .then(response => {
        console.log('Results saved successfully:', { results: resultsToSend });
        alert('Results saved successfully');
      })
      .catch(error => {
        console.error('Ошибка при сохранении результатов:', error);
        alert('Ошибка при сохранении результатов');
      });
    }
  }
};
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
