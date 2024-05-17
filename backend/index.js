const port = 4000;
const express = require('express');
// express: Express.js is a web application framework for Node.js, used for
//  building web applications and APIs. It provides various features for handling HTTP requests, routing, middleware, etc.
const app = express();
const mongoose = require('mongoose');
// Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. 
// It provides a schema-based solution to model application data and interactions with MongoDB databases.
const jwt = require('jsonwebtoken');
// JWT (JSON Web Tokens) is a compact, URL-safe means of representing claims to be transferred between two parties.
//  It's commonly used for authentication and information exchange in web development.
const multer = require('multer');
// Multer is a middleware for handling multipart/form-data, which is primarily used for uploading files in web applications.
const path = require('path');
// The path module provides utilities for working with file and directory paths.
//  It's often used for resolving and manipulating file paths in Node.js applications.
const cors = require('cors');
// CORS (Cross-Origin Resource Sharing) is a security feature implemented by web browsers that restricts web pages from making
//  requests to a different origin (domain, protocol, or port) than the one from which the web page originated.
// In Node.js with Express.js, you can use the cors middleware to enable CORS support in your server. This middleware adds the
//  necessary HTTP headers to responses to allow requests from specified origins, methods, and headers.
app.use(express.json());
app.use(cors()); 
// Data base connection with mongodb
mongoose.connect("mongodb+srv://Naniecommerce:Venkatreddypadala123123@cluster0.yaorrl1.mongodb.net/e-commerce");

//API creation 

app.get("/",(req,res)=>{
    res.send("Express App is Running");
})
// Image storage Engine
const storage = multer.diskStorage({
    destination:'./upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})
const upload = multer({storage: storage})
// creating upload endpoint

app.use('/images',express.static('upload/images'))

app.post('/upload',upload.single('product'),(req,res)=>{
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Scehema for creating products
const Product = mongoose.model('Product',{
    id:{
        type:Number,
        required:true
    },
    name:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    new_price:{
        type:Number,
        required:true
    },
    old_price:{
        type:Number,
        required:true
    },
    date:{
        type:Date,
        default:Date.now(),
    },
    available:{
        type:Boolean,
        default:true
    },
}) 

// creating a endpoint to add the products 

app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length > 0){
        let last_product_array = products.slice(-1);
        let last_product =last_product_array[0];
        id = last_product.id + 1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})
// creating api for deleting products 
app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({ id: req.body.id });
    console.log("removed");
    res.json({
        success: true,
        name: req.body.name,
    });
});

// creating api for getting all products
app.get('/all_products',async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})
// Schema Creating for Usermodel
const Users = mongoose.model('Users',{
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now()
    }
})

// creating an endpoint to register the user 
app.post('/signup',async (req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"Existing User Found with same email Address"})
    }
    let cart = {};
    for(let i = 0; i <300;i++){
        cart[i] = 0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
})
await user.save();
const data = {
    user:{
        id:user.id
    }
}
const token = jwt.sign(data,'secret_ecom');
res.json({success:true, token})
});

// Creating endpoint for userlogin
app.post('/login',async (req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data = {
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true, token})
        }
        else{
           res.json({success:false,errors:"Incorrect Password"});
        }
    }
    else{
        res.json({success:false,errors:"User Not Found"});
    }
})

// Creating endpoint for newcollection Data
app.get('/newcollections',async (req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("newcollection Fetched");
    res.send(newcollection);
})
// creating endpoint for popular items in women section
app.get('/popularinwomen',async (req,res)=>{
    let products = await Product.find({category: 'women'});
    let popular_in_women = products.slice(0,4);
    console.log("popular in women Fetched");
    res.send(popular_in_women);
})
// creating middleware to fetch the user
const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please Authenticate using valid token"})
    }
    else{
        try{
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        }catch(error){
            res.status(401).send({errors:"please authenticate using valid token"})
        }
    }
}

// creating endpoint for adding products in the cartdata
app.post('/addtocart',fetchUser,async (req,res)=>{
    console.log("Added",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")
})

// creating endpoint for removing product from cart data
app.post('/removefromcart',fetchUser,async (req,res)=>{
    console.log("Removed",req.body.itemId);
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId]-=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
})

//creating a endpoint to get the cartdata 
app.post('/getcart', fetchUser, async (req, res) => {
    try {
        console.log("GetCart");
        let userData = await Users.findOne({ _id: req.user.id });
        if (userData) {
            res.json(userData.cartData);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        console.error("Error fetching cart data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.listen(port,(error)=>{
    if(!error){
        console.log(`Server is running on port ${port}`);
    }
    else{
        console.log(`Error ${error}`);
    }
});