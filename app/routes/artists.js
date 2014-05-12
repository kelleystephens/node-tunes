'use strict';

var artists = global.nss.db.collection('artists');
var songs = global.nss.db.collection('songs');
var multiparty = require('multiparty');
var fs = require('fs');
var Mongo = require('mongodb');
var _  = require('lodash');

exports.index = (req, res)=>{
  artists.find().toArray((e,r)=>{
    res.render('artists/index', {artists: r, title: 'artist List'});
  });
};

exports.create = (req, res)=>{
  var form = new multiparty.Form();

  form.parse(req, (err, fields, files)=>{
    var artist = {};
    artist.folder = fields.name[0].toLowerCase().split(' ').join('-');
    artist.fileName = files.photo[0].originalFilename;
    artist.name = fields.name[0];
    artist.photo = files.photo[0].path;
    var exists = fs.existsSync(`${__dirname}/../static/img/${artist.folder}`);
    if(exists === false){
      fs.mkdirSync(`${__dirname}/../static/img/${artist.folder}`);
      fs.renameSync(artist.photo, `${__dirname}/../static/img/${artist.folder}/${artist.fileName}`);
    }else{
      fs.renameSync(artist.photo, `${__dirname}/../static/img/${artist.folder}/${artist.fileName}`);
    }
    artists.save(artist, ()=>res.redirect('/artists'));
  });
};

exports.show = (req, res)=>{
  var _id = Mongo.ObjectID(req.params.id);
  artists.find().toArray((e, artists)=>{
    songs.find({artistId: _id}).toArray((e, sngs)=>{
      sngs = sngs.map(s=>{
        var ar = _(artists).find(a=>a._id.toString() === s.artistId.toString());
        s.artist = ar;
        return s;
      });
      res.render('artists/show', {songs: sngs, title: 'Songs By Artist'});
    });
  });
};
