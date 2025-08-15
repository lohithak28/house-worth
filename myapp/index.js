const express=require('express');
const bodyParser=require('body-parser');
const mongoose=require('mongoose');
const app=express();
const port=3000;
//middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
const mongoURI='mongodb://localhost:27017/mydatabase';
mongoose.connect(mongoURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})
  .then(() =>console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:',err));
  const userSchema=new mongoose.Schema({
    username:String,
    password:String,
  });
  const student=mongoose.model('student',userSchema);
  //routes
  app.get('/signup',(req,res)=>{
    res.sendFile(__dirname + '/public/signup.html');
  });
  app.get('/login',(req,res)=>{
    res.sendFile(__dirname + '/public/login.html');
  });
  app.get('/welcome',(req,res)=>{
    res.sendFile(__dirname + '/public/welcome.html');
  });
  app.post('/signup',async(req,res)=>{
    if(!student){
        return res.status(500).send('database not connected');
    }
    const {username,password}=req.body;
    try {
        //const collection=User.collection('student');
        const user= await student.collection.findOne({username});
        if(user){
            return res.send('user already exists');
        }
        await student.collection.insertOne({username,password});
        res.send('Signup successful');
    }catch(err){
        console.error('error during signup:',err);
        res.status(500).send('internal server error')
    }
  });
  app.post('/login',async(req,res)=> {
    const {username,pwd}=req.body;
   // const collection=User.collection('student');
    //check if user exists
    const user=await student.collection.findOne({username,pwd});
    if(user){
        res.send('login successful');
        //res.redirect(/welcome.html?username=${username});
    }else {
        res.send('invalid credentials')
    }
  });
  app.listen(port,()=>{
    console.log(`server running at http://localhost:${port}`);
  });