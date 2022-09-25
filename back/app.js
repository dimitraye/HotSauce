//Lance l'application express

//Importe le package express qui est un framework facilitant la gestion de serveur node.js
const express = require('express');

//Création de l'application Express
const app = express();

//Importe le package dotenv pour la gestion du fichier de configuration .env
require("dotenv").config();

//Importe le package mongoose pour faciliter les intéractions avec MongoDB
const mongoose = require('mongoose');

//Importe les routes liées aux sauces
const sauceRoutes = require('./routes/sauce');

//Importe les routes liées au user (elles servent à l'authentification)
const userRoutes = require('./routes/user');
//Importe le package path pour gérer l'accès au système de gestion des fichiers
const path = require('path');





//Connexion à la base de donnée 
mongoose.connect('mongodb+srv://'+process.env.DB_USER+':'+process.env.DB_PASSWORD+'@cluster0.5ujafkx.mongodb.net/?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'
    ));

//Formate les données des requêtes au format json
app.use(express.json());

//Ajout des headers à la réponse
app.use((req, res, next) => {
    //Permet d'accéder à notre API depuis n'importe quelle origine ( '*' ) ;
    res.setHeader('Access-Control-Allow-Origin', '*');
    //Permet d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) ;
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    //Permet d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.).
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

//Liaison de la route api/sauces aux routes définies dans 'sauceRoutes'
app.use('/api/sauces', sauceRoutes);
//Liaison de la route api/auth aux routes définies dans 'userRoutes'
app.use('/api/auth', userRoutes);
//Liaison de la route /images au dossier 'images'
app.use('/images', express.static(path.join(__dirname, 'images')));


//Rend le module accessible dans d'autres fichiers
module.exports = app;