const express = require('express')
const app = express()
const PORT = process.env.PORT ||  5006
const server = app.listen(PORT, () => console.log('server running on '+PORT))
const io = require('socket.io')(server, {
    cors:{
        origin:'*'      
    }
}) 
const fetch = require("node-fetch")
//app.use(express.static(path.join(__dirname, 'testwork')))

let socketConnected = new Set()
var users = []
io.on('connection',  onConnected) 

function onConnected(socket){
  
    console.log(socket.id)
    socketConnected.add(socket.id)  
 
    socket.on('user_connected', (id) =>{
        users[id] = socket.id
        socket.broadcast.emit("user_connected", id) 
       
    })

function userstatus(id){
    var userSocket = users[id]
    return userSocket
}

    socket.on('userstatus', (data)=>{        
       
        if(userstatus(data.otheruser) === undefined){
            var res = false
        }else{
            var res = true
        }
        socket.emit('userstatus', res) 
        console.log(userstatus(data.otheruser))
        console.log(res)
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
        
    socket.on('message', (info) =>{
        console.log(info.message)
        var socketId = users[info.to]
        socket.broadcast.to(socketId).emit('chat-message', info)
       socket.broadcast.to(socketId).emit('lastmessage', info.message,info.from)
         if(info.type === '0'){
            var data = JSON.stringify(info) 
         const url = 'https://sm.emarkets24.com/etalk_app/newFile/chatMessages.php'              
         fetch(url, {
             method: 'POST',
             body: data,  
             mode:'cors'    
         }).then(response => response.text())
         .then(response => {               
         })     

        }else if(info.type === 1 || info.type === '1'){
           
         } else{} 
                
    })  
    socket.on('user-profile', (id)=>{
        const info ={
            userid:id
        }    
        var data = JSON.stringify(info) 
        const url = 'https://sm.emarkets24.com/etalk_app/newFile/checkoutprofile.php' 
        fetch(url, {
            method: 'POST',
            body: data,  
            mode:'cors'    
        }).then(response => response.text())
        .then(response => { 
            socket.emit('user-profile', response)              
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

    socket.on('task', (res)=>{
        var data = JSON.stringify(res) 
        const url = 'https://sm.emarkets24.com/etalk_app/newFile/tasks.php'              
        fetch(url, {
            method: 'POST',
            body: data,
            mode:'cors'
        }).then(response => response.text())
        .then(response => {   
            console.log(response) 
            socket.emit('task', response)     
        })  
      
    })
   // socket.broadcast.emit('brdcast', socket.id)

    io.emit('clients-total', socketConnected.size)   
    socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketConnected.delete(socket.id)        
    })

} 