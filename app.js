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
var channels = [
    {"ChannelName":'Channels Tv',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/26266',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign.PNG',"type":"News"},
        {"ChannelName":'Abu Dhabi Tv',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/6679',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign30.PNG',"type":"Lifestyle"},
        {"ChannelName":'Crime & Investigation',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/12509',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign17.PNG',"type":"Reality"},
        {"ChannelName":'EuroNews',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/67530',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign1.PNG',"type":"News"},           
        {"ChannelName":'MBC Action',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/4078',"viewtype":'1',"type":"Movies","image":'https://wwu30.localto.net/img/redesign13.PNG'},
        {"ChannelName":'Africa News',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/26282',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign6.PNG',"type":"News"},        
        {"ChannelName":'VOX Africa',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/7606',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign31.PNG',"type":"News"},
        {"ChannelName":'BBC World News',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/26106',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign8.PNG',"type":"News"},
        {"ChannelName":'Cbeebies',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/128586',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign9.PNG',"type":"Kids"},
        {"ChannelName":'Kix',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132372',"viewtype":'1',"type":"Movies","image":'https://wwu30.localto.net/img/redesign39.PNG'},
        {"ChannelName":'CNA',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132338',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign37.PNG',"type":"News"},        
        {"ChannelName":'CGTN',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132337',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign36.PNG',"type":"News"},
        {"ChannelName":'Celestial Movies',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/28797',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign38.PNG',"type":"News"},
        {"ChannelName":'Super Action',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/83712',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign9.PNG',"type":"Kids"},

        {"ChannelName":'K+',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132370',"viewtype":'1',"type":"Movies","image":'https://wwu30.localto.net/img/redesign25.PNG'},
        {"ChannelName":'CNA',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132338',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign37.PNG',"type":"News"},        
        {"ChannelName":'CGTN',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132337',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign36.PNG',"type":"News"},
        {"ChannelName":'Celestial Movies',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/28797',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign38.PNG',"type":"News"},
        {"ChannelName":'Super Action',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/83712',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign9.PNG',"type":"Kids"},


        {"ChannelName":'CBS Justice',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/128587',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign10.PNG',"type":"Reality"},
        {"ChannelName":'CBS Reality',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/20614',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign11.PNG',"type":"Reality"},
        {"ChannelName":'Curiosity Stream',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/22547',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign23.PNG',"type":"Lifestyle"},
        {"ChannelName":'DayStar',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/31344',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign16.PNG',"type":"Religion"},
        {"ChannelName":'Deutsche Well',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/31343',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign3.PNG',"type":"News"},
        {"ChannelName":'Discovery Channel',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/128595',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign4.PNG',"type":"Reality"},
        {"ChannelName":'Destination America',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/10645',"viewtype":'1',"image":'https://wwu30.localto.net/img/redesign.PNG',"type":"North America",},
        {"ChannelName":'Sky News',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/33648',"viewtype":'1',"image":'https://wwu30.localto.net/img/redesign19.PNG',"type":"News"},
        {"ChannelName":'Bein Series',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/15586',"viewtype":'1',"image":'https://wwu30.localto.net/img/redesign26.PNG',"type":"Movie"},        
        {"ChannelName":'Bein Sports News',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/285',"viewtype":'1',"type":"News","image":'https://wwu30.localto.net/img/redesign29.PNG'},
        {"ChannelName":'Travel Channel',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/12484',"viewtype":'...',"image":'https://wwu30.localto.net/img/redesign21.PNG',"type":"Lifestyle"},
        {"ChannelName":'Telemundo',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/128663',"viewtype":'1',"type":"Movies","image":'https://wwu30.localto.net/img/redesign22.PNG'},
        {"ChannelName":'TNT Comedy',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/1617',"viewtype":'1',"type":"Movies","image":'https://wwu30.localto.net/img/redesign20.PNG'},
        {"ChannelName":'Arirang',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/74145',"viewtype":'1',"type":"Movies","image":'https://wwu30.localto.net/img/redesign25.PNG'},
        {"ChannelName":'KBS World',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/930',"viewtype":'1',"type":"News","image":'https://wwu30.localto.net/img/redesign24.PNG'},
        {"ChannelName":'MBC+ Drama',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/7542',"viewtype":'1',"type":"Movies","image":'https://wwu30.localto.net/img/redesign28.PNG'},
        {"ChannelName":'MBC 2',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/41073',"viewtype":'1',"type":"Movies","image":'https://wwu30.localto.net/img/redesign14.PNG'},
        {"ChannelName":'MBC Max',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/4075',"viewtype":'1',"type":"News","image":'https://wwu30.localto.net/img/redesign15.PNG'},
        {"ChannelName":'Bein Sport',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/2744',"viewtype":'1',"type":"Sport","image":'https://wwu30.localto.net/img/redesign27.PNG'}

    
]
io.on('connection',  onConnected) 

function onConnected(socket){
    
    
    socketConnected.add(socket.id)                 
 
socket.on('registration', (data)=>{
      //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/registration.php'
      const url = 'https://wwu30.localto.net/scripts/registration.php'
        fetch(url, {
            method: 'POST',
            body: data,
            mode:'cors'
        }).then(response => response.text())
        .then(dat => {
          socket.emit('registration', dat)
        }); 
   })
socket.on('login', (res) =>{   
        //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/login.php' 
        const url = 'https://wwu30.localto.net/scripts/login.php'
        fetch(url, {
            method: 'POST',
            body: res,
            mode:'cors'
        }).then(response => response.text())
        .then(data => { 
            console.log(data)
            socket.emit('login', data)  
        });   
        
    })
socket.on('feed-back', (data)=>{ 
    var res = JSON.stringify(data)    
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/feedback.php' 
    const url = 'https://wwu30.localto.net/scripts/feedback.php'
    fetch(url, {
        method: 'POST',
        body: res,
        mode:'cors'
    }).then(response => response.text())
    .then(data => { 
              
    }); 
})   
socket.on('logout',(res)=>{
    const url = 'https://wwu30.localto.net/scripts/updateLogs.php'
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/updateLogs.php' 
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
        //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/get_topics.php' 
        const url = 'https://wwu30.localto.net/scripts/get_topics.php'
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
    const url = 'https://wwu30.localto.net/scripts/forgot-account.php'
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/forgot-account.php' 
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
socket.on('get-channels', ()=>{
       socket.emit('get-channels', channels)
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/checksub.php'
    const url = 'https://wwu30.localto.net/scripts/checksub.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/post_topics.php'
    const url = 'https://wwu30.localto.net/scripts/post_topics.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/sendpetition.php'
    const url = 'https://wwu30.localto.net/scripts/sendpetition.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/sendpetition-email.php'
    const url = 'https://wwu30.localto.net/scripts/sendpetition-email.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/sendpetition-pass.php'
    const url = 'https://wwu30.localto.net/scripts/sendpetition-pass.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/subscription.php'
    const url = 'https://wwu30.localto.net/scripts/subscription.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/date_dash.php' 
    const url = 'https://wwu30.localto.net/scripts/date_dash.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/get_appointments.php'
    const url = 'https://wwu30.localto.net/scripts/get_appointments.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/update_appointments.php'
    const url = 'https://wwu30.localto.net/scripts/update_appointments.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/get_comments.php'
    const url = 'https://wwu30.localto.net/scripts/get_comments.php'
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
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/post_comments.php'
    const url = 'https://wwu30.localto.net/scripts/post_comments.php'
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
