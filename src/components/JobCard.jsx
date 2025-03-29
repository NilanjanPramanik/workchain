import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";

const JobCard = ({ job, currentAccount, fetchJobs, approveWork }) => {
  const [appliedFreelancer, setAppliedFreelancer] = useState(null);

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

  useEffect(() => {
    if (job) {
      getAppliedFreelancers(job.id); // Fetch applied freelancers when job changes
    }
  }, [job]);

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
        <div>
          <h4>Applied Freelancers:</h4>
          {appliedFreelancer.map((freelancer, index) => (
            <div key={index}>
              <p key={index}>{freelancer}</p>
              <button onClick={() => acceptFreelancer(job.id, freelancer)}>
                Assign Him
              </button>
            </div>
          ))}
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
    </div>
  );
};

export default JobCard;
