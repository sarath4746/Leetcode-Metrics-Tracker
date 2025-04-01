document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('search-btn');
    const usernameInput = document.getElementById('user-input');
    const statsContainer = document.querySelector('.stats-container');
    const easyProgressCircle = document.querySelector('.easy-progress');
    const mediumProgressCircle = document.querySelector('.medium-progress');
    const hardProgressCircle = document.querySelector('.hard-progress');
    const easyLabel = document.getElementById('easy-label');
    const mediumLabel = document.getElementById('medium-label');
    const hardLabel = document.getElementById('hard-label');
    const cardStatsContainer = document.querySelector('.stats-cards');
    const loadingMessage = document.querySelector('.loading-message'); // The loading message div

    // Validate the username
    validateUsername = (username) => {
        if (username.trim() === '') {
            alert('Username should not be empty');
            return false;
        }

        const isMatching = username.length > 0;
        if (!isMatching) {
            alert('Invalid Username!');
        }
        return isMatching;
    }

    // Fetch user data from the API
    async function fetchUserDetails(username) {
        try {
            searchButton.disabled = true;

            // Show the loading message
            loadingMessage.style.display = "block";
            searchButton.style.display = "none" ;
            statsContainer.style.display = "none"; // Hide stats initially while fetching

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = `https://leetcode.com/graphql/`;

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphql = JSON.stringify({
                query:
                    "\n    query userSessionProgress($username: String!) {\n  allQuestionsCount {\n    difficulty\n    count\n  }\n  matchedUser(username: $username) {\n    submitStats {\n      acSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n      totalSubmissionNum {\n        difficulty\n        count\n        submissions\n      }\n    }\n  }\n}\n    ",
                variables: { username: `${username}` }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
                redirect: "follow"
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fetch the User details");
            }
            const parsedData = await response.json();
            console.log('Logging data: ', parsedData);

            displayUserData(parsedData);

        } catch (error) {
            statsContainer.innerHTML = `<p>No data Found </p>`;
        } finally {
            searchButton.textContent = "Search";
            searchButton.disabled = false;

            // Hide the loading message and show the stats container after data is fetched
            loadingMessage.style.display = "none";
            statsContainer.style.display = "block";
            searchButton.style.display = "block" ;
        }
    }

    // Update the circular progress based on the progress degree
    updateProgress = (solved, total, label, circle) => {
        const progressDegree = (solved / total) * 100;
        circle.style.setProperty('--progress-degree', `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }

    // Display the user data on the screen
    displayUserData = (parsedData) => {
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedHardQues, totalHardQues, hardLabel, hardProgressCircle);

        // Prepare data for the stats cards
        const cardData = [
            { label: "Overall Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0].submissions },
            { label: "Overall Easy Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1].submissions },
            { label: "Overall Medium Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2].submissions },
            { label: "Overall Hard Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3].submissions },
        ];

        console.log(cardData);

        // Display stats cards dynamically
        cardStatsContainer.innerHTML = cardData.map(
            data => `
                <div class='card'>
                    <h3>${data.label}</h3>
                    <p>${data.value}</p>
                </div>
            `
        ).join("");
    }

    // Event listener to handle the search button click
    searchButton.addEventListener('click', () => {
        const username = usernameInput.value;
        console.log('logging username ', username);
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });
});
