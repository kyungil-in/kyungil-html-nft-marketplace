
$(window).load(async function () {

	var contractAddress;
	//블록체인 네트워크 선택하기
	var blockChainNetwork = localStorage.getItem("blockChainNetwork")
	$("#selectNetwork").val(blockChainNetwork).prop("selected", true);


	if (blockChainNetwork == "MATIC_MUMBAI") {
		contractAddress = contractAddress_MATIC_MUMBAI;
	}

	else if (blockChainNetwork == "KLAY_BAOBAB") {
		contractAddress = contractAddress_KLAY_BAOBAB;
	}

	else if (blockChainNetwork == "ETH_RINKEBY") {
		contractAddress = contractAddress_ETH_RINKEBY;
	}




	if (typeof web3 !== "undefined") {
		console.log("web3가 활성화되었습니다");

		$("#resultbrowsers").text("메타마스크를 로그인 해주세요!");

		if (web3.currentProvider.isMetaMask == true) {
			$("#resultbrowsers").text("메타마스크가 활성화되었습니다");
			try {

				accounts = await ethereum.request({
					method: "eth_requestAccounts"
				});

				$("#showAccount").text(accounts);
				//web3
				window.web3 = new Web3(window.ethereum);

				var mintingEvent = await new window.web3.eth.Contract(
					abiobj,
					contractAddress
				);


			} catch (error) {
				console.log(`error msg: ${error}`);
				$("#resultbrowsers").text("메타마스크를 로그인 해주세요!");
				return false;
			}
		} else {
			$("#resultbrowsers").text("메타마스크를 사용할 수  없니댜.");
		}
	} else {
		$("#resultbrowsers").text("web3를 찾을 수 없습니다.");
	}



	//승인 상태조회
	const ApprovalState = await mintingEvent.methods.isApprovedForAll(accounts[0], contractAddress).call();
	if (ApprovalState) {
		$("#btn_setApprovalForAll").text("거래상태 : 거래가능");
	} else {
		$("#btn_setApprovalForAll").text("거래상태 : 거래중지");
	}
	//console.log(ApprovalState);		

	//ipfs
	const IPFS_URL = "https://ipfs.io/ipfs/";
	const IPFS_API_URL = "ipfs.infura.io";
	const ipfs = window.IpfsApi(IPFS_API_URL, "5001", { protocol: "https" }); // Connect to IPFS

	$("#btn_uploadfile").on("click", function () {
		if ($("#uploadfile").val() == "") {
			alert("대표이미지를 입력해주세요");
			$("#uploadfile").focus();
			return;
		}

		var reader = new FileReader();
		reader.onloadend = function () {
			//console.log("reader.result" + reader.result);
			var buf = buffer.Buffer(reader.result); // Convert data into buffer
			ipfs.files.add(buf, (err, result) => {
				// Upload buffer to IPFS
				if (err) {
					console.error(err);
					return;
				}

				var hash_img_url = IPFS_URL + result[0].hash;

				//console.log(`Url --> ${hash_img_url}`);
				$("#ipfs_file_url").text(hash_img_url);
				$("#ipfs_file_url").attr("href", hash_img_url);
				$("#hash_img_url").val(hash_img_url);
			});
		};

		//console.log($('input#uploadfile')[0].files[0]);
		reader.readAsArrayBuffer($("input#uploadfile")[0].files[0]); // Read Provided File
	});

	$("#bnt_mint").on("click", function () {
		//https://docs.opensea.io/docs/metadata-standards
		/*
			  {
			  "description": "Friendly OpenSea Creature that enjoys long swims in the ocean.", 
			  "external_url": "https://openseacreatures.io/3", 
			  "image": "https://storage.googleapis.com/opensea-prod.appspot.com/puffs/3.png", 
			  "name": "Dave Starbelly",
			  "attributes": [ ... ], 
			  }                
		  */

		if (!localStorage.getItem("blockChainNetwork")) {
			alert("네트워크를 선택해주세요!");
			return false;
		}

		var name = $("#name").val();
		var hash_img_url = $("#hash_img_url").val();
		var description = $("#description").val();
		var category_val = $("select[name=category] option:selected").text();
		var metaData = {};
		var attributes = [];

		if (name == "") {
			alert("발행자를 입력해주세요");
			$("#name").focus();
			return false;
		}

		if (hash_img_url == "") {
			alert("대표이미지를 업로드해주세요");
			$("#uploadfile").focus();
			return false;
		}

		if (category == "선택하세요") {
			alert("카테고리를 선택하세요!");
			$("#category").focus();
			return false;
		}

		if (description == "") {
			alert("description을 입력해주세요");
			$("#description").focus();
			return false;
		}

		attributes.push({ trait_type: "category", value: category_val });

		metaData["name"] = name;
		metaData["attributes"] = attributes;
		metaData["description"] = description;
		metaData["image"] = hash_img_url;

		console.log(JSON.stringify(metaData));

		var buf = buffer.Buffer.from(JSON.stringify(metaData));
		ipfs.files.add(buf, (err, result) => {
			// Upload buffer to IPFS
			if (err) {
				console.error(err);
				return;
			}
			var hash_meta_url = IPFS_URL + result[0].hash;
			console.log(`hash_meta_url --> ${hash_meta_url}`);

			// mint function 
			setMint(hash_meta_url);
		});
	});



	async function setMint(hash_meta_url) {
		if (mintingEvent != null) {
			try {
				var accounts = await web3.eth.getAccounts();
				var receiptObj = await mintingEvent.methods.mintNFT(hash_meta_url).send({ from: accounts[0] });

				console.log(receiptObj);
				$("#resultbox").text("처리결과 \n" + JSON.stringify(receiptObj));

			} catch (error) {
				console.log(error);
				$("#resultbox").text("처리결과 \n" + error);
			}

		}
	}



	//상태변경하기
	$('#btn_setApprovalForAll').click(async function () {
		var receiptObj = await mintingEvent.methods.setApprovalForAll(contractAddress, true).send({ from: accounts[0] });
		console.log(receiptObj);
		location.reload();
	});
});
