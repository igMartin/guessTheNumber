
var net = require('net');

var sockets = [];
var then = Date.now();
var listaDeComandos = ['send', 'getOnlineUsers', 'usuario', 'adivinar', 'scoreboard', 'uptime'];
var usuarioASocket = {};
var scoreboard = {};
var serverPort = 8888;
var server = net.createServer(function(socket) {
    function resetearComando() {
        stringRecibida = '';
    }

    function incrementarPuntos(usr, n) {
        if (!scoreboard[usr] || typeof scoreboard[usr] !== 'number') {
            scoreboard[usr] = n;
        } else {
            scoreboard[usr] += n;
        }
    }

    function obtenerPuntos(obj) {
        //recibe un scoreboard y retorna un array de strings con el siguiente formato
        // [ "usuario1 45", "usuario2 30", "usuario3 2"]
        var result = [];
        Object.keys(obj).forEach(function(user) {
            var userPoints = scoreboard[user] || 0;
            result.push(user + ' ' + userPoints);
        });

        return result.sort(function(prev, next) {
            if (prev.split(' ')[1] < next.split(' ')[1]) {
                return 1;
            }
            if (prev.split(' ')[1] > next.split(' ')[1]) {
                return -1;
            }
            return 0;
        });
    }

    function verificarComando(str) {
        console.log('comando: ' + str);
        var cmd = str.split(' ')[0].trim();
        if (listaDeComandos.indexOf(cmd) !== -1) {
            return ejecutarComando(str);
        }

        console.log('comando inválido.');
        resetearComando();
    }

    function ejecutarComando(str) {
        var cmd = str.split(' ')[0].trim();
        var usuario;
        //var mensaje = str.split(' ')[2];
        var numeroAdivinado = +(str.split(' ')[2]);
        if (cmd === 'send') {
            usuario = str.split(' ')[1].trim();
            console.log('send recibido de "' + socket.usuario + '" a "' + usuario + '"');
            send(usuario,
                str.split(' ').splice(2, str.split(' ').length - 1).join(' '), socket.usuario);
        }

        if (cmd === 'usuario') {
            usuario = str.split(' ')[1].trim();
            console.log('usuario registrado: ' + usuario);
            if (!usuario) {
                socket.write('usuario inválido.\n');
                console.log('usuario inválido');
            }

            if (!str.split(' ')[2] || numeroAdivinado > 10 || numeroAdivinado < 0) {
                socket.write('el número a adivinar tiene que ser menor o igual a 10.\n');
            }

            usuarioASocket[usuario] = socket;
            socket.usuario = usuario;
            socket.numeroAAdivinar = str.split(' ')[2].trim();
            console.log('número a adivinar: ' + socket.numeroAAdivinar + '.');
            socket.write('usuario registrado con número ' +
                socket.numeroAAdivinar + '.\n');
        }

	if (cmd === 'adivinar') {
            usuario = str.split(' ')[1].trim();
            numeroAdivinado = str.split(' ')[2].trim();
            
	    if (usuarioASocket[usuario].numeroAAdivinar === usuarioASocket[usuario].numeroAAdivinar) {
	       socket.write('Entrada invalida. No puedes elegirte a ti mismo'.)
	    }
            if (numeroAdivinado === usuarioASocket[usuario].numeroAAdivinar && usuarioASocket[usuario].numeroAAdivinar !== usuarioASocket[usuario].numeroAAdivinar) {	
                usuarioASocket[usuario].end();
                socket.write('adivinaste el número de ' + usuario + '!\n');
                incrementarPuntos(socket.usuario, 1);
                console.log(socket.usuario + ' adivinó a ' + usuario);
            } else {
                socket.write('número incorrecto!\n');
            }
        }

        if (cmd === 'getOnlineUsers') {
            socket.write('Lista de usuarios:\n' + Object.keys(usuarioASocket).join('\n') + '\n');
        }

        if (cmd === 'scoreboard') {
            socket.write('Lista de puntos:\n' + obtenerPuntos(usuarioASocket).join('\n') + '\n');

        }

        if (cmd === 'uptime') {
            socket.write('El server está levantado hace ' +
                (Date.now() - then) / (1000 * 60 * 60) + ' horas.\n');
        }

        return resetearComando();
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
        if (stringRecibida.indexOf('\n') !== -1 && stringRecibida.indexOf('coderhouse') !== -1) {
            console.log('usuario validado');
            clearTimeout(timeout);
            validado = true;
            socket.write('Ingrese usuario y número.\n');
            resetearComando();
        }
    });
    socket.on('end', function() {
        console.log('conexión terminada');
        // en la desconexión, lo saco de la lista
        sockets.splice(sockets.indexOf(socket), 1);
    });
});

server.listen(serverPort, function() {
    console.log('server inicializado en puerto ' + serverPort);
});

function send(usuario, mensaje, from) {
    //console.log(usuarioASocket);
    if (!usuarioASocket[usuario]) {
        return console.log('send a un usuario no registrado: ' + usuario);
    }
    usuarioASocket[usuario].write('\n"' + from + '" dice: ' + mensaje);
  }
