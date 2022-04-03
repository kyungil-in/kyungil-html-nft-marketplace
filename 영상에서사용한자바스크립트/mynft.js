//승인 상태조회
const ApprovalState = await mintingEvent.methods.isApprovedForAll(accounts[0], contractAddress).call();
if (ApprovalState) {
	$("#btn_setApprovalForAll").text("거래상태 : 거래가능");
} else {
	$("#btn_setApprovalForAll").text("거래상태 : 거래중지");
}

const tempnftListArray = await mintingEvent.methods.getNftTokens(accounts[0]).call();

//console.log(tempnftListArray);


for (i = 0; i < tempnftListArray.length; i++) {

_nftTokenId = tempnftListArray[i].nftTokenId;
_nftTokenURI = tempnftListArray[i].nftTokenURI;
_price = tempnftListArray[i].price;
_ipfsinfo = ipfsInfo(_nftTokenURI);
name = _ipfsinfo.name;
image = _ipfsinfo.image;




var html = '';

html += '<tr id="tr_' + _nftTokenId + '">';
html += '<td>' + (i + 1) + '</td>';
html += '<td>' + _nftTokenId + '</td>';

html += '<td>' + name + '</td>';
html += '<td><img src=' + image + ' width=100px/></td>';

html += '<td>' + _price + '</td>';
html += '<td>';
html += '<a href="./mynft_detail.html?tokenId=' + _nftTokenId + '" class="btn btn-secondary btn-flat">상세보기</a> ';

if (_price == 0) {
	html += '<button type="button" class="btn btn-primary btn_onSale" data-bs-toggle="modal" data-bs-target="#saleModal" data-val="' + _nftTokenId + '">판매하기</button> ';
}


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




$('.btn_onSale').click(function () {
	var tokenId = $(this).attr("data-val");
	$('.modal-title').html("판매등록하기");
	$('#saleModal').modal('show');

	//판매하기
	$('.btn_onSaleSubmit').click(async function () {
		var price = $("#price").val();
		//console.log(tokenId, price, ApprovalState);


		var ownerAddress = await mintingEvent.methods.ownerOf(tokenId).call();
		console.log(ownerAddress.toLowerCase(), accounts[0]);

		if (ownerAddress.toLowerCase() != accounts[0]) {
			alert("제품 소유자만 판매등록할 수 있습니다.");
			return false;
		}


		if (!ApprovalState) {
			alert("판매승인 상태를 변경하세요");
			return false;
		}




		var receiptObj = await mintingEvent.methods.setSaleNftToken(tokenId, price).send({ from: accounts[0], gas: 3000000 });
		console.log(receiptObj);

		location.reload();
	});



});




$('.btn_burn').click(async function () {
	if (confirm('삭제하시면 복구할수 없습니다. \n 정말로 삭제하시겠습니까??')) {
		var tokenId = $(this).attr("data-val");
		var receiptObj = await mintingEvent.methods.burn(tokenId).send({ from: accounts[0] });
		console.log(receiptObj);

		$('#tr_' + tokenId + '').remove();

		return false;
	}
});




//상태변경하기
$('#btn_setApprovalForAll').click(async function () {
	var receiptObj = await mintingEvent.methods.setApprovalForAll(contractAddress, true).send({ from: accounts[0] });
	console.log(receiptObj);
	location.reload();
});

