  const express = require('express');
  const bodyParser = require('body-parser');
  const mongoose = require('mongoose');
  const dotenv = require('dotenv');
  const cors = require('cors');
  const otpGenerator = require('otp-generator')
  const adminBroRouter = require('./routes/Admin.router.js'); // Import the AdminBro router middleware
  const routes = require('./routes/Routes.js');
  // const PasswordRecoveryRoute = require('./routes/PasswordRecoveryRoute.js');


  const app = express();

  // env configurations
  dotenv.config();

  // Connect to MongoDB
  const mongoURI = 'mongodb://localhost:27017/trackingApp';
  // const mongoURI =  "mongodb+srv://Isreal:oparanti@cluster0.pkhckh1.mongodb.net/trackingapp?retryWrites=true&w=majority";


  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch(err => {
      console.error('Error connecting to MongoDB:', err);
    });
  // Important ---> Should always be on top of other middlewares
    app.use('/admin', adminBroRouter);
  // Middlewares
  app.use(bodyParser.json({ limit: '30mb', extended: true }));
  app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
  app.use(cors());


  // Routes
  app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome!' });
  });

  app.get('/about', (req, res) => {
    res.status(200).json({ message: 'About' });
  });

  ///routes
  app.use('/api', routes)


  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
