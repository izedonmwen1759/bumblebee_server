const { response } = require('express')
const express = require('express')
const res = require('express/lib/response')
const app = express()
const PORT = process.env.PORT ||  5009
const server = app.listen(PORT, () => console.log('server running on '+PORT))
const io = require('socket.io')(server, {
    cors:{
        origin:'*'      
    }
})   
const fetch = require("node-fetch")
const redis = require('redis')
const redis_port = process.env.PORT || 5009
const client = redis.createClient(redis_port)
const { v4: uuidV4} = require('uuid')
//app.use(express.static(path.join(__dirname, 'testwork')))

let socketConnected = new Set()
let rmId
var users = []
var datedashArr = []
var topicArr = [] 
var calenda = [] 
var chanListArr = []
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
        
        const url = 'http://localhost/xtreamz/php/get_topics.php'
        fetch(url, {
            method: 'POST',
            mode:'cors'
        }).then(response => response.text())
        .then(data => { 
            const dd = JSON.parse(data)           
            io.emit('topics', dd)        
        }); 
     
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
   socket.to(userstatus(data.receiver)).emit('calendaSetting', data)
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
        //client.set()
        
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
  socket.on('schedule',(data)=>{
   
    socket.to(userstatus(data.id)).emit('schedule', data)
  })
socket.on('topics', (data)=>{ 
    
    const anotherData = {
        roomid: uuidV4(),
        topic:data.topic,
        comments:data.comments,
        userid:data.userid
    }   
    const ddd = JSON.stringify(anotherData)
    const url = 'http://localhost/xtreamz/php/post_topics.php'
    fetch(url, {
        method: 'POST',
        body: ddd, 
        mode:'cors'
    }).then(response => response.text())
    .then(dat => { 
        const dd = JSON.parse(dat)
        io.emit('topics', dd) 
    }); 
   
    
})

socket.on('payment-successful', (res)=>{
    var data = JSON.stringify(res)    
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/subscription.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {  
        console.log(res.id)
         update_user_settings(res.id)
    }); 
})
socket.on('zoom-successful', (res)=>{
    var data = JSON.stringify(res)    
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/date_dash.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())    
    .then(data => {

    }); 
})
socket.on('get-appointments',(res)=>{
    var data = JSON.stringify(res)    
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/get_appointments.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {
        socket.emit('get-appointments',data)
    }); 
})
socket.on('send-zcode',(res)=>{
    var data = JSON.stringify(res)    
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/update_appointments.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {
        socket.emit('send-zcode', '')
    }); 
})
function update_user_settings(val){ 
    const res = {
        user:val
    }
    console.log(res+" defined")
    const ress = JSON.stringify(res)
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/getaccount.php' 
    fetch(url, {
        method: 'POST',
        body: ress, 
        mode:'cors'
    }).then(response => response.text())
    .then(data => { 
       socket.emit('login', data)
    }); 
}
socket.on('getTopicDetails', (ddd)=>{   
    const data = JSON.stringify(ddd)  
    const url = 'http://localhost/xtreamz/php/get_comments.php'
    fetch(url, {
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(response => {  
        socket.join(ddd.room)
        socket.to(ddd.room).emit('user-connected',  ddd.room)
        io.in(ddd.room).allSockets().then(result=>{ 
            io.to(ddd.room).emit("total-numbers", result.size) 
             io.to(ddd.room).emit("comments", response) 
        })
    });      
            
})
socket.on('get-ip-location', ()=>{
    const url = 'https://api.db-ip.com/v2/free/self' 
    fetch(url, { 
       method: 'POST'
    }).then(response => response.text())
    .then(data => {  
        socket.emit('get-ip-location', data)     
    });     
})
socket.on('check-subscription',(data)=>{
    var ddd = JSON.stringify(data)
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/channels.php'
  console.log(ddd)
})
socket.on('region',(data)=>{
 var ddd = JSON.stringify(data)
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/channels.php'
    const url = 'http://localhost/biznxx/country-details/channels.php'
    fetch(url, {
        method: 'POST',
        body: ddd, 
        mode:'cors'
    }).then(response => response.text())
    .then(data => { 
      socket.emit('region', data)
    }); 
})
socket.on('leave-room',(data)=>{
   
    for (let i = 0; i < topicArr.length; i++) {
      
        if(topicArr[i].topic === data.topic && topicArr[i].roomId === rmId){            
            socket.leave(topicArr[i].roomId)
            socket.to(topicArr[i].roomId).emit("user-connected", topicArr[i].roomId) 
        }
     }    

})
socket.on('user-geo-data',(data)=>{
  co

})
socket.on('channels-List-comments',(data)=>{
    if(chanListArr.length === 0 || chanListArr.length === '0'){
            chanListArr.push(data)
           console.log('e work')
    }else{
        for (let i = 0; i < chanListArr.length; i++) {
           if(chanListArr[i].chan === data.chan){
             console.log('same')
           }else{
            chanListArr.push(data)
            console.log('working')
           }
        }
    }
})


socket.on('comments', (ddd)=>{
    const data = JSON.stringify(ddd)  
    const url = 'http://localhost/xtreamz/php/post_comments.php'
    fetch(url, {
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {    
        socket.emit('refresh-comments', ddd)
    }); 
   
  //  io.to(ddd.room).emit("comments", ddd) 
   // 
   
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




//////////////////////////////////////////////////////////////////////////
/////// AGENTS SERVER

socket.on('agentLogin', (res)=>{
    var data = JSON.stringify(res) 
   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/login.php'
    const url = 'http://localhost/xtreamz/php/login.php'
    fetch(url, {
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {           
       socket.emit('agentLoginpage', data)
    }); 
})
socket.on('agentCreateUsers', (res)=>{
    var data = JSON.stringify(res)   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/agentAccountCreation.php'
    fetch(url, {
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {   
       socket.emit('agentCreateUsers', data)
    }); 
})
socket.on('list-of-users', (res)=>{
    var data = JSON.stringify(res)   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/listofusers.php'
    const url = 'http://localhost/xtreamz/php/listusers.php'
    fetch(url, {
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {
       socket.emit('list-of-users', data)
    });       
})
socket.on('find-user-with-email', (res)=>{
    var data = JSON.stringify(res)   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/findusers.php'
    fetch(url, {
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {   
      socket.emit('find-user-with-email', data)
    }); 
})
socket.on('subscription-user', (res)=>{
    var data = JSON.stringify(res)   
   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/subscription.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {  
        socket.emit('subscription-user',data)   
    }); 
}) 
socket.on('show-table-sub', (res)=>{
    var data = JSON.stringify(res)   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/subscription-table.php'
    fetch(url, { 
         method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {  
        socket.emit('show-table-sub',data)   
    }); 
})   
socket.on('earnings',(res)=>{
    var data = JSON.stringify(res)   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/earnings.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {  
        socket.emit('show-table-sub',data)   
    }); 
})
socket.on('agent-registration',(res)=>{
    var data = JSON.stringify(res)   
   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/bumblebee-users.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {  
        console.log(data)
        socket.emit('agent-registration',data)   
    }); 
})
socket.on('feedback-developers',(res)=>{
    var data = JSON.stringify(res)   
   
    //const url = 'https://www.emarkets24.com/apps/bumblebee-agent/phpscripts/agentAccountCreation.php'
    const url = 'http://localhost/xtreamz/php/bumblebee-users.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {  
        console.log(data)
        socket.emit('agent-registration',data)   
    }); 
})
///////////////////////////////////////////////////////////////////////////
////////ADMIN CONTROL









////////////////////////////////////////////////////////////////////////////
    io.emit('clients-total', socketConnected.size)   
    socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketConnected.delete(socket.id)        
    })

} 