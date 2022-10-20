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
var chanListArr = []
io.on('connection',  onConnected) 

function onConnected(socket){
    
    
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
socket.on('feed-back', (data)=>{ 
    var res = JSON.stringify(data)    
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/feedback.php' 
    //const url = 'http://localhost/xtreamz/php/feedback.php'
    fetch(url, {
        method: 'POST',
        body: res,
        mode:'cors'
    }).then(response => response.text())
    .then(data => { 
              
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
        const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/get_topics.php' 
        //const url = 'http://localhost/xtreamz/php/get_topics.php'
        fetch(url, {
            method: 'POST',
            mode:'cors'
        }).then(response => response.text())
        .then(data => { 
             
            io.emit('topics', data)        
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
socket.on('forgot-account',(data)=>{
    var res = JSON.stringify(data)
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/forgot-account.php' 
    fetch(url, {
        method: 'POST',
        body: res, 
        mode:'cors'
    }).then(response => response.text())  
    .then(daa => { 
       socket.emit('forgot-account', daa)
    }); 
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
socket.on('control-room-dash',()=>{  
    io.emit('datedash', datedashArr)
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
socket.on('check-subscription', (data)=>{    
    const ddd = JSON.stringify(data)
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/checksub.php'
    //const url = 'http://localhost/xtreamz/php/checksub.php'
    fetch(url, {
        method: 'POST',
        body: ddd, 
        mode:'cors'
    }).then(response => response.text())
    .then(dat => {  
      socket.emit('check-subscription', dat) 
    });      
  })
socket.on('topics', (data)=>{  
    
    const anotherData = {
        roomid: uuidV4(),
        topic:data.topic,
        userid:data.userid
    }   
    const ddd = JSON.stringify(anotherData)
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/post_topics.php'
    //const url = 'http://localhost/xtreamz/php/post_topics.php'
    fetch(url, {
        method: 'POST',
        body: ddd, 
        mode:'cors'
    }).then(response => response.text())
    .then(dat => { 
       
        io.emit('topics', dat)   
    }); 
    
})
socket.on('send-message-for-user-account-update', (send_data)=>{
    const ddd = JSON.stringify(send_data)
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/sendpetition.php'
    
    fetch(url, {
        method: 'POST',
        body: ddd, 
        mode:'cors'
    }).then(response => response.text())
    .then(dat => {    
        socket.emit('send-message-for-user-account-update', "")   
    }); 
}) 
socket.on('send-message-for-user-email-update', (send_data)=>{
    const ddd = JSON.stringify(send_data)
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/sendpetition-email.php'
    
    fetch(url, {
        method: 'POST',
        body: ddd, 
        mode:'cors'
    }).then(response => response.text())
    .then(dat => {     
        socket.emit('send-message-for-user-account-update', "")   
    }); 
})
socket.on('send-message-for-user-pass-update', (send_data)=>{
    const ddd = JSON.stringify(send_data)
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/sendpetition-pass.php'
    
    fetch(url, {
        method: 'POST',
        body: ddd, 
        mode:'cors'
    }).then(response => response.text())
    .then(dat => {   
        socket.emit('send-message-for-user-account-update', "")   
    }); 
})  
socket.on('payment-successful', (res)=>{
    var data = JSON.stringify(res)    
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/subscription.php'
    //const url = 'http://localhost/xtreamz/php/subscription.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(daa => {  
        socket.emit('payment-successful', daa)
    }); 
})
socket.on('zoom-successful', (res)=>{
    var data = JSON.stringify(res)    
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/date_dash.php' 
    //const url = 'http://localhost/xtreamz/php/date_dash.php'
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
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/get_appointments.php'
    //const url = 'http://localhost/xtreamz/php/get_appointments.php'
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
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/update_appointments.php'
    //const url = 'http://localhost/xtreamz/php/update_appointments.php'
    fetch(url, { 
        method: 'POST',
        body: data,
        mode:'cors'
    }).then(response => response.text())
    .then(data => {
        socket.emit('send-zcode', '')
        if(userstatus(res.to) === undefined){

        }else{
        socket.to(userstatus(res.to)).emit("send-zcode-receive",res.zcode) 
        }
       
    }); 
})

socket.on('getTopicDetails', (ddd)=>{   
    const data = JSON.stringify(ddd)  
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/get_comments.php'
    //const url = 'http://localhost/xtreamz/php/get_comments.php'
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

socket.on('leave-room',(data)=>{
   
    for (let i = 0; i < topicArr.length; i++) {
      
        if(topicArr[i].topic === data.topic && topicArr[i].roomId === rmId){            
            socket.leave(topicArr[i].roomId)
            socket.to(topicArr[i].roomId).emit("user-connected", topicArr[i].roomId) 
        }
     }    

})

socket.on('comments', (ddd)=>{
    const data = JSON.stringify(ddd)  
    const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/post_comments.php'
    //const url = 'http://localhost/xtreamz/php/post_comments.php'
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






////////////////////////////////////////////////////////////////////////////
    io.emit('clients-total', socketConnected.size)   
    socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
    socketConnected.delete(socket.id)        
    })

} 