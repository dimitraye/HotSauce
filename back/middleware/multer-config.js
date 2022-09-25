//Importe le modèle multer pour la gestion desfichiers
const multer = require('multer');

//Objet ayant comme propriété les formats d'image que l'on a choisi de traiter
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

//
const storage = multer.diskStorage({
    //
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    //
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});
//Rend le module multer accessible dans d'autres fichiers
module.exports = multer({ storage: storage }).single('image');