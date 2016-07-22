var twitter={
	tweets:{},

	getTweet: function(params){
		var request = new XMLHttpRequest();
		request.onreadystatechange = function(){
			if(request.readyState == 4){
			if(request.status == 200){
				// success
					this.tweets = JSON.parse(request.responseText);
					console.log(this.tweets);

					var t = this.tweets.statuses[0];

					comms.send(
						t.user.name+" (@"+t.user.name+"):\n\n"
						+t.text+"\n\n"
						+new Date(t.created_at).toLocaleDateString()
					);
				}else if(request.status == 400){
					// error
					console.error(request.responseText);
				}else{
					// something else
				}
			}
		}.bind(this);

		request.open("get", "http://seans.site/stuff/P8T/gpiotest-twitter.php"+params, true);
		request.send();
	}
};