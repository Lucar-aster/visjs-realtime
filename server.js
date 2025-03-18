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

const PORT = process.env.PORT || 10000;
const path = '/events.json'; // Percorso del file dove salviamo gli eventi

// Funzione per caricare gli eventi dal file JSON
function loadEventsFromFile() {
  try {
    if (fs.existsSync(path)) {
      const fileData = fs.readFileSync(path, 'utf8');
      // Se il file è vuoto o non valido, restituisce un array vuoto
      return fileData ? JSON.parse(fileData) : [];
    }
  } catch (error) {
    console.error("Errore durante la lettura del file JSON:", error);
  }
  return []; // Restituisce un array vuoto se non c'è il file o se è vuoto
}

// Carica gli eventi all'avvio del server
let events = loadEventsFromFile();

// Funzione per salvare gli eventi nel file
function saveEventsToFile() {
  try {
    fs.writeFileSync(path, JSON.stringify(events, null, 2)); // Salva come JSON formattato
    console.log('File events.json aggiornato'); // Log per verificare che il file venga aggiornato
  } catch (error) {
    console.error("Errore durante il salvataggio del file JSON:", error);
  }
}

io.on('connection', (socket) => {
  console.log("Un utente si è connesso");

  // Invia gli eventi esistenti al nuovo utente
  socket.emit('loadEvents', events);

  // Ascolta quando un utente aggiunge o modifica un evento
  socket.on('updateEvents', (updatedEvents) => {
    console.log('Eventi ricevuti dal client:', updatedEvents); // Log per vedere gli eventi ricevuti dal client
    events = updatedEvents; // Aggiorna gli eventi
    saveEventsToFile(); // Salva nel file
    io.emit('loadEvents', events); // Invia gli eventi aggiornati a tutti i client
  });
// Gestire l'aggiunta di un nuovo evento
  socket.on('addEvent', (newEvent) => {
    console.log('Nuovo evento ricevuto per l\'aggiunta:', newEvent);
    events.push(newEvent); // Aggiungi l'evento all'array
    saveEventsToFile(); // Salva nel file
    io.emit('loadEvents', events); // Invia gli eventi aggiornati a tutti i client
  });

  // Gestire l'eliminazione di un evento
  socket.on('removeEvent', (eventId) => {
    console.log('Evento ricevuto per l\'eliminazione:', eventId);
    events = events.filter(event => event.id !== eventId); // Rimuovi l'evento dall'array
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
