//Gère la gestion des fichiers 

//Importe le module multer pour la gestion desfichiers
const multer = require('multer');

//Objet ayant comme propriété les formats d'image que l'on a choisi de traiter 
//Les valeurs de cet objet sont les extensions du fichier (jpg, jpeg, png)
const MIME_TYPES = {
    'image/jpg': 'jpg',
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

//diskStorage permet de gérer le stockage de fichier ( fichier image dans notre cas)
const storage = multer.diskStorage({
    //Dossier de destination (images)
    destination: (req, file, callback) => {
        callback(null, 'images');
    },
    //Gestion du renomage du fichier
    filename: (req, file, callback) => {
        const originalName = file.originalname;
        const name = originalName.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        const updatedName = name.replace(extension, '');
        callback(null, updatedName + Date.now() + '.' + extension);
    }
});
//Rend le module multer accessible dans d'autres fichiers
module.exports = multer({ storage: storage }).single('image');