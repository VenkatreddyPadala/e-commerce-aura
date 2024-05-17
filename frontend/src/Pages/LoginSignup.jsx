import React, { useState } from 'react';
import './CSS/LoginSignup.css';
import signup from '../Components/Assets/signup.jpg';

const LoginSignup = () => {
  const [state, setState] = useState("Login");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
  });

  const changeHandler = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const login = async () => {
    try {
      console.log("Login Function Executed", formData);
      const response = await fetch('https://e-commerce-aura.onrender.com/login', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();
      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        // Optionally, you can redirect to another page upon successful login
        window.location.replace("/");
      } else {
        alert(responseData.errors);
      }
    } catch (error) {
      console.error("Error during login:", error);
      alert("An error occurred during login.");
    }
  };

  const signUp = async () => {
    try {
      console.log("Signup Function Executed", formData);
      const response = await fetch('https://e-commerce-aura.onrender.com/signup', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData),
      });
      const responseData = await response.json();
      if (responseData.success) {
        localStorage.setItem("auth-token", responseData.token);
        // Optionally, you can redirect to another page upon successful signup
        // window.location.replace("/");
      } else {
        alert(responseData.errors);
      }
    } catch (error) {
      console.error("Error during signup:", error);
      alert("An error occurred during signup.");
    }
  };
  return (
    <div className='cen'>
      <div className="center">
      <div className="left box">
        <img src={signup} className='image' alt="" />
      </div>
      <div className="right box">
        <h1>{state}</h1>
        <form action="">
          <div id="dual-box">
            <div className="input-box">
            {state === "SignUp" ? <input name='username' value={formData.username} onChange={changeHandler} type="text" id="Name" placeholder='Name' required/> : null}

            </div>
          </div>
          <div className="input-box">
            <label htmlFor="email">Email</label>
            <input type="email" name="email" value={formData.email} onChange={changeHandler} id="email" placeholder='Email Address' required />
          </div>
          <div id="dual-box">
            <div className="input-box">
              <label htmlFor="password">Password</label>
              <input name='password' value={formData.password} onChange={changeHandler} type="password" id="password" placeholder='Password' required />
            </div>
          </div>
          <div className="input-box">
            <button onClick={()=>{state==="Login"?login():signUp()}} type="submit" >Submit</button>
          </div>
          {state==="SignUp"?<p className="sigin">Already had an account? <span onClick={()=>{setState("Login")}}>LogIn here</span></p> : <p className="sigin">Create an account? <span onClick={()=>{setState("SignUp")}}>SignUp here</span></p>}
        </form>
      </div>
      </div>
    </div>
  )
}
export default LoginSignup