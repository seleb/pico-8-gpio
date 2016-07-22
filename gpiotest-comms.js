var pico8_gpio = new Array(128);

var comms = {
	Turns:Object.freeze({
		MY_TURN:1,
		THEIR_TURN:0
	}),
	States:Object.freeze({
		STARTING:0,
		RECEIVING:1,
		SENDING:2,
		SENT:3,
		RECEIVED:4,
		IDLE:5
	}),
	Pins:Object.freeze({
		TURN:0,
		STATE:1,
		FRAME_ID:2,
		FRAME_LENGTH:3,
		DATA_LENGTH:4,
		DEBUG:5,
		DATA_START:6
	}),

	debug:0,
	state:0,

	char_offset: 31, // ignore control characters
	data_bytes: 120, // bytes available for data

	pending_packets: [],
	incoming_packet: [],

	send: function (data){
		if(this.state == this.States.IDLE || this.state == this.States.HOLD){
			// how many packets do we need to send to fit the data?
			var num_packets = Math.max(1,Math.ceil(data.length/this.data_bytes));

			// split the data into packets
			this.pending_packets = [];
			for(i = 1; i <= num_packets; ++i){
				// grab the first chunk of the data as a character array
				var chars = data.substr(0,this.data_bytes).split("");

				// convert characters to numbers matching
				for(j=0;j<chars.length;++j){
					chars[j] = this.charToPico(chars[j]);
				}

				// construct the actual packet
				var packet = {
					frame_id: i,
					frame_length: num_packets,
					data_length: chars.length,
					data: chars
				};

				// add the packet to the queue
				this.pending_packets.push(packet);

				// throw away the data we just packed
				data = data.substr(chars.length);
			}

			console.log("Sending packets:");
			console.log(JSON.stringify(this.pending_packets));
			this.state = this.States.SENDING;
		}else{
			console.error("Comms busy; send aborted");
		}
	},

	// converts characters to a format which the cart can read
	// case is reversed, characters are offset, and newline is a special character
	charToPico: function (c){
		if(c == '\n'){
			return 0;
		}else{
			// swap case
			c = (c == c.toLowerCase() ? c.toUpperCase() : c.toLowerCase());
			// convert to ASCII
			c = c.charCodeAt();
			// offset
			c -= this.char_offset;
			return c;
		}
	},

	write_packet:function(packet){
		for(i=0;i<packet.data_length;++i){
			pico8_gpio[i+this.Pins.DATA_START] = packet.data[i];
		}
		pico8_gpio[this.Pins.FRAME_ID] = packet.frame_id;
		pico8_gpio[this.Pins.FRAME_LENGTH] = packet.frame_length;
		pico8_gpio[this.Pins.DATA_LENGTH] = packet.data_length;
	},

	read_packet:function(){
		for(i=0;i<pico8_gpio[this.Pins.DATA_LENGTH];++i){
			this.incoming_packet[i] = pico8_gpio[i+this.Pins.DATA_START];
		}
	},

	update: function(){

		window.requestAnimationFrame(comms.update.bind(comms));
		
		// return early if it's not our turn
		if(pico8_gpio[this.Pins.TURN] != this.Turns.MY_TURN){
			return;
		}

		// store current io as the incoming packet
		this.read_packet();
		this.onreceive();


		// decide what to do with our turn
		switch(this.state){
			case this.States.STARTING: 
				// if cart is in startup state, switch to idle
				this.state = this.States.IDLE;
				this.onstartup();
				break;
			case this.States.SENDING:
				// if no packets to send, switch to idle
				if(this.pending_packets.length == 0){
					this.state = this.States.IDLE;
					
					pico8_gpio[this.Pins.FRAME_LENGTH] = 0;
					pico8_gpio[this.Pins.FRAME_ID] = 0;
					pico8_gpio[this.Pins.DATA_LENGTH] = 0;
					return;
				}

				// write the first packet to the io and discard it
				this.write_packet(this.pending_packets.shift());
				break;
				break;
			case this.States.IDLE:
			case this.States.HOLD:
				break;
		}

		// give the turn back to them
		pico8_gpio[this.Pins.STATE] = this.state;
		pico8_gpio[this.Pins.DEBUG] = this.debug;
		pico8_gpio[this.Pins.TURN] = this.Turns.THEIR_TURN;
	},

	onstartup: function(){
		// can overwrite this
	},

	onreceive: function(){
		// can overwrite this
	}
};

window.requestAnimationFrame(comms.update.bind(comms));