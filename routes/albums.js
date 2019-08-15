var express = require('express');
var fs = require('fs');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var Binary = require('mongodb').Binary;
var ObjectId = require('mongodb').ObjectID;
const constants = require('../constants');
const formidable = require('formidable');
const auth = require('../auth');

router.get('/loadAlbums', (req, res) => {
  MongoClient.connect(constants.DB_URL, { useNewUrlParser: true }, (err, db) => {
    if (err) throw err;
    const dbo = db.db(constants.DB_NAME);
    let albums = [];
    dbo.collection("albums").find({}).toArray((err, rawAlbums) => {
      if (err) throw err;
      rawAlbums.forEach(rawAlbum => {
        let album = {
          id: rawAlbum._id,
          name: rawAlbum.name
        }
        albums.push(album);
      });
      db.close();
      res.send(albums);
    });
  });
})

router.get('/getAlbumById/:albumId', (req, res) => {
  const albumId = req.params.albumId;
  MongoClient.connect(constants.DB_URL, { useNewUrlParser: true }, (err, db) => {
    if (err) throw err;
    const dbo = db.db(constants.DB_NAME);
    let album = {};

    dbo.collection("albums").find({"_id" : ObjectId(albumId)}).toArray((err, rawAlbum) => {
      if (err) throw err;
      album.name = rawAlbum[0].name;
    });

    dbo.collection("images").find({"album" : albumId}).toArray((err, rawImages) => {
      if (err) throw err;
      let images = [];
      rawImages.forEach(rawImage => {
        images.push({src: rawImage._id});
      })
      album.images = images;
      db.close();
      return res.status(200).json(album);
    })
  });
})

router.post('/addAlbum', auth.isAuthenticated ,(req, res) => {
  let form = new formidable.IncomingForm();
  form.multiples = true;
  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error', err);
      throw err;
    }

    let newAlbum = {
      name: fields.name,
      flag: Binary(fs.readFileSync(files.images[0].path)),
      cover: Binary(fs.readFileSync(files.images[1].path))
    }

    MongoClient.connect(constants.DB_URL, { useNewUrlParser: true }, (err, db) => {
      if(err) throw err;
      const dbo = db.db(constants.DB_NAME);
      dbo.collection('albums').insertOne(newAlbum, (err, res) => {
        if (err) throw err;
        db.close();
      })
      return res.status(200).json({ message: 'Album added successfully' });
    })
  })
});

router.get('/getCover/:albumId', (req, res) => {
  const albumId = req.params.albumId;
  MongoClient.connect(constants.DB_URL, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      const dbo = db.db(constants.DB_NAME);
      dbo.collection('albums').find({"_id" : ObjectId(albumId)}).toArray((err, rawAlbum) => {
          return res.status(200).send(rawAlbum[0].cover.buffer);
      })
  })
})


router.get('/getFlag/:albumId', (req, res) => {
  const albumId = req.params.albumId;
  MongoClient.connect(constants.DB_URL, { useNewUrlParser: true }, (err, db) => {
      if (err) throw err;
      const dbo = db.db(constants.DB_NAME);
      dbo.collection('albums').find({"_id" : ObjectId(albumId)}).toArray((err, rawAlbum) => {
          return res.status(200).send(rawAlbum[0].flag.buffer);
      })
  })
})

module.exports = router;
