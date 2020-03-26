const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');
const sanitize = require('mongo-sanitize');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {

  try {
    const { title, author, email } = req.fields;
    const file = sanitize(req.files.file);
    const fileName = file.path.split('/').slice(-1)[0];
    const fileExt = fileName.split('.').slice(-1)[0];

    const reg = /^[a-z\d]+[\w\d.-]*@(?:[a-z\d]+[a-z\d-]+\.){1,5}[a-z]{2,6}$/i;
    const emailMatched = email.match(pattern).join('');
    if(emailMatched.length < email.length) throw new Error('Invalid characters...');

    if(author.length > 50 || title.length > 25) throw new Error('Wrong input!');

    if(title && author && email && file && (fileExt === 'png' || 'jpg' || 'jpeg' || 'gif')) { // if fields are not empty...

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const newPhoto = new Photo({ title, author, email, src: fileName, votes: 0 });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);

    } else {
      throw new Error('Wrong input!');
    }

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {

  try {
    res.json(await Photo.find());

  } catch(err) {
    res.status(500).json(err);
  }

};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const voter = await Voter.findOne({ user:req.ip });
    if(voter){
      if(voter.votes.indexOf(req.params.id) >= 0){
        return res.status(400).json({ message: 'Error' }) 
      } else {
        voter.votes.push(req.params.id)
        await voter.save();
      }  
    } else {
      const newVoter = new Voter({ user: req.ip, votes: [req.params.id]})
      console.log(newVoter)
      await newVoter.save();
    }

    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if(!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch(err) {
    res.status(500).json(err);
  }

};
