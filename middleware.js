const {campgroundSchema, reviewSchema}=require("./schemas.js")
const ExpressError=require("./utils/expressError")
const Campground = require('./models/campground')
const Review = require('./models/review')


const isLoggedIn=(req, res, next)=>{
    
    if(!req.isAuthenticated()){
        req.session.returnTo=req.originalUrl
        req.flash("error", "sign in first")
        return res.redirect("/login")
    }
    next()
}

module.exports.isLoggedIn=isLoggedIn


const validateCampground=(req, res, next)=>{
    const {error}=campgroundSchema.validate(req.body)
    if (error){
        const mes=error.details.map(el=>el.message).join(",")
        throw new ExpressError(mes, 400)
    }
    else
        next()
}
module.exports.validateCampground=validateCampground


const isAuthor=async(req, res, next)=>{
    const {id}=req.params;
    const campground = await Campground.findById(id);
    //console.log(campground)
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'permission denied');
        return res.redirect('/campgrounds');
    }
    next()
}
module.exports.isAuthor=isAuthor

const validateReview=(req, res, next)=>{
    const {error}=reviewSchema.validate(req.body)
    if (error){
        const mes=error.details.map(el=>el.message).join(",")
        throw new ExpressError(mes, 400)
    }
    else
        next()
}

module.exports.validateReview=validateReview;

const isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.isReviewAuthor=isReviewAuthor
