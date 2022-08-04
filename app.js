const express = require('express')
const app = express()
const PORT = process.env.PORT ||  5009
const server = app.listen(PORT, () => console.log('server running on '+PORT))
const io = require('socket.io')(server, {
    cors:{
        origin:'*'      
    }
}) 
const fetch = require("node-fetch")
const { v4: uuidV4} = require('uuid')
//app.use(express.static(path.join(__dirname, 'testwork')))

let socketConnected = new Set()
let rmId
var users = []
var datedashArr = []
var topicArr = []
var calenda = []
io.on('connection',  onConnected) 

function onConnected(socket){
    
    console.log(socket.id)
    socketConnected.add(socket.id)  
 
    socket.on('registration', (data)=>{
      const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/registration.php'
        fetch(url, {
            method: 'POST',
            body: data,
            mode:'cors'
        }).then(response => response.text())
        .then(data => {
            
           socket.emit('registration', data)
        }); 
    })
    socket.on('login', (res) =>{   
        const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/login.php' 
        fetch(url, {
            method: 'POST',
            body: res,
            mode:'cors'
        }).then(response => response.text())
        .then(data => { 
            
            socket.emit('login', data)  
        });   
        
    })
    
socket.on('logout',(res)=>{
    
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/updateLogs.php' 
    fetch(url, {
        method: 'POST',
        body: res, 
        mode:'cors'
    }).then(response => response.text())
    .then(data => { 
       
       socket.emit('logout', data)
    }); 
})
    socket.on('user_connected', (id) =>{ 
        users[id] = socket.id
       // socket.broadcast.emit("user_connected", id) 
        
    })

function userstatus(id){
   let  userSocket = ''
    if(users[id] === undefined){
         userSocket = undefined
    }else{
         userSocket = users[id]
    }
    return userSocket
}
    socket.on('text', (data)=>{
        socket.broadcast.emit('text', data)
    })
    socket.on('userstatus', (data)=>{        
       
        if(userstatus(data.otheruser) === undefined){
            var res = false
        }else{
            var res = true
        }
        socket.emit('userstatus', res) 
       
    })
  socket.on('calendaSetting', (data)=>{
      if(calenda.length === '0' || calenda.length === 0 || calenda.length === null){
          calenda.push(data)
      }else{

      
      }
  })  
  socket.on('opencalenda',(data)=>{
    
    for (let i = 0; i < calenda.length; i++) {
           if(calenda[i].sender == data.id || calenda[i].receiver == data.id){
              
            socket.emit('opencalenda', calenda[i])
           }
    }
     
  }) 
  socket.on('dashaccount',(data)=>{
    if(datedashArr.length === 0 || datedashArr.length === '0'){
        datedashArr.push(data)
        
        
        io.emit('datedash', datedashArr)
    }else if(datedashArr.length > 0){ 
        for (let i = 0; i < datedashArr.length; i++) {
                if(datedashArr[i].id === data.id){
                    datedashArr.push(data)
                    datedashArr = [...datedashArr.reduce((map,obj)=> map.set(obj.id, obj), new Map()).values()]                     
                    
                    io.emit('datedash', datedashArr)
                    
                }else{
                    datedashArr.push(data)
                    io.emit('datedash', datedashArr)
                    
                }               
            }
    }
      
   
  })  
  socket.on('report_message', (data)=>{

      if(userstatus(data.to) === undefined || userstatus(data.to) === 'undefined'){

      }else{
          socket.to(userstatus(data.to)).emit('report_message', data)
      }
  })
  socket.on('findUserSex', (data)=>{
      const d ={
          num:data 
      }
    if(datedashArr.length > 0){
        for (let i = 0; i < datedashArr.length; i++) {
            
                if(datedashArr[i].sex == d.num){                    
                    
                    socket.emit('datedash2', datedashArr[i])                  
                }          
            }
    }else{

    }
      
  })
  socket.on('schedule',(data)=>{
   
    socket.to(userstatus(data.id)).emit('schedule', data)
  })
    socket.on('topics', (data)=>{ 
      
        const anotherData = {
            roomId: uuidV4(),
            topic:data.topic,
            comments:data.comments,
            user:data.user
        }   
        topicArr.push(anotherData)
       
        io.emit('topics', topicArr) 
        
    })
socket.on('freetopics', ()=>{       
       
        io.emit('topics', topicArr)
})
socket.on('getTopicDetails', (data)=>{
        for (let i = 0; i < topicArr.length; i++) {
      
       if(topicArr[i].roomId === data.room && topicArr[i].user === data.createdBy){
        socket.join(topicArr[i].roomId)
        socket.to(topicArr[i].roomId).emit('user-connected',  topicArr[i].roomId)
        io.to(topicArr[i].roomId).emit("comments", topicArr[i].comments) 
        io.in(topicArr[i].roomId).allSockets().then(result=>{
            io.to(topicArr[i].roomId).emit("total-numbers", result.size) })
       }else{
         
       }
    }
})

socket.on('leave-room',(data)=>{
   
    for (let i = 0; i < topicArr.length; i++) {
      
        if(topicArr[i].topic === data.topic && topicArr[i].roomId === rmId){            
            socket.leave(topicArr[i].roomId)
            socket.to(topicArr[i].roomId).emit("user-connected", topicArr[i].roomId) 
        }
     }    

})
socket.on('getcomments', (data)=>{
    let report = 0
     for (let i = 0; i < topicArr.length; i++) {
       
        if(topicArr[i].roomId === data.room){        
      
     socket.to(data.room).emit("comments", topicArr[i].comments) 
        }
     }
    // socket.emit('comments', report)
 })
socket.on('comments', (data)=>{
   let report = 0
    for (let i = 0; i < topicArr.length; i++) {
      
       if(topicArr[i].roomId === data.room){         
       
       topicArr[i].comments.push(data)
     //report = topicArr[i].comments
     io.to(topicArr[i].roomId).emit("comments", topicArr[i].comments) 
     io.to(topicArr[i].roomId).emit('clients-total', socketConnected.size)   
       }else{
        
       }
    }
    
})
    socket.on('find-messengers', (res) =>{
        const url = 'https://sm.emarkets24.com/etalk_app/newFile/messengers.php'  
        var data = {
            id: res
        } 
        var d = JSON.stringify(data) 
       
         
    })
         
    socket.on('message', (info) =>{    
        var socketId =  userstatus(info.to)
        socket.broadcast.to(socketId).emit('chat-message', info)
       socket.broadcast.to(socketId).emit('lastmessage', info.message,info.from)
         if(info.type === '0'){
            var data = JSON.stringify(info) 
         const url = 'https://sm.emarkets24.com/etalk_app/newFile/chatMessages.php'              
             

        }else if(info.type === 1 || info.type === '1'){
           
         } else{} 
                 
    })  
    socket.on('user-profile', (id)=>{
        const info ={
            userid:id
        }    
         var data = JSON.stringify(info) 
        const url = 'https://sm.emarkets24.com/etalk_app/newFile/checkoutprofile.php' 
         
    })
    socket.on('allchat messages', (res) =>{   
        var data = JSON.stringify(res)
         const url = 'https://sm.emarkets24.com/etalk_app/newFile/openmessages.php'              
           
            
    }) 
    socket.on('find number', (dat) =>{
        const res = {
            enum:dat
        } 
        var data = JSON.stringify(res) 
         const url = 'https://sm.emarkets24.com/etalk_app/newFile/numberdetails.php'              
         
    })   
     socket.on('send to user', (data)=>{
        var socketId = users[data.id]
        
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
         
      
    })
   // socket.broadcast.emit('brdcast', socket.id)

    io.emit('clients-total', socketConnected.size)   
    socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketConnected.delete(socket.id)        
    })

} 