//main.js
//options!
var options = {
	//you can find your own at https://developer.darkskyapp.com/ (it's free!)
	APIKEY: 'APIKEYHERE',
	msgElem: ".answer h1",
	minPrecip: 0.1,
	hoursInFuture: 24,
	states: {
		error: "Give me an address.",
		rain: {
			yes: "Yes.",
			no: "No.",
			later: "But you will need it later today.",
			belowMin: "But you should be fine with a coat.",
			background: '#04355E',
		},
		snow: {
			no: " Build a snowman for me.",
			background: "#EFF7FA"
		}
	},
	background: "#055D04"
}

$("document").ready(function() {
	launch();
	//reload button
	$(".refresh").click(function() {
		$(options.msgElem).text("Refreshing...");
		launch();
		return false;
	});
});

//go go go!
function launch() {
	//check to see if browser supports location
	if (navigator.geolocation) {
	  	navigator.geolocation.getCurrentPosition(success, error);
	} else {
		//give an alternate means to give the address
		error();
	}
}

//main function, handles getting the weather
function success(position, google) {
	//Check to see if results came from Google or native
	if (typeof(google) === "boolean") {
		var latitude = position.results[0].geometry.location.lat;
		var longitude = position.results[0].geometry.location.lng;
	} else {
		var latitude = position.coords.latitude;
		var longitude = position.coords.longitude;
	}
	//run the request
	var requestURI = "https://api.forecast.io/forecast/" + options.APIKEY + "/" + latitude + "," + longitude;
	$.ajax({
	    url: requestURI,
	    dataType: "jsonp",
	    success: function(data) {
	    	var answer = false;
	    	var rain = false;
	    	var other = false;
	    	//is it currently raining?
	    	if (data.currently.precipIntensity > 0 && data.currently.precipType === 'rain') {
	    		answer = options.states.rain.yes;
	    		if (data.currently.precipIntensity < options.minPrecip) {
	    			answer += " " + options.states.rain.belowMin;
	    		}
	    		$("body").css({backgroundColor: options.states.rain.background});
	    	//It's not raining
	    	} else {
	    		answer = options.states.rain.no;
	    		$("body").css({backgroundColor: options.background});
	    		//check to see if it is doing something besides rain right now
	    		for (var message in options.states) {
	    			if (data.currently.precipType == message) {
	    				answer += " " + options.states[message].no;
	    				$("body").css({backgroundColor: options.states[message].background});
	    				other = true;
	    			}
	    		}
	    		//check into the future
	    		for (var i = 0; i < data.hourly.data.length && i < options.hoursInFuture && !rain; i++) {
	    			if (data.hourly.data[i].precipIntensity > options.minPrecip && data.hourly.data[i].precipType === 'rain') {
	    				answer += " " + options.states.rain.later;
	    				$("body").css({backgroundColor: options.states.rain.background});
	    				rain = true;
	    			}
	    		}
	    		//If I'm in the clear, change the icon to sunglasses!
	    		if (!rain) {
	    			if (!other) {
	    				$("body").css({backgroundColor: options.background });
	    			}
	    			$(options.msgElem).removeClass("umbrella").addClass("sunglasses");
	    		}
	    	}
	    	//give me the answer
	    	if (answer) {
	    		$(options.msgElem).text(answer);
	    	}
	    }
	})
}

function error() {
	//tell me what happened
	$(options.msgElem).text(options.states.error);
	//show me the address form
	$(".error").fadeIn("slow").submit(function() {
		var address = encodeURI($("input[name=address]").val());
		//get the longitude and latitude from Google and launch the main function
		$.ajax({
		    url: 'http://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&sensor=false',
		    dataType: "json",
		    success: function(data) {
		    	success(data, true);
		    	$(".error").fadeOut("slow");
		    }
		})
		return false;
	});
}
