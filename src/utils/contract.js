import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/FreelancerMarketplace.sol/FreelancerMarketplace.json";

const CONTRACT_ADDRESS = "0xa0ed3f82Ac3A1ff7338708e9c99686C1585De658";

export const getContract = async () => {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not installed! Please install it.");
    throw new Error("MetaMask is not installed.");
  }

  try {
    // Create a provider and request MetaMask connection
    const provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Get the signer (connected account)
    const signer = await provider.getSigner();

    // Connect to the deployed smart contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

    console.log("Contract loaded successfully:", contract);
    return contract;
  } catch (error) {
    console.error("Error setting up contract:", error);
    throw error;
  }
};