
var last=[];
var btns=[];
var btnsp=[];
var searchField = document.getElementById("searchField");

function search(params){
	if(comms.state == comms.States.IDLE){
		twitter.getTweet.bind(twitter)(params);
		comms.state = comms.States.HOLD;
	}else{
		console.error("Comms are busy; action ignored");
	}
}


function next(){
	if(twitter.tweets != null){
		last.push(twitter.tweets.search_metadata.max_id_str);
		search(twitter.tweets.search_metadata.next_results);
	}
}

function prev(){
	if(last.length > 0){
		search("?max_id="+last.pop()+"&q="+encodeURIComponent(searchField.value)+"&count=1");
	}else{
		refresh();
	}
}

function refresh(){
	last=[];
	search("?q="+encodeURIComponent(searchField.value)+"&count=1");
}

comms.onstartup = function(){
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
	twitter.ontweetloaded = function(){
		try{
			var t = twitter.tweets.statuses[0];
			comms.send(
				t.user.name+" (@"+t.user.name+"):\n\n"
				+t.text+"\n\n"
				+new Date(t.created_at).toLocaleDateString()
			);
		}catch(e){
			comms.send(":(  Sorry!  :(\nThere was an error retrieving tweets.\n\nTry refreshing the page if this continues.");
		}
	};

	search("?q="+encodeURIComponent(searchField.value)+"&count=1");
};