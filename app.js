var express = require("express");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var fs = require("fs");
//server open port 3000
server.listen(process.env.PORT || 3000);

// app.get("/", function(req, res){
// 	res.sendFile(__dirname + "/index.html");	
// });

var arrayUserName = [];
var arrayImage = new Array();

//folder images
fs.readdir("images/", function(err, files) {
    if (err) {
        return;
    }
    files.forEach(function(f) {
       arrayImage.push("images/" + f);
    });
});


//server 
io.sockets.on('connection', function (socket) {
	
	console.log("client conneted");
	//add user register to arrayUserName
	socket.on('client-register', function(username){
		console.log("client just registed username = " + username);
		var result = false;
		//check in arrayUserName
		if(arrayUserName.indexOf(username) > -1){
			console.log("This account already exists!")
			result = false;
		}
		else{
			arrayUserName.push(username);
			socket.username = username;
			console.log("Sign in success");
			result = true;
		}
		socket.emit('signin', {register : result});	
	
	});
	
	socket.on('login', function(username){
		var result_login = false;
		//check in arrayUserName
		if(arrayUserName.indexOf(username) == -1){
			arrayUserName.push(username);
			socket.username = username;
			console.log("push " + username + " to array");
		}
	});
	
	socket.on('client-joined-chat', function(username){
		console.log("user joined username = " + username);
		//echo globally (all clients) that a person has connected
		io.sockets.emit('client-joined-chat', {username: username, number: arrayUserName.length});
	});
	
	socket.on('client-send-chat', function (data) {
		//console.log(socket.username + ":" + chat)
		var image64 = new Buffer(data.images, 'binary').toString('base64')
		socket.broadcast.emit('client-send-chat', {username: socket.username, message: data.message, send_img: image64});
		console.log(socket.username + ": " + image64)
		// emit toi tat ca moi nguoi
		//socket.broadcast.emit('client-send-chat', {username: socket.username, message: chat});
	
		// emit tới máy nguoi vừa gửi
		//socket.emit('server-send-chat', {username: socket.client-stop-typing, message: chat});
	});
  
	
	socket.on('client-send-typing', function () {
		console.log(socket.username + " is typing");
		socket.broadcast.emit('client-send-typing', {username: socket.username});
	});
  
	
	socket.on('client-stop-typing', () => {
		console.log(socket.username + " stop typing");
		socket.broadcast.emit('server-send-stop-typing', {username: socket.username});
	});
  
  
	socket.on('disconnect', function(){
		console.log(socket.username + " disconnect");
		if(arrayUserName.length > 0){
			var pos = arrayUserName.indexOf(socket.username);
			if(pos > -1){
				arrayUserName.splice(pos, 1);
				io.sockets.emit('user-left', {usernameleft: socket.username, number: arrayUserName.length});
			}
		}
		
    });
 
 
	function getFilenameImage(id){
		return "images/" + id.substring(2) + getMilis() + ".png";
	}


	function getMilis(){
		var date = new Date();
		var milis = date.getTime();
		return milis;
	}
});