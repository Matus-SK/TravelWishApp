const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(__dirname + '/public'))
app.set("view engine", "ejs");

//set dtb connections
mongoose.connect("mongodb://localhost:27017/wishtravelDB", {useNewUrlParser: true, useUnifiedTopology: true});


//db setting

const placeNameSchema = new mongoose.Schema({
    item: String,
    created: {type: Date, default: Date.now}
});

const continentNameSchema = new mongoose.Schema({
    name: String,
    item: [placeNameSchema]
});

//two collection in database
const Afrika = mongoose.model("Afrika", placeNameSchema);
const Continent = mongoose.model("Continent", continentNameSchema );



const place1 = new Afrika({
    item: "Welcome to Travel wish app"
});

const place2 = new Afrika({
    item: "<--click there to delete item"
});

const defaultPlaces = [place1, place2];

app.route("/")

.get(function(req, res){

    Afrika.find(function(err, foundPlaceNames){
        if (foundPlaceNames.length === 0) {
            Afrika.insertMany(defaultPlaces, function(err){});
            res.redirect("/")
        }else{
            res.render("list", {addPlace: foundPlaceNames, header: "Afrika"});
        }
    });
    
})
//make decision in witch database should be informations saved
.post(function(req, res){
    const addPlace = req.body.addPlace;
    const listHeader = req.body.button;

    const newPlace = new Afrika ({
        item: addPlace
    });
    
    if (listHeader === "Afrika"){
        if (addPlace){
            newPlace.save();
            
            res.redirect("/");
        }else {
            res.redirect("/");
        }
        
    }else {
        if (addPlace){
            Continent.findOne({name: listHeader}, function(err, foundContinents){
                foundContinents.item.push(newPlace);
                foundContinents.save();
                res.redirect("/" + listHeader);
            })
        } else {
            res.redirect("/" + listHeader);
        }
        
    }
});


//render new list based of what continent was choosen
app.get("/:continentName", function(req, res){
   const header = _.capitalize(req.params.continentName);
    Continent.findOne({name: header}, function (err, foundContinents){
        if (foundContinents){
            res.render("list", {header: foundContinents.name, addPlace: foundContinents.item});
        }else {
            const continent = new Continent ({
                name: header,
                item: defaultPlaces
            });
            continent.save();
            res.redirect("/" + header);
        }
    });

});


app.post("/delete", function(req, res){
    const checkbox = req.body.checkbox;
    const inputHeader = req.body.inputType;

    if (inputHeader === "Afrika"){
        Afrika.deleteOne({_id: checkbox},function(err){});
        res.redirect("/");
    }else{
        Continent.findOneAndUpdate({name: inputHeader}, {$pull: {item:{_id: checkbox}}}, function(err){});
        res.redirect("/" + inputHeader);
    }
    
});




app.listen(3000, function(req, res){
    console.log("Server has started succesfully");
});