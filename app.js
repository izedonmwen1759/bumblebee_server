const express = require('express')
const res = require('express/lib/response')
const path = require('path')
const app = express()
const PORT = process.env.PORT ||  5006
const server = app.listen(PORT, () => console.log('server running on '+PORT))
const io = require('socket.io')(server, {
    cors:{
        origin:'https://arcane-dawn-97707.herokuapp.com/'
    }
}) 
const mysql = require("mysql")
const { use } = require('express/lib/application')
const req = require('express/lib/request')
const { redirect } = require('express/lib/response')
const fetch = require("node-fetch") 
const { response } = require('express')
//app.use(express.static(path.join(__dirname, 'testwork')))

let socketConnected = new Set()
var users = []

io.on('connection',  onConnected) 

function onConnected(socket){
 console.log(socket.id)
    socketConnected.add(socket.id)
    socket.on('user_connected', (id) =>{
        users[id] = socket.id       
        socket.emit('user_connect', id)
    })

    socket.on('login-details', (res) =>{
        const url = 'https://sm.emarkets24.com/etalk_app/newFile/login.php'  
       var data = JSON.stringify(res) 
        fetch(url, {
            method: 'POST',
            body: data,
            mode:'cors' 
        }).then(response => response.text())
        .then(res => {   
            var data = JSON.parse(res)
           // console.log(data)
           socket.emit('userlogin', data)
        }) 
    })
    
    socket.on("user_connected", (user) =>{        
        //save in array        
        users[user] = socket.id
       
        const url = 'https://sm.emarkets24.com/bumblebee/php/updatelogin.php'
        const d = {
            userid:user,
            num:1
        }
        const data = JSON.stringify(d)
        fetch(url, {
            method: 'POST',
            body: data,
            mode:'cors'
        }).then(response => response.text())
        .then(data => {
           // console.log(data)
           // socket.emit('report', data)
        }); 
    })
    socket.on('find-messengers', (res) =>{
        const url = 'https://sm.emarkets24.com/etalk_app/newFile/messengers.php'  
        var data = {
            id: res
        } 
        var d = JSON.stringify(data) 
       
         fetch(url, {
             method: 'POST',
             body: d,
             mode:'cors'
         }).then(response => response.text())
         .then(res => {    
            // var data = JSON.parse(res)
             console.log(res)
            socket.emit('displayMessenges', res)
         })
    })
    
    socket.on('message', (res) =>{
        var socketId = users[res.to]  
        //var usersocket = users[res.from]      
        io.to(socketId).emit('chat-message', res) 
        io.to(socketId).emit('lastmessage', res.message,res.from)  
        var data = JSON.stringify(res)
         const url = 'https://sm.emarkets24.com/etalk_app/newFile/chatMessages.php'              
         fetch(url, {
             method: 'POST',
             body: data,
             mode:'cors'
         }).then(response => response.text())
         .then(response => {             
         })     
       
    }) 
    socket.on('allchat messages', (res) =>{
        var data = JSON.stringify(res)
         const url = 'https://sm.emarkets24.com/etalk_app/newFile/openmessages.php'              
         fetch(url, {
             method: 'POST',
             body: data,
             mode:'cors'
         }).then(response => response.text())
         .then(response => {   
        socket.emit('messages', response)
         })  
    }) 
    socket.on('find number', (dat) =>{
        const res = {
            enum:dat
        } 
        var data = JSON.stringify(res) 
         const url = 'https://sm.emarkets24.com/etalk_app/newFile/numberdetails.php'              
         fetch(url, {
             method: 'POST',
             body: data,
             mode:'cors'
         }).then(response => response.text())
         .then(response => {   
             console.log(response)
        socket.emit('find number', response)
         })  
    })   
     socket.on('send to user', (data)=>{
        var socketId = users[data.id]
        console.log(data)
        io.to(socketId).emit('send response', data)  
     })
    socket.on('feedback', (data) => {
        var socketId = users[data.to]  
        if(data.feedback === ''){
            io.to(socketId).emit('clearfeedback', data)
        }else{
            io.to(socketId).emit('feedback', data)
        }   
       
    })
   // socket.broadcast.emit('brdcast', socket.id)

    io.emit('clients-total', socketConnected.size)   


}