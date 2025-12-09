import React, { use, useEffect, useState } from "react";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
// import LoadingScreen from "./loading";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogin = async () => {
    if(email == "" || password == ""){
      setError("Please fill all fields :)")
      return
    }

    if(!email.includes("@") || !email.includes(".")){
      setError("Not a valid email :(")
      return 
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      navigate("/home/main"); 
    } catch (err) {
      setError(err.message);
    }
  };

  const handleKeyPress = (e) =>{
    if(e.key=="Enter"){
      console.log("Enter Key Pressed")
      handleLogin()
    }
  }

  useEffect(()=>{
    if(auth.currentUser){
      console.log(user)
      navigate("/Home/main")
    }
  },[])


  // useEffect(()=>{
  //   if(email.length<6){
  //     document.querySelector(".email-cont").style.border = `1px solid red`
  //   }else{
  //     document.querySelector(".email-cont").style.border = `none`
  //   }
  // }, email)

  return (

    // <LoadingScreen />
    
    <div className="login-page">
      <h3 className="app-name-login">Smart Parking Application</h3>
      <div className="login-o-cont">
        <div className="login-cont">
          <h2 style={{marginLeft:"10px"}}>Login</h2>
          <input type="email" className=" details" style={{border:"none"}} placeholder="Email" onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyPress}/>
          <input type="password" className="email-cont details" placeholder="Password" onChange={(e) => setPassword(e.target.value)}  onKeyDown={handleKeyPress}/>
          <button className="login-btn" onClick={handleLogin}>Login</button>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <p className="login-hint" style={{marginLeft:"10px"}}>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
          <p className="login-hint-pswd" ><Link to="/reset">Forgot Password?</Link></p>
      </div>
    </div>
  );
}

export default Login;
