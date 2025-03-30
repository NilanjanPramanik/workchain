import React from "react";

const JobForm = ({
  jobTitle,
  description,
  budget,
  duration,
  setJobTitle,
  setDescription,
  setBudget,
  setDuration,
  createJob,
}) => {
  // console.log(jobTitle, description, budget, duration);
  return (
    <div className="flex p-4 gap-2 flex-col bg-black/5 backdrop-blur-lg rounded-lg shadow-md max-w-4xl">
      <input
        type="text"
        placeholder="Job Title"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
        className="border border-gray-300 p-3 rounded"
      />
      <input
        type="text"
        placeholder="Job Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border border-gray-300 p-3 rounded"
      />
      <input
        type="text"
        placeholder="Budget (AVAX)"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        className="border border-gray-300 p-3 rounded"
      />
      <input
        type="text"
        placeholder="Duration (days)"
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        className="border border-gray-300 p-3 rounded"
      />
      <button
        onClick={() => createJob(jobTitle, description, budget, duration)}
      >
        Create Job
      </button>
    </div>
  );
};

export default JobForm;
