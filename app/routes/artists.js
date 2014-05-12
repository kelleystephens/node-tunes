'use strict';

var artists = global.nss.db.collection('artists');
var multiparty = require('multiparty');
var fs = require('fs');
// var Mongo = require('mongodb');

exports.index = (req, res)=>{
  artists.find().toArray((e,r)=>{
    console.log(r);
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

// exports.show = (req, res)=>{
//   var _id = Mongo.ObjectID(req.params.id);
//
//   artists.findOne({_id:_id}, (e, artist)=>{
//     res.render('artists/show', {artist: artist, title: `${artist.name}`});
//   });
// };
