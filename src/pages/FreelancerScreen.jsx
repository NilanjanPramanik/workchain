import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getContract } from "../utils/contract";
import JobCardViewOnly from "../components/JobCardViewOnly";

const FreelancerScreen = () => {
  const [jobs, setJobs] = useState([]);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [workLink, setWorkLink] = useState(""); // State to store work link
  const [isRegistered, setIsRegistered] = useState(false);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolioURL, setPortfolioURL] = useState("");
  const [linkedInURL, setLinkedInURL] = useState("");
  const [email, setEmail] = useState("");

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchJobs();
    connectWallet();
    getFreelancer(currentAccount); // Fetch freelancer data on load
  }, [currentAccount]);

  const getFreelancer = async (address) => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const freelancer = await contract.getFreelancer(address);
      console.log("Freelancer data:", freelancer);
      setUserData({
        id: freelancer[0].toString(),
        age: freelancer[1].toString(),
        name: freelancer[2],
        location: freelancer[3],
        phoneNumber: freelancer[4],
        email: freelancer[5],
        bio: freelancer[6],
        skills: freelancer[7],
        portfolioURL: freelancer[8],
        linkedInURL: freelancer[9],
        rating: freelancer[10].toString(),
      });
    } catch (error) {
      console.error("Error fetching freelancer data:", error);
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
      const registered = await contract.isFreelancerRegistered(accounts[0]);
      setIsRegistered(registered);
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

  const loadJobs = async () => {
    const contract = await getContract();
    const jobsData = await contract.getAllJobs();
    setJobs(jobsData);
  };

  const registerFreelancer = async () => {
    try {
      const contract = await getContract();

      const tx = await contract.registerFreelancer(
        name,
        age,
        location,
        phoneNumber,
        email,
        bio,
        skills,
        portfolioURL ? portfolioURL : "N/A",
        linkedInURL ? linkedInURL : "N/A"
      );
      await tx.wait();

      console.log("Freelancer registered successfully!");
      setIsRegistered(true); // Update state after registration
      window.location.reload(); // Reload the page to fetch updated data
    } catch (error) {
      console.error("Error registering freelancer:", error);
    }
  };

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
        <h2>Register as a Freelancer</h2>
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
        <input
          type="text"
          placeholder="Skills (comma-separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="Portfolio URL"
          value={portfolioURL}
          onChange={(e) => setPortfolioURL(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <input
          type="text"
          placeholder="LinkedIn URL"
          value={linkedInURL}
          onChange={(e) => setLinkedInURL(e.target.value)}
          style={{
            padding: "15px",
            paddingX: "20px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <button onClick={registerFreelancer}>Register</button>
      </div>
    );

  if (userData)
    return (
      <div className="w-screen min-h-screen flex flex-col p-4">
        <h2 className="text-xl">Welcome {userData.name},</h2>

        {/* List of Jobs */}
        <div className="flex flex-col gap-4 mt-4 bg-black/5 backdrop-blur-lg rounded-lg shadow-md max-w-4xl p-4">
          <h2 className="text-lgs ">Active Jobs</h2>
          <div className="flex flex-col gap-4 mt-4">
            {jobs.map((job) => (
              <JobCardViewOnly key={job.id} job={job} />
            ))}
            {jobs.length === 0 && (
              <div className="text-gray-500">No jobs available</div>
            )}
          </div>
        </div>
      </div>
    );
};

export default FreelancerScreen;
