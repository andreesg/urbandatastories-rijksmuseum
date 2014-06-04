
var rijksmuseum  = {
	apiKey: "dofc647S",
	content: null,
	initialId: null
}

rijksmuseum.getContentAndInitial = function() {
	var self = this;
	$.getJSON("https://www.rijksmuseum.nl/api/nl/collection?key="+self.apiKey+"&format=json&type=schilderij&imgonly=True&ps=150", function(data) {
		var found = false;
		for (var i = 0; i < data.artObjects.length; i++) {
			if (data.artObjects[i].id == self.initialId) {
				var temp = data.artObjects[0];
				data.artObjects[0] = data.artObjects[i];
				data.artObjects[i] = temp;
				self.content = data.artObjects;
				self.buildContent();
				found = true;
				break;
			}
		};

		if (!found) {
			var lastContent = data.artObjects;
			$.getJSON("https://www.rijksmuseum.nl/api/nl/collection/"+self.initialId+"?key="+self.apiKey+"&format=json", function(data) {
				var initial = data.artObject;
				self.content = [];
				self.content.push(initial);
				self.content.concat(lastContent);
				self.buildContent();
			});
		}
	});
	
}

rijksmuseum.getContent = function(options) {
	var self = this;
	$.getJSON("https://www.rijksmuseum.nl/api/nl/collection?key="+self.apiKey+"&format=json&type=schilderij&imgonly=True&toppieces=True&ps=150", function(data) {
		self.content = data.artObjects;
		self.buildContent();
	});
}

rijksmuseum.findPicture = function(options) {
	var p_id = options.id;
	for (var i = 0; i < this.content.length; i++) {
		if (this.content[i].id == options.id) {
			return true;
		}
	};
	return false;
}

rijksmuseum.buildContent = function() {
	rijksSlideshow.init();	
}

rijksmuseum.init = function() {
	var self = this;
	var state = history.state;
	var pathname = window.location.pathname.split("/")[1];

	if (state) {
		this.initialId = state.id;
	} else if (pathname != "") {
		this.initialId = pathname;
	} 

	if (this.initialId) {
		this.getContentAndInitial();
	} else {
		this.getContent();
	}
}

$(document).ready(function() {
	rijksmuseum.init();
});



