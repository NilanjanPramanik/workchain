import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import JobCard from "../components/JobCard";
import JobForm from "../components/JobForm";

const ClientScreen = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [duration, setDuration] = useState("");

  const [isRegistered, setIsRegistered] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");

  const [userData, setUserData] = useState(null);

  const [isJobFormOpen, setIsJobFormOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
    connectWallet();
    getClient(currentAccount); // Fetch client data on load
  }, [currentAccount]);

  const getClient = async (address) => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const client = await contract.getClient(address);
      if(!client) return;
      console.log("Client data:", client);
      setUserData({
        // id: client[0].toString(),
        name: client[0],
        age: client[1].toString(),
        location: client[2],
        phoneNumber: client[3],
        email: client[4],
        bio: client[5],
      });
    } catch (error) {
      console.error("Error fetching client data:", error);
    }
  };

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

      // Check if the freelancer is registered
      const contract = await getContract();
      const registered = await contract.isClientRegistered(accounts[0]);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };
  const registerClient = async () => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const tx = await contract.registerClient(
        name,
        parseInt(age),
        location,
        phoneNumber,
        email,
        bio
      );
      await tx.wait(); // Wait for transaction confirmation

      console.log("Client registered successfully!");

      setIsRegistered(true); // Update state to reflect registration
    } catch (error) {
      console.error("Error registering client:", error);
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
          title: job[1],
          description: job[2],
          price: ethers.formatEther(job[3]),
          duration: job[4], // Convert from Wei to ETH
          employer: job[5],
          freelancer: job[6],
          appliedFreelancers: job[7],
          isAssigned: job[8],
          isCompleted: job[9],
          isPaid: job[10],
          workLink: job[11],
        });
      }

      console.log("Fetched jobs:", jobsArray);
      setJobs(jobsArray); // Store in React state
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const createJob = async (title, description, price, duration) => {
    try {
      const contract = await getContract();

      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const priceInWei = ethers.parseEther(price.toString()); // Convert price to Wei

      // Corrected function call: Pass function parameters first, then msg.value
      const tx = await contract.createJob(
        title,
        description,
        parseInt(duration),
        "N/A", //for work link
        {
          value: priceInWei,
        }
      );

      await tx.wait(); // Wait for transaction confirmation
      console.log("Job created successfully!");

      setJobTitle("");
      setDescription("");
      setBudget("");
      setDuration("");
      setIsJobFormOpen(false); // Close the job form after submission
      fetchJobs(); // Refresh job list
      window.location.reload(); // Reload the page to reflect changes

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

  if (!isRegistered)
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          minWidth: "420px",
          backgroundColor: "",
        }}
      >
        <h2>Register as a Work Provider</h2>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button onClick={registerClient}>Register</button>
      </div>
    );

  if (userData)
    return (
      <div className="w-screen h h-full overflow-x-scroll flex flex-col item-start p-4 gap-2">
        <h2 className="text-3xl font-semibold pb-6">Welcome {userData.name}</h2>

        {/* Create Job Form */}
        <div className="p-6 bg-white/5 backdrop-blur-lg shadow-md rounded-lg w-full flex flex-col gap-4">
          <button className="w-fit" onClick={() => setIsJobFormOpen(true)}>
            Create a New Job Post
          </button>

          {isJobFormOpen && (
            <JobForm
              jobTitle={jobTitle}
              description={description}
              budget={budget}
              duration={duration}
              setJobTitle={setJobTitle}
              setDescription={setDescription}
              setBudget={setBudget}
              setDuration={setDuration}
              createJob={createJob}
            />
          )}
        </div>

        {/* List of Jobs */}
        <div className="p-6 mt-6 bg-white/5 backdrop-blur-lg shadow-md rounded-lg w-full space-y-6">
          <h3 className="text-xl">Your Created Jobs</h3>
          <div className="flex flex-col gap-4 mt-4">
            {jobs.map((job) => (
              <JobCard
                key={job?.id}
                job={job}
                currentAccount={currentAccount}
                fetchJobs={fetchJobs}
                approveWork={approveWork}
              />
            ))}
            {jobs.length === 0 && (
              <div className="text-gray-500">No jobs available.</div>
            )}
          </div>
        </div>
      </div>
    );
};

export default ClientScreen;
