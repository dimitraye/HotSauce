/* ROUTES */
/* Relie les requêtes aux controlleurs qui leur correspondent */

const express = require('express');
const router = express.Router();

const userCtrl = require('../controllers/user');

//relie au controller de signup(creation d'un utilisateur)
router.post('/signup', userCtrl.signup);
//relie au controller de login(connexion d'un utilisateur)
router.post('/login', userCtrl.login);

module.exports = router;