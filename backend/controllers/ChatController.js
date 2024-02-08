const bcrypt = require('bcrypt');
const Message = require('../models/Message');
const Conversation = require("../models/Conversation");
 /** Middleware for verifying user */
 
  
exports.Conversation = async function (req, res) {
    const newConversation = new Conversation({
        members: [req.body.senderId, req.body.receiverId],
      });
    
      try {
        const savedConversation = await newConversation.save();
        res.status(200).json(savedConversation);
      } catch (err) {
        res.status(500).json(err);
      }
    }  

    exports.GetConversation = async function (req, res) {
        try {
          const conversation = await Conversation.find({
            members: { $in: [req.params.userId] },
          });
          res.status(200).json(conversation);
        } catch (err) {
        }
          res.status(500).json(err);
      }


    //   router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
    //     try {
    //       const conversation = await Conversation.findOne({
    //         members: { $all: [req.params.firstUserId, req.params.secondUserId] },
    //       });
    //       res.status(200).json(conversation)
    //     } catch (err) {
    //       res.status(500).json(err);
    //     }
    //   });
      
      
 
////////Messages/////////////

exports.Messages = async function (req, res) {
  const newMessage = new Message(req.body);

  try {
    const savedMessage = await newMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json(err);
  }
}

// //get

exports.GetMessages = async function (req, res) {
  try {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json(err);
  }
};

// module.exports = router;

      
 