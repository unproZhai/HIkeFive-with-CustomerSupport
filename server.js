const express    =  require('express');
const mongoose   =  require('mongoose');
const bodyParser =  require('body-parser');
const passport   =  require('passport');
const path       =  require('path');
const users      =  require('./routes/api/users');
const profile    =  require('./routes/api/profile');
const posts      =  require('./routes/api/posts');
const group      =  require('./routes/api/group');
const app        =  express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Config
const db = require('./config/keys').mongoURI;

// Connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Passport middleware
app.use(passport.initialize());

// Passport Config
require('./config/passport')(passport);

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);
app.use('/api/group', group);

// Server static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static('client/build'));

  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));

// Customer support 
require('dotenv').config({ path: '.env' });
const cors = require('cors');
const Chatkit = require('@pusher/chatkit-server');

const chatkit = new Chatkit.default({
      instanceLocator: process.env.CHATKIT_INSTANCE_LOCATOR,
      key: process.env.CHATKIT_SECRET_KEY,
});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/users', (req, res) => {
    const { userId } = req.body;

    chatkit
        .createUser({
          id: userId,
          name: userId,
        })
        .then(() => {
          res.sendStatus(201);
        })
        .catch(err => {
          if (err.error === 'services/chatkit/user_already_exists') {
            console.log(`User already exists: ${userId}`);
            res.sendStatus(200);
          } else {
            res.status(err.status).json(err);
          }
        });
    });

app.post('/authenticate', (req, res) => {
      const authData = chatkit.authenticate({
        userId: req.query.user_id,
      });
      res.status(authData.status).send(authData.body);
});

app.set('port', process.env.PORT || 5200);
    const server = app.listen(app.get('port'), () => {
      console.log(`Express running → PORT ${server.address().port}`);
});
