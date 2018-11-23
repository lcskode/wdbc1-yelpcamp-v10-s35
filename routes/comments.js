var express = require("express");
// req.params.id not going through comments.js, needs mergeParams to fix req.params.id = null
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");


// Comments NEW
router.get("/new", isLoggedIn, function(req, res){
  // find campground by id
  // req.params.id is null in value without the mergeParams: true
  Campground.findById(req.params.id, function(err, campground){
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", {campground: campground});
    }
  });
});

// Comments CREATE
// handle add comment
router.post("/", isLoggedIn, function(req, res){
  // lookup campground using ID
  Campground.findById(req.params.id, function(err, campground){
    if (err) {
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      // create new comment
      Comment.create(req.body.comment, function(err, comment){
        if (err) {
          console.log(err);
        } else {
          // add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username =req.user.username;
          // save comment
          comment.save();

          // add comment to campground 
          campground.comments.push(comment);
          // save comment to campground
          campground.save();

          // console.log(comment);

          // 
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});

// EDIT ROUTE - COMMENT
router.get("/:comment_id/edit", checkCommentOwnership, function(req, res){
  Comment.findById(req.params.comment_id, function(err, foundComment){
    if(err){
      res.redirect("back");
    }else{
      res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
    }
  })
});

// UPDATE ROUTE - COMMENT
router.put("/:comment_id", checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// DESTROY ROUTE - COMMENT
router.delete("/:comment_id", checkCommentOwnership, function(req, res){
  // destroy campground
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// MIDDLEWARE
// add isLoggedIn middleware 
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    // if authenticated, continue showing pages
    return next();
  }
  // if not authenticated, show login page, 
  res.redirect("/login");
}

// add checkCommentOwnership middleware
function checkCommentOwnership(req, res, next) {
  // is user logged in?
  if(req.isAuthenticated()){  
    // find comment by ID
    Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
        res.redirect("back");
      } else {        
        // does user own the comment? compare if logged in user (req.user._id) matched
        if (foundComment.author.id.equals(req.user._id)) {
          // foundCampground.author.id is an OBJECT, req.user._id is a STRING
          // == OR === will not work, use .equals() instead to compare them
          next();
        } else {
          // if not own comment, redirect
          res.redirect("back");
        }
      } 
    });
  } else {
    // if user not logged in, redirect
    res.redirect("back");
  }
} 

module.exports = router;