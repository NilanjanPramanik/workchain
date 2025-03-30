import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import JobCardActions from "./JobCardActions";

const JobCard = ({ job, currentAccount, fetchJobs, approveWork }) => {
  const [appliedFreelancer, setAppliedFreelancer] = useState(null);
  const [freelancerProfile, setFreelancerProfile] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [freelansersName, setFreelansersName] = useState(null);

  const getAppliedFreelancers = async (jobId) => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const freelancers = await contract.getAppliedFreelancers(jobId);
      console.log("Applied freelancers for job #", jobId, freelancers);
      setAppliedFreelancer(freelancers);
    } catch (error) {
      console.error("Error fetching applied freelancers:", error);
    }
  };

  const acceptFreelancer = async (jobId, freelancer) => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const tx = await contract.acceptFreelancer(jobId, freelancer);
      await tx.wait();

      console.log(`Freelancer accepted for job #${jobId}`);
      fetchJobs(); // Refresh job list
    } catch (error) {
      console.error("Error accepting freelancer:", error);
    }
  };

  const getFreelancer = async (address) => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }

      const freelancer = await contract.getFreelancer(address);
      console.log("Freelancer data:", { freelancer });
      setFreelancerProfile({
        id: freelancer[0].toString(),
        name: freelancer[1],
        age: freelancer[2].toString(),
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

  useEffect(() => {
    if (job) {
      getAppliedFreelancers(job.id);
    }
  }, [job]);

  useEffect(() => {
    if (appliedFreelancer) {
      appliedFreelancer.forEach((freelancer) => {
        getFreelancer(freelancer);
        // setFreelansersName === null
        //   ? setFreelansersName(freelancer.name)
        //   : setFreelansersName((pre) => {
        //       [...pre, freelancer.name];
        //     });
      });
    }
  }, [appliedFreelancer]);

  console.log(freelancerProfile);

  if (!job) return null; // Check if job is null or undefined

  return (
    <div style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}>
      <h3>Job ID: {job.id}</h3>
      <p>{job.description}</p>
      <p>Budget: {job.price} AVAX</p>
      <p>Freelancer: {job.freelancer || "Not Assigned"}</p>
      <p>Status: {job.isCompleted ? "Completed" : "In Progress"}</p>
      <p>Paid: {job.isPaid ? "Yes" : "No"}</p>
      <p>Posted by: {job.employer}</p>
      <p>Duration: {job.duration} days</p>
      {job.workLink && <p>Work Link: {job.workLink}</p>}

      {!job.isAssigned && appliedFreelancer && (
        <div className="flex flex-col gap-4 mt-4 bg-black/5 backdrop-blur-lg rounded-lg shadow-md max-w-4xl p-4 relative text-white/80">
          <h4 className="text-lg">Applied Freelancers:</h4>
          <div className="flex flex-col gap-4">
            {appliedFreelancer.map((freelancer, index) => (
              <JobCardActions
                key={index}
                freelancer={freelancer}
                job={job}
                setIsOpen={setIsOpen}
                acceptFreelancer={acceptFreelancer}
              />
            ))}
          </div>
        </div>
      )}

      {/* {!job.isCompleted &&
        !job.isAssigned &&
        job.employer.toString().toLowerCase() == currentAccount && (
          <button
            onClick={() => acceptFreelancer(job?.id)}
            className="bg-green-500 text-white px-4 py-2 mt-2 rounded"
          >
            Accept Freelancer
          </button>
        )} */}

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

      {isOpen && freelancerProfile && (
        <div className="w-screen min-h-screen flex flex-col p-4 absolute top-0 left-0 z-10 bg-[#1a1a1a]">
          <div className="bg-black/10 backdrop-blur-lg w-full max-w-[660px] p-6 pt-10 relative">
            <p>Name:{freelancerProfile.name}</p>
            <p>{freelancerProfile.bio}</p>
            <p>Skills: {freelancerProfile.skills}</p>
            <p>Age: {freelancerProfile.age}</p>
            <p>Email: {freelancerProfile.email}</p>
            <p>Phone No.: {freelancerProfile.phoneNumber}</p>
            <p>WalletId: {freelancerProfile.id}</p>
            <p>Address: {freelancerProfile.location}</p>
          </div>

          <div
            onClick={() => setIsOpen(false)}
            className="absolute top-6 left-8 underline cursor-pointer"
          >
            Go back
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
