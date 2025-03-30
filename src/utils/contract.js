import { ethers } from "ethers";
import contractABI from "../../artifacts/contracts/FreelancerMarketplace.sol/FreelancerMarketplace.json";

const CONTRACT_ADDRESS = "0xdff22Dc5F0641a4821B2403B60462d1dfF490423";

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