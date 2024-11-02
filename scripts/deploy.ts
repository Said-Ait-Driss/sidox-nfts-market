
import { ethers } from "hardhat";


async function main(){
    const NftMarket = await ethers.getContractFactory("SaidMarket");
    const nftmarket = await NftMarket.deploy();
    // await nftmarket.deployed();
    console.log("SaidMarket deployed to:", await nftmarket.getAddress());
}

main().catch((error)=>{
    console.log(error);
    process.exitCode = 1
})