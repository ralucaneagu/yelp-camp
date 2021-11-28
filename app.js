if(process.env.NODE_ENV!=="production"){
    require("dotenv").config()
}


console.log(process.env.SECRET)

const express = require('express');
const router=express.Router()
const dbUrl=process.env.DB_URL || "mongodb://localhost:27017/yelpcamp"

const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session')
const flash = require('connect-flash')
const ExpressError = require('./utils/ExpressError')
const methodOverride = require('method-override')
const passport=require("passport")
const localStrat=require("passport-local")
const User=require("./models/user")
const mongoSanitize=require("express-mongo-sanitize")
const helmet=require("helmet")

//const {MongoStore}=require("connect-mongo")
const MongoDBStore=require("connect-mongo")(session)



mongoose.connect(dbUrl)

const db=mongoose.connection
db.on("error", console.error.bind(console, "error:("))
db.once("open",()=>{
    console.log("connected succesfully to db")
})

const app=express()
const campgroundRoutes=require("./routes/campgrounds")
const reviewRoutes=require("./routes/reviews")
const userRoutes=require("./routes/users");
//const MongoStore = require("connect-mongo");

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname,"views"))

app.use(methodOverride("_method"))
app.use(express.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, "public")))

const secret=process.env.SECRET||"thisshouldbeasecret"
const store=new MongoDBStore({
    url: dbUrl,
    secret,
    touchAfter: 24*3600
})

store.on("error", function(e){
    console.log("Session error", e)
})

const sessionConfig={
    store,
    name:"session",
    secret,
    resave:false,
    saveUninitialized:true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(express.static(path.join(__dirname, 'public')))

app.use(flash());
app.use(helmet())

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dakdgmuxe/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(new localStrat(User.authenticate()))
app.use(mongoSanitize({
    replaceWith:"_"
}))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

/*const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})*/

app.use((req, res, next) => {
    console.log(req.query)
    //console.log(req.session)
    res.locals.currentUser=req.user
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get("/fakeUser", async(req, res)=>{
    const user=new User({email: "raluk6102@yahoo.com", username: "raluk"})
    const newUser=await User.register(user,"monkey")
    res.send(newUser)
})

app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes)


app.get("/", (req, res)=>{
    res.render("home")
})


const port=process.env.PORT||3000

app.listen(port,()=>{
    console.log(`listening on port ${port}`)
})

