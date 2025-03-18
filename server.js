const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs'); // Per leggere/scrivere su file

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permette connessioni da qualsiasi origine
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const path = './events.json'; // Percorso del file dove salviamo gli eventi

// Carica gli eventi dal file
let events = [];
if (fs.existsSync(path)) {
  const fileData = fs.readFileSync(path);
  events = JSON.parse(fileData);
} else {
  events = []; // Se non esiste il file, inizializza con un array vuoto
}

// Funzione per salvare gli eventi nel file
function saveEventsToFile() {
  fs.writeFileSync(path, JSON.stringify(events, null, 2)); // Salva come JSON formattato
}

io.on('connection', (socket) => {
  console.log("Un utente si è connesso");

  // Invia gli eventi esistenti al nuovo utente
  socket.emit('loadEvents', events);

  // Ascolta quando un utente aggiunge o modifica un evento
  socket.on('updateEvents', (updatedEvents) => {
    events = updatedEvents; // Aggiorna gli eventi
    saveEventsToFile(); // Salva nel file
    io.emit('loadEvents', events); // Invia gli eventi aggiornati a tutti i client
  });

  socket.on('disconnect', () => {
    console.log("Un utente si è disconnesso");
  });
});

server.listen(PORT, () => {
  console.log(`Server in ascolto sulla porta ${PORT}`);
});
