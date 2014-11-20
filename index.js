"use strict";
var net = require('net');

var sockets = [];
var listaDeComandos = ['send', 'usuario', 'adivinar'];
var usuarioASocket = {};
var server = net.createServer(function(socket) {
	function resetearComando(){
		stringRecibida = '';
	}
	function verificarComando(str) {
		console.log('comando: ' + str);
		var cmd = str.split(' ')[0];
		if(listaDeComandos.indexOf(cmd) !== -1) {
			return ejecutarComando(str);
		}

		console.log('comando inválido.');
		resetearComando();
	}

	function ejecutarComando(str) {
		var cmd = str.split(' ')[0];
		var usuario = str.split(' ')[1].split('\r')[0];
		var mensaje = str.split(' ')[2];
		var numeroAdivinado = +(str.split(' ')[2]);
		if(cmd === 'send') {
			console.log('send recibido de "' + socket.usuario + '" a "' + usuario +'"');
			send(usuario, 
				str.split(' ').splice(2,str.split(' ').length -1).join(' '), socket.usuario);
			resetearComando();
			return;
		}

		if(cmd === 'usuario') {
			console.log('usuario registrado: ' + usuario);
			if(!usuario) {
				resetearComando();
				socket.write('usuario inválido.\n');
				return console.log('usuario inválido');
			}

			if(!str.split(' ')[2] || numeroAdivinado > 10 || numeroAdivinado < 0) {
				resetearComando();
				return socket.write('el número a adivinar tiene que ser menor o igual a 10.\n');
			}

			usuarioASocket[usuario] = socket;
			socket.usuario = usuario;
			socket.numeroAAdivinar = str.split(' ')[2];
			console.log('número a adivinar: ' + socket.numeroAAdivinar);
			socket.write('usuario registrado con número ' + 
				socket.numeroAAdivinar + '.\n');
			resetearComando();
			return;
		}		

		if(cmd === 'adivinar') {
			numeroAdivinado = str.split(' ')[2];

			if(numeroAdivinado === usuarioASocket[usuario].numeroAAdivinar) {
				usuarioASocket[usuario].end();
				socket.write('adivinaste el número de ' + usuario + '!\n');
				console.log(socket.usuario + 'adivinó a ' + usuario);
			}

			resetearComando();
		}
	}

    var validado = false;
    sockets.push(socket);
    console.log('conexión establecida');
    var timeout = setTimeout(function() {
        if (!validado) {
            socket.end();
        }
    }, 5000);
    var stringRecibida = '';
    socket.on('data', function(data) {
    	stringRecibida += data.toString();
        if (validado && stringRecibida.indexOf('\n') !== -1) {
            // el usuario ingresó un comando
            verificarComando(stringRecibida);
        }
        if(stringRecibida.indexOf('\n') !== -1 && stringRecibida.indexOf('coderhouse') !== -1) {
        	console.log('usuario validado');
        	clearTimeout(timeout);
        	validado = true;
        	socket.write('Ingrese usuario y número\n');
        	resetearComando();
        }
    });
    socket.on('end', function() {
        console.log('conexión terminada');
        // en la desconexión, lo saco de la lista
        sockets.splice(sockets.indexOf(socket), 1);
    });
});

server.listen(8888, function() {
    console.log('server inicializado');
});

function send(usuario, mensaje, from) {
	//console.log(usuarioASocket);
	if(!usuarioASocket[usuario]) {
		return console.log('send a un usuario no registrado: ' + usuario);
	}
	usuarioASocket[usuario].write('\n"'+ from +'" dice: ' + mensaje);
}