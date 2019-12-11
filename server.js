const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/cute', {
  useNewUrlParser: true
});


// Configure multer so that it will upload to '/public/images'
const multer = require('multer')
const upload = multer({
  dest: './public/images/',
  limits: {
    fileSize: 10000000
  }
});

// Create a scheme for items in the show down: a title and a path to an image.
const itemSchema = new mongoose.Schema({
  title: String,
  path: String,
  score: Number
});

itemSchema.virtual('id').get(function() 
{
  return this._id.toHexString();
});

// Create a model for items in the cute showdown database
const Item = mongoose.model('Item', itemSchema);

app.listen(9000, () => console.log('Server listening on port 9000!'));

// Create a new item in the cute showdown takes a title and a path to an image.
app.post('/api/items', async (req, res) => {
  const item = new Item({
    title: req.body.title,
    path: req.body.path,
    score: req.body.score,
  });
  try {
    await item.save();
    res.send(item);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// Upload an image and keeps a path to the upladed imnage for future reference
app.post('/api/photos', upload.single('photo'), async (req, res) => {
  // Just a safety check
  if (!req.file) {
    return res.sendStatus(400);
  }
  res.send({
    //console.log("Uploading photo, return the path of stored photo!");
    path: "/images/" + req.file.filename
  });
});

// Get a list of all of the competertiors in the cute showdown
app.get('/api/items', async (req, res) => {
  try {
    let items = await Item.find();
    res.send(items);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// remove one of the items from the cute showdown
app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.deleteOne(
      {
        _id: req.params.id
      });
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// edit one of the item's score in the database
app.put('/api/items/:id', async (req, res) => {
  try {
    let item = await Item.findOne(
      {
        _id: req.params.id
      });
    item.score = req.body.score;
    item.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// edit one of the item's name in the database
app.put('/api/change/:id', async (req, res) => {
  try {
    let item = await Item.findOne(
      {
        _id: req.params.id
      });
    item.title = req.body.title;
    item.save();
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});
