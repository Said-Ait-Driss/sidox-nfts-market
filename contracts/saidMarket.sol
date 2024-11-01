// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

import {ERC721URIStorage, ERC721} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

struct NFT {
    address seller;
    uint256 price;
}

contract SaidMarket is ERC721URIStorage {
    address payable public marketplaceOwner; // me
    uint256 private _nextTokenId = 0;
    mapping(uint256 => NFT) private _arr_of_nfts;
    // address private owner; => use this if you don't use the Ownable modifier

    // if tokenURi is not empty => an NFT is Created
    // if price > 0 => an NFT is listed
    // if price = 0 & tokenURI is not empty => an NFT  is stransferd (bought or canceled)

    event NFTTranfer(
        uint256 tokenId,
        address from,
        address to,
        string tokenURI,
        uint256 price
    );
    constructor() ERC721("MyNFT", "ITM") {
        // owner = msg.sender; // the owner is who deployed the contract
    }

    modifier onlyOwner() {
        require(
            msg.sender == marketplaceOwner,
            "Only owner can call this function"
        );
        _;
    }

    function createNft(string calldata _uri) public returns (uint256) {
        uint256 id = _nextTokenId++; // creating new token

        _safeMint(msg.sender, id);
        _setTokenURI(id, _uri);

        emit NFTTranfer(id, address(0), msg.sender, _uri, 0);
        return id;
    }

    // list nft to the market (said market :))
    function listingNFt(uint256 tokenId, uint256 price) public {
        // listing not requiring any fee
        require(price > 0, "SaidMarket : price must be greather than 0");
        // approve(address(this), tokenId); // allowing the market to handle this token
        transferFrom(msg.sender, address(this), tokenId); // transfrom the ownership to the market
        _arr_of_nfts[tokenId] = NFT(msg.sender, price);
        emit NFTTranfer(tokenId, msg.sender, address(this), "", price);
    }

    // buy the nft
    function buyNft(uint256 tokenId) public payable {
        NFT memory nftToBuy = _arr_of_nfts[tokenId];

        require(nftToBuy.price > 0, "SaidMarket : nft not listed for sell"); // check if the nft is listing for sale
        require(
            msg.value == nftToBuy.price,
            "SaidMarket : price is less or greather than the nft price"
        ); // check if the price send to this function is equal to the nft price

        ERC721(address(this)).transferFrom(address(this), msg.sender, tokenId); // transfer the nft from the market to buyer
        clearNFT(tokenId); // clear the nft from listing
        payable(nftToBuy.seller).transfer((nftToBuy.price * 95) / 100); // take 95% and pay 5% to the market
        emit NFTTranfer(tokenId, address(this), msg.sender, "", 0);
    }

    function clearNFT(uint256 tokenId) private {
        _arr_of_nfts[tokenId] = NFT(address(0), 0);
    }

    // cancel listing of nft
    function cancelListing(uint256 tokenId) public {
        NFT memory nftToCancel = _arr_of_nfts[tokenId];
        require(nftToCancel.price > 0, "SaidMarket : nft not listed for sele");
        require(
            nftToCancel.seller == msg.sender,
            "SaidMarket : only the owner can cancel the nft from listing"
        ); // only the owner (original seller ) can cancel the nft from listing
        ERC721(address(this)).transferFrom(address(this), msg.sender, tokenId);
        clearNFT(tokenId);
        emit NFTTranfer(tokenId, address(this), msg.sender, "", 0);
    }

    // widthraw money from the market to the wallet
    function withrawFunds() public onlyOwner {
        // require( owner == msg.sender, "SaidMarket : only the owner of the contract can withraw the mony "); if you don't use the ownable modifier// owner = who deployed the contract (creator of the account)
        uint256 balance = address(this).balance;
        require(balance > 0, "SaidMarket : balance haven't enough funds");
        payable(marketplaceOwner).transfer(balance);
    }
}
