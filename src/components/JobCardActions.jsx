import React from "react";

const JobCardActions = ({freelancer,setIsOpen, acceptFreelancer, job}) => {
  return (
    <div className="flex items-center justify-between">
      <p>{freelancer}</p>
      <div className="space-x-4">
        <button
          onClick={() => {
            setIsOpen(true);
          }}
        >
          View Profile
        </button>
        <button onClick={() => acceptFreelancer(job.id, freelancer)}>
          Assign Him
        </button>
      </div>
    </div>
  );
};

export default JobCardActions;
