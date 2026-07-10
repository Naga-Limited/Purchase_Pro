
"use strict";
var port;
class SerialLEDController {
    constructor() {
        this.encoder = new TextEncoder();
        this.decoder = new TextDecoder();
    }
	//var port;
    async init() {
        if ('serial' in navigator) {
            try {
                port = await navigator.serial.requestPort();
                await port.open({ baudRate: 2400 , bufferSize:500000});
                this.reader = port.readable.getReader();
                this.writer = port.writable.getWriter();
                let signals = await port.getSignals();
                console.log(signals);
            }
            catch (err) {
                console.error('There was an error opening the serial port:', err);
            }
        }
        else {
            console.error('Web serial doesn\'t seem to be enabled in your browser. Try enabling it by visiting:');
            console.error('chrome://flags/#enable-experimental-web-platform-features');
            console.error('opera://flags/#enable-experimental-web-platform-features');
            console.error('edge://flags/#enable-experimental-web-platform-features');
        }
    }
    async write(data) {
        const dataArrayBuffer = this.encoder.encode(data);
        return await this.writer.write(dataArrayBuffer);
    }
    async read() {
        try {
			var readerData ="";
			if(this.reader)
			{
				//this.reader.cancel();
				this.reader.releaseLock();
				//port.close();
			}
                ////await port.open({ baudRate: 2400 , bufferSize:500000});
                this.reader = port.readable.getReader();
                //this.writer = port.writable.getWriter();
                //let signals = await port.getSignals();
                //console.log(signals);
			//while (true) {
				
				for(var i=0;i<10;i++)
				{
			  const { value, done } = await this.reader.read();
//			  this.reader.cancel();
			  if (done==true) {
				// Allow the serial port to be closed later.
				this.reader.releaseLock();
				break;
			  }
			  
			  if (value) {
				  readerData+=this.decoder.decode(value);
				//console.log(value);
			  }
			}
			
			var tmparr = readerData.split("\n\r");
			console.log(tmparr.length);
			console.log(readerData);
			document.getElementById("txtWeight").value=tmparr[tmparr.length-2];
			console.log(tmparr[tmparr.length-2]);
            //port.close();
				/*while(this.reader.available() > 0) {
					t = this.reader.read();
				}*/
			if(readerData!="")
            {
				//return this.decoder.decode(readerData);
				return readerData;
			}
			else
			return "";
        }
        catch (err) {
            const errorMessage = `error reading data: ${err}`;
            ////console.error(errorMessage);
            return errorMessage;
        }
    }
}