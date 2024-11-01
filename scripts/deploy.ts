
import { ethers } from "hardhat";


async function main(){
    const NftMarket = await ethers.getContractFactory("SaidMarket");
    const nftmarket = await NftMarket.deploy();
    // await nftmarket.deployed();
    // console.log("SaidMarket deployed to:", nftmarket.address);
}

main().catch((error)=>{
    console.log(error);
    process.exitCode = 1
})