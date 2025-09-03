class InputData {
  constructor() {
    this.users = JSON.parse(localStorage.getItem("allUsers")) || [];
    this.currentUser  = null;
  }

  saveUsers() {
    localStorage.setItem("allUsers", JSON.stringify(this.users));
  }

  loadUsers() {
    return this.users;
  }

  addUser (email, password) {
    email = email.trim().toLowerCase();
    if (this.users.some(u => u.email === email)) {
      return false;
    }
    const newUser  = {
      email,
      password,
      personal: {
        fullName: "",
        dob: "",
        gender: "",
        email,
        mobile: ""
      },
      education: {
        elemSchool: "",
        elemYear: "",
        hsSchool: "",
        hsYear: "",
        gwa: "",
        discount: ""
      }
    };
    this.users.push(newUser );
    this.saveUsers();
    return true;
  }

  findUser (email, password) {
    email = email.trim().toLowerCase();
    const foundUser  = this.users.find(u => u.email === email && u.password === password);
    return foundUser ;
  }

  setCurrentUser (user) {
    this.currentUser  = user;
    window.currentUser  = user;
  }

  getCurrentUser () {
    return this.currentUser ;
  }
}

class UserView {
  constructor(model) {
    this.model = model;
    this.bindEvents();
  }

  bindEvents() {
    const goLogin = document.getElementById("go-login");
    const goRegister = document.getElementById("go-register");
    if (goLogin) {
      goLogin.addEventListener("click", e => { e.preventDefault(); this.showPage("login"); });
    }
    if (goRegister) {
      goRegister.addEventListener("click", e => { e.preventDefault(); this.showPage("register"); });
    }
  }

  bindRegister(handler) {
  document.getElementById("register-form").addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const password = document.getElementById("register-password").value.trim();
    const confirm = document.getElementById("register-confirm-password").value.trim();

    if (password !== confirm) {
      this.showError("Passwords do not match!", "register");
      return;
    }

    handler(email, password);
  });
  }


  bindLogin(handler) {
    document.getElementById("login-form").addEventListener("submit", e => {
      e.preventDefault();
      handler(
        document.getElementById("login-email").value.trim().toLowerCase(),
        document.getElementById("login-password").value.trim()
      );
    });
  }

  bindPersonal(handler) {
    document.getElementById("personaldeets-form").addEventListener("submit", e => {
      e.preventDefault();
      handler({
        fullName: document.getElementById("full-name").value.trim(),
        dob: document.getElementById("dob").value,
        gender: document.querySelector("input[name='gender']:checked")?.value || "",
        email: document.getElementById("personal-email").value.trim(),
        mobile: document.getElementById("mobile").value.trim()
      });
    });
  }

  bindEducation(handler) {
    const gwaInput = document.getElementById("gwa");
    const discountInput = document.getElementById("discount");

    gwaInput.addEventListener("input", () => {
      const gwa = parseFloat(gwaInput.value);
      let discount = "";
      if (!isNaN(gwa)) {
        if (gwa >= 90 && gwa <= 94.4) {
            discount = "25% discount";
        }
        else if (gwa >= 94.5 && gwa <= 97.4) {
            discount = "50% discount";
        }
        else if (gwa >= 97.5 && gwa <= 100) {
            discount = "100% discount";
        }
        else {
            discount = "no discount";
        }
      }
      discountInput.value = discount;
    });

    document.getElementById("edbg-form").addEventListener("submit", e => {
      e.preventDefault();
      handler({
        elemSchool: document.getElementById("elem-school").value.trim(),
        elemYear: document.getElementById("elem-year").value.trim(),
        hsSchool: document.getElementById("hs-school").value.trim(),
        hsYear: document.getElementById("hs-year").value.trim(),
        gwa: gwaInput.value.trim(),
        discount: discountInput.value.trim()
      });
    });
  }

  showPage(page) {
    document.querySelectorAll(".wrapper").forEach(w => w.classList.remove("active"));
    const el = document.querySelector(`.${page}`);
    if (el) {
      el.classList.add("active");

      if (page === "login") {
        document.getElementById("login-form").reset();
        document.getElementById("login-error").textContent = "";
      }
      if (page === "register") {
        document.getElementById("register-form").reset();
        document.getElementById("register-error").textContent = "";
      }
      if (page === "personaldeets") {
        const user = this.model.getCurrentUser();
        if (user && user.personal && user.personal.fullName) {
          this.populatePersonalForm(user);
        } else {
          this.clearPersonalForm();
        }
      }
      if (page === "edbg") {
        const user = this.model.getCurrentUser();
        if (user && user.education && user.education.elemSchool) {
          this.populateEducationForm(user);
        } else {
          this.clearEducationForm();
        }
      }
      if (page === "profile-card") {
        const user = this.model.getCurrentUser();
        if (user) {
          this.showProfile(user);  
        }
      }
    }
  }

  showError(msg, page = "login") {
    if (page === "login") {
      document.getElementById("login-error").textContent = msg;
    } else if (page === "register") {
      document.getElementById("register-error").textContent = msg;
    }
  }

  showProfile(user) {
    const profile = document.querySelector(".profile-card");
    profile.innerHTML = `
      <h1>Profile</h1>
      <p><strong>Name:</strong> ${user.personal.fullName || "N/A"}</p>
      <p><strong>Date of Birth:</strong> ${user.personal.dob || "N/A"}</p>
      <p><strong>Gender:</strong> ${user.personal.gender || "N/A"}</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Mobile:</strong> ${user.personal.mobile || "N/A"}</p>

      <h2>Educational Background</h2>
      <p><strong>Elementary School:</strong> ${user.education.elemSchool || "N/A"}</p>
      <p><strong>Year Graduated:</strong> ${user.education.elemYear || "N/A"}</p>
      <p><strong>High School:</strong> ${user.education.hsSchool || "N/A"}</p>
      <p><strong>Year Graduated:</strong> ${user.education.hsYear || "N/A"}</p>
      <p><strong>GWA:</strong> ${user.education.gwa || "N/A"}</p>
      <p><strong>Discount:</strong> ${user.education.discount || "N/A"}</p>

      <button id="logout-btn">LOGOUT</button>
    `;

    document.getElementById("logout-btn").addEventListener("click", () => {
      this.model.setCurrentUser(null);
      window.location.href = "index.html"; 
    });

  }

  clearPersonalForm() {
    document.getElementById("full-name").value = "";
    document.getElementById("dob").value = "";
    document.querySelectorAll("input[name='gender']").forEach(r => r.checked = false);
    document.getElementById("personal-email").value = "";
    document.getElementById("mobile").value = "";
    document.getElementById("name-error").textContent = "";
    document.getElementById("dob-error").textContent = "";
    document.getElementById("gender-error").textContent = "";
    document.getElementById("email-error").textContent = "";
  }
  populatePersonalForm(user) {
    if (!user || !user.personal) return;
    document.getElementById("full-name").value = user.personal.fullName || "";
    document.getElementById("dob").value = user.personal.dob || "";
    const gender = user.personal.gender || "";
    document.querySelectorAll("input[name='gender']").forEach(r => {
      r.checked = (r.value === gender);
    });
    document.getElementById("personal-email").value = user.personal.email || "";
    document.getElementById("mobile").value = user.personal.mobile || "";
  }

  clearEducationForm() {
    document.getElementById("elem-school").value = "";
    document.getElementById("elem-year").value = "";
    document.getElementById("hs-school").value = "";
    document.getElementById("hs-year").value = "";
    document.getElementById("gwa").value = "";
    document.getElementById("discount").value = "";
    document.getElementById("elem-school-error").textContent = "";
    document.getElementById("elem-year-error").textContent = "";
    document.getElementById("hs-school-error").textContent = "";
    document.getElementById("hs-year-error").textContent = "";
  }

  populateEducationForm(user) {
    if (!user || !user.education) return;
    document.getElementById("elem-school").value = user.education.elemSchool || "";
    document.getElementById("elem-year").value = user.education.elemYear || "";
    document.getElementById("hs-school").value = user.education.hsSchool || "";
    document.getElementById("hs-year").value = user.education.hsYear || "";
    document.getElementById("gwa").value = user.education.gwa || "";
    document.getElementById("discount").value = user.education.discount || "";
  }
}

class Controller {
  constructor(model, view) {
    this.model = model;
    this.view = view;

    this.view.bindRegister(this.handleRegister.bind(this));
    this.view.bindLogin(this.handleLogin.bind(this));
    this.view.bindPersonal(this.handlePersonal.bind(this));
    this.view.bindEducation(this.handleEducation.bind(this));
  }

  handleRegister(email, password) {
    const success = this.model.addUser(email, password);
    if (!success) {
      this.view.showError("Email already registered!", "register");
      return;
    }
    const user = this.model.findUser(email, password);
    this.model.setCurrentUser(user);

    this.view.showPage("personaldeets");
  }

  handleLogin(email, password) {
  email = email.trim().toLowerCase();

  const user = this.model.findUser (email, password);

  if (user) {

    const fullUser  = this.model.users.find(u => u.email === user.email);
    this.model.setCurrentUser (fullUser );

    const params = new URLSearchParams();
    params.set("email", fullUser .email);
    params.set("password", fullUser .password);
    params.set("fullName", fullUser .personal.fullName || "");
    params.set("dob", fullUser .personal.dob || "");
    params.set("gender", fullUser .personal.gender || "");
    params.set("mobile", fullUser .personal.mobile || "");
    params.set("elemSchool", fullUser .education.elemSchool || "");
    params.set("elemYear", fullUser .education.elemYear || "");
    params.set("hsSchool", fullUser .education.hsSchool || "");
    params.set("hsYear", fullUser .education.hsYear || "");
    params.set("gwa", fullUser .education.gwa || "");
    params.set("discount", fullUser .education.discount || "");

    window.location.href = `index.html?${params.toString()}&showProfile=true`;
  } else {
    this.view.showError("Invalid email or password.");
  }
}



  handlePersonal(details) {
  const user = this.model.getCurrentUser ();
  if (user) {
    
    const index = this.model.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this.model.users[index].personal = { ...details };
      this.model.saveUsers();
      this.model.setCurrentUser (this.model.users[index]);
    }
    this.view.showPage("edbg");
  }
}

handleEducation(details) {
  const user = this.model.getCurrentUser ();
  if (user) {
    
    const index = this.model.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this.model.users[index].education = { ...details };
      this.model.saveUsers();
      this.model.setCurrentUser (this.model.users[index]);
    }

    const updatedUser  = this.model.getCurrentUser ();

    const params = new URLSearchParams();
    params.set("email", updatedUser .email);
    params.set("password", updatedUser .password);
    params.set("fullName", updatedUser .personal.fullName || "");
    params.set("dob", updatedUser .personal.dob || "");
    params.set("gender", updatedUser .personal.gender || "");
    params.set("mobile", updatedUser .personal.mobile || "");
    params.set("elemSchool", updatedUser .education.elemSchool || "");
    params.set("elemYear", updatedUser .education.elemYear || "");
    params.set("hsSchool", updatedUser .education.hsSchool || "");
    params.set("hsYear", updatedUser .education.hsYear || "");
    params.set("gwa", updatedUser .education.gwa || "");
    params.set("discount", updatedUser .education.discount || "");

    window.location.href = `index.html?${params.toString()}&showProfile=true`;
  }
}


}

document.addEventListener("DOMContentLoaded", () => {
  const data = new InputData();
  const view = new UserView(data);   
  new Controller(data, view);
});
