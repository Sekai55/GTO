"use strict";
const sqlite3 = require('sqlite3').verbose();

class Db {
  constructor(file) {
    this.db = new sqlite3.Database(file);
    this.createTables();
  }

  createTables() {
    const userTable = `
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY, 
        name TEXT, 
        email TEXT UNIQUE, 
        user_pass TEXT,
        is_admin INTEGER)`;

    const teamTable = `
      CREATE TABLE IF NOT EXISTS team (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE)`;

    const eventTable = `
      CREATE TABLE IF NOT EXISTS event (
        id INTEGER PRIMARY KEY,
        name TEXT)`;

    const resultTable = `
      CREATE TABLE IF NOT EXISTS result (
        id INTEGER PRIMARY KEY,
        team_id INTEGER,
        event_id INTEGER,
        time TEXT,
        score REAL,
        place INTEGER,
        FOREIGN KEY (team_id) REFERENCES team(id),
        FOREIGN KEY (event_id) REFERENCES event(id))`;

    const eventGroupNamesTable = `
      CREATE TABLE IF NOT EXISTS event_group_names (
        id INTEGER PRIMARY KEY,
        name TEXT UNIQUE
      )`;

    const summaryTable = `
      CREATE TABLE IF NOT EXISTS summary (
        id INTEGER PRIMARY KEY,
        team_id INTEGER,
        event_group_id INTEGER,
        total_score REAL,
        place INTEGER,
        FOREIGN KEY (team_id) REFERENCES team(id),
        FOREIGN KEY (event_group_id) REFERENCES event_group_names(id),
        CONSTRAINT unique_team_event_group UNIQUE (team_id, event_group_id)
    );`;

    this.db.serialize(() => {
      this.db.run(userTable);
      this.db.run(teamTable);
      this.db.run(eventTable);
      this.db.run(resultTable);
      this.db.run(eventGroupNamesTable);
      this.db.run(summaryTable);
    });
  }

  insertOrUpdateSummary(teamId, eventGroupId, totalScore, place, callback) {
    return this.db.run(
      `INSERT INTO summary (team_id, event_group_id, total_score, place)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(team_id, event_group_id) DO UPDATE SET
       total_score = excluded.total_score,
       place = excluded.place`,
      [teamId, eventGroupId, totalScore, place],
      (err) => {
        callback(err);
      }
    );
  }

  selectSummary(callback) {
    return this.db.all(`SELECT * FROM summary`, function(err, rows) {
      callback(err, rows);
    });
  }

  updateSummary(callback) {
    const eventGroups = [
      [1, 2],
      [1, 2, 3],
      [1, 2, 3, 4],
      [5, 6],
      'ALL'
    ];

    this.db.serialize(() => {
      const processNextGroup = (index) => {
        if (index >= eventGroups.length) {
          callback(null);
          return;
        }

        const eventGroup = eventGroups[index];
        let query;
        if (eventGroup === 'ALL') {
          query = `
            SELECT team_id, SUM(score) as total_score
            FROM result
            GROUP BY team_id
            ORDER BY total_score DESC`;
        } else {
          const placeholders = eventGroup.map(() => '?').join(',');
          query = `
            SELECT team_id, SUM(score) as total_score
            FROM result
            WHERE event_id IN (${placeholders})
            GROUP BY team_id
            ORDER BY total_score DESC`;
        }

        this.db.all(query, eventGroup === 'ALL' ? [] : eventGroup, (err, rows) => {
          if (err) {
            callback(err);
            return;
          }

          let place = 1;
          const updateNext = () => {
            if (rows.length === 0) {
              processNextGroup(index + 1);
              return;
            }

            const { team_id, total_score } = rows.shift();
            const groupString = eventGroup === 'ALL' ? 'ALL' : eventGroup.join(', ');
            this.insertOrUpdateSummary(team_id, index + 1, total_score, place, (err) => {
              if (err) {
                callback(err);
                return;
              }
              place++;
              updateNext();
            });
          };

          updateNext();
        });
      };

      processNextGroup(0);
    });
  }

  selectByEmail(email, callback) {
    return this.db.get(
      `SELECT * FROM user WHERE email = ?`,
      [email], function(err, row) {
        callback(err, row);
      });
  }

  insertAdmin(user, callback) {
    return this.db.run(
      'INSERT INTO user (name, email, user_pass, is_admin) VALUES (?, ?, ?, ?)',
      user, (err) => {
        callback(err);
      });
  }

  selectAll(callback) {
    return this.db.all(`SELECT * FROM user`, function(err, rows) {
      callback(err, rows);
    });
  }

  insert(user, callback) {
    return this.db.run(
      'INSERT INTO user (name, email, user_pass) VALUES (?, ?, ?)',
      user, (err) => {
        callback(err);
      });
  }

  insertTeam(team, callback) {
    return this.db.run(
      'INSERT INTO team (name) VALUES (?)',
      [team], (err) => {
        callback(err);
      });
  }

  insertEvent(event, callback) {
    return this.db.run(
      'INSERT INTO event (name) VALUES (?)',
      [event], (err) => {
        callback(err);
      });
  }

  insertResult(result, callback) {
    return this.db.run(
      'INSERT INTO result (team_id, event_id, time, score, place) VALUES (?, ?, ?, ?, ?)',
      result, (err) => {
        callback(err);
      });
  }

  updateResult(result, callback) {
    return this.db.run(
      `UPDATE result 
       SET time = ?, score = ?, place = ?
       WHERE id = ?`,
      [result.time, result.score, result.place, result.id],
      (err) => {
        callback(err);
      }
    );
  }

  selectAllUsers(callback) {
    return this.db.all(`SELECT * FROM user`, function(err, rows) {
      callback(err, rows);
    });
  }

  selectAllTeams(callback) {
    return this.db.all(`SELECT * FROM team`, function(err, rows) {
      callback(err, rows);
    });
  }

  selectAllEvents(callback) {
    return this.db.all(`SELECT * FROM event`, function(err, rows) {
      callback(err, rows);
    });
  }

  selectAllEventGroupNames(callback) {
    return this.db.all(`SELECT * FROM event_group_names`, function(err, rows) {
      callback(err, rows);
    });
  }

  selectResultsByTeam(teamId, callback) {
    return this.db.all(
      `SELECT * FROM result WHERE team_id = ?`,
      [teamId], function(err, rows) {
        callback(err, rows);
      });
  }

  selectResultsByEvent(eventId, callback) {
    return this.db.all(
      `SELECT * FROM result WHERE event_id = ?`,
      [eventId], function(err, rows) {
        callback(err, rows);
      });
  }
  selectSummaryByEvent(eventGroupId, callback) {
    return this.db.all(
      `SELECT * FROM summary WHERE event_group_id = ?`,
      [eventGroupId], function(err, rows) {
        callback(err, rows);
      });
  }
}

module.exports = Db;
