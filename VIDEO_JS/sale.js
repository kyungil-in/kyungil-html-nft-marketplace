

const tempnftListArray = await mintingEvent.methods.getSaleNftTokens().call();
console.log(tempnftListArray)

let i = 0;

for (i = 0; i < tempnftListArray.length; i++) {

	_nftTokenId = tempnftListArray[i].nftTokenId;
	_nftTokenURI = tempnftListArray[i].nftTokenURI;
	_price = tempnftListArray[i].price;

	_ipfsinfo = ipfsInfo(_nftTokenURI);
	name = _ipfsinfo.name;
	image = _ipfsinfo.image;

	//console.log(v);


	var html = '';

	html += '<tr id="tr_' + _nftTokenId + '">';
	html += '<td>' + (i + 1) + '</td>';
	html += '<td>' + _nftTokenId + '</td>';

	html += '<td>' + _price + '</td>';

	html += '<td>' + name + '</td>';
	html += '<td><img src=' + image + ' width=100px/></td>';

	html += '<td>';
	html += '<a href="./mynft_detail.html?tokenId=' + _nftTokenId + '" class="btn btn-secondary btn-flat">상세보기</a> ';
	html += '<button type="button" class="btn btn-success btn_buy" data-bs-toggle="modal" data-bs-target="#saleModal" data-val="' + _nftTokenId + '" data-price-val="' + _price + '"  ">구매하기</button> ';
	html += '<button type="button" class="btn btn-danger btn_burn"" data-val="' + _nftTokenId + '">삭제하기</button> ';

	html += '</td> ';
	html += '</tr>';

	$("#dynamicTbody").append(html);
}



if (i == 0) {

	var html = '';

	html += '<tr>';
	html += '<td colspan="6" style="text-align:center;">자료없음</td> ';
	html += '</tr>';

	$("#dynamicTbody").append(html);

}


function ipfsInfo(_nftTokenURI) {
	$.ajax({
		url: _nftTokenURI,
		type: 'get',
		data: '',
		async: false,
		success: function (data) {
			//console.log(data);
			//console.log(data.name);
			//console.log(data.image);

			name = data.name;
			image = data.image;


		},
		error: function (e) {
			console.log("값을 가져오지 못했습니다.");
		}
	});

	return {
		name: name,
		image: image
	};

}










$('.btn_buy').click(function () {
	var tokenId = $(this).attr("data-val");
	var price = $(this).attr("data-price-val");
	$("#price").val(price)

	$('.modal-title').html("구매하기");
	$('#saleModal').modal('show');


	//구매하기
	$('.btn_buySubmit').click(async function () {
		var ownerAddress = await mintingEvent.methods.ownerOf(tokenId).call();
		console.log(ownerAddress.toLowerCase(), accounts[0]);

		if (ownerAddress.toLowerCase() == accounts[0]) {
			alert("제품 소유자는 구매할 수 없습니다.");
			return false;
		}

		if (!ApprovalState) {
			alert("판매승인 상태를 변경하세요");
			return false;
		}

		var receiptObj = await mintingEvent.methods.buyNftToken(tokenId).send({ from: accounts[0], value: price });
		console.log(receiptObj);
		location.reload();

	});

});