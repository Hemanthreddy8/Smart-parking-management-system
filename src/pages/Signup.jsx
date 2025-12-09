import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, getAuth } from "firebase/auth";
import { auth, db } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {

    if(contact.length!=10){
      setError("Invalid Phone Number")
      // setTimeout(()=>{
      //   setError("")
      // },3000)
      return
    }


    if (!email.includes("@")) {
      setEmail("Please enter a valid email address!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const user = userCredential.user;


      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: name,
        email: user.email,
        phone: contact,
        createdAt: new Date(),
        isAdmin: false
      });



      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(()=>{
    if(auth.currentUser){
      navigate("/Home")
    }
  },[])

  return (
    <div className="login-page">
      <h3 className="app-name-login">Smart Parking Application</h3>
      <div className="login-o-cont">
        <div className="login-cont">
          <h2>Signup</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <input className="details" type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required />
          <input className="details" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required/>
          <input className="details" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required/>
          <input className="details" type="number" placeholder="Phone Number" max={9999999999} min={1000000000}  onChange={(e) => setContact(e.target.value)} required/>
          <button className="login-btn" onClick={handleSignup}>Sign Up</button>
          <p className="login-hint" style={{marginLeft:"10px"}}>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
