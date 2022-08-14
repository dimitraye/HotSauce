const Sauce = require('../models/sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
  console.log('req.body', req.body);
  console.log('req.body.sauce', req.body.sauce);
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });

  sauce.save()
    .then(() => { res.status(201).json({ message: 'Objet enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
};



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
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
    ...JSON.parse(req.body.sauce),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.modifyLike = (req, res, next) => {
  const userId = req.body.userId;
  const like = req.body.like;
  const id = req.params.id;
  delete likeInfo.userId;
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId != req.auth.userId) {
        res.status(401).json({ message: 'Not authorized' });
      } else {
        Sauce.updateOne({ _id: req.params.id }, { likes: likeInfo.like })
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch(error => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

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
            .catch(error => res.status(401).json({ error }));
        });
      }
    })
    .catch(error => {
      res.status(500).json({ error });
    });
};

exports.getAllSauces = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};


function likeDislike(userId, like, sauce) {
  //si like == 1
  if (like == 1) {
    //verifier si mon unserId sse trouve dans le tableau des usersLiked
    if (!sauce.usersLiked.includes("userId")) {
      //Si UserId n'est pas dans sauce.usersLiked -> ajouter userId 
      sauce.usersLiked.push(userId);
      // incrémenter sauce.likes de 1
      sauce.likes += 1;
    }
  }
  else if (like == -1) {
    //verifier si mon unserId sse trouve dans le tableau des usersDisliked
    if (!sauce.usersDisliked.includes("userId")) {
      //Si UserId n'est pas dans sauce.usersLiked -> ajouter userId 
      sauce.usersDisliked.push(userId);
      // incrémenter sauce.likes de 1
      sauce.dislikes += 1;
    }
  }

  else if(like == 0){
     // Parcourrur les tableau -> supprimer le UserId + décrémenter liki/dislke de 1 
     //vérifie si le userId est dans usersLikded
     if(sauce.usersLiked.includes("userId")){
      //supprimer userId du tableau
      sauce.usersLiked = sauce.usersLiked.filter(idUser => idUser !=  userId);
      //decrementer sauce.likes de 1
      sauce.likes -=1;
     }
     else if(sauce.usersDisliked.includes("userId")){
      //supprimer userId du tableau
      sauce.usersDisliked = sauce.usersDisliked.filter(idUser => idUser !=  userId);
      //decrementer sauce.likes de 1
      sauce.dislikes -=1;
     }
 
  }
  //Si like ==0
   
}