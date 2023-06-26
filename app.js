require("dotenv").config(); //We only require it from the very top of our code.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema ({  //for encrypt to work, we need to initialize a mongoose object schema. And then the schema.
    email: String,
    password: String
});

userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]}); //It gets the secret from the .env file

const User = mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home")
});

app.get("/login", function(req, res){
    res.render("login")
});

app.get("/register", function(req, res){
    res.render("register")
});

app.post("/register", function(req, res){
    const newUser = new User ({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save()
        .then(function(){
            console.log("User saved successfully")
            res.render("secrets");
        })
        .catch(function(error) {
            console.error('An error occurred while saving:', error);
        });

});

app.post("/login", function(req, res){
    async function find(email) {
        return await User.findOne({email} )
    }
    const userName = req.body.username;
    const password = req.body.password;
    const foundUser = find(userName);

    foundUser.then(function(result){

        if (result == null) {
            res.send("Username doesn't exist");
        } else {
            if (result.password === password) {
                res.render("secrets");
            }
        }

    })
        .catch(function(error){
            res.send(error);
            console.log(error);
        })
})

app.listen(3000, function(){
    console.log("Server Started on port 3000");
});