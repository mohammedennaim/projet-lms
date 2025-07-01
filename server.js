const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3004;

// Middleware
app.use(cors());
app.use(express.static('.'));

// Route pour la page des statistiques
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'statistics.html'));
});

app.get('/statistics', (req, res) => {
    res.sendFile(path.join(__dirname, 'statistics.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur de statistiques démarré sur http://localhost:${PORT}`);
    console.log(`📊 Page des statistiques: http://localhost:${PORT}/statistics`);
    console.log(`🔗 API Backend sur: http://localhost:8000`);
});
