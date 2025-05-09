document.addEventListener('DOMContentLoaded', () => {
  // Get the form and issue list DOM elements
  const form = document.getElementById('issueForm');
  const issueList = document.getElementById('issueList');

  // Initialize an array to store issues
  let issues = [];

  // Function to render issues in the list
  function renderIssues() {
    issueList.innerHTML = ''; // Clear the current list
    issues.forEach((issue, index) => {
      const issueItem = document.createElement('div');
      issueItem.classList.add('issue');
      issueItem.innerHTML = `
        <p><strong>Issue:</strong> <a href="${issue.url}" target="_blank">${issue.title}</a></p>
        <button class="remove-issue" data-index="${index}">Remove</button>
      `;
      issueList.appendChild(issueItem);
    });

    // Add event listeners for the "Remove" buttons
    const removeButtons = document.querySelectorAll('.remove-issue');
    removeButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        const index = event.target.getAttribute('data-index');
        issues.splice(index, 1); // Remove the issue from the array
        renderIssues(); // Re-render the issues list
      });
    });
  }


  // Form submission event handler
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const issueUrl = document.getElementById('issueUrl').value.trim();
    if (!issueUrl) {
      alert('Please enter a valid GitHub issue URL.');
      return;
    }

    // Check if the URL is a valid GitHub issue URL (basic check)
    const issuePattern = /https:\/\/github\.com\/[^\/]+\/[^\/]+\/issues\/\d+/;
    if (!issuePattern.test(issueUrl)) {
      alert('Please enter a valid GitHub issue URL.');
      return;
    }

    // Fetch and process the issue data
    const issueData = await fetchIssueData(issueUrl);
    if (issueData) {
      issues.push(issueData); // Add the issue to the list
      renderIssues(); // Re-render the issues list
    }

    // Clear the input field after submission
    document.getElementById('issueUrl').value = '';
  });

  // Function to fetch and parse the issue data from GitHub
  async function fetchIssueData(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        alert('Error fetching issue data.');
        return;
      }
      const data = await response.json();
      if (data.title) {
        return {
          url: url,
          title: data.title,
        };
      }
    } catch (error) {
      console.error('Error fetching GitHub issue:', error);
      alert('An error occurred while fetching the issue.');
    }
    return null;
  }

  // Initial render of issues (if any)
  renderIssues();
});

