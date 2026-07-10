var SerialPort = require('serialport');
var io = require('socket.io').listen(3000);

var serialPort = new SerialPort("COM29", {
    baudRate: 2400,
    parser: new SerialPort.parsers.Readline("\n"),
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

io.sockets.on('connection', function(socket){
    socket.on('message', function(msg){
        console.log(msg);
    });

    socket.on('disconnected', function(){
        console.log('disconnected');
    });
});

var clearData = "";
var readData = "";

serialPort.on('open',function(){
    console.log('open');
    serialPort.on('data', function(data){
        const buf2 = Buffer.from(data)
        let wArray = buf2.toString('utf8');
        //this part just removes characters I don't need from the data
        let wSlice = wArray.slice(3, wArray.length);
        let rawWeight = wSlice.slice(0, -3);
        let fWeight = rawWeight.trim();
        let weight = parseInt(fWeight);
        console.log(weight);
    });
});

setTimeout(function(){
    serialPort.close(function(){
        console.log("Port Closed!");
    });
}, 3000);