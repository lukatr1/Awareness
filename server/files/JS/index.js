/*
async function fetchUsers() {
    try {
      const response = await fetch("/getUser");
      const user = await response.json();
      const tableBody = document.getElementById("user-table-body");
      tableBody.innerHTML = "";

      // Since we're only dealing with one user, we don't need forEach
      const row = `
  <tr>
    <td>${user.id}</td>
    <td>${user.username}</td>
    <td>${user.email}</td>
    <td>${user.language_preference}</td>
    <td>${user.games_played}</td>
    <td>${user.success_rate.toFixed(2)}%</td>
    <td>${user.failure_rate.toFixed(2)}%</td>
    <td>${user.average_completion_time.toFixed(2)}s</td>
    <td>${new Date(user.created_at).toLocaleDateString()}</td>
  </tr>
`;
      tableBody.innerHTML += row;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  }

  */

