/* ROUTES */
/* Relie les routes aux méthodes de controlleurs qui leur correspondent */

//Importe le package express qui est un framework facilitant la gestion de serveur node.js
const express = require('express');
//Création d'un noueau router
const router = express.Router();
//Importe le fichier auth (middleware d'authentification)
const auth = require('../middleware/auth');
//Importe le fichier multer-config (middleware de gestion des fichiers)
const multer = require('../middleware/multer-config');
//Importe le controller sauce 
const sauceCtrl = require('../controllers/sauce');

//relie la route / (racine) à la méthode getAllSauces du controller sauce(récupère toutes les sauces)
router.get('/', auth, sauceCtrl.getAllSauces);
//relie la route / (racine) à la méthode createSauce du controller sauce(récupère toutes les sauces)
router.post('/', auth, multer, sauceCtrl.createSauce);
//relie la route / (racine) la rooute / (racine) à la méthode getOneSauce du controller sauce(récupère toutes les sauces)
router.get('/:id', auth, sauceCtrl.getOneSauce);
//relie la route / (racine) à la méthode modifySauce du controller sauce(récupère toutes les sauces)
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
//relie la route / (racine) à la méthode modifyLike du controller sauce(récupère toutes les sauces)
router.post('/:id/like', auth, sauceCtrl.modifyLike);
//relie la route / (racine) à la méthode deleteSauce du controller sauce(récupère toutes les sauces)
router.delete('/:id', auth, sauceCtrl.deleteSauce);

//Rend le module accessible dans d'autres fichiers
module.exports = router;