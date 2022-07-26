const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
const bcrypt = require('bcrypt');
const saltRounds = 10;
const express = require('express')
const app = express()
const User = require('./database/User');
const Userprofile = require('./database/UserProfile');
const { ensureIndexes } = require('./database/User');



main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb://localhost:27017/site');
  console.log("database started")
}


app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());

app.post('/signup',async(req,res,next)=>{
  const {username,password,email} = req.body;
  const hash = await bcrypt.hash(password,saltRounds);
  const user = new User({
      username,
      password: hash,
      email
  })
  await user.save();
  const UserProfile = new Userprofile({username,email});
  await UserProfile.save();
  
  res.status(200).json({
    username: username,
    email: email,
    password: hash
  })
})

app.post('/login',async (req,res)=>{
  const {username,password} = req.body;
  const user = await User.findOne({username});
  const validPassword = await bcrypt.compare(password,user.password)
  if(validPassword){
    const token = jwt.sign({ username }, 'secer_key');
    res.status(200).json({ token:token})
    const us = await User.findOneAndUpdate({username},{token});
  }else{
    res.status(403).send('wrong details')
  }
})


app.post('/userList',(req,res)=>{
  Userprofile.find({}, function(err, users) {
    var userMap = [];
    users.forEach(function(user) {
      userMap.push(user.username)
      
    });
    res.json(userMap)
})
})

const auth =(req, res, next)=>{
  const token = req.body.token 

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, 'secer_key');
    req.user = decoded;
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
}

app.post('/userProfileEdit',auth,(req,res)=>{

  const token = req.body.token 
  User.findOne({token},async function(err,data){
    if(err){
      res.send("you are not allow to see this data")
    }else{
      const username = data.username
        const profile =await Userprofile.findOne({username})
        res.json({profile})
    }})
  })


app.listen(3000,()=>{
  console.log("server started")
})