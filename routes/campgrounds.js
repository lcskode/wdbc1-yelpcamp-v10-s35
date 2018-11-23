var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");


// INDEX - list all campgrounds
router.get("/", function(req, res){
  // Get all campgrounds from db
  Campground.find({}, function(err, allCampgrounds){
    if (err) {
      console.log(err);
    } else {
      // display all campgrounds and get currentUser if any
      res.render("campgrounds/index", {campgrounds: allCampgrounds});
    }
  });
});

// CREATE - save newly added campground
router.post("/", isLoggedIn, function(req, res){
  // get data from new campground form and add to campgrounds db
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  //req.user contains info about currently logged in user
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  // make name and image variables as object
  var newCampground = {name: name, image: image, description: desc, author: author};
  // Create new campground and save to db
  Campground.create(newCampground, function(err, newlyCreated){
    if (err) {
      console.log(err)
    } else {
      // redirect back to campgrounds page which by default will go to /campgrounds app.get ROUTE
      console.log(newlyCreated);
      res.redirect("/campgrounds");
    }
  });  
});

// NEW - add new campground
router.get("/new", isLoggedIn, function(req, res){
  res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
  // find the campground with the provided ID
  // and populate with comments
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
  // Campground.findById(req.params.id, function(err, foundCampground){  
    if (err) {
      console.log(err);
    } else {
      // console.log(foundCampground);
      // render show template with that campground
      // res.send("THIS WILL BE THE SHOW PAGE SOON!");
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

// EDIT Campground ROUTE
router.get("/:id/edit", checkCampgroundOwnership, function(req, res){
  Campground.findById(req.params.id, function(err, foundCampground){
    res.render("campgrounds/edit", {campground: foundCampground});
  });  
});

// UPDATE Campground ROUTE
router.put("/:id", checkCampgroundOwnership, function(req, res){
  // find and update the correct campground
  // Campground.findByIdAndUpdate(ID, DATA, CALLBACK)
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
    if(err){
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

// DESTROY campground ROUTE
router.delete("/:id", checkCampgroundOwnership, function(req, res){
  // destroy campground
  Campground.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds");
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

// add checkCampgroundOwnership middleware
function checkCampgroundOwnership(req, res, next) {
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



module.exports = router;