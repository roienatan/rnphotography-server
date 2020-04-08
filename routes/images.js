var express = require('express');
var fs = require('fs');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var Binary = require('mongodb').Binary;
var ObjectId = require('mongodb').ObjectID;
const constants = require('../constants');
const formidable = require('formidable');
const auth = require('../auth');

router.post('/uploadImages', auth.isAuthenticated, (req, res) => {
    let form = new formidable.IncomingForm();
    form.multiples = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error', err);
            throw err;
        }

        let images = files.images;

        MongoClient.connect(constants.DB_URL, { useNewUrlParser: true }, (err, db) => {
            if (err) throw err;
            const dbo = db.db(constants.DB_NAME);
            if(!Array.isArray(images)){ 
                images = [images];
            }
            images.forEach(image => {
                let newImage = {
                    album: fields.albumId,
                    image: Binary(fs.readFileSync(image.path))
                }
                dbo.collection('images').insertOne(newImage, (err, res) => {
                    if (err) throw err;
                })
            })
            db.close();
            return res.status(200).json({ message: 'Images added successfully' });
        })
    })
});

router.get('/getImage/:imageId', (req, res) => {
    const imageId = req.params.imageId;
    MongoClient.connect(constants.DB_URL, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db(constants.DB_NAME);
        dbo.collection('images').find({"_id" : ObjectId(imageId)}).toArray((err, rawImage) => {
            return res.status(200).send(rawImage[0].image.buffer);
        })
    })
})

router.post('/deleteImage/:imageId', auth.isAuthenticated, (req, res) => {
    const imageId = req.params.imageId;
    MongoClient.connect(constants.DB_URL, { useNewUrlParser: true }, (err, db) => {
        if (err) throw err;
        const dbo = db.db(constants.DB_NAME);
        dbo.collection('images').deleteOne({"_id" : ObjectId(imageId)}, (err, res) => {
            if (err) throw err;
        })
        return res.status(200).json({ message: 'Image deleted successfully' });
    })
})

module.exports = router;