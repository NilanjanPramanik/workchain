// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract FreelancerMarketplace {
    struct Job {
        uint id;
        string description;
        uint budget;
        address payable client;
        address payable freelancer;
        bool isCompleted;
        bool isPaid;
        bool isTaken;
    }

    uint public jobCount;
    mapping(uint => Job) public jobs;

    event JobCreated(
        uint jobId,
        string description,
        uint budget,
        address client
    );
    event JobAccepted(uint jobId, address freelancer);
    event JobCompleted(uint jobId);
    event PaymentReleased(uint jobId, address freelancer);
    event JobTaken(uint256 indexed jobId, address indexed freelancer);
    event FreelancerAccepted(uint256 indexed jobId, address indexed freelancer);

    function createJob(string memory _description) external payable {
        require(msg.value > 0, "Budget must be greater than 0");

        jobCount++;
        jobs[jobCount] = Job(
            jobCount,
            _description,
            msg.value,
            payable(msg.sender),
            payable(address(0)),
            false,
            false,
            false // Initialize isTaken to false
        );

        emit JobCreated(jobCount, _description, msg.value, msg.sender);
    }

    function acceptJob(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.client != address(0), "Job does not exist");
        require(job.freelancer == address(0), "Job already taken");
        require(job.client != msg.sender, "Client cannot take the job");

        job.freelancer = payable(msg.sender);
        emit JobAccepted(_jobId, msg.sender);
    }

    function completeJob(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(
            msg.sender == job.freelancer,
            "Only freelancer can complete the job"
        );
        require(!job.isCompleted, "Job already completed");

        job.isCompleted = true;
        emit JobCompleted(_jobId);
    }

    function releasePayment(uint _jobId) external {
        Job storage job = jobs[_jobId];
        require(msg.sender == job.client, "Only client can release payment");
        require(job.isCompleted, "Job is not completed yet");
        require(!job.isPaid, "Payment already released");

        job.isPaid = true;
        job.freelancer.transfer(job.budget);
        emit PaymentReleased(_jobId, job.freelancer);
    }

    // Function to get job details by ID
    function getJob(
        uint256 _jobId
    )
        external
        view
        returns (
            uint256 id,
            string memory description,
            uint256 budget,
            address client,
            address freelancer,
            bool isCompleted,
            bool isPaid
        )
    {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID"); // Ensure valid ID

        Job memory job = jobs[_jobId]; // Fetch job

        return (
            job.id,
            job.description,
            job.budget,
            job.client, // Use client instead of employer
            job.freelancer,
            job.isCompleted,
            job.isPaid // Use isPaid instead of isTaken
        );
    }

    function applyForJob(uint256 _jobId) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        Job storage job = jobs[_jobId];
        require(job.isTaken == false, "Job already taken");

        job.freelancer = payable(msg.sender);
        job.isTaken = true;

        emit JobTaken(_jobId, msg.sender);
    }

    function acceptFreelancer(uint256 _jobId) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        Job storage job = jobs[_jobId];
        require(
            msg.sender == job.client,
            "Only employer can accept freelancer"
        );
        require(job.isTaken == true, "No freelancer has applied yet");
        require(job.isCompleted == false, "Job already completed");

        emit FreelancerAccepted(_jobId, job.freelancer);
    }

    event WorkSubmitted(uint256 indexed jobId, address indexed freelancer);

    function submitWork(uint256 _jobId) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        Job storage job = jobs[_jobId];

        require(
            msg.sender == job.freelancer,
            "Only assigned freelancer can submit work"
        );
        require(job.isTaken == true, "Freelancer has not been accepted yet");
        require(job.isCompleted == false, "Job is already completed");

        job.isCompleted = true; // ✅ Mark job as completed

        emit WorkSubmitted(_jobId, msg.sender);
    }

    event PaymentReleased(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount
    );

    function approveWork(uint256 _jobId) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        Job storage job = jobs[_jobId];

        require(msg.sender == job.client, "Only employer can approve work");
        require(job.isCompleted == true, "Work is not submitted yet");
        require(job.isTaken == true, "No freelancer assigned");
        require(
            address(this).balance >= job.budget,
            "Contract balance is insufficient"
        );

        job.freelancer.transfer(job.budget); // ✅ Transfer payment to freelancer
        job.isCompleted = false; // ✅ Mark job as closed

        emit PaymentReleased(_jobId, job.freelancer, job.budget);
    }

    function getAllJobs() public view returns (Job[] memory) {
        Job[] memory jobList = new Job[](jobCount);
        for (uint256 i = 1; i <= jobCount; i++) {
            jobList[i - 1] = jobs[i];
        }
        return jobList;
    }
}
