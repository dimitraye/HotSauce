//Importe le modèle user pour créer un utilisateur
const User = require("../models/user");
//Importe le module bcrypt servant à crypter/décrypter un mot de passe
const bcrypt = require("bcrypt");
//Importe le module jsonwebtoken servant à attribuer un tokken d'authentification à un utilisateur
const jwt = require("jsonwebtoken");
//Importe le module email-validator servant à vérifier la validité d'un email
const emailvalidator = require("email-validator");
//Importe le module password-validator servant à vérifier la validité d'un mot de passe
var passwordValidator = require('password-validator');

// Crétion d'un schema de validation du mot de passe
var schema = new passwordValidator();
//Indique que le schema doit avoir au minimum 5 caractères 
schema
.is().min(5);    // Minimum 5 caractères

//Création d'un utilisateur
exports.signup = (req, res, next) => { 
  //Vérifie si le format de l'email n'est pas valide
  if ((!req.body.email || !emailvalidator.validate(req.body.email))){
    //Si l'email n'est pas valide on renvoit un message d'erreur
    res.status(400).send({error:"Email ou Mot de Passe Invalide"});
    //Génère une exception étant une chaîne de caractères
    throw "Erreur : Email ou Mot de Passe Invalide";
  }
  //Vérifie si le format du mot de passe est valide
  if ((!req.body.password || !schema.validate(req.body.password))){
    //Si le mdp n'est pas valide on renvoit un message d'erreur
    res.status(400).send({error:"Merci d'indiquer un mot de passe de minimum 5 caractères"});
    //Génère une exception étant une chaîne de caractères
    throw "Erreur : Mot de passe de moins de 5 caractères";
  }
  //hachage du mdp
  bcrypt
    //la fonction hash() de bcrypt va crypter le mot de passe | la valeur 10 correspond 
    .hash(req.body.password, 10)
    //Une fois que c'est fait, affecte le hash à la propriété password de l'objet user
    .then((hash) => {
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      //sauvegarde l'utilisateur
      user
        .save()
          //Renvoie une réponse dont le status est 200 et dont le message est au format JSON
          .then(() => res.status(201).json({ message: "Utilisateur créé !" }))
        //La méthode catch() renvoie un objet Promise et ne traite que des cas où la promesse initiale est rejetée
        .catch((error) =>
          //Renvoie une réponse dont le status est 400 et dont le message est au format JSON
          res
            .status(400)
            .json({ error: "Problèmes lors de la création de l'utilisateur" })
        );
    })
    .catch((error) =>
      //Renvoie une réponse dont le status est 500 et dont le message est au format JSON
      res
        .status(500)
        .json({ error: "Problèmes d'inscription de l'utilisateur." })
    );
};

//Connexion
exports.login = (req, res, next) => {
  //La méthode findOne() est utilisée pour chercher si l'email se trouve dans le base de données
  User.findOne({ email: req.body.email })
    .then((user) => {
      //Si l'email entré ne se trouve pas dans la BD
      if (!user) {
        //Retoure une réponse dont le status est 401 et dont le message est au format JSON
        return res.status(401).json({ error: "Utilisateur non trouvé !" });
      }
      //compare
      bcrypt
        //La méthode compare() compare si le mot de passe entré correspond à celui enregistré dans la BD pour cet email
        .compare(req.body.password, user.password)
        .then((valid) => {
          //Cas 1
          //Le mot de passe entré n'est pas valide
          if (!valid) {
            //Retoure une réponse dont le status est 401 et dont le message est au format JSON
            return res.status(401).json({ error: "Mot de passe incorrect !" });
          }
          //Cas 2
          //Le mot de passe entré est valide
          //Retoure une réponse dont le status est 200 avec la propriété userId et token au format JSON
          res.status(200).json({
            userId: user._id,
            //Attribut un token d'authentification
            token: jwt.sign(
              { userId: user._id },
              "RANDOM_TOKEN_SECRET",
              //Le token est valide pendant 24h
              { expiresIn: "24h" }
            ),
          });
        })
        .catch((error) =>
          //Retoure une réponse dont le status est 500 et dont le message est au format JSON
          res
            .status(500)
            .json({ error: "Mot de passe et/ou identifiant incorrect" })
        );
    })
    .catch((error) =>
      //Retoure une réponse dont le status est 500 et dont le message est au format JSON
      res.status(500).json({ error: "Impossible de trouver l'utilisateur" })
    );
};
