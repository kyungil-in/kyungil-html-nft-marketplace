


function getUrlVars() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

var tokenId = getUrlVars()["tokenId"];


var _tokenURI = await mintingEvent.methods.tokenURI(tokenId).call();
var _ipfsinfo = ipfsInfo(_tokenURI);

var name = _ipfsinfo.name;
var imgurl = _ipfsinfo.image;
var description = _ipfsinfo.description;
var category = _ipfsinfo.category;

$("#name").text(name);
$("#imgurl").attr("src", imgurl);
$("#description").text(description);
$("#category").text(category);


function ipfsInfo(_tokenURI) {
	$.ajax({
		url: _tokenURI,
		type: 'get',
		data: '',
		async: false,
		success: function (data) {
			console.log(data);
			//console.log(data.name);
			//console.log(data.image);

			name = data.name;
			image = data.image;
			description = data.description;
			category = data.attributes[0].value;



		},
		error: function (e) {
			console.log("값을 가져오지 못했습니다.");
		}
	});

	return {
		name: name,
		image: image,
		description: description,
		category: category,
	};

}
