const API = "http://localhost:5000/api";

let isLogin = true;
let countdownIntervals = {};

/* ================= TOGGLE LOGIN / REGISTER ================= */

function toggleForm() {
  isLogin = !isLogin;

  formTitle.innerText = isLogin ? "Login" : "Register";
  name.style.display = isLogin ? "none" : "block";

  toggleText.innerHTML = isLogin
    ? `Don't have an account? 
       <span onclick="toggleForm()" style="color:blue;cursor:pointer;">Register</span>`
    : `Already have an account? 
       <span onclick="toggleForm()" style="color:blue;cursor:pointer;">Login</span>`;
}

/* ================= LOGIN / REGISTER ================= */

function handleAuth() {

  if (isLogin) {

    fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })
    .then(res => res.json())
    .then(data => {

      if (!data.token) {
        alert("Login failed!");
        return;
      }

      localStorage.setItem("token", data.token);
      showTodoSection();
    });

  } else {

    fetch(API + "/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value
      })
    })
    .then(() => {
      alert("Registration successful! Please login.");
      toggleForm();
    });
  }
}

/* ================= SHOW TODO SECTION ================= */

function showTodoSection() {
  authSection.style.display = "none";
  todoSection.style.display = "block";
  loadTodos();
}

/* ================= LOGOUT ================= */

function logout() {
  localStorage.removeItem("token");
  location.reload();
}

/* ================= AUTO LOGIN ================= */

window.onload = function () {
  if (localStorage.getItem("token")) {
    showTodoSection();
  }
};

/* ================= ADD TODO ================= */

function addTodo() {

  fetch(API + "/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({
      text: todoInput.value,
      dueDate: dueDate.value,
      reminderTime: reminderTime.value,
      status: statusSelect.value
    })
  })
  .then(() => {
    todoInput.value = "";
    dueDate.value = "";
    reminderTime.value = "";
    loadTodos();
  });
}

/* ================= LOAD TODOS ================= */

function loadTodos() {

  fetch(API + "/todos", {
    headers: {
      "authorization": localStorage.getItem("token")
    }
  })
  .then(res => res.json())
  .then(data => {

    todoList.innerHTML = "";

    data.forEach(t => {

      const countdownId = "countdown-" + t._id;
      const color = t.status === "Completed" ? "green" : "orange";

      todoList.innerHTML += `
        <li>
          <strong>${t.text}</strong><br>

          <span style="color:${color}; font-weight:bold;">
            ${t.status}
          </span><br>

          ${
            t.reminderTime && t.status === "In Progress"
              ? `<span id="${countdownId}"></span><br>`
              : ""
          }

          <button onclick="deleteTodo('${t._id}')">Delete</button>
        </li>
        <hr>
      `;

      if (t.reminderTime && t.status === "In Progress") {
        startCountdown(t._id, t.reminderTime);
      }
    });
  });
}

/* ================= COUNTDOWN WITH ALERT ================= */

function startCountdown(id, reminderTime) {

  const element = document.getElementById("countdown-" + id);
  const target = new Date(reminderTime);

  if (countdownIntervals[id]) {
    clearInterval(countdownIntervals[id]);
  }

  countdownIntervals[id] = setInterval(() => {

    const now = new Date();
    const diff = target - now;

    if (diff <= 0) {

      clearInterval(countdownIntervals[id]);

      element.innerHTML = "⏰ Time Reached!";

      // 🔔 ALERT MESSAGE
      alert("🔔 Reminder: Task Time Reached!");

      // 🔄 AUTO UPDATE STATUS TO COMPLETED
      fetch(API + "/todos/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "authorization": localStorage.getItem("token")
        },
        body: JSON.stringify({
          status: "Completed"
        })
      })
      .then(() => loadTodos());

      return;
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    element.innerHTML =
      "⏳ " +
      String(hours).padStart(2, '0') + ":" +
      String(minutes).padStart(2, '0') + ":" +
      String(seconds).padStart(2, '0');

  }, 1000);
}

/* ================= DELETE TODO ================= */

function deleteTodo(id) {

  fetch(API + "/todos/" + id, {
    method: "DELETE",
    headers: {
      "authorization": localStorage.getItem("token")
    }
  })
  .then(() => loadTodos());
}