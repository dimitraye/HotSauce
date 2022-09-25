/* Modélisation de la sauce */

//Importe le package mongoose qui facilite les intéractions avec MongoDB
const mongoose = require('mongoose');

//Schéma d'une sauce
const sauceSchema = mongoose.Schema({
    //Propriétés de la sauce
    userId: { type: String },
    name: { type: String },
    manufacturer: { type: String },
    description: { type: String },
    mainPepper: { type: String },
    imageUrl: { type: String},
    heat: { type: Number },
    likes: { type: Number },
    dislikes: { type: Number },
    price: { type: Number },
    usersLiked: { type: [String] },
    usersDisliked: { type: [String] }
  });

//Rend le modèle accessible dans d'autres fichiers
module.exports = mongoose.model('Sauce', sauceSchema);
