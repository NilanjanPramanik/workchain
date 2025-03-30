import React, { useEffect, useState } from "react";
import { getContract } from "../utils/contract";

const JobCardViewOnly = ({ job }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [jobOwner, setJobOwner] = useState(null);

  const getJobOwner = async (oenerId) => {
    try {
      const contract = await getContract();
      if (!contract) {
        console.error("Contract not initialized");
        return;
      }
      const owner = await contract.getClient(oenerId);
      setJobOwner(owner);
    } catch (error) {
      console.error("Error fetching job owner:", error);
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
      window.location.reload();
    } catch (error) {
      console.error("Error applying for job:", error);
      alert(error.reason);
    }
  };

  const submitWork = async (jobId) => {
    try {
      const contract = await getContract();
      console.log("Available contract functions:", contract.functions);

      const tx = await contract.submitWork(jobId, workLink);
      await tx.wait();
      console.log("Work submitted successfully!");
      loadJobs(); // ✅ Refresh job list
    } catch (error) {
      console.error("Error submitting work:", error);
    }
  };

  useEffect(() => {
    getJobOwner(job.employer);
  }, [job.employer]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex justify-between p-4 gap-2 bg-white/5 backdrop-blur-lg rounded-lg shadow-md max-w-4xl"
      >
        <p>Job Title: {job.title}</p>
        <p>Budget: {job.price}</p>
        <p>Duration: {job.duration} days</p>
      </button>

      <div>
        {isOpen && (
          <div className="flex flex-col gap-4 mt-4 bg-black/5 backdrop-blur-lg rounded-lg shadow-md max-w-4xl p-4 relative text-white/80">
            <p>Title: {job.title}</p>
            <p> {job.description}</p>
            <p>Budget: {job.price} AVAX</p>
            <p>Status: {job.isCompleted ? "Completed" : "Active"}</p>
            <p>Posted by: {jobOwner?.name}</p>
            <p>Job Id: {job.id}</p>

            <p
              onClick={() => setIsOpen(false)}
              className="bg-white/5 drop-shadow-md rounded-full w-8 h-8 flex items-center justify-center absolute top-2 right-2 cursor-pointer"
            >
              X
            </p>

            <div>
              {!job.isAssigned && (
                <button
                  onClick={() => applyForJob(job.id)}
                  className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
                >
                  Apply Now
                </button>
              )}

              {job.isAssigned && <button onClick={submitWork}></button>}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default JobCardViewOnly;
