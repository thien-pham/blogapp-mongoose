const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {Post} = require('./models');

const app = express();
app.use(bodyParser.json());

app.get('/posts', (req, res) => {
    //res.json(req.body);
    Post
      .find()
      .exec()
      .then(posts => {
            res.json(
                posts.map((post) => post.apiRepr())
          );
        })
        .catch(
            err => {
                console.error(err);
                res.status(500).send('Error!');
            });
});

app.get('/posts/:id', (req, res) => {
  Post
    .findById(req.params.id)
    .exec()
    .then(post => res.json(post.apiRepr()))
    .catch(err => {
      console.error(err);
      res.status(500).send('Error: id required');
    });
});

app.post('/posts', (req, res) => {
  const requiredFields = ['title', 'content', 'author'];
  for(let i=0; i<requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      res.status(400).send('Missing required fields');
    }
  }
    Post
      .create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author})
      .then(post => res.status(201).json(post.apiRepr()))
      .catch(err => {
        console.error(err);
        res.status(400).send('Error!');
      });
});

//PUT REQUEST
app.put('/posts/:id', (req, res) => {
  const postId = req.params.id;
  if(!(postId)) {
    res.status(400).send('Error: missing id');
  }
  Post
    .findByIdAndUpdate(req.params.id, {
      $set: {
        'title': req.body.title,
        'content': req.body.content,
        'author': req.body.author
      }
    })
    .then(post => res.status(201).json(post.apiRepr()))     
    .catch(err => {
      console.error('Error: Could not update', err);
    });
});





let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

// this function closes the server, and returns a promise. we'll
// use it in our integration tests later.
function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

// if server.js is called directly (aka, with `node server.js`), this block
// runs. but we also export the runServer command so other code (for instance, test code) can start the server as needed.
if (require.main === module) {
  runServer().catch(err => console.error(err));
}

module.exports = {app, runServer, closeServer};