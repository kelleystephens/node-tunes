'use strict';

var albums = global.nss.db.collection('albums');
// var songs = global.nss.db.collection('songs');
var multiparty = require('multiparty');
var fs = require('fs');
// var Mongo = require('mongodb');

exports.index = (req, res)=>{
  albums.find().toArray((e,r)=>{
    res.render('albums/index', {albums: r, title: 'Album List'});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    var album = {};
    album.folder = fields.name[0].toLowerCase().split(' ').join('-');
    album.fileName = files.cover[0].originalFilename;
    album.name = fields.name[0];
    album.cover = files.cover[0].path;
    var exists = fs.existsSync(`${__dirname}/../static/img/${album.folder}`);
    if(exists === false){
      fs.mkdirSync(`${__dirname}/../static/img/${album.folder}`);
      fs.renameSync(album.cover, `${__dirname}/../static/img/${album.folder}/${album.fileName}`);
    }else{
      fs.renameSync(album.cover, `${__dirname}/../static/img/${album.folder}/${album.fileName}`);
    }
    albums.save(album, ()=>res.redirect('/albums'));
  });
};

// exports.show = (req, res)=>{
//   var _id = Mongo.ObjectID(req.params.id);
//   var
//
//   songs.find({albumId:_id}(e, sngs)=>{
//     albums.findOne({_id:_id}, (e, album)=>{
//       res.render('albums/show', {album: album, songs: sngs, title: `${album.name}`});
//     });
//   });
//
// };
