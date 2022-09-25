//Gestion de l'authentification par token

//Importe le module jsonwebtoken pour la gestion du token 
const jwt = require('jsonwebtoken');

//Rend le middleware accessible dans d'autres fichiers
module.exports = (req, res, next) => {
   try {
    //Récupère la valeur de la propriété authorization dans la propriété headers de la requête
    const authorization = req.headers.authorization ;
       //authorization =  Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmZiNjFyMYmFj...
        /*   split sépare authorization en deux parties :
                ["Bearer",  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MmZiNjFyMYmFj..."]
        */
       const token = authorization.split(' ')[1];
       //La fonction verify de jwt nous permet de décoder le token grace à la clef de chiffrement/déchiffrement RANDOM_TOKEN_SECRET
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       //On récupère le userId de decodedToken
       const userId = decodedToken.userId;
       //attribut userId àl'objet auth de la requête
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       //Renvoie une réponse au status 401 et au format JSON
       res.status(401).json({ error : "Problème d'authentification" });
   }
};