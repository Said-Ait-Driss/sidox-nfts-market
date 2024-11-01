import { assert, expect } from "chai";
import { ethers } from "hardhat";
import d from "ethers";

describe("SaidMarket", () => {
  let nftmarket: any, signers: any;

  before(async () => {
    // getting the contract & inistiat it then deploying it
    const NftMarket = await ethers.getContractFactory("SaidMarket");
    nftmarket = await NftMarket.deploy();
    signers = await ethers.getSigners();
  });

  const createNFT = async (nftUri: string) => {
    const createNftTransaction = await nftmarket.createNft(nftUri);
    // await the transaction until minit
    const receipt = await createNftTransaction.wait();
    // check if the new minted nft uri is the same as the one sent to create nft uri
    return receipt.events[0].args.tokenId;
  };

  const createAndListNFT = async (price: number) => {
    const tokenId = await createNFT("some uri here");
    const listNftTransaction = await nftmarket.listingNFt(tokenId, price);
    await listNftTransaction.wait();
    return tokenId;
  };

  describe("createNFT", async () => {
    it("should create nft with all corrct infos", async () => {
      // testing the create nft function
      const nftUri = "https://someuri.com";

      await expect(nftmarket.createNft(nftUri))
        .to.emit(nftmarket, "NFTTranfer")
        .withArgs(0, ethers.ZeroAddress, signers[0].getAddress(), nftUri, 0);
    });
  });

  describe("listingNFt", async () => {
    it("should revert if the price is 0", async () => {
      const tokenId = 0;
      const price = 0;
      await expect(nftmarket.listingNFt(tokenId, price)).to.be.revertedWith(
        "SaidMarket : price must be greather than 0"
      );
    });

    it("it should revert if not called by the owner", async () => {
      const tokenId = 0;
      const price = 10;

      await expect(
        nftmarket.connect(signers[1]).listingNFt(tokenId, price)
      ).to.be.revertedWith("Only owner can call this function");
    });
    it("it should list the nft token if all requirment are met", async () => {
      const tokenId = 0;
      const price = 10;

      await expect(nftmarket.listingNFt(tokenId, price))
        .to.emit(nftmarket, "NFTTranfer")
        .withArgs(
          0,
          signers[0].getAddress(),
          await nftmarket.getAddress(),
          "",
          10
        );

      // check if nft ownership transferd to the contract
      const ownerAdress = await nftmarket.ownerOf(tokenId);
      expect(ownerAdress).to.equal(await nftmarket.getAddress());
    });
  });

  describe("buyNFT", () => {
    it("should revert if the nft not listed to buy", async () => {
      const transaction = nftmarket.buyNft(555);
      expect(transaction).to.revertedWith(
        "NFTMarket : nft not listed for sell"
      );
    });

    it("should revert if the buying price not the same as nft price", async () => {
      const price = 214;
      const seller = signers[0]; // sellter => [0] , buyer => [1]
      const tokenId = 0;
      await expect(
        nftmarket.connect(seller).buyNft(tokenId, { value: price })
      ).to.revertedWith(
        "SaidMarket : price is less or greather than the nft price"
      );
    });

    it("should pass if all requirement are met", async () => {
      const price = 214;
      const seller = signers[0]; // sellter => [0] , buyer => [1]
      const buyer = signers[1];
      const initiaContractBalance = await ethers.provider.getBalance(
        nftmarket.getAddress()
      );
      const sellerProfit = Math.floor((price * 95) / 100); // 95% of the price

      const fee = price - sellerProfit; // 5% of the price

      const tokenId = 1;
      const tokenUri = "some uri here";

      let tr = await nftmarket.createNft(tokenUri);
      await tr.wait();

      tr = await nftmarket.listingNFt(tokenId, price);
      await tr.wait();
      await new Promise((r) => setTimeout(r, 100));

      const oldSellerBalance = await ethers.provider.getBalance(
        seller.getAddress()
      );

      await new Promise((r) => setTimeout(r, 100));

      expect(await nftmarket.tokenURI(tokenId)).to.be.equal(tokenUri);

      await expect(nftmarket.connect(buyer).buyNft(tokenId, { value: price }))
        .to.emit(nftmarket, "NFTTranfer")
        .withArgs(
          tokenId,
          await nftmarket.getAddress(),
          buyer.getAddress(),
          "",
          0
        );

      // 95% of the price added to the seller balance
      await new Promise((r) => setTimeout(r, 100));

      const newSellerBalance = await ethers.provider.getBalance(
        seller.getAddress()
      );

      const diff = newSellerBalance - oldSellerBalance;

      expect(diff).to.equal(sellerProfit);

      // 5% of the price was kept to contract balance

      const newContractBalance = await ethers.provider.getBalance(
        nftmarket.getAddress()
      );

      const contractBalanceDeff = newContractBalance - initiaContractBalance;

      expect(contractBalanceDeff).to.equal(fee); // contract balance = 5% of the price

      // nft ownership transformed to the seller

      const ownerAdress = await nftmarket.ownerOf(tokenId);

      expect(ownerAdress).to.equal(await buyer.getAddress());
    });
  });

  describe("cancelListing", () => {
    it("should revert if the nft is not listed for sale", async () => {
      const transaction = nftmarket.cancelListing(256);
      await expect(transaction).to.be.revertedWith(
        "SaidMarket : nft not listed for sale"
      );
    });

    it("should revert if the caller is not who listed the nft to the market", async () => {
      const tokenId = 2;
      const price = 210;
      const tokenUri = "some uri 2 here";

      let tr = await nftmarket.createNft(tokenUri);
      await tr.wait();

      tr = await nftmarket.listingNFt(tokenId, price);
      await tr.wait();

      expect(await nftmarket.tokenURI(tokenId)).to.be.equal(tokenUri);

      const transaction = nftmarket.connect(signers[1]).cancelListing(tokenId);

      await expect(transaction).to.be.revertedWith(
        "SaidMarket : only the owner can cancel the nft from listing"
      );
    });

    it("should transfer the ownership back to the seller", async () => {
      const tokenId = 3;
      const price = 210;
      const tokenUri = "some uri 3 here";

      let tr = await nftmarket.createNft(tokenUri);
      await tr.wait();

      tr = await nftmarket.listingNFt(tokenId, price);
      await tr.wait();

      expect(await nftmarket.tokenURI(tokenId)).to.be.equal(tokenUri);

      await expect(nftmarket.cancelListing(tokenId))
        .to.emit(nftmarket, "NFTTranfer")
        .withArgs(
          tokenId,
          await nftmarket.getAddress(),
          signers[0].getAddress(),
          "",
          0
        );

      const ownerAdress = await nftmarket.ownerOf(tokenId);
      expect(ownerAdress).to.equal(await signers[0].getAddress());
    });
  });

  describe("widthrawFunds", () => {
    it("should revert if the caller is not who has the funds", async () => {
      const transaction = nftmarket.connect(signers[1]).withrawFunds();
      await expect(transaction).to.be.revertedWith(
        "Only owner can call this function"
      );
    });

    it("should transfer the contract balance to the owner's balance", async () => {
      const owner = signers[0]

      const contractBalance = await ethers.provider.getBalance(
        await nftmarket.getAddress()
      );
      const initialBalance = await ethers.provider.getBalance(await owner.getAddress());

      const transaction = await nftmarket.withrawFunds();
      const receipt = await transaction.wait();

      await new Promise((r) => setTimeout(r, 100));
      const finalBalance = await ethers.provider.getBalance(await owner.getAddress());

      let gas = receipt.gasUsed * receipt.gasPrice

      assert.equal(
        initialBalance + contractBalance,
        finalBalance + BigInt(gas)
    )
    });

    it("should reverted if the contract value is zero", async () => {
      const transaction = nftmarket.withrawFunds();
      await expect(transaction).to.be.revertedWith(
        "SaidMarket : balance haven't enough funds"
      );
    });
  });
});
