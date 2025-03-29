import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import JobCard from "../components/JobCard";

const ClientScreen = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    fetchJobs();
    connectWallet();
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask not detected!");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      console.log("Connected wallet:", accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const jobCount = await contract.jobCount(); // Get total job count
      const jobsArray = [];

      for (let i = 1; i <= jobCount; i++) {
        const job = await contract.getJob(i); // Fetch each job
        jobsArray.push({
          id: job[0].toString(),
          description: job[1],
          price: ethers.formatEther(job[2]),
          duration: job[3], // Convert from Wei to ETH
          employer: job[4],
          freelancer: job[5],
          appliedFreelancers: job[6],
          isAssigned: job[7],
          isCompleted: job[8],
          isPaid: job[9],
          workLink: job[10],
        });
      }

      console.log("Fetched jobs:", jobsArray);
      setJobs(jobsArray); // Store in React state
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const createJob = async (description, price, duration) => {
    try {
      const contract = await getContract();

      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const priceInWei = ethers.parseEther(price.toString()); // Convert price to Wei

      // Corrected function call: Pass function parameters first, then msg.value
      const tx = await contract.createJob(
        description,
        parseInt(duration),
        "N/A",
        {
          value: priceInWei,
        }
      );

      await tx.wait(); // Wait for transaction confirmation
      console.log("Job created successfully!");

      const balance = await contract.getContractBalance();
      console.log("Contract balance:", ethers.formatEther(balance.toString()));
    } catch (error) {
      console.error("Error creating job:", error);
    }
  };

  const approveWork = async (jobId) => {
    try {
      const contract = await getContract();
      const tx = await contract.approveWork(jobId);
      await tx.wait();
      console.log("Work approved and payment released!");
      // loadJobs(); // Refresh jobs after approval

      const balance = await contract.getContractBalance();
      console.log("Contract balance:", ethers.formatEther(balance.toString()));
    } catch (error) {
      console.error("Error approving work:", error);
    }
  };

  // const loadJobs = async () => {
  //   const contract = await getContract();
  //   // const jobsData = await contract.getAllJobs();
  //   // setJobs(jobsData);
  // };

  return (
    <div className="App">
      <h1>Freelancer Marketplace for Admin</h1>

      {/* Create Job Form */}
      <div>
        <input
          type="text"
          placeholder="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="text"
          placeholder="Budget (AVAX)"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <input
          type="text"
          placeholder="Duration (days)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <button onClick={() => createJob(description, budget, duration)}>
          Create Job
        </button>
      </div>

      {/* List of Jobs */}
      {jobs.map((job) => (
        <JobCard
          key={job?.id}
          job={job}
          currentAccount={currentAccount}
          fetchJobs={fetchJobs}
          approveWork={approveWork}
        />
      ))}
    </div>
  );
};

export default ClientScreen;
