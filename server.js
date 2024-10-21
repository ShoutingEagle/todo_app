// packages
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const session = require('express-session')
const mongoDbSession = require('connect-mongodb-session')(session)
const bcrypt = require('bcryptjs')


//files
const userModel = require('./schemas/userSchema.js'); 
const sessionModel = require('./schemas/sessionSchema.js')
const todoModel = require('./schemas/todoSchema.js')
const isAuth = require('./utils/isAuth.js')
const rateLimitingMiddleware = require('./utils/rateLimitingMiddleware.js')

// constants
const app = express()
const PORT = process.env.PORT || 8000
const MONGO_URI = process.env.MONGO_URI
const secret = process.env.secret
const salt = process.env.salt
const store = new mongoDbSession ({
    uri: MONGO_URI,
    collection: 'todo_sessions'
})

//middleware
app.set('view engine','ejs')
app.use(express.json())
app.use(express.urlencoded({extended : true}))
app.use(express.static('public'))
// Prevent caching
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});


app.use(session({
    secret,
    store,
    resave: false,
    saveUninitialized: false
}))

//DB_Connection
mongoose
.connect(MONGO_URI)
.then(res => console.log('db connection successful'))
.catch(error => console.log(error))

//api
//login
app.get('/login',(req,res) => {
    res.render('login')
})

app.post('/login',async(req,res) => {
    const loginData = req.body
    try {
        const dbResObj = await userModel.findOne({username: loginData.username})
        const decryptPassword = await bcrypt.compare(loginData.password,dbResObj.password) 
        if(decryptPassword){
            req.session.isAuth = true
            req.session.userDetail = {
                name: dbResObj.name,
                username: dbResObj.username
            }
            
            return res.json({message : 'login-success',userData: req.session.userDetail})
        }
        return res.send('check username/password')
    } catch (error) {
        return res.send({
            message: error.message
        })
    }
})

//signup
app.get('/',(req,res) => {
    if(req.session.isAuth) {
        res.render('dashboard')
    }else {
        res.render('signup')
    }
})

app.post('/signup',async (req,res) => {
    
    const {name,username,email,password} = req.body

    //hash password
    const hashedPass = await bcrypt.hash(password,Number(salt))

    const userObj = new userModel({name,username,email,password:hashedPass})

        try {
            await userObj.save()
            return res.send({
                message: 'success'
            })
        } catch (error) {
            return res.send({
                message : error.message
            })
        }
})

app.get('/dashboard', isAuth, (req, res) => {
    res.render('dashboard', { user: req.session.userDetail });
})

//logout
app.get('/logout',(req,res) => {    
    req.session.destroy(err => {
        if(err) return res.send({message : err})
        return res.send({message : 'logout successfull'}) 
    })
})

//logoutAll
app.get('/logoutAll',async (req,res) => {    
    const {username} = req.session.userDetail
    
    try {
        const logoutAll = await sessionModel.deleteMany({"session.userDetail.username":username})
        return res.send('logout from all devices successfull')
    } catch (error) {
        return res.send('logout from all devices failed due to',error)
    }
})

//todo
//create
app.post('/createTodo',rateLimitingMiddleware,async (req,res) => {
    console.log('second');
    
    const {inputTodo} = req.body
    const {username} = req.session.userDetail
    const todoObj = new todoModel({inputTodo,completed: false,username})
    
    try {
        const response = await todoObj.save()
        return res.send(response)
    } catch (error) {
        console.log(error);
        return res.send(error)
    }
})

//update
app.post('/updateTodo',async (req,res) => {
    const {inputTodo,_id} = req.body

    try {
        const response = await todoModel.updateOne({'_id': _id},{'inputTodo': inputTodo})
        res.send(response)
    } catch (error) {
        res.send(error)
    }

    
})

//delete
app.post('/deleteTodo',async (req,res) => {
    const{_id} = req.body
    try {
        const response = await todoModel.deleteOne({'_id':_id})
        res.send(response); 
    } catch (error) {
        res.send(error);
    }
    
})

//getTodo
app.get('/getTodo',async (req,res) => {
    const {username} = req.session.userDetail
    const {skip} = req.query

    
    
    try {
        const todos = await todoModel.aggregate([
            {
                $match: {username}
            },
            {
                $skip: Number(skip)
            },
            {
                $limit: 5
            }
        ])
        return res.send(todos)
        
    } catch (error) {
        console.log(error);
        
    }
})

app.listen(PORT,() => console.log(`server is running at http://localhost:${PORT}`))



