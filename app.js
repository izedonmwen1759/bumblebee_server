const express = require('express')
const res = require('express/lib/response')
const path = require('path')
const app = express()
const PORT = process.env.PORT ||  5005
const server = app.listen(PORT, () => console.log('server running on '+PORT))
const io = require('socket.io')(server, {
    cors:{
        origin:'*'
    }
}) 
const mysql = require("mysql")
const { use } = require('express/lib/application')
const req = require('express/lib/request')
const { redirect } = require('express/lib/response')
const fetch = require("node-fetch") 
//app.use(express.static(path.join(__dirname, 'public')))

let socketConnected = new Set()
var users = []
io.on('connection',  onConnected)

function onConnected(socket){
 console.log(socket.id)
    socketConnected.add(socket.id)
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
            console.log(data)
           // socket.emit('report', data)
        }); 
    })

    socket.broadcast.emit('brdcast', socket.id)

    io.emit('clients-total', socketConnected.size)

    //var socketRoom;
    socket.on("user_disconnect", (user) =>{        
        //save in array
        users[user] = socket.id
        const url = 'https://sm.emarkets24.com/bumblebee/php/updatelogin.php'
        const d = {
            userid:user,
            num:0
        }
        const data = JSON.stringify(d)
        fetch(url, {
            method: 'POST',
            body: data,
            mode:'cors'
        }).then(response => response.text())
        .then(data => {
            console.log(data) 
           // socket.emit('report', data)
        }); 
        //io.emit("user_connected", userid)
        socketConnected.delete(users[user])               
        console.log('Socket disconnected '+users[user])
    })
    socket.on('userlogin', (data) =>{        
              
        const url = 'https://sm.emarkets24.com/bumblebee/php/login.php'
        fetch(url, {
            method: 'POST',
            body: data,
            mode:'cors'
        }).then(response => response.text())
        .then(data => {
            console.log(data) 
            socket.emit('report', data)
        });   
        
    })

    socket.on('find-subscription', (data) =>{
   //     connection.query("SELECT * FROM subscription_details WHERE userid='"+data+"' ORDER BY sub_id DESC LIMIT 1", function(error, result){
            
            

    //socket.emit('find-subscription', result)
    //   })

})
//flight booking
socket.on('flight', (data) =>{
   // console.log(data.loc_int)
  /*  if(data.loc_int === 1){
        connet.query("INSERT INTO data (name, lname, other_name, number, email, origin, destination, flight_type,num_travellers,date_of_travel,status,loc_int) VALUES ('"+data.fname+"','"+data.lname+"','"+data.others+"','"+data.num+"','"+data.email+"','"+data.origin+"','"+data.dest+"','"+data.travel+"','"+data.travellers+"','"+data.date_+"','0','"+data.loc_int+"')", function(error, result){})
    }else if(data.loc_int === '2'){
      //  console.log(data)
        connet.query("INSERT INTO data (name, lname, other_name, number, email, origin, destination, flight_type,num_travellers,date_of_travel,status,loc_int) VALUES ('"+data.fname+"','"+data.lname+"','"+data.others+"','"+data.num+"','"+data.email+"','"+data.origin+"','"+data.dest+"','"+data.travel+"','"+data.travellers+"','"+data.date_+"','0','"+data.loc_int+"')", function(error, result){})
    }else{}
   */
  
})

    socket.on('registration', (data) =>{
             
                  const url = 'https://sm.emarkets24.com/bumblebee/php/createAccount.php'
                fetch(url, {
                    method: 'POST',
                    body: data,
                    mode:'cors' 
                }).then(response => response.text())
                .then(data => {
                   socket.emit('registration-response', data)
                });     
       
              
            })

            socket.on('user-info', (user) =>{ 
                const url = 'https://sm.emarkets24.com/bumblebee/php/get_user.php'
                const getdata = {
                    userid:user
                }
                var data = JSON.stringify(getdata)
                fetch(url, {
                    method: 'POST',
                    body: data,
                    mode:'cors' 
                }).then(response => response.text())
                .then(data => {                    
                    socket.emit('retrieved-info', data)
                    socket.emit('retrieved-data', data)
                    socket.emit('data-for-travel', data)
                    socket.emit('userdata', data)
                });     
       
               
            })

            
            socket.on('update_user_profile', (resp) =>{
             //   console.log(data)
             const url = 'https://sm.emarkets24.com/bumblebee/php/updateUserAccount.php'
             fetch(url, {
                 method: 'POST',
                 body: resp,
                 mode:'cors'
             }).then(response => response.text())
             .then(data => {
                 console.log(data)
                socket.emit('update_user_profile', resp.user)
             }); 
              
            })

    /*socket.on('disconnect', (userid) => {
        users[userid] = socket.id
        connection.query("UPDATE users SET session_int=0 WHERE id="+userid+"", function(error, result){})
        console.log(users[userid])       
        console.log('Socket disconnected', users[userid])
        
    })*/

    socket.on('user-status', (data) => {
        socket.broadcast.emit('chat-message', data)
    })
/// MEDIA LISTS 
socket.on('kids', (d) =>{
        if(d === 'fr'){
            // FRENCH MOVIES
            const data = [
                
                { 
                    a:'https://www.youtube.com/embed/CxsXg22188U',
                    b:'WB Kids'
                },
                {
                    a:'https://www.youtube.com/embed/3XpcL1wOhYs',
                    b:'PAW Patrol'
                },
                {
                    a:'https://www.youtube.com/embed/6lUcxhyomMs',
                    b:'Talking Tom'
                }

            ]
               
           
            socket.emit('kids', data)
        }else if(d === 'es'){
            //SPANISH MOVIES
            const data = {
                a:'www.sbjsbhjlcs.com',
                b:'koikndbj.hj'
            }
            socket.emit('kids', data)
        }else{
            //SPANISH MOVIES
            const data = null               
            
            socket.emit('kids', data)
        }
    })
    socket.on('stations', (d) =>{
        if(d === 'fr'){
            // FRENCH MOVIES
            const data = [
                { a:'https://www.youtube.com/embed/Q_gKfMq2x00',
                b:'TVC News'},
                {
                    a:'https://www.youtube.com/embed/TGqIu5FJpV0',
                    b:'ET News'
                }
            ]
               
           
            socket.emit('stations', data)
        }else if(d === 'es'){
            //SPANISH MOVIES
            const data = {
                a:'www.sbjsbhjlcs.com',
                b:'koikndbj.hj'
            }
            socket.emit('stations', data)
        }else{
            //SPANISH MOVIES
            const data = null               
            
            socket.emit('stations', data)
        }
        
       
    })
///LANG
socket.on('selected-lang', (val) =>{
    console.log(val)
    if(val === 'fr'){
        const fr = {
            email: "Vous n'avez pas un compte",
            reg:"Incrisez Ici",
            logBtn:"connexion",
            tc:"Termes et conditions",
            pp:"politique de confidentialité",
            uc:"la régulation",
            agentBee:"Devenez agent"
           
        }
        
       socket.emit('selected-lang', fr) 
    }else if(val === 'es'){
         const es = {
            email: "no tienes una cuenta?",
            reg:"registrarse aquí",
            logBtn:"conexión",
            tc:"Términos y condiciones",
            pp:"política de privacidad",
            uc:"regulación",
            agentBee:"convertirse en un agente"
        }
        
       socket.emit('selected-lang', es) 
    }else if(val === 'ar'){
        const ar = {
            email: "لا يوجد حساب بعد",
            reg:"سجل هنا",
            logBtn:"أدخل",
            tc:"الأحكام والشروط",
            pp:"سياسة خاصة",
            uc:"اللوائح التي تحكم",
            agentBee:"أصبح وكيلا"
        }
        
       socket.emit('selected-lang', ar) 
    }else if(val === 'pr'){
        const pr = {
            email: "sem conta ainda?",
            reg:"registrar agora",
            logBtn:"Conecte-se",
            tc:"termos e Condições",
            pp:"política de Privacidade",
            uc:"regulamentos",
            agentBee:"Torne-se um agente"
        }
        
       socket.emit('selected-lang', pr) 
    }else if(val === 'gr'){
        const gr = {
            email: "kein Account?",
            reg:"jetzt registrieren",
            logBtn:"das Login",
            tc:"Geschäftsbedingungen",
            pp:"Datenschutz-Bestimmungen",
            uc:"Vorschriften",
            agentBee:"Agent werden"
        }
        
       socket.emit('selected-lang', gr) 
    }else if(val === 'lt'){
        const lt = {
            email: "paginam non habes?",
            reg:"hic subcriptio",
            logBtn:"ineo",
            tc:"leges condicionesque",
            pp:"consilium secretum",
            uc:"ordinationes",
            agentBee:"facti sunt agente"
        }
        
       socket.emit('selected-lang', lt) 
    }
    
})
socket.on('selected-lang-dash', (val) =>{
   
    if(val === 'fr'){
        const data_lan = {           
            warning1:"Acculiel",
            plan:"Choisissez un plan",
            pay:"Payez",
            sub:"Abonnement",
            logout:"Se déconnecter",
            travel:"Réservez un vol"
        }
        
       socket.emit('selected-lang-dash', data_lan) 
    }else if(val === 'es'){
         const data_lan = {
            warning1:"el punto de partida",
            plan:"elige un plan",
            pay:"Pagar",
            sub:"suscripción",
            logout:"desconectar",
            travel:"reservar un vuelo"
        }
        
       socket.emit('selected-lang-dash', data_lan) 
    }
    else if(val === 'ar'){
        const data_lan = {
           warning1:"الهدف",
           plan:"اختر خطة",
           pay:"دفع",
           sub:"الاشتراك",
           logout:"قطع الاتصال",
           travel:"احجز رحلة طيران"
       }
       
      socket.emit('selected-lang-dash', data_lan) 
   }else if(val === 'pr'){
    const data_lan = {           
        warning1:"a origem",
        plan:"escolha um plano",
        pay:"pagar",
        sub:"inscrição",
        logout:"desconectar",
        travel:"reservar voo"
    }
    
   socket.emit('selected-lang-dash', data_lan) 
    }else if(val === 'gr'){
        const data_lan = {           
            warning1:"das Ziel",
            plan:"Wählen Sie einen Plan",
            pay:"bezahlen",
            sub:"Abonnement",
            logout:"ausschalten",
            travel:"Flug buchen"
        }
        
       socket.emit('selected-lang-dash', data_lan) 
    }else if(val === 'lt'){
        const data_lan = {           
            warning1:"Accudomumliel",
            plan:"eligere consilium",
            pay:"stipendium",
            sub:"subscriptio",
            logout:"disiungo",
            travel:"liber fuga"
        }
        
       socket.emit('selected-lang-dash', data_lan) 
    }
    
})

socket.on('selected-lang-settings', (val) =>{
   
    if(val === 'fr'){
        const data_lan = {           
            set:"Réglages",
            name:"Changez les noms",
            update:"Réactualiser",
            email:"Réactualiser email",
            pass:"Réactualiser password",
            ret:"Retourner"
        }
        
       socket.emit('selected-lang-settings', data_lan) 
    }else if(val === 'es'){
         const data_lan = {
            set:"ajustes",
            name:"cambiar nombres",
            update:"ajustar",
            email:"ajustar email",
            pass:"ajustar password",
            ret:"devolver"
        }
        
       socket.emit('selected-lang-settings', data_lan) 
    }else if(val === 'ar'){
        const data_lan = {
           set:"اضبط",
           name:"تغيير الأسماء",
           update:"واكب العصر",
           email:"تحديث البريد الإلكتروني",
           pass:"تطوير كلمة السر",
           ret:"عودة"
       }
       
      socket.emit('selected-lang-settings', data_lan) 
   }else if(val === 'pr'){
    const data_lan = {
       set:"a afinação",
       name:"mudança de nomes",
       update:"renovar",
       email:"ajustar email",
       pass:"ajustar password",
       ret:"devolver"
   }
   
  socket.emit('selected-lang-settings', data_lan) 
    }else if(val === 'gr'){
        const data_lan = {
           set:"der Rahmen",
           name:"Namensänderung",
           update:"die Neufassung",
           email:"die Neufassung email",
           pass:"die Neufassung password",
           ret:"Rückkehr"
       }
       
      socket.emit('selected-lang-settings', data_lan) 
    }else if(val === 'lt'){
        const data_lan = {
           set:"collocatio",
           name:"mutatio nominum",
           update:"renovatio",
           email:"renovatio email",
           pass:"renovatio password",
           ret:"reversio"
       }
       
      socket.emit('selected-lang-settings', data_lan) 
        }

    
})

socket.on('selected-lang-sub', (val) =>{   
    if(val === 'fr'){
        const fr = {           
            name:"Les noms",
            amount:"Rémunéré",
            plan:"Plan",
            begin:"Commencer",
            end:"Terminer",
            status:"la situation"
        }        
       socket.emit('selected-lang-sub', fr) 
    }else if(val === 'es'){
         const es = {
            name:"nombres",
            amount:"pagado",
            plan:"el plan",
            begin:"comenzar",
            end:"terminar",
            status:"la posición"
        }        
       socket.emit('selected-lang-sub', es) 
    }else if(val === 'ar'){
        const ar = {
            name:"الأسماء",
            amount:"دفع",
            plan:"خطة",
            begin:"بداية",
            end:"نهاية",
            status:"وضع"
       }       
      socket.emit('selected-lang-sub', ar) 
   }else if(val === 'pr'){
    const pr = {
        name:"nomes",
        amount:"pago",
        plan:"plano",
        begin:"começar",
        end:"o fim",
        status:"posição"
   }   
  socket.emit('selected-lang-settings', pr) 
    }else if(val === 'gr'){
        const gr = {
            name:"Namen",
            amount:"bezahlt",
            plan:"planen",
            begin:"der Beginn",
            end:"das Ende",
            status:"Position"
       }       
      socket.emit('selected-lang-sub', gr) 
    }else if(val === 'lt'){
        const lt = {
            name:"nomen",
            amount:"solvit",
            plan:"consilium",
            begin:"satus",
            end:"terminare",
            status:"positione"
       }       
      socket.emit('selected-lang-sub', lt) 
        }

    
})

socket.on('reg-lang', (lan) =>{
    if(lan === 'fr'){
        const fr = {
            create:"Créer un compte",
            login:"Connectez-vous ici",
            tc:"Termes et conditions",
            pp:"politique de confidentialité",
            uc:"la régulation",
            agentBee:"Devenez agent"
        }
        socket.emit('reg-lang', fr) 
    }else if(lan === 'es'){
        const es = {
            create:"Crea una cuenta",
            login:"Entre aquí",
            tc:"Términos y condiciones",
            pp:"política de privacidad",
            uc:"regulación",
            agentBee:"convertirse en un agente"
        }
        socket.emit('reg-lang', es) 
    }else if(lan ==='ar'){
        const ar = {
            create:"انشئ حساب",
            login:"تسجيل الدخول هنا",
            tc:"الأحكام والشروط",
            pp:"سياسة خاصة",
            uc:"اللوائح التي تحكم",
            agentBee:"أصبح وكيلا"
        }
        socket.emit('reg-lang', ar) 
    }else if(lan ==='pr'){
        const pr = {
            create:"Crie a sua conta aqui",
            login:"entre aqui",
            tc:"termos e Condições",
            pp:"política de Privacidade",
            uc:"regulamentos",
            agentBee:"Torne-se um agente"
        }
        socket.emit('reg-lang', pr) 
    }
    else if(lan ==='gr'){
        const gr = {
            create:"ein Konto erstellen",
            login:"Hier anmelden",
            tc:"Geschäftsbedingungen",
            pp:"Datenschutz-Bestimmungen",
            uc:"Vorschriften",
            agentBee:"Agent werden"
        }
        socket.emit('reg-lang', gr) 
    }
    else if(lan ==='lt'){
        const lt = {
            create:"creare rationem",
            login:"vade huc",
            tc:"leges condicionesque",
            pp:"consilium secretum",
            uc:"ordinationes",
            agentBee:"facti sunt agente"
        }
        socket.emit('reg-lang', lt) 
    }
})









}