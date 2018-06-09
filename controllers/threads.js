var express = require("express");
var bbCode = require("ya-bbcode");

var router = express.Router();

// Import the model to use its database functions.
var db = require("../models");

router.get("/viewthread/:id", function (req, res) {

    db.Thread.findOne({
        where: {
            threadId: req.params.id
        },
        include: [
            { model: db.Category },
            {
                model: db.Subscription,
                where: { userId: 1 }, // change later
                required: false // this is an outer join; will null if this doesn't exist but will still return the row; 
            },
        ]
    }).then(function (thread) {
        db.Post.findAll({
            where: {
                threadId: req.params.id
            },
            include: [
                { model: db.User },
            ],
            order: [ 'createdAt' ]
        }).then(function (data) {
            let parser = new bbCode();

            for (let post of data) {
                post.postContent = post.postContent.replace(/&/g, "&amp;");
                post.postContent = post.postContent.replace(/</g, "&lt;");
                post.postContent = post.postContent.replace(/>/g, "&gt;");
                post.postContent = parser.parse(post.postContent);
            }

            var hbsObject = {
                thread: thread,
                posts: data
            };
            res.render("postlist", hbsObject);
        });
    })
})

module.exports = router;
