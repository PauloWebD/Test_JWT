const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser'); // Middleware pour gérer le corps des requêtes JSON
const fs = require('fs'); // Module pour lire le fichier JSON

// Import du middleware isAdmin
const { isAdmin } = require('./middleware'); // Assurez-vous que le chemin d'accès est correct

// Configuration de l'application Express
const app = express();
const port = 3000; // Vous pouvez changer le port si nécessaire

// Charger les variables d'environnement à partir de .env
require('dotenv').config();

// Récupérer la clé secrète depuis les variables d'environnement
const jwtSecretKey = process.env.JWT_SECRET;

// Middleware pour vérifier le JWT avant d'accéder aux routes protégées
function verifyToken(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
  }

  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token invalide.' });
    }

    req.user = decoded.user;
    next();
  });
}

app.use(bodyParser.json());


app.get('/protected', verifyToken, (req, res) => {
    console.log('Token décodé :', req.user); 
   
    fs.readFile('users.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Erreur lors de la lecture du fichier JSON des utilisateurs :', err); 
        return res.status(500).json({ message: 'Erreur lors de la lecture du fichier JSON des utilisateurs.' });
      }
  
      const users = JSON.parse(data);
      res.json({ message: 'Vous avez accès à cette route protégée car votre JWT est valide.', users });
    });
  });
  

app.get('/admin-only', verifyToken, isAdmin, (req, res) => {
  res.json({ message: 'Vous avez accès à cette route réservée aux administrateurs.', user: req.user });
});

app.get('/users', verifyToken, isAdmin, (req, res) => {
    
    fs.readFile('users.json', 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la lecture du fichier JSON des utilisateurs.' });
      }
  
      const users = JSON.parse(data);
     
      const usersWithoutAdmin = users.filter((user) => !user.isAdmin);
      res.json({ message: 'Vous avez accès à la liste des utilisateurs (sans l\'administrateur).', users: usersWithoutAdmin });
    });
  });
  
  
  
app.post('/create-user', (req, res) => {
  const { id, username, email, isAdmin } = req.body;

  
  if (!id || !username || !email || isAdmin === undefined) {
    return res.status(400).json({ message: 'Veuillez fournir toutes les informations nécessaires pour créer un nouvel utilisateur.' });
  }

  const newUser = {
    id,
    username,
    email,
    isAdmin,
  };

  jwt.sign({ user: newUser }, jwtSecretKey, { expiresIn: '1h' }, (err, token) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la génération du token.' });
    }

    res.json({ token });
  });
});

app.post('/login', (req, res) => {
  
  const { username, password } = req.body;


  if (username === 'JohnDoe' && password === 'secret') {
    const user = {
      id: 1,
      username: 'JohnDoe',
      email: 'johndoe@example.com',
      isAdmin: true,
    };

    jwt.sign({ user }, jwtSecretKey, { expiresIn: '1h' }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: 'Erreur lors de la génération du token.' });
      }

      res.json({ token });
    });
  } else {
    res.status(401).json({ message: 'Identifiants de connexion invalides.' });
  }
});


app.listen(port, () => {
  console.log(`Le serveur écoute sur http://localhost:${port}`);
});
