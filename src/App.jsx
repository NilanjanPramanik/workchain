import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getContract } from "./utils/contract";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");

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
          isCompleted: job[5],
          isTaken: job[6],
        });
      }

      console.log("Fetched jobs:", jobsArray);
      setJobs(jobsArray); // Store in React state
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const createJob = async (description, price) => {
    try {
      const contract = await getContract(); // Ensure contract instance is fetched correctly

      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const priceInWei = ethers.parseEther(price.toString()); // Convert price to wei

      console.log("Creating job with:", description, priceInWei.toString());

      // Send ETH as msg.value (required by the contract)
      const tx = await contract.createJob(description, {
        value: priceInWei, // Set the transaction value
      });

      await tx.wait(); // Wait for transaction confirmation
      console.log("Job created successfully!");
    } catch (error) {
      console.error("Error creating job:", error);
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

  const acceptFreelancer = async (jobId) => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const tx = await contract.acceptFreelancer(jobId);
      await tx.wait();

      console.log(`Freelancer accepted for job #${jobId}`);
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error accepting freelancer:", error);
    }
  };

  const submitWork = async (jobId) => {
    try {
      const contract = await getContract();
      console.log("Available contract functions:", contract.functions);

      const tx = await contract.submitWork(jobId);
      await tx.wait();
      console.log("Work submitted successfully!");
      loadJobs(); // ✅ Refresh job list
    } catch (error) {
      console.error("Error submitting work:", error);
    }
  };

  const approveWork = async (jobId) => {
    try {
      const contract = await getContract();
      const tx = await contract.approveWork(jobId);
      await tx.wait();
      console.log("Work approved and payment released!");
      loadJobs(); // Refresh jobs after approval
    } catch (error) {
      console.error("Error approving work:", error);
    }
  };

  const loadJobs = async () => {
    const contract = await getContract();
    const jobsData = await contract.getAllJobs();
    setJobs(jobsData);
  };

  // async function acceptJob(jobId) {
  //   try {
  //     const contract = getContract();
  //     const tx = await contract.acceptJob(jobId);
  //     await tx.wait();
  //     fetchJobs();
  //   } catch (error) {
  //     console.error("Error accepting job:", error);
  //   }
  // }

  // async function completeJob(jobId) {
  //   try {
  //     const contract = getContract();
  //     const tx = await contract.completeJob(jobId);
  //     await tx.wait();
  //     fetchJobs();
  //   } catch (error) {
  //     console.error("Error completing job:", error);
  //   }
  // }

  // async function releasePayment(jobId) {
  //   try {
  //     const contract = getContract();
  //     const tx = await contract.releasePayment(jobId);
  //     await tx.wait();
  //     fetchJobs();
  //   } catch (error) {
  //     console.error("Error releasing payment:", error);
  //   }
  // }

  if (!currentAccount) return <p>Loading...</p>;

  return (
    <div className="App">
      <h1>Freelancer Marketplace</h1>

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
        <button onClick={() => createJob(description, budget)}>
          Create Job
        </button>
      </div>

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

          {!job.isTaken && (
            <button
              onClick={() => applyForJob(job.id)}
              className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
            >
              Apply
            </button>
          )}

          {!job.isTaken && (
            <>
              {job.employer.toString().toLowerCase() == currentAccount &&
                !job.isCompleted && (
                  <button
                    onClick={() => acceptFreelancer(job?.id)}
                    className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
                  >
                    Accept Freelancer
                  </button>
                )}
            </>
          )}

          {job.freelancer.toString().toLowerCase() === currentAccount &&
            !job.isCompleted && (
              <button
                onClick={() => submitWork(job.id)}
                className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
              >
                Submit Work
              </button>
            )}

          {job.employer?.toString().toLowerCase() === currentAccount &&
            job.isCompleted && (
              <button
                onClick={() => approveWork(job.id)}
                className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
              >
                Approve Work & Pay
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
}

export default App;
