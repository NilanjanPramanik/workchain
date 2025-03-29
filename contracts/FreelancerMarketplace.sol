// SPDX-License-Identifier: MIT
// pragma solidity ^0.8.18;

// contract FreelancerMarketplace {
//     struct Job {
//         uint id;
//         string description;
//         uint budget;
//         address payable client;
//         address payable freelancer;
//         // address[] appliedFreelancer;
//         bool isAssigned;
//         bool isCompleted;
//         bool isPaid;
//         bool isApplied;
//     }

//     uint public jobCount;
//     mapping(uint => Job) public jobs;

//     event JobCreated(
//         uint jobId,
//         string description,
//         uint budget,
//         address client
//     );
//     event JobAccepted(uint jobId, address freelancer);
//     event JobCompleted(uint jobId);
//     event PaymentReleased(uint jobId, address freelancer);
//     event JobTaken(uint256 indexed jobId, address indexed freelancer);
//     event FreelancerAccepted(uint256 indexed jobId, address indexed freelancer);

//     function createJob(string memory _description) external payable {
//         require(msg.value > 0, "Budget must be greater than 0");

//         jobCount++;
//         jobs[jobCount] = Job(
//             jobCount,
//             _description,
//             msg.value,
//             payable(msg.sender),
//             payable(address(0)),
//             // new address[](0), // Initialize appliedFreelancer as an empty array
//             false,
//             false,
//             false, // Initialize isTaken to false
//             false // Initialize isApplied to false
//         );

//         emit JobCreated(jobCount, _description, msg.value, msg.sender);
//     }

//     function acceptJob(uint _jobId) external {
//         Job storage job = jobs[_jobId];
//         require(job.client != address(0), "Job does not exist");
//         require(job.freelancer == address(0), "Job already taken");
//         require(job.client != msg.sender, "Client cannot take the job");

//         job.freelancer = payable(msg.sender);
//         emit JobAccepted(_jobId, msg.sender);
//     }

//     function completeJob(uint _jobId) external {
//         Job storage job = jobs[_jobId];
//         require(
//             msg.sender == job.freelancer,
//             "Only freelancer can complete the job"
//         );
//         require(!job.isCompleted, "Job already completed");

//         job.isCompleted = true;
//         emit JobCompleted(_jobId);
//     }

//     function releasePayment(uint _jobId) external {
//         Job storage job = jobs[_jobId];
//         require(msg.sender == job.client, "Only client can release payment");
//         require(job.isCompleted, "Job is not completed yet");
//         require(!job.isPaid, "Payment already released");

//         job.isPaid = true;
//         job.freelancer.transfer(job.budget);
//         emit PaymentReleased(_jobId, job.freelancer);
//     }

//     // Function to get job details by ID
//     function getJob(
//         uint256 _jobId
//     )
//         external
//         view
//         returns (
//             uint256 id,
//             string memory description,
//             uint256 budget,
//             address client,
//             address freelancer,
//             // address[] memory appliedFreelancer,
//             bool isAssigned,
//             bool isCompleted,
//             bool isPaid,
//             bool isApplied
//         )
//     {
//         require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID"); // Ensure valid ID

//         Job memory job = jobs[_jobId]; // Fetch job

//         return (
//             job.id,
//             job.description,
//             job.budget,
//             job.client, // Use client instead of employer
//             job.freelancer,
//             // job.appliedFreelancer,
//             job.isAssigned,
//             job.isCompleted,
//             job.isPaid,
//             job.isApplied // Use isPaid instead of isTaken
//         );
//     }

//     function applyForJob(uint256 _jobId) external {
//         require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
//         Job storage job = jobs[_jobId];
//         require(job.isAssigned == false, "Job already taken");

//         // job.freelancer = payable(msg.sender);
//         job.isApplied = true;

//         emit JobTaken(_jobId, msg.sender);
//     }

//     function acceptFreelancer(uint256 _jobId) external {
//         require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
//         Job storage job = jobs[_jobId];
//         require(
//             msg.sender == job.client,
//             "Only employer can accept freelancer"
//         );
//         require(job.isApplied == true, "No freelancer has applied yet");
//         require(job.freelancer != address(0), "No freelancer assigned yet");
//         require(job.isAssigned == false, "Freelancer already accepted");
//         require(job.isCompleted == false, "Job already completed");

//         emit FreelancerAccepted(_jobId, job.freelancer);
//     }

//     event WorkSubmitted(uint256 indexed jobId, address indexed freelancer);

//     function submitWork(uint256 _jobId) external {
//         require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
//         Job storage job = jobs[_jobId];

//         require(
//             msg.sender == job.freelancer,
//             "Only assigned freelancer can submit work"
//         );
//         require(job.isAssigned == true, "Freelancer has not been accepted yet");
//         require(job.isCompleted == false, "Job is already completed");

//         job.isCompleted = true; // ✅ Mark job as completed

//         emit WorkSubmitted(_jobId, msg.sender);
//     }

//     event PaymentReleased(
//         uint256 indexed jobId,
//         address indexed freelancer,
//         uint256 amount
//     );

//     function approveWork(uint256 _jobId) external {
//         require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
//         Job storage job = jobs[_jobId];

//         require(msg.sender == job.client, "Only employer can approve work");
//         require(job.isCompleted == true, "Work is not submitted yet");
//         require(job.isAssigned == true, "No freelancer assigned");
//         require(
//             address(this).balance >= job.budget,
//             "Contract balance is insufficient"
//         );

//         job.freelancer.transfer(job.budget); // ✅ Transfer payment to freelancer
//         job.isCompleted = false; // ✅ Mark job as closed

//         emit PaymentReleased(_jobId, job.freelancer, job.budget);
//     }

//     function getAllJobs() public view returns (Job[] memory) {
//         Job[] memory jobList = new Job[](jobCount);
//         for (uint256 i = 1; i <= jobCount; i++) {
//             jobList[i - 1] = jobs[i];
//         }
//         return jobList;
//     }
// }

pragma solidity ^0.8.18;

contract FreelancerMarketplace {
    struct Job {
        uint id;
        string description;
        uint budget;
        uint duration;
        address payable client;
        address payable freelancer;
        address[] appliedFreelancers; // Store applied freelancers
        bool isAssigned;
        bool isCompleted;
        bool isPaid;
        string workLink;
    }

    struct Freelancer {
        address freelancerAddress;
        string name;
        string bio;
        string skills;
        uint rating;
    }

    uint public jobCount;
    mapping(uint => Job) public jobs;
    mapping(address => Freelancer) public freelancers;

    function registerFreelancer(
        string memory _name,
        string memory _bio,
        string memory _skills
    ) public {
        require(
            bytes(freelancers[msg.sender].name).length == 0,
            "Freelancer already registered"
        );

        freelancers[msg.sender] = Freelancer({
            freelancerAddress: msg.sender,
            name: _name,
            bio: _bio,
            skills: _skills,
            rating: 0 // Initial rating is 0
        });
    }

    function isFreelancerRegistered(
        address _freelancer
    ) public view returns (bool) {
        return bytes(freelancers[_freelancer].name).length > 0;
    }

    event JobCreated(
        uint jobId,
        string description,
        uint budget,
        address client
    );
    event JobApplied(uint jobId, address freelancer); // New event
    event JobAccepted(uint jobId, address freelancer);
    event JobCompleted(uint jobId);
    event FreelancerAccepted(uint jobId, address freelancer);
    event WorkSubmitted(
        uint256 indexed jobId,
        address indexed freelancer,
        string workLink
    );
    event PaymentReleased(
        uint256 indexed jobId,
        address indexed freelancer,
        uint256 amount
    );

    function createJob(
        string memory _description,
        uint256 _duration,
        string memory workLink
    ) external payable {
        require(msg.value > 0, "Budget must be greater than 0");

        jobCount++;
        jobs[jobCount] = Job(
            jobCount,
            _description,
            msg.value,
            _duration,
            payable(msg.sender),
            payable(address(0)),
            new address[](0), // Initialize appliedFreelancers as an empty array
            false,
            false,
            false,
            workLink = "N/A"
        );

        emit JobCreated(jobCount, _description, msg.value, msg.sender);
    }

    function getJob(
        uint256 _jobId
    )
        external
        view
        returns (
            uint256 id,
            string memory description,
            uint256 budget,
            uint256 duration,
            address client,
            address freelancer,
            address[] memory appliedFreelancer,
            bool isAssigned,
            bool isCompleted,
            bool isPaid,
            string memory workLink
        )
    {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID"); // Ensure valid ID

        Job memory job = jobs[_jobId]; // Fetch job

        return (
            job.id,
            job.description,
            job.budget,
            job.duration,
            job.client, // Use client instead of employer
            job.freelancer,
            job.appliedFreelancers,
            job.isAssigned,
            job.isCompleted,
            job.isPaid,
            job.workLink
        );
    }

    function applyForJob(uint256 _jobId) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        Job storage job = jobs[_jobId];
        require(!job.isAssigned, "Job already assigned");

        // Check if freelancer has already applied
        for (uint i = 0; i < job.appliedFreelancers.length; i++) {
            require(
                job.appliedFreelancers[i] != msg.sender,
                "You have already applied"
            );
        }

        job.appliedFreelancers.push(msg.sender); // Store applied freelancer
        emit JobApplied(_jobId, msg.sender);
    }

    function getAppliedFreelancers(
        uint _jobId
    ) external view returns (address[] memory) {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        return jobs[_jobId].appliedFreelancers;
    }

    function acceptFreelancer(uint256 _jobId, address _freelancer) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        require(_freelancer != address(0), "Invalid freelancer address");

        Job storage job = jobs[_jobId];
        require(
            msg.sender == job.client,
            "Only employer can accept freelancer"
        );
        require(!job.isAssigned, "Freelancer already assigned");

        // Ensure the freelancer actually applied for the job
        bool hasApplied = false;
        for (uint i = 0; i < job.appliedFreelancers.length; i++) {
            if (job.appliedFreelancers[i] == _freelancer) {
                hasApplied = true;
                break;
            }
        }
        require(hasApplied, "Freelancer did not apply for this job");

        job.freelancer = payable(_freelancer);
        job.isAssigned = true;

        emit FreelancerAccepted(_jobId, _freelancer);
    }

    function submitWork(uint256 _jobId, string memory _workLink) external {
        require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
        Job storage job = jobs[_jobId];

        require(
            msg.sender == job.freelancer,
            "Only assigned freelancer can submit work"
        );
        require(job.isAssigned, "Freelancer has not been accepted yet");
        require(!job.isCompleted, "Job is already completed");
        require(bytes(_workLink).length > 0, "Work link cannot be empty"); // ✅ Added validation

        job.isCompleted = true;
        job.workLink = _workLink;

        emit WorkSubmitted(_jobId, msg.sender, _workLink);
    }

    // function approveWork(uint256 _jobId) external {
    //     require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
    //     Job storage job = jobs[_jobId];

    //     require(msg.sender == job.client, "Only employer can approve work");
    //     require(job.isCompleted == true, "Work is not submitted yet");
    //     require(job.isAssigned == true, "No freelancer assigned");
    //     require(
    //         address(this).balance >= job.budget,
    //         "Contract balance is insufficient"
    //     );

    //     job.freelancer.transfer(job.budget); // ✅ Transfer payment to freelancer
    //     job.isCompleted = true; // ✅ Mark job as closed

    //     emit PaymentReleased(_jobId, job.freelancer, job.budget);
    //     bool success = job.freelancer.send(job.budget); // Transfer payment to freelancer
    //     require(success, "Payment transfer failed");
    //     job.isPaid = true;
    //     emit PaymentReleased(_jobId, job.freelancer, job.budget);
    // }

    function approveWork(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(job.client == msg.sender, "Only employer can approve");
        require(job.isAssigned, "Job not assigned");
        require(job.isCompleted, "Job already completed");

        job.isCompleted = true;
        job.isPaid = true;

        // Transfer payment to freelancer
        payable(job.freelancer).transfer(job.budget);
        emit PaymentReleased(_jobId, job.freelancer, job.budget);
    }

    // function approveWork(uint256 _jobId) external {
    //     require(_jobId > 0 && _jobId <= jobCount, "Invalid job ID");
    //     Job storage job = jobs[_jobId];

    //     require(msg.sender == job.client, "Only employer can approve work");
    //     require(job.isCompleted, "Work is not submitted yet");
    //     require(job.isAssigned, "No freelancer assigned");
    //     require(
    //         address(this).balance >= job.budget,
    //         "Contract balance is insufficient"
    //     );
    //     require(!job.isPaid, "Payment already made");

    //     job.isPaid = true;
    //     (bool success, ) = job.freelancer.call{value: job.budget}("");
    //     require(success, "Payment transfer failed");

    //     emit PaymentReleased(_jobId, job.freelancer, job.budget);
    // }

    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // function releasePayment(uint _jobId) internal {
    //     Job storage job = jobs[_jobId];
    //     require(msg.sender == job.client, "Only client can release payment");
    //     require(job.isCompleted, "Job is not completed yet");
    //     require(!job.isPaid, "Payment already released");

    //     job.isPaid = true;
    //     job.freelancer.transfer(job.budget);
    //     emit PaymentReleased(_jobId, job.freelancer, job.budget);
    // }
}
