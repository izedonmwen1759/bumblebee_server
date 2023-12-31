const express = require('express')
const app = express()
const PORT = process.env.PORT ||  5009
const server = app.listen(PORT, () => console.log('server running on '+PORT))
const io = require('socket.io')(server, {
    cors:{
        origin:'*'      
    }
}) 
const {v4 : uuidV4} = require('uuid')
const fetch = require("node-fetch")
const fs = require('fs')
//app.use(express.static(path.join(__dirname, 'testwork')))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index/");
     
  }); 
 
let socketConnected = new Set()
var movies = []
var series = []
const datedashArr =[]
var jsonContent = ''
var dataUser = fs.readFileSync('./json/users.json')
var userdata = JSON.parse(dataUser)

var dataTopic = fs.readFileSync('./json/topic.json')
var userdataTop = JSON.parse(dataTopic)

var dataComment = fs.readFileSync('./json/comment.json')
var userdataComment = JSON.parse(dataComment)

var dataDash = fs.readFileSync('./json/datedash.json')
var userdataDash = JSON.parse(dataDash)


io.on('connection',  onConnected) 

function onConnected(socket){
       
    socketConnected.add(socket.id)     
  

socket.on('admin-portal-movies', (data)=>{
       movies.push(data)   
       console.log(movies)
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
              jsonContent = JSON.stringify('created');
        }else{
            console.log('email exist')
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
           
            jsonContent = JSON.stringify('created'); 
        
    } 
    
    socket.emit('registration', jsonContent)
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
     
    const newData = JSON.parse(thather)
    console.log(newData)  
    const newdataa = {  
        fname:newData.fname,
        lname:newData.lname,
        email: newData.email,
        password:newData.password,
        country:newData.country,                   
        date_joined:newData.date_joined,
        id: newData.id,
        is_loggedIn:false,
        verified:newData.verified,
        subscription:newData.subscription
      }
            for (let i = 0; i < userdata.length; i++) {
                if(userdata[i].id == newData.id){
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
        socket.emit('logout', jsonContent) 
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
    console.log(data)
    
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
socket.on('leave-room',(data)=>{
   
    for (let i = 0; i < topicArr.length; i++) { 
      
        if(topicArr[i].topic === data.topic && topicArr[i].roomId === rmId){            
            socket.leave(topicArr[i].roomId)    
            socket.to(topicArr[i].roomId).emit("user-connected", topicArr[i].roomId) 
        }
     }    

})

socket.on('dating-account',(data)=>{
    console.log(data)
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
