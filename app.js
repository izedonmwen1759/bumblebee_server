const express = require('express')
const app = express()
const PORT = process.env.PORT ||  6456
const server = app.listen(PORT, () => console.log('server running on '+PORT))
const io = require('socket.io')(server, {
    cors:{
        origin:'*'      
    } 
}) 
const sha1 = require('crypto-js/sha1') 
const {v4 : uuidV4} = require('uuid')
const fetch = require("node-fetch")
const fs = require('fs')
const corss = require('cors')
app.use(corss({     
    origin:'http://localhost:9876'
}))
app.get("/", (req, res) => {
    //res.sendFile(__dirname + "/index/");
     res.end(channelArrs)
}); 

let socketConnected = new Set()
var movies = []
var series = []
const datedashArr =[]
var jsonContent = ''
let dataUser = fs.readFileSync('./json/users.json')
var userdata = JSON.parse(dataUser)

var dataTopic = fs.readFileSync('./json/topic.json')
var userdataTop = JSON.parse(dataTopic)

var sub = fs.readFileSync('./json/sub.json')
var subscribe = JSON.parse(sub)

var dataComment = fs.readFileSync('./json/comment.json')
var userdataComment = JSON.parse(dataComment)

var dataDash = fs.readFileSync('./json/datedash.json')
var userdataDash = JSON.parse(dataDash)
var cha = fs.readFileSync('./json/channels.json')
var channelArrs = JSON.parse(cha)

app.get("/media/:medi", (req,res)=>{
     res.send(userdata)    
})
app.get("/:json", (req, res) => {
    //res.sendFile(__dirname + "/index/");
     res.end(userdata)
});
io.on('connection',  onConnected) 
 
function onConnected(socket){
       
    socketConnected.add(socket.id)     
  

socket.on('admin-portal-movies', (data)=>{
       movies.push(data)   
       socket.emit('admin-portal-movies', JSON.stringify(movies))    
})   
socket.on('movies-list', ()=>{
    socket.emit('admin-portal-movies', JSON.stringify(movies))    
})  
socket.on('series-list', ()=>{
    socket.emit('admin-portal-series', JSON.stringify(series))    
})   
socket.on('admin-portal-series', (data)=>{
    series.push(data)  
    socket.emit('admin-portal-series', JSON.stringify(series))    
})
socket.on('admin-users', ()=>{
    socket.emit('admin-users', userdata)    
})
socket.on('registration', (realdata)=>{ 
    if(userdata.length > 0 ){
        var result = userdata.find((user) => user.email==realdata.email)
        if(result === undefined){
              userdata.push(realdata)
             
             var str = JSON.stringify(userdata)
                fs.writeFile('./json/users.json', str, (err)=>{
                    if (err) {
                        console.log(err.message)
                    } 
                })
                socket.emit('admin-users', userdata)  
              jsonContent = JSON.stringify('created');
        }else{
              jsonContent = JSON.stringify('Email exist');
        }
            
    }else{
        
        userdata.push(realdata)
        var str = JSON.stringify(userdata)
        fs.writeFile('./json/users.json', str, (err)=>{
            
            if (err) {
                console.log(err.message)
            } 
        })
        socket.emit('admin-users', userdata)  
            jsonContent = JSON.stringify('created'); 
    } 
    
    socket.emit('registration', jsonContent)
 })
    socket.on('admin-subscribers',()=>{
        socket.emit('admin-subscribers', subscribe)
    })
    socket.on('admin-cancel-sub',(data)=>{
        var result = subscribe.find((user) => user.id==data)
       var info = subscribe.indexOf(result) 
                 subscribe.splice(info, 1) 
             var str = JSON.stringify(subscribe)
                    fs.writeFile('./json/sub.json', str, (err)=>{
                       
                        if (err) {
                            console.log(err.message)
                        } 
                    })
        socket.emit('admin-subscribers', subscribe)
    })
 socket.on('login', (realdata)=>{ 
    var result = userdata.find((user) => user.email==realdata.email && user.password== realdata.password)
    if(result === undefined){
        jsonContent = JSON.stringify('incorrect');
    }else{
        jsonContent = JSON.stringify(result);
    }
    socket.emit('login', jsonContent)
    
 })
 socket.on('logout',(thather)=>{   
    var user_id = Number(thather.id)
    var result = userdata.find((user) => user.id==user_id)
    console.log(result.fname)
    
    const newdataa = {  
        fname:result.fname,
        lname:result.lname,
        email: result.email,
        password:result.password,
        country:result.country,                   
        date_joined:result.date_joined,
        id: result.id,
        is_loggedIn:false,
        verified:result.verified, 
        subscription:result.subscription
      }
            for (let i = 0; i < userdata.length; i++) {
                if(userdata[i].id == result.id){
                    userdata.push(newdataa)
                var info = userdata.indexOf(userdata[i])               
                userdata.splice(info, 1) 
                var str = JSON.stringify(userdata)
                    fs.writeFile('./json/users.json', str, (err)=>{
                       
                        if (err) {
                            console.log(err.message)
                        } 
                    })
                 jsonContent = JSON.stringify("logout")
                }
            }
     socket.emit('logout', '') 
})
 socket.on('get-channels', ()=>{ 
    socket.emit('get-channels', channels)
}) 
socket.on('update-login',(data)=>{ 

    for (let i = 0; i < userdata.length; i++) {
        if(userdata[i].id == data.id){
            userdata.push(data)
            var info = userdata.indexOf(userdata[i])
            userdata.splice(info, 1) 
                var str = JSON.stringify(userdata)
                    fs.writeFile('./json/users.json', str, (err)=>{
                       
                        if (err) {
                            console.log(err.message)
                        } 
                    })
        }
       
      }
})
socket.on('delete-account',(data)=>{
    for (let i = 0; i < userdata.length; i++) {
        if(userdata[i].id == data.id){
            var info = userdata.indexOf(userdata[i])
            userdata.splice(info, 1) 
                var str = JSON.stringify(userdata)
                    fs.writeFile('./json/users.json', str, (err)=>{
                       
                        if (err) {
                            console.log(err.message)
                        } 
                    })
        }
       
      }
      socket.emit('delete-account', data)
})
socket.on('check-subscription', (data)=>{  
    
  })
  /*
  socket.on('user_connected', (id) =>{     
    users[id] = socket.id
    //const url = 'https://www.emarkets24.com/apps/bumblebee/phpscripts/get_topics.php' 
    const url = 'https://wwu30.localto.net/scripts/get_topics.php'
    fetch(url, {
        method: 'POST',
        mode:'cors'
    }).then(response => response.text())
    .then(data => { 
         console.log(data)
      //  io.emit('topics', data)        
    }); 
 
}) */
socket.on('topics', (data)=>{  
    
    const anotherData = {
        roomid: uuidV4(),
        topic:data.topic,
        userid:data.userid
    }   
    userdataTop.push(anotherData)
    var str = JSON.stringify(userdataTop)
    fs.writeFile('./json/topic.json', str, (err)=>{
                       
        if (err) {
            console.log(err.message)
        } 
    })
     
        io.emit('topics', JSON.stringify(userdataTop))   
    
     
})
socket.on('get-topics', ()=>{  
            socket.emit('topics', JSON.stringify(userdataTop))   
})
socket.on('comments', (ddd)=>{   
    userdataComment.push(ddd)
    var str = JSON.stringify(userdataComment)
    fs.writeFile('./json/comment.json', str, (err)=>{
                       
        if (err) {
            console.log(err.message)
        } 
    })
        socket.broadcast.emit('refresh-comments', userdataComment)
            
})
socket.on('getTopicDetails', (ddd)=>{ 
    
    var com = ''
  
  if(userdataComment.length > 0){
    var ht = []
    
      socket.join(ddd.room)
      socket.to(ddd.room).emit('user-connected',  ddd.room)
      io.in(ddd.room).allSockets().then(result=>{ 
          io.to(ddd.room).emit("total-numbers", result.size)  
           for (let i = 0; i < userdataComment.length; i++) {
                if (userdataComment[i].room === ddd.room) {
                    ht.push(userdataComment[i])
                } 
            } 
           io.to(ddd.room).emit("comments", JSON.stringify(ht))   
           ht.length = 0      
      })
 
  
        
  }else{
    var ht = 0
    io.to(ddd.room).emit("comments", JSON.stringify(ht))
  }
               
        
            
})
socket.on('payment-successful', (res)=>{
    subscribe.push(res)
        var str = JSON.stringify(subscribe)
        fs.writeFile('./json/sub.json', str, (err)=>{
                        
            if (err) {
                console.log(err.message)
            } 
        })
}) 
socket.on('check-sub',(data)=>{
   // console.log(data)
    var result = subscribe.find((user) => user.id==data)
    console.log(result)
   socket.emit('check-sub', result)
})
socket.on('leave-room',(data)=>{
   
    for (let i = 0; i < topicArr.length; i++) { 
      
        if(topicArr[i].topic === data.topic && topicArr[i].roomId === rmId){            
            socket.leave(topicArr[i].roomId)    
            socket.to(topicArr[i].roomId).emit("user-connected", topicArr[i].roomId) 
        }
     }    

})

socket.on('dating-account',(data)=>{
    if(userdataDash.length === 0 ){
        userdataDash.push(data)
        var str = JSON.stringify(userdataDash)
        fs.writeFile('./json/datedash.json', str, (err)=>{
                        
            if (err) {
                console.log(err.message)
            } 
        })
        io.emit('datedash', userdataDash)
    }else if(userdataDash.length > 0){ 
        for (let i = 0; i < userdataDash.length; i++) {
                if(userdataDash[i].id === data.id){
                    userdataDash.push(data)
                    const indexid = userdataDash.indexOf(userdataDash[i].id)
                    userdataDash.splice(indexid, 1)
                    var str = JSON.stringify(userdataDash)
                    fs.writeFile('./json/datedash.json', str, (err)=>{
                                    
                        if (err) {
                            console.log(err.message)
                        } 
                    })                 
                    
                    io.emit('datedash', userdataDash)
                    
                }           
        }
    }
      
   
  })  
   // socket.broadcast.emit('brdcast', socket.id)

    io.emit('clients-total', socketConnected.size)   
    socket.on('disconnect', () => {
            
    socketConnected.delete(socket.id)        
    })

} 









/*
bbc  http://iptvcliques.ottct.pro:80/18BRYLMDNA/J6LDAP8B2X/8375
aljazeera 
kix
mbc 2
abc family
bbc brit         http://iptvcliques.ottct.pro:80/18BRYLMDNA/J6LDAP8B2X/448305
cbeebies
cbs Justice
cbs Reality
sky sports news
be
*/
var channels = [
    {"ChannelName":'BBC',"m3url":'bbc_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign8.PNG',"xql":"26266","type":"News"},
    {"ChannelName":'Aljazeera',"m3url":'aj_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign5.PNG',"xql":"6679","type":"News"},
    {"ChannelName":'Kix',"m3url":'kix_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign39.PNG',"xql":"26266","type":"Movies"},
    {"ChannelName":'MBC 2',"m3url":'mbc_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign14.PNG',"xql":"6679","type":"Movies"},
    {"ChannelName":'Blitz View',"m3url":'blv_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign41.PNG',"xql":"6679","type":"Sports"},
   
        //{"ChannelName":'Crime & Investigation',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/12509',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign17.PNG',"xql":"12509","type":"Reality"},
        {"ChannelName":'abc Family',"m3url":'abc_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign33.PNG',"xql":"67530","type":"News"},           
        {"ChannelName":'BBC Brit',"m3url":"bbcb_","viewtype":'1',"xql":"4078","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign42.PNG'},
        //{"ChannelName":'Africa News',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/26282',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign6.PNG',"xql":"26282","type":"News"},        
        //{"ChannelName":'VOX Africa',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/7606',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign31.PNG',"xql":"7606","type":"News"},
        //{"ChannelName":'BBC World News',"m3url":'bbc_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign8.PNG',"xql":"26106","type":"News"},
        {"ChannelName":'Cbeebies',"m3url":'cbees_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign9.PNG',"xql":"128586","type":"Kids"},
        //{"ChannelName":'Kix',"m3url":'kix_',"viewtype":'1',"xql":"132372","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign39.PNG'},
        //{"ChannelName":'CNA',"m3url":'cna_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign37.PNG',"xql":"132338","type":"News"},        
        //{"ChannelName":'CGTN',"m3url":'cgtn_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign36.PNG',"xql":"132337","type":"News"},
        {"ChannelName":'Celestial Movies',"m3url":'cel_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign38.PNG',"xql":"28797","type":"Movies"},
        //{"ChannelName":'Super Action',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/83712',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign9.PNG',"xql":"83712","type":"Kids"},
        //{"ChannelName":'K+',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132370',"viewtype":'1',"xql":"132370","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign25.PNG'},
        //{"ChannelName":'CNA',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132338',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign37.PNG',"xql":"132338","type":"News"},        
       // {"ChannelName":'CGTN',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/132337',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign36.PNG',"xql":"132337","type":"News"},
        //{"ChannelName":'Celestial Movies',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/28797',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign38.PNG',"xql":"28797","type":"News"},
        //{"ChannelName":'Super Action',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/83712',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign9.PNG',"xql":"83712","type":"Kids"},
        {"ChannelName":'CBS Justice',"m3url":'cbsj_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign10.PNG',"xql":"128587","type":"Reality"},
        {"ChannelName":'CBS Reality',"m3url":'cbsr_',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign11.PNG',"xql":"20614","type":"Reality"},
        //{"ChannelName":'Curiosity Stream',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/22547',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign23.PNG',"xql":"22547","type":"Lifestyle"},
        //{"ChannelName":'DayStar',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/31344',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign16.PNG',"xql":"31344","type":"Religion"},
       // {"ChannelName":'Deutsche Well',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/31343',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign3.PNG',"xql":"31343","type":"News"},
        //{"ChannelName":'Discovery Channel',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/128595',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign4.PNG',"xql":"128595","type":"Reality"},
        //{"ChannelName":'Destination America',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/10645',"viewtype":'1',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign.PNG',"xql":"10645","type":"North America",},
        {"ChannelName":'Sky Sports News',"m3url":'sky_',"viewtype":'1',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign44.jpg',"xql":"33648","type":"News"},
        //{"ChannelName":'Bein Series',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/15586',"viewtype":'1',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign26.PNG',"xql":"15586","type":"Movie"},        
        {"ChannelName":'BET',"m3url":'bet_',"viewtype":'1',"xql":"285","type":"News","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign43.PNG'},
        //{"ChannelName":'Travel Channel',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/12484',"viewtype":'...',"image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign21.PNG',"xql":"12484","type":"Lifestyle"},
        {"ChannelName":'Telemundo',"m3url":'tlm_',"viewtype":'1',"xql":"128663","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign22.PNG'},
        //{"ChannelName":'Al Jazeera',"m3url":'aj_',"viewtype":'1',"xql":"1617","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign20.PNG'},
        {"ChannelName":'Arirang',"m3url":'arng_',"viewtype":'1',"xql":"74145","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign25.PNG'},
        {"ChannelName":'KBS World',"m3url":'kbs_',"viewtype":'1',"xql":"930","type":"News","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign24.PNG'},
    
       // {"ChannelName":'MBC+ Drama',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/7542',"viewtype":'1',"xql":"7542","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign28.PNG'},
        //{"ChannelName":'MBC 2',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/41073',"viewtype":'1',"xql":"41073","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign14.PNG'},
        {"ChannelName":'MBC Max',"m3url":'mbcm_',"viewtype":'1',"xql":"4075","type":"News","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign15.PNG'},

       // {"ChannelName":'Blitz Movies',"m3url":'http://localhost:7777/data/media/medi.m3u8',"viewtype":'1',"xql":"41073","type":"Movies","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign14.PNG'},
        {"ChannelName":'Blitz Sports',"m3url":'',"viewtype":'1',"xql":"4075","type":"News","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign15.PNG'},

        //{"ChannelName":'Bein Sport',"m3url":'http://tunestream.me:8080/bumblebeetvlist/beeride/2744',
        //"viewtype":'1',"xql":"2744","type":"Sport","image":'https://bumblebee-nativeapp.onrender.com/img/channelsImage/redesign27.PNG'}

    
]
