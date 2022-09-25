/* Modélisation de l'utilisateur */

//Importe le package mongoose qui facilite les intéractions avec MongoDB
const mongoose = require('mongoose');

//Importe le package mongoose-unique-validator 
//améliore les messages d'erreur lors de l'enregistrement de données uniques
const uniqueValidator = require('mongoose-unique-validator');

//Schéma d'un utilisateur
const userSchema = mongoose.Schema({
  //Propriétés du user
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

//Applique le module uniqueValidator au userSchema
userSchema.plugin(uniqueValidator);

//Rend le modèle user accessible dans d'autres fichiers
module.exports = mongoose.model('User', userSchema);


