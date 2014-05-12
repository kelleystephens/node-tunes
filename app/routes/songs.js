/* jshint unused:false */

'use strict';

var artists = global.nss.db.collection('artists');
var albums  = global.nss.db.collection('albums');
var songs   = global.nss.db.collection('songs');
var Mongo   = require('mongodb');
var _       = require('lodash');
var multiparty = require('multiparty');
var fs = require('fs');

exports.index = (req, res)=>{
  artists.find().toArray((e, arts)=>{
    console.log(arts);
    console.log('--------');
    albums.find().toArray((e, albs)=>{
      console.log(albs);
      songs.find(req.query).toArray((e, sngs)=>{

        sngs = sngs.map(s=>{
          s.album = _(albs).find(a=>a._id.toString() === s.albumId.toString());
          s.artist = _(arts).find(a=>a._id.toString() === s.artistId.toString());
          console.log(s);
          return s;
        });

        res.render('songs/index', {artists: arts, albums: albs, songs: sngs, title: 'Songs'});
      });
    });
  });
};


exports.create = (req, res)=>{
  var path = require('path');
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    var name       = fields.name[0];
    var normalized = name.split(' ').map(w=>w.trim()).map(w=>w.toLowerCase()).join('');
    var genres     = fields.genres[0].split(',').map(w=>w.trim()).map(w=>w.toLowerCase());
    var artistId   = Mongo.ObjectID(fields.artistId[0]);
    var albumId    = Mongo.ObjectID(fields.albumId[0]);
    var extension  = path.extname(files.file[0].path);
    var newPathRel = `/audios/${artistId}/${albumId}/${normalized}${extension}`;

    var bseDir     = `${__dirname}/../static/audios`;
    var artDir     = `${bseDir}/${artistId}`;
    var albDir     = `${artDir}/${albumId}`;
    var newPathAbs = `${albDir}/${normalized}${extension}`;
    var oldPathAbs = files.file[0].path;

    if(!fs.existsSync(artDir)){fs.mkdirSync(artDir);}
    if(!fs.existsSync(albDir)){fs.mkdirSync(albDir);}
    fs.renameSync(oldPathAbs, newPathAbs);

    // genreList.update();

    var song      = {};
    song.name     = name;
    song.genres   = genres;
    song.artistId = artistId;
    song.albumId  = albumId;
    song.file     = newPathRel;

    songs.save(song, ()=>res.redirect('/songs'));  });
};
