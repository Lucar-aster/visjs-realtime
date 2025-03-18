const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permette connessioni da qualsiasi origine
    methods: ["GET", "POST"]
  }
});

let events = [
  { id: 1, content: "Evento 1", start: "2025-03-01" },
  { id: 2, content: "Evento 2", start: "2025-03-15" },
  { id: 3, content: "Evento 3", start: "2025-03-30" }
];

io.on('connection', (socket) => {
  console.log("Un utente si è connesso");

  // Invia gli eventi esistenti al nuovo utente
  socket.emit('loadEvents', events);

  // Ascolta quando un utente aggiunge/modifica un evento
  socket.on('updateEvents', (updatedEvents) => {
    events = updatedEvents;
    io.emit('loadEvents', events); // Aggiorna tutti i client
  });

  socket.on('disconnect', () => {
    console.log("Un utente si è disconnesso");
  });
});

server.listen(3000, () => {
  console.log('Server in ascolto su http://localhost:3000');
});
