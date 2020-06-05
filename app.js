var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
//server open port 3000
server.listen(process.env.PORT || 3000);

var arrayUserName = [];

//server 
io.sockets.on('connection', function (socket) {
	
	console.log("client conneted");
 
	//add user register to arrayUserName
	socket.on('client-register', function(data){
	console.log("client just registed username =" + data);
	var result = false;
	//check in arrayUserName
	if(arrayUserName.indexOf(data) > -1){
		console.log("This account already exists!")
		result = false;
	}
	else{
		arrayUserName.push(data);
		socket.un = data;
		console.log("Sign in success");
		result = true;
	}
	socket.emit('login', {register : result});	
	
	});
	
	socket.on('client-joined-chat', function(data){
		console.log("user joined username =" + data);
		//echo globally (all clients) that a person has connected
		io.sockets.emit('server-send-user-joined', {username: data, number: arrayUserName.length});
	});
	
	io.sockets.emit('server-send-user-joined', {username: socket.username});

	socket.on('client-send-chat', function (chat) {
	  console.log(socket.un + ":" + chat);
		// emit toi tat ca moi nguoi
		io.sockets.emit('server-send-chat', {username: socket.un, message: chat});
	
		// emit tới máy nguoi vừa gửi
		//socket.emit('server-send-chat', { comment: socket.un + ":" + chat });
	});
  
	
	socket.on('client-send-typing', function () {
		console.log(socket.un + " is typing");
		io.sockets.emit('server-send-typing', {username: socket.un});
	});
  
	
	socket.on('client-stop-typing', () => {
		console.log(socket.un + " stop typing");
		io.sockets.emit('server-send-typing', {username: socket.un});
	});
  
  
	socket.on('disconnect', function(){
		if(arrayUserName.length > 0){
			var pos = arrayUserName.indexOf(socket.un);
			if(pos > -1){
				arrayUserName.splice(pos, 1);
				io.sockets.emit('server-send-user-left', {usernameleft: socket.un, number: arrayUserName.length});
			}
		}
    });
 
});