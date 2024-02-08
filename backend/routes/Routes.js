const express = require('express');
const { register, login, getUser, verifyOTP, passwordRecoveryEmail, logOut, createActiveRoute, searchLocation, activeStatus, getRouteHistory} = require('../controllers/AuthController.js');
const { Conversation, GetConversation, Messages, GetMessages } = require('../controllers/ChatController.js');
const  localVariables  = require('../middleware/auth.js')
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// router.post('/log-out', logOut);


router.get('get-user/:username', getUser);

router.get('/user/search-location', searchLocation);
router.post('/user/active-route', createActiveRoute);
router.get('/user/active-status', activeStatus);
router.get('/user/route-histoty', getRouteHistory);


// router.get('/user/dashboard', dashboard);

 

router.post('/password-recovery', passwordRecoveryEmail);
router.post('/verifyOTP', verifyOTP);

router.post('/conversations', Conversation);
router.post('/conversations/:userId', GetConversation);  

router.post('/messages', Messages);

router.get('/messages/:conversationId', GetMessages);

module.exports = router;
    