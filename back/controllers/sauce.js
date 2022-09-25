//Importe le modèle sauce pour créer une sauce
const Sauce = require('../models/sauce');
//Importe le modèle fs pour lire des fichiers
const fs = require('fs');
const SAUCE_INTROUVABLE = "sauce introuvable";

//Fonction pour créer une sauce
exports.createSauce = (req, res, next) => {
  console.log('req.body', req.body);
  console.log('req.body.sauce', req.body.sauce);
  //Transforme l'objet sauce au format JSON en objet utilisable
  const sauceObject = JSON.parse(req.body.sauce);
  //supprime l'id de sauce lors de sa création car la base de donnée va lui en attribuer un automatiquement 
  delete sauceObject._id;
  //supprime le userId de sauce lors de sa création car la base de donnée va lui en attribuer un automatiquement 
  delete sauceObject._userId;
  //Crée une nouvelle sauce
  const sauce = new Sauce({
    //... premet d'attribuer toutes propriétés d'un objet (sauceObjet) à un autre objet (sauce)
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    //initialise les likes/ dislikes à 0 et usersLiked/usersDisliked vides comme demandé dans les spécs
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });

  //Enregistre la saucedans la base de donnés 
  sauce.save()
    //Renvoie une réponse dont le status est 201 et dont le message est au format JSON
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    //En cas d'erreur , renvoie une réponse dont le status est 400 et dont le message est au format JSON
    .catch(error => { res.status(400).json({ error : "Impossible d'enregistrer la sauce" }) })
};

//Affiche une seule sauce(détails de la sauce)
exports.getOneSauce = (req, res, next) => {
  //Cherche une sauce en fonction de son Id
  Sauce.findOne({
    _id: req.params.id
  }).then(
    //Renvoie une réponse dont le status est 200 et dont le message est l'objet sauce au format JSON
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    //Renvoie une réponse dont le status est 404 (not found : dans notre cas, cela signifie que l'on a pas trouvé de sauce) et dont le message est au format JSON
    (error) => {
      res.status(404).json({
        error: SAUCE_INTROUVABLE
      });
    }
  );
};

//Met à jour un sauce
exports.modifySauce = (req, res, next) => {
  //créer un objet Sauce
  //si le fichier existe déjà, attribuer tous les éléments JSON à sauceObject
  //Sinon 
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  //Efface le userId de sauce car l'objet sauce en possède déjà un
  delete sauceObject._userId;
  //Cherche la sauce en fonction de son Id
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      //Si le userId est différent de celui enregistré dans la base de donnée
      if (sauce.userId != req.auth.userId) {
        //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
        res.status(401).json({ message: 'Not authorized' });
      } else {
        //Sinon met à jour l'id 
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        //Renvoie une réponse dont le status est 200 et dont le message est au format JSON
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
          .catch(error => res.status(401).json({ error : "Impossible de mettre à jour la sauce" }));
      }
    })
    //Renvoie une réponse dont le status est 400 et dont le message est au format JSON
    .catch((error) => {
      res.status(400).json({ error : SAUCE_INTROUVABLE });
    });
};

//Met à jour le nombre de likes/dislikes
exports.modifyLike = (req, res, next) => {
  const userId = req.body.userId;
  //transforme like au forat Json en format Int
  const like = parseInt(req.body.like);
  const id = req.params.id;
  let newSauce;
  //Cherche la sauce en fonction de son id
  Sauce.findOne({ _id: id })
    .then((sauce) => {
      //Mise à jour  de l'objet newsauce 
      newSauce = likeDislike(userId, like, sauce);
      //Mise à jour de la sauce en BD
      Sauce.updateOne({ _id: id }, { ...newSauce })
      //Renvoie une réponse dont le status est 200 et dont le message est au format JSON
        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
        //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
        .catch(error => res.status(401).json({ error : "Impossible de modifier la sauce" }));

    })
    .catch((error) => {
      //Renvoie une réponse dont le status est 400 et dont le message est au format JSON
      res.status(400).json({ error : SAUCE_INTROUVABLE });
    });
};

//Supprime une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      //Si userId de la sauce est différent de celui de la requête
      if (sauce.userId != req.auth.userId) {
        //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
        res.status(401).json({ message: 'Not authorized' });
      } else {
          
          /* Sépare la chaîne de caractères en deux parties : 1-la première partie contient l'url jusqu'à /images/ comprit 
            2-la deuxième partie après /images/ (soit le nom de l'image)
            EXEMPLE : 
            http://localhost:3000/images/media.auchan.1664106546363.jpg
            =
            [ "http://localhost:3000/images/" , "media.auchan.1664106546363.jpg"]
          */      

         const filename = sauce.imageUrl.split('/images/')[1];
        //Supprime l'image du dossier image
        fs.unlink(`images/${filename}`, () => {
          //Efface une sauce en fonction de son id
          Sauce.deleteOne({ _id: req.params.id })
            //Renvoie une réponse dont le status est 200 et dont le message est au format JSON
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
            .catch(error => res.status(401).json({ error : "Impossible de supprimer la sauce" }));
        });
      }
    })
    .catch(error => {
      //Renvoie une réponse dont le status est 500 et dont le message est au format JSON
      res.status(500).json({ error : SAUCE_INTROUVABLE });
    });
};

//Affiche toutes les sauces
exports.getAllSauces = (req, res, next) => {
  //On récupère toutes les sauces avec la fontion find()
  Sauce.find().then(
    (sauces) => {
      //Renvoie une réponse dont le status est 200 et dont les objets (sauces) sont au format JSON
      res.status(200).json(sauces);
    }
  ).catch(
    //Renvoie une réponse dont le status est 400 et dont le message est au format JSON
    (error) => {
      res.status(400).json({
        error: "Impossible de récupérer les sauces"
      });
    }
  );
};

//fonction qui like/dislike une sauce
function likeDislike(userId, like, sauce) {
  let newSauce = {};
  newSauce._id = sauce._id;
  //Cas 1
  //On clique sur like pour la première fois
  if (like == 1) {
    //verifier si le userId se trouve dans le tableau des usersLiked
    if (!sauce.usersLiked.includes("userId")) {
      //Si UserId n'est pas dans sauce.usersLiked -> ajouter userId 
      sauce.usersLiked.push(userId);
      // incrémenter sauce.likes de 1
      sauce.likes += 1;
      //Mise à jour l'objet newsauce en ajoutant les propriétés (likes, usersLiked)
      newSauce = {likes: sauce.likes, usersLiked: sauce.usersLiked };
    }
  }
  //Cas 2
  //On clique sur dislike pour la première fois
  else if (like == -1) {
    //verifier si le userId se trouve dans le tableau des usersDisliked
    if (!sauce.usersDisliked.includes("userId")) {
      //Si UserId n'est pas dans sauce.usersLiked -> ajouter userId 
      sauce.usersDisliked.push(userId);
      // incrémenter sauce.likes de 1
      sauce.dislikes += 1;
      //Mise à jour l'objet newsauce en ajoutant les propriétés (dislikes, usersDisliked)
      newSauce = {  dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked };
    }
  }
  //Cas 3
  //On clique sur like ou dislike pour la deuxième fois
  else if (like == 0) {
    //vérifie si le userId est dans le tableau usersLikded
    if (sauce.usersLiked.includes(userId)) { //Si on a déjà cliqué sur le bouton like (annulation du like)

      //supprimer userId du tableau
      sauce.usersLiked = sauce.usersLiked.filter(idUser => idUser != userId);

      //decrementer sauce.likes de 1
      sauce.likes -= 1;
      //Mise à jour l'objet newsauce en ajoutant les propriétés (likes, usersLiked)
      newSauce = {  likes: sauce.likes, usersLiked: sauce.usersLiked };

    }
    //vérifie si le userId est dans le tableau usersDislikded
    else if (sauce.usersDisliked.includes(userId)) { //Si on a déjà cliqué sur le bouton dislike  (annulation du dislike)
      //supprimer userId du tableau
      sauce.usersDisliked = sauce.usersDisliked.filter(idUser => idUser != userId);
      //decrementer sauce.DISlikes de 1
      sauce.dislikes -= 1;
      //Mise à jour l'objet newsauce en ajoutant les propriétés (dislikes, usersDisliked)
      newSauce = { dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked };

    }

  }
  //On retourne un objet sauce mis à jour
  return newSauce;
}

