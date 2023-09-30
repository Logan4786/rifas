const multer = require('multer');
const crypto = require('crypto');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path.resolve(__dirname, '..', 'tmp'));
    },
    filename: (req, file, callback) => {
        crypto.randomBytes(16, (err, hash) => {
            if (err) callback(err);

            const fileName = `${hash.toString('hex')} - ${file.originalname}`;
            callback(null, fileName);
        });
    }
});

module.exports = {
    dest: path.resolve(__dirname, '..', 'tmp'),
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB (2 * 1024 * 1024 bytes)
    },
    fileFilter: (req, file, callback) => {
        const allowedMimes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif'
        ];
        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error("Tipo de arquivo inválido"));
        }
    }
};
