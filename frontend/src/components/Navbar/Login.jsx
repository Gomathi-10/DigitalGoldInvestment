import React, { useState } from "react";
import "./Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import AxiosInstance from "../../AxiosInstance";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isActive, setIsActive] = useState(false);

  // Separate states for Login and Register forms
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [showPasswordLogin, setShowPasswordLogin] = useState(false);
  const [showPasswordRegister, setShowPasswordRegister] = useState(false);

  const navigate = useNavigate();

  // Handlers
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const resetLogin = () => setLoginData({ email: "", password: "" });
  const resetRegister = () =>
    setRegisterData({ username: "", email: "", password: "" });

  // Login API
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await AxiosInstance.post("login/", loginData);
      alert("Login Successful!");
      console.log(response.data);
      resetLogin();
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.user.username || "");
      localStorage.setItem("email", response.data.user.email || "");
      localStorage.setItem("is_staff", response.data.user.is_staff);
      localStorage.setItem("has_accepted_tc", response.data.user.has_accepted_tc);

      if (response.data.user.is_staff) {
        navigate("/admin");
      } else if (!response.data.user.has_accepted_tc) {
        navigate("/terms-and-conditions");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.log(error);
      alert("Invalid email or password");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await AxiosInstance.post("register/", registerData);
      alert("Registration Successful! Please login to continue.");
      resetRegister();
      setIsActive(false); // Switch to login form
    } catch (error) {
      console.log(error);
      alert("Registration Failed!");
    }
  };

  return (
    <div className="login-page">
      <div className={`login-container ${isActive ? "active" : ""}`}>
        {/* LOGIN FORM */}
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            <div className="input-box">
              <input
                name="email"
                value={loginData.email}
                placeholder="Email"
                type="email"
                required
                onChange={handleLoginChange}
                autoComplete="off"
              />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input
                name="password"
                placeholder="Password"
                type={showPasswordLogin ? "text" : "password"}
                value={loginData.password}
                required
                onChange={handleLoginChange}
              />
              <i
                className={
                  showPasswordLogin ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"
                }
                onClick={() => setShowPasswordLogin(!showPasswordLogin)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
            <button type="submit" className="btn">
              Login
            </button>
          </form>
        </div>

        {/* REGISTER FORM */}
        <div className="form-box register">
          <form onSubmit={handleRegister}>
            <h1>Register</h1>
            <div className="input-box">
              <input
                name="username"
                value={registerData.username}
                placeholder="Username"
                required
                onChange={handleRegisterChange}
                autoComplete="off"
              />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input
                name="email"
                value={registerData.email}
                placeholder="Email"
                type="email"
                required
                onChange={handleRegisterChange}
                autoComplete="off"
              />
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="input-box">
              <input
                name="password"
                placeholder="Password"
                type={showPasswordRegister ? "text" : "password"}
                value={registerData.password}
                required
                onChange={handleRegisterChange}
              />
              <i
                className={
                  showPasswordRegister
                    ? "fa-solid fa-eye-slash"
                    : "fa-solid fa-eye"
                }
                onClick={() => setShowPasswordRegister(!showPasswordRegister)}
                style={{ cursor: "pointer" }}
              ></i>
            </div>
            <button type="submit" className="btn">
              Register
            </button>
          </form>
        </div>

        {/* TOGGLE PANEL */}
        <div className="toggle-box">
          <div className="toggle-panel toggle-left">
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button
              type="button"
              className="btn register-btn"
              onClick={() => {
                setIsActive(true);
                resetRegister();
              }}
            >
              Register
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Welcome Back!</h1>
            <p>Already have an Account?</p>
            <button
              type="button"
              className="btn login-btn"
              onClick={() => {
                setIsActive(false);
                resetLogin();
              }}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
