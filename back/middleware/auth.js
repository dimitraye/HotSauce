//Importe le module jsonwebtoken pour créer un tokken qui sera utiliser pour l'authentification d'un utilisateur
const jwt = require('jsonwebtoken');

//Rend le middleware accessible dans d'autres fichiers
module.exports = (req, res, next) => {
   try {
       //
       const token = req.headers.authorization.split(' ')[1];
       //Affecte le token à la constante decodedToken, la fonction verify qui nous permet de décoder le token
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       //Affecte le userId de decodedToken au userId
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       //Renvoie une réponse dont le status est 401 et dont le message est au format JSON
       res.status(401).json({ error });
   }
};