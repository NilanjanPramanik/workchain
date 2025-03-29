import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";

const FreelancerScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);

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
          price: ethers.formatEther(job[2]), // Convert from Wei to ETH
          employer: job[3],
          freelancer: job[4],
          isAssigned: job[5],
          isCompleted: job[6],
          isPaid: job[7],
        });
      }

      console.log("Fetched jobs:", jobsArray);
      setJobs(jobsArray); // Store in React state
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const applyForJob = async (jobId) => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const tx = await contract.applyForJob(jobId);
      await tx.wait();

      console.log(`Applied for job #${jobId}`);
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error applying for job:", error);
    }
  };

  console.log(jobs);

  return (
    <div className="App">
      <h1>Freelancer Marketplace for Freelancer</h1>

      {/* List of Jobs */}
      {jobs.map((job) => (
        <div
          key={job.id}
          style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}
        >
          <h3>Job ID: {job.id}</h3>
          <p>{job.description}</p>
          <p>Budget: {job.price} AVAX</p>
          <p>Freelancer: {job.freelancer || "Not Assigned"}</p>
          <p>Status: {job.isCompleted ? "Completed" : "In Progress"}</p>
          <p>Paid: {job.isPaid ? "Yes" : "No"}</p>
          <p>Posted by: {job.employer}</p>
          {!job.isApplied ? (
            <button
              onClick={() => applyForJob(job.id)}
              className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
            >
              Apply
            </button>
          ) : (
            <p className="text-green-500">Applied</p>

          )}

          {job.freelancer.toString().toLowerCase() === currentAccount &&
            !job.isCompleted && (
              <button
                onClick={() => submitWork(job.id)}
                className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
              >
                Submit Work Link
              </button>
            )}

          {/* {!job.freelancer && (
            <button onClick={() => acceptJob(job.id)}>Accept Job</button>
          )}
          {job.freelancer && !job.isCompleted && (
            <button onClick={() => completeJob(job.id)}>Complete Job</button>
          )}
          {job.freelancer && job.isCompleted && !job.isPaid && (
            <button onClick={() => releasePayment(job.id)}>
              Release Payment
            </button>
          )} */}
        </div>
      ))}
    </div>
  );
};

export default FreelancerScreen;
