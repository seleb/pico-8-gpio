
var last=[];
var btns=[];
var btnsp=[];

function boop(params){
	if(comms.state == comms.States.IDLE){
		twitter.getTweet.bind(twitter)(params);
		comms.state = comms.States.HOLD;
	}else{
		console.error("Comms are busy; action ignored");
	}
}


function next(){
	last.push(twitter.tweets.search_metadata.max_id_str);
	boop(twitter.tweets.search_metadata.next_results);
}

function prev(){
	if(last.length > 0){
		boop("?max_id="+last.pop()+"&q=%23pico8-filter:retweets&count=1&include_entitites=0");
	}else{
		refresh();
	}
}

function refresh(){
	last=[];
	boop("?q=%23pico8-filter:retweets&count=1&include_entitites=0");
}

comms.onstartup = function(){
	boop("?q=%23pico8-filter:retweets&count=1&include_entitites=0");
};

comms.onreceive = function(){
	var btn = comms.incoming_packet[0];
	var b = [];

	for(i=0;i<6;++i){
		b[i] = (btn & (1 << i)) != 0;
		btnsp[i] = !btns[i] && b[i];
		btns[i]=b[i];
	}
	if(btnsp[0]){
		prev();
	}else if(btnsp[1]){
		next();
	}else if(btnsp[2]){
		refresh();
	}
};