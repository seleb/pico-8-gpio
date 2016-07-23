var twitter={
	tweets:null,

	getTweet: function(params){
		var request = new XMLHttpRequest();
		request.onreadystatechange = function(){
			if(request.readyState == 4){
			if(request.status == 200){
				// success
					this.tweets = JSON.parse(request.responseText);
					console.log("Loaded tweet:",JSON.stringify(this.tweets));

					var t = this.tweets.statuses[0];

					this.ontweetloaded();
				}else if(request.status == 400){
					// error
					console.error(request.responseText);
				}else{
					// something else
				}
			}
		}.bind(this);

		request.open("get", "https://seans.site/stuff/P8T/twitter.php"+params, true);
		request.send();
	},

	ontweetloaded: function(){
		// can overwrite this
	}
};