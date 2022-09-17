/* MODELS */
/* Gère les données et la logique métier */

const mongoose = require('mongoose');

//Schém d'une sauce
const sauceSchema = mongoose.Schema({
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

module.exports = mongoose.model('Sauce', sauceSchema);
