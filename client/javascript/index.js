class TodoHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <nav class="navbar">
          <ul>
            <li>
              <a href="index.html">
                <a href="index.html"
                  ><img
                    src="../images/todologo.png"
                    alt="app-logo"
                    class="app-logo" /></a
                ></a>
            </li>
            <li class="nav-list-item"><a href="task.html">Tasks</a></li>
            <li class="nav-list-item"><a href="admin.html">Admin</a></li>
            <li class="nav-list-item right-aligned">
              <a href="signUp.html">Sign Up</a>
            </li>
            <li class="nav-list-item"><a href="logIn.html">Log In</a></li>
          </ul>
        </nav>
      </header>`;
  }
}

customElements.define("todo-header", TodoHeader);
class TodoFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <footer>
      <ul>
        <li>App Version: 0.1v</li>
        <li>Todo App</li>
        <li>&copy2021 Manas Vyas</li>
      </ul>
    </footer>`;
  }
}

customElements.define("todo-footer", TodoFooter);

const getAllUsers = async () =>
  await (await fetch("http://localhost:5000/user")).json();

const getAllTaskStatuses = async () =>
  await (await fetch("http://localhost:5000/taskStatus")).json();

const getAllTasks = async () =>
  await (await fetch("http://localhost:5000/task")).json();

const getTaskAudit = async () =>
  await (
    await fetch("http://localhost:5000/task/audit/report", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
  ).json();

const getUserAudit = async () =>
  await (
    await fetch("http://localhost:5000/user/audit/report", {
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
  ).json();

const loginUser = async (user) =>
  await (
    await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
  ).json();

const signupUser = async (user) =>
  await (
    await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      body: user,
    })
  ).json();

const addTask = async (task) =>
  await (
    await fetch("http://localhost:5000/task/add", {
      method: "POST",
      body: JSON.stringify(task),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: localStorage.getItem("token"),
      },
    })
  ).json();

const updateTask = async (task) =>
  await (
    await fetch("http://localhost:5000/task/update", {
      method: "PUT",
      body: JSON.stringify(task),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: localStorage.getItem("token"),
      },
    })
  ).json();

const deleteTask = async (taskDetails) =>
  await (
    await fetch(`http://localhost:5000/task/delete/`, {
      method: "DELETE",
      body: JSON.stringify(taskDetails),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: localStorage.getItem("token"),
      },
    })
  ).json();

const updateUser = async (user) =>
  await (
    await fetch("http://localhost:5000/user/update", {
      method: "PUT",
      body: user,
      headers: {
        Authorization: localStorage.getItem("token"),
      },
    })
  ).json();

const deleteUser = async (userDetails) =>
  await (
    await fetch("http://localhost:5000/user/delete", {
      method: "DELETE",
      body: JSON.stringify(userDetails),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
        Authorization: localStorage.getItem("token"),
      },
    })
  ).json();

document.addEventListener("DOMContentLoaded", async () => {

  const manageLoader = (show) => {
    const loader = document.querySelector(".loader");
    if (show) {
      loader.className = "loader";
    } else {
      loader.className += " hidden";
    }
  };

  const findTaskStatusById = (statusId) => {
    const taskStatus = taskStatuses.data.find(
      (taskStatus) => taskStatus.taskStatusId === statusId
    );
    return taskStatus.taskStatusName;
  };

  const findTaskStatusIdByName = (taskStatusName) => {
    const taskStatus = taskStatuses.data.find(
      (taskStatus) => taskStatus.taskStatusName === taskStatusName
    );
    return taskStatus.taskStatusId;
  };

  const findUsernameById = (userId) => {
    const user = users.data.find((user) => user.userId === userId);
    return user.username;
  };

  const findUserIdByName = (username) => {
    const user = users.data.find((user) => user.username === username);
    return user.userId;
  };

  const findTaskCreatedOnById = (taskId) => {
    const task = tasks.data.find((task) => task.taskId === Number(taskId));
    return task.createdOn;
  };

  const findTaskUpdatedOnById = (taskId) => {
    const task = tasks.data.find((task) => task.taskId === Number(taskId));
    return task.updatedOn;
  };

  // Home page

  let loggedInUser = {};
  let users = [];
  let tasks = [];
  let filteredTask = [];
  let userSpecificTask = [];
  let taskStatuses = [];
  let taskAudits = [];
  let userAudits = [];
  let selectedStatus = "All Tasks";

  try {
    manageLoader(true);
    if (localStorage.getItem("loggedInUser")) {
      loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    }
    users = await getAllUsers();
    tasks = await getAllTasks();
    taskStatuses = await getAllTaskStatuses();
    if (
      !(
        loggedInUser &&
        Object.keys(loggedInUser).length === 0 &&
        loggedInUser.constructor === Object
      ) &&
      loggedInUser.role === "user"
    ) {
      filteredTask = tasks.data
        .filter((task) => {
          return task.userId === loggedInUser.userId;
        })
        .map((task) => {
          return {
            taskId: task.taskId,
            taskName: task.taskName,
            taskStatus: findTaskStatusById(task.taskStatusId),
            createdOn: task.createdOn,
            updatedOn: task.updatedOn,
            user: findUsernameById(task.userId),
          };
        });
      userSpecificTask = filteredTask;
    }

    if (
      !(
        loggedInUser &&
        Object.keys(loggedInUser).length === 0 &&
        loggedInUser.constructor === Object
      ) &&
      loggedInUser.role === "admin"
    ) {
      filteredTask = tasks.data.map((task) => {
        return {
          taskId: task.taskId,
          taskName: task.taskName,
          taskStatus: findTaskStatusById(task.taskStatusId),
          createdOn: task.createdOn,
          updatedOn: task.updatedOn,
          user: findUsernameById(task.userId),
        };
      });
      userSpecificTask = filteredTask;
      taskAudits = await getTaskAudit();
      userAudits = await getUserAudit();
    }

    if (
      loggedInUser &&
      Object.keys(loggedInUser).length === 0 &&
      loggedInUser.constructor === Object
    ) {
      const createTaskBtn = document.querySelector(
        ".left-content a[href='task.html']"
      );
      if (createTaskBtn) {
        createTaskBtn.setAttribute("href", "logIn.html");
      }
    }
    manageLoader(false);
  } catch (error) {
    manageLoader(false);
    console.log(error);
  }

  const renderSimpleAlert = async (
    headerText,
    bodyText,
    icon,
    redirectLocation
  ) => {
    const response = await swal(headerText, {
      text: bodyText,
      icon: icon,
      buttons: { OK: "OK" },
    });
    switch (response) {
      case "OK":
        window.location = redirectLocation;
      default:
        window.location = redirectLocation;
    }
  };

  const renderConfirmationAlert = async (id, actionType) => {
    const willDelete = await swal({
      title: "Are you sure?",
      text: "Once deleted, you won't be able to recover!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    });
    let deletedItem = [];
    if (willDelete) {
      if (actionType === "deleteTask") {
        manageLoader(true);
        deletedItem = await deleteTask({
          taskId: id,
          executedBy: loggedInUser.userId,
        });
        manageLoader(false);
        if (deletedItem.data) {
          await renderSimpleAlert(
            "Success",
            "User Deleted Successfully",
            "success",
            "task.html"
          );
        }
      } else {
        manageLoader(true);
        deletedItem = await deleteUser({
          userId: id,
          executedById: loggedInUser.userId,
        });
        manageLoader(false);
        if (deletedItem.data) {
          if (loggedInUser.userId === id) {
            localStorage.removeItem("token");
            localStorage.removeItem("loggedInUser");
            await renderSimpleAlert(
              "Success",
              "User Deleted Successfully",
              "success",
              "index.html"
            );
            return;
          }
          await renderSimpleAlert(
            "Success",
            "User Deleted Successfully",
            "success",
            "admin.html"
          );
        }
      }
    }
  };

  const taskTableBody = document.querySelector("#task-table-body");

  // header
  if (
    !(
      loggedInUser &&
      Object.keys(loggedInUser).length === 0 &&
      loggedInUser.constructor === Object
    )
  ) {
    const navList = document
      .querySelector("todo-header")
      .childNodes[1].childNodes[1].querySelector("ul");
    const li = document.createElement("li");
    li.classList.add("nav-list-item");
    const a = document.createElement("a");
    a.appendChild(document.createTextNode("Log Out"));
    a.setAttribute("href", "#");
    a.setAttribute("class", "log-out");
    li.appendChild(a);
    navList.appendChild(li);
    const rightAlignedAuthItem = document.querySelector(".right-aligned");
    rightAlignedAuthItem.innerHTML = `
      <img src='http://localhost:5000/${loggedInUser.profilePicture}' class='profile-logo' alt='profile-logo'>
    `;
    rightAlignedAuthItem.nextElementSibling.innerHTML = `
      Welcome, ${loggedInUser.username}
    `;
  }

  // Task page

  const searchTask = document.querySelector(".task-search");
  if (searchTask && filteredTask) {
    searchTask.addEventListener("keyup", () => {
      const searchText = searchTask.value;
      taskTableBody.innerHTML = "";
      filteredTask
        .filter((task) => {
          if (searchText === "") {
            return task;
          } else if (
            task.taskName.toLowerCase().includes(searchText.toLowerCase())
          ) {
            return task;
          } else if (
            task.taskStatus.toLowerCase().includes(searchText.toLowerCase())
          ) {
            return task;
          } else if (
            task.user.toLowerCase().includes(searchText.toLowerCase())
          ) {
            return task;
          }
        })
        .forEach((taskItem) => {
          taskTableBody.innerHTML += `
        <tr>
          <td>${taskItem.taskId}</td>
          <td>${taskItem.taskName}</td>
          <td>${taskItem.taskStatus}</td>
          <td>${taskItem.user}</td>
          <td>${taskItem.createdOn}</td>
          <td>
            <i
            class="fas fa-edit"
            onclick='document.querySelector('.edit-task-modal').style.display='block''
            title="Edit Task"
            ></i>
            <i
            class="fas fa-trash"
            title="Delete Task"
            ></i>
          </td>
        </tr>
      `;
        });
    });
  }
  if (taskStatuses.data.length > 0) {
    const statusDrp = document.querySelector(".task-status-drp");
    if (statusDrp) {
      selectedStatus = statusDrp.value;
      statusDrp.innerHTML = "";
      taskStatuses.data.forEach((taskStatus) => {
        statusDrp.innerHTML += `
          <option value="${taskStatus.taskStatusName}">${taskStatus.taskStatusName} Tasks</option>
        `;
      });
      statusDrp.innerHTML += `
        <option value='All Tasks' selected>All Tasks</option>
      `;

      statusDrp.addEventListener("change", () => {
        document.querySelector(".task-search").value = "";
        selectedStatus = statusDrp.value;
        if (selectedStatus === "All Tasks") {
          filteredTask = userSpecificTask;
        } else {
          filteredTask = userSpecificTask.filter((task) => {
            return task.taskStatus === selectedStatus;
          });
        }
        if (filteredTask.length === 0) {
          return (taskTableBody.innerHTML = `
            <tr>
              <td colspan="5">No tasks found</td>
            </tr>
          `);
        }
        taskTableBody.innerHTML = "";
        filteredTask.forEach((task) => {
          taskTableBody.innerHTML += `
        <tr>
          <td>${task.taskId}</td>
          <td>${task.taskName}</td>
          <td>${task.taskStatus}</td>
          <td>${task.user}</td>
          <td>${task.createdOn}</td>
          <td>
            <i
            class="fas fa-edit"
            onclick="document.querySelector('.edit-task-modal').style.display='block'"
            title="Edit Task"
            ></i>
            <i
            class="fas fa-trash"
            title="Delete Task"
            ></i>
          </td>
        </tr>
        `;
        });
      });
    }
  }

  if (filteredTask.length > 0) {
    if (taskTableBody) {
      taskTableBody.innerHTML = "";
      filteredTask.forEach((task) => {
        taskTableBody.innerHTML += `
        <tr>
          <td>${task.taskId}</td>
          <td>${task.taskName}</td>
          <td>${task.taskStatus}</td>
          <td>${task.user}</td>
          <td>${task.createdOn}</td>
          <td>
            <i
            class="fas fa-edit"
            title="Edit Task"
            onclick="document.querySelector('.edit-task-modal').style.display='block'"
            ></i>
            <i
            class="fas fa-trash"
            title="Delete Task"
            ></i>
          </td>
        </tr>
        `;
      });
    }
  }

  const addTaskModal = document.querySelector(".add-task-modal");
  if (addTaskModal) {
    window.onclick = (e) => {
      if (e.target === addTaskModal) {
        addTaskModal.style.display = "none";
      }
    };
  }

  const editTaskModal = document.querySelector(".edit-task-modal");
  if (editTaskModal) {
    window.onclick = (e) => {
      if (e.target === editTaskModal) {
        editTaskModal.style.display = "none";
      }
    };
  }

  const addTaskForm = document.forms["add-task-modal"];
  if (addTaskForm) {
    addTaskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const taskName = addTaskForm.querySelector('input[type="text"]').value;
      const loggedInUserId = JSON.parse(
        localStorage.getItem("loggedInUser")
      ).userId;
      try {
        manageLoader(true);
        const addedData = await addTask({ taskName, userId: loggedInUserId });
        manageLoader(false);
        addTaskModal.style.display = "none";
        if (addedData.data) {
          await renderSimpleAlert(
            "Success",
            "Task Added Successfully",
            "success",
            "task.html"
          );
        }
        if (addedData.status === "error") {
          await renderSimpleAlert(
            "Error",
            addedData.message,
            "error",
            "task.html"
          );
        }
      } catch (error) {
        manageLoader(false);
        await renderSimpleAlert("Error", "Unauthorized!", "error", "task.html");
        console.log(error);
      }
    });
  }

  if (taskTableBody) {
    for (i = 0; i < taskTableBody.getElementsByTagName("tr").length; i++) {
      row = taskTableBody.querySelectorAll(".fa-edit")[i];
      if (row) {
        row.addEventListener("click", (e) => {
          const rowData = e.target.parentNode.parentNode.querySelectorAll("td");
          const editTaskForm = document.forms["edit-task-modal"];
          editTaskForm.querySelector('input[name="taskId"]').value =
            rowData[0].innerHTML;
          editTaskForm.querySelector('input[name="taskName"]').value =
            rowData[1].innerHTML;
          editTaskForm.querySelector('select[name="taskStatus"]').value =
            rowData[2].innerHTML;
          editTaskForm.querySelector('input[name="username"]').value =
            rowData[3].innerHTML;
        });
      }
    }
  }

  const editTaskForm = document.forms["edit-task-modal"];
  if (editTaskForm) {
    editTaskForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const taskId = editTaskForm.querySelector('input[name="taskId"]').value;
      const taskName = editTaskForm.querySelector(
        'input[name="taskName"]'
      ).value;
      const taskStatusId = findTaskStatusIdByName(
        editTaskForm.querySelector('select[name="taskStatus"]').value
      );
      const userId = findUserIdByName(
        editTaskForm.querySelector('input[name="username"]').value
      );
      const createdOn = findTaskCreatedOnById(taskId);
      const updatedOn = findTaskUpdatedOnById(taskId);
      try {
        manageLoader(true);
        const updatedData = await updateTask({
          taskId,
          taskName,
          taskStatusId,
          userId,
          createdOn,
          updatedOn,
        });
        manageLoader(false);
        editTaskModal.style.display = "none";
        if (updatedData.data) {
          await renderSimpleAlert(
            "Success",
            "Task Updated Successfully",
            "success",
            "task.html"
          );
        }
        if (updatedData.status === "error") {
          await renderSimpleAlert(
            "Error",
            updatedData.message,
            "error",
            "task.html"
          );
        }
      } catch (error) {
        manageLoader(false);
        await renderSimpleAlert("Error", "Unauthorized!", "error", "task.html");
        console.log(error);
      }
    });
  }

  if (taskTableBody) {
    for (i = 0; i < taskTableBody.getElementsByTagName("tr").length; i++) {
      row = taskTableBody.querySelectorAll(".fa-trash")[i];
      if (row) {
        row.addEventListener("click", async (e) => {
          const rowData = e.target.parentNode.parentNode.querySelectorAll("td");
          try {
            await renderConfirmationAlert(rowData[0].innerHTML, "deleteTask");
          } catch (error) {
            console.log(error);
          }
        });
      }
    }
  }

  // Admin

  const navAdminURL = document.querySelector("a[href='admin.html']");
  const navTaskURL = document.querySelector("a[href='task.html']");
  if (Object.keys(loggedInUser).length === 0 || loggedInUser.role === "user") {
    navAdminURL.setAttribute("href", "index.html");
    if (window.location.pathname.includes("admin.html")) {
      window.location = "index.html";
    }
  }

  if (Object.keys(loggedInUser).length === 0) {
    navTaskURL.setAttribute("href", "index.html");
    if (window.location.pathname.includes("task.html")) {
      window.location = "index.html";
    }
  }

  const openAdminTab = (tabName) => {
    let i, tabContent;
    tabContent = document.querySelectorAll(".tab-content");
    for (i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = "none";
    }
    document.querySelector(`#${tabName}`).style.display = "flex";
  };

  for (let i = 0; i < document.querySelectorAll(".tablink").length; i++) {
    const tab = document.querySelectorAll(".tablink")[i];
    if (i === 0) {
      tab.addEventListener("click", (e) => openAdminTab("admin-user"));
    } else if (i === 1) {
      tab.addEventListener("click", (e) => openAdminTab("admin-user-audit"));
    } else if (i === 2) {
      tab.addEventListener("click", (e) => openAdminTab("admin-task-audit"));
    }
  }

  if (document.querySelector("#defaultOpen")) {
    document.querySelector("#defaultOpen").click();
  }

  const generateUserTasksTable = (username) => {
    const user = users.data.find((user) => user.username === username);
    const adminTasksTableBody = document.querySelector(
      "#admin-user-task-table-body"
    );
    adminTasksTableBody.innerHTML = "";
    user.tasks.forEach((task) => {
      adminTasksTableBody.innerHTML += `
      <tr>
        <td>${task.taskId}</td>
        <td>${task.taskName}</td>
        <td>${findTaskStatusById(task.taskStatusId)}</td>
        <td>${findUsernameById(task.user_id)}</td>
        <td>${task.createdOn}</td>
      </tr>
      `;
    });
  };

  const generateUserCards = () => {
    if (users.data.length > 0) {
      const usersTab = document.querySelector("#admin-user");
      if (usersTab) {
        usersTab.innerHTML = "";
        users.data.forEach((user) => {
          usersTab.innerHTML += `
          <div class="user-card">
            <img src='http://localhost:5000/${user.profilePicture}'>
            <h1>${user.username}</h1>
            <p class="role">${user.role.toUpperCase()}</p>
            <i
            class="fas fa-edit user-admin-card-btns"
            title="Edit User"
            onclick="document.querySelector('.admin-user-update-modal').style.display='block'"
            ></i>
            <button class="user-tasks-btn" onclick="document.querySelector('.admin-user-modal').style.display='block'" >Tasks</button>
            <i
            class="fas fa-trash user-admin-card-btns"
            title="Delete User"
            ></i>
          </div>
        `;
        });
        const userCards = document.querySelectorAll(".user-card");
        const userTasksBtns = document.querySelectorAll(".user-tasks-btn");
        for (let i = 0; i < userCards.length; i++) {
          const userTaskBtn = userTasksBtns[i];
          userTaskBtn.addEventListener("click", (e) =>
            generateUserTasksTable(userCards[i].childNodes[3].innerText)
          );
        }
      }
    }
  };

  generateUserCards();

  const fillUserUpdateForm = (username) => {
    const user = users.data.find((user) => user.username === username);
    const updateUserForm = document.forms["update-user-modal"];
    updateUserForm.querySelector('input[name="userId"]').value = user.userId;
    updateUserForm.querySelector('input[name="username"]').value =
      user.username;
    updateUserForm.querySelector('select[name="role"]').value = user.role;
    updateUserForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userId = updateUserForm.querySelector('input[name="userId"]').value;
      const username = updateUserForm.querySelector(
        'input[name="username"]'
      ).value;
      const password = updateUserForm.querySelector(
        'input[name="password"]'
      ).value;
      const role = updateUserForm.querySelector('select[name="role"]').value;
      const profilePicture = updateUserForm.querySelector(
        'input[name="profilePicture"]'
      ).files[0];
      const user = new FormData();
      user.append("userId", userId);
      user.append("username", username);
      user.append("password", password);
      user.append("role", role);
      user.append("profilePicture", profilePicture);
      user.append("executedBy", loggedInUser.userId);
      try {
        manageLoader(true);
        const updatedUser = await updateUser(user);
        manageLoader(false);
        if (updatedUser.data) {
          if (updatedUser.data.userId === loggedInUser.userId) {
            localStorage.setItem(
              "loggedInUser",
              JSON.stringify(updatedUser.data[0])
            );
          }
          await renderSimpleAlert(
            "Success",
            "User Updated Successfully",
            "success",
            "admin.html"
          );
        } else {
          await renderSimpleAlert(
            "Error",
            updatedUser.message,
            "error",
            "admin.html"
          );
        }
      } catch (error) {
        manageLoader(false);
        console.log(error);
      }
    });
  };

  const onEditUserClick = () => {
    const userCards = document.querySelectorAll(".user-card");
    for (let i = 0; i < userCards.length; i++) {
      const editButton = userCards[i].childNodes[7];
      editButton.addEventListener("click", () =>
        fillUserUpdateForm(userCards[i].childNodes[3].innerHTML)
      );
    }
  };

  onEditUserClick();

  const deleteAdminUser = async (username) => {
    const user = users.data.find((user) => user.username === username);
    try {
      await renderConfirmationAlert(user.userId, "deleteUser");
    } catch (error) {
      console.log(error);
    }
  };

  const onDeleteUserClick = () => {
    const userCards = document.querySelectorAll(".user-card");
    for (let i = 0; i < userCards.length; i++) {
      const deleteButton = userCards[i].childNodes[11];
      deleteButton.addEventListener("click", () =>
        deleteAdminUser(userCards[i].childNodes[3].innerHTML)
      );
    }
  };

  onDeleteUserClick();

  const generateTaskAuditTable = () => {
    const taskAuditTableBody = document.querySelector(
      "#audit-task-table tbody"
    );
    if (taskAuditTableBody) {
      taskAuditTableBody.innerHTML = "";
      for (let i = 0; i < taskAudits.data.length; i++) {
        taskAuditTableBody.innerHTML += `
        <tr>
          <td>${taskAudits.data[i].taskAuditId}</td>
          <td>${taskAudits.data[i].tableName}</td>
          <td>${taskAudits.data[i].operation}</td>
          <td>${taskAudits.data[i].taskId}</td>
          <td>${taskAudits.data[i].performedBy}</td>
          <td>${taskAudits.data[i].performedDate}</td>
        </tr>
      `;
      }
    }
  };

  generateTaskAuditTable();

  const generateUserAuditTable = () => {
    const userAuditTableBody = document.querySelector(
      "#audit-user-table tbody"
    );
    if (userAuditTableBody) {
      userAuditTableBody.innerHTML = "";
      for (let i = 0; i < userAudits.data.length; i++) {
        userAuditTableBody.innerHTML += `
        <tr>
          <td>${userAudits.data[i].userAuditId}</td>
          <td>${userAudits.data[i].tableName}</td>
          <td>${userAudits.data[i].operation}</td>
          <td>${userAudits.data[i].userId}</td>
          <td>${userAudits.data[i].performedBy}</td>
          <td>${userAudits.data[i].performedDate}</td>
        </tr>
      `;
      }
    }
  };

  generateUserAuditTable();

  // Login

  const loginForm = document.forms["login-form"];
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = loginForm.querySelector('input[type="text"]').value;
      const password = loginForm.querySelector('input[type="password"]').value;
      try {
        manageLoader(true)
        loggedInUser = await loginUser({ username, password });
        manageLoader(false);
        if (loggedInUser.data) {
          localStorage.setItem("token", loggedInUser.token);
          localStorage.setItem(
            "loggedInUser",
            JSON.stringify(loggedInUser.data[0])
          );
          await renderSimpleAlert(
            "Success",
            "User Logged In Successfully",
            "success",
            "task.html"
          );
        } else {
          await renderSimpleAlert(
            "Error",
            loggedInUser.message,
            "error",
            "login.html"
          );
        }
      } catch (error) {
        manageLoader(false);
        console.log(error);
      }
    });
  }

  const signupForm = document.forms["signup-form"];
  if (signupForm) {
    const footer = document.querySelector("todo-footer").childNodes[1];
    footer.classList.add("signup-footer");
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = signupForm.querySelector('input[type="text"]').value;
      const password = signupForm.querySelector('input[type="password"]').value;
      const role = signupForm.querySelector("select").value;
      const profilePicture =
        signupForm.querySelector('input[type="file"]').files[0];
      const user = new FormData();
      user.append("username", username);
      user.append("password", password);
      user.append("role", role);
      user.append("profilePicture", profilePicture);
      try {
        manageLoader(true);
        loggedInUser = await signupUser(user);
        manageLoader(false);
        if (loggedInUser.data) {
          localStorage.setItem("token", loggedInUser.token);
          localStorage.setItem(
            "loggedInUser",
            JSON.stringify(loggedInUser.data[0])
          );
          await renderSimpleAlert(
            "Success",
            "User Registered Successfully",
            "success",
            "task.html"
          );
        } else {
          await renderSimpleAlert(
            "Error",
            loggedInUser.message,
            "error",
            "signup.html"
          );
        }
      } catch (error) {
        manageLoader(false);
        console.log(error);
      }
    });
  }

  const logOutBtn = document.querySelector(".log-out");
  if (logOutBtn) {
    logOutBtn.addEventListener("click", async () => {
      loggedInUser = {};
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("token");
      await renderSimpleAlert(
        "Success",
        "User Logged Out Successfully",
        "success",
        "index.html"
      );
    });
  }
});
