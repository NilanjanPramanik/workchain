import React from "react";

const JobScreen = ({job}) => {
  return (
    <div>
      <div
        key={job.id}
        style={{
          border: "1px solid gray",
          padding: "10px",
          margin: "10px",
        }}
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
            <>
              <input
                value={workLink}
                onChange={(e) => setWorkLink(e.target.value)}
              />
              <button
                onClick={() => submitWork(job.id)}
                className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
              >
                Submit Work Link
              </button>
            </>
          )}
      </div>
    </div>
  );
};

export default JobScreen;
