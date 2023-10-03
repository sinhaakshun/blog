const express = require('express');
const routes = require('./routes/routes');
const mongoose = require('mongoose');
const path = require('path');

mongoose.connect('mongodb://localhost:27017/').then(()=>{
    console.log('connection established')
}).catch(err=>{
    console.log('failed to connect to database')
})


const app = express();

app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));


app.use('/app', routes)

app.listen(4000, ()=>{
    console.log('listening on 4000')
})