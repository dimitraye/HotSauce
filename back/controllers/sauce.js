const Sauce = require('../models/sauce');
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
  delete sauceObject._userId;
  const sauce = new Sauce({
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
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json({ error : "Impossible d'enregistrer la sauce" }) })
};

//Affiche une seule sauce(détails de la sauce)
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
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

  //
  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error : "Impossible de mettre à jour la sauce" }));
      }
    })
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
  Sauce.findOne({ _id: id })
    .then((sauce) => {

      newSauce = likeDislike(userId, like, sauce);
      Sauce.updateOne({ _id: id }, { ...newSauce })
        .then(() => res.status(200).json({ message: 'Objet modifié!' }))
        .catch(error => res.status(401).json({ error : "Impossible de modifier la sauce" }));

    })
    .catch((error) => {
      res.status(400).json({ error : SAUCE_INTROUVABLE });
    });
};

//Supprime une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => { res.status(200).json({ message: 'Objet supprimé !' }) })
            .catch(error => res.status(401).json({ error : "Impossible de supprimer la sauce" }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error : SAUCE_INTROUVABLE });
    });
};

//Affiche toutes les sauces
exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
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
  //si like == 1
  if (like == 1) {
    //verifier si mon unserId sse trouve dans le tableau des usersLiked
    if (!sauce.usersLiked.includes("userId")) {
      //Si UserId n'est pas dans sauce.usersLiked -> ajouter userId 
      sauce.usersLiked.push(userId);
      // incrémenter sauce.likes de 1
      sauce.likes += 1;
      newSauce = {likes: sauce.likes, usersLiked: sauce.usersLiked };
    }
  }
  else if (like == -1) {
    //verifier si mon unserId sse trouve dans le tableau des usersDisliked
    if (!sauce.usersDisliked.includes("userId")) {
      //Si UserId n'est pas dans sauce.usersLiked -> ajouter userId 
      sauce.usersDisliked.push(userId);
      // incrémenter sauce.likes de 1
      sauce.dislikes += 1;
      newSauce = {  dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked };
    }

  }

  else if (like == 0) {
    // Parcourrur les tableau -> supprimer le UserId + décrémenter liki/dislke de 1 
    //vérifie si le userId est dans usersLikded
    if (sauce.usersLiked.includes(userId)) {
      //supprimer userId du tableau

      sauce.usersLiked = sauce.usersLiked.filter(idUser => idUser != userId);

      //decrementer sauce.likes de 1
      sauce.likes -= 1;
      newSauce = {  likes: sauce.likes, usersLiked: sauce.usersLiked };

    }
    else if (sauce.usersDisliked.includes(userId)) {
      //supprimer userId du tableau
      sauce.usersDisliked = sauce.usersDisliked.filter(idUser => idUser != userId);
      //decrementer sauce.likes de 1
      sauce.dislikes -= 1;
      newSauce = { dislikes: sauce.dislikes, usersDisliked: sauce.usersDisliked };

    }

  }
  return newSauce;


}

