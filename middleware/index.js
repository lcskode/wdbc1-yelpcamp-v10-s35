var Campground = require("../models/campground");
var Comment = require("../models/comment");

// all the middleware goes here
// create middleware obj for all middlewares

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next){
  // is user logged in?
  if(req.isAuthenticated()){  
    // find campground by ID
    Campground.findById(req.params.id, function(err, foundCampground){
      if(err){
        res.redirect("back");
      } else {        
        // does user own the campground?
        if (foundCampground.author.id.equals(req.user._id)) {
          // foundCampground.author.id is an OBJECT, req.user._id is a STRING
          // == OR === will not work, use .equals() instead to compare them
          next();
        } else {
          // if not own campground, redirect
          res.redirect("back");
        }
      } 
    });
  } else {
    // if not logged in, redirect
    res.redirect("back");
  }
}

middlewareObj.checkCommentOwnership = function(req, res, next){
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

middlewareObj.isLoggedIn = function(req, res, next){
  if(req.isAuthenticated()){
    // if authenticated, continue showing pages
    return next();
  }
  // if not authenticated, show login page, 
  res.redirect("/login");
}

module.exports = middlewareObj;