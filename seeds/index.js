const mongoose=require("mongoose")
const Campground=require("../models/campground")
const cities=require("./cities")
const { descriptors, places }=require("./seedHelpers")

mongoose.connect("mongodb://localhost:27017/yelpcamp")

const db=mongoose.connection
db.on("error", console.error.bind(console, "error:("))
db.once("open",()=>{
    console.log("connected succesfully to db")
})

const sample=arr => arr[Math.floor(Math.random()*arr.length)]

const seedDb=async()=>{
    await Campground.deleteMany({});
    for (let i=0;i<20;i++){
        const randomCity=Math.floor(Math.random()*10)
        const camp=new Campground({
            loc: `${cities[randomCity].city}, ${cities[randomCity].state}`,
            name: `${sample(descriptors)} ${sample(places)}`,
            images:[
                {
                  url: 'https://res.cloudinary.com/dakdgmuxe/image/upload/v1637859885/yelpcamp/qtcqq85qsuqkdyl0edxr.jpg',
                  filename: 'yelpcamp/qtcqq85qsuqkdyl0edxr'
                }
              ],
            geometry:{
                type:"Point",
                coordinates:[23.58, 46.776]
              },
            desc: "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Ipsam ut dolor aliquid sequi ducimus? Voluptas quia quasi odit, labore repellendus, sed optio exercitationem in quas laudantium necessitatibus officia? Exercitationem, molestias?",
            price:100,
            author:"619d1154f4f0dd7f38da307d"
        })
        await camp.save()
    }
}

seedDb().then(() => {
    mongoose.connection.close();
})