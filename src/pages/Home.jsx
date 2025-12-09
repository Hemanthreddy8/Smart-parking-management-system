import React, { use } from "react";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore"; 
import { Outlet } from "react-router-dom";
import NavBar from "../Navbar";
import { sendEmailVerification } from "firebase/auth";


function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null)


  const checkSignUp = async ()=>{
    // console.log(user)
    if(user && !user.emailVerified){
      // const auth = getAuth();
      await sendEmailVerification(user)
      
    }
  }


  // useEffect(()=>{
  //   checkSignUp()
  // },[])

  const checkSignUpVer = ()=>{
    if(!user.emailVerified){
      // const auth = getAuth();
      alert("Please verify your account :)")
      
    }else{
      console.log("User Verified")
    }
  }

  // useEffect(()=>{
  //   if(userData){
  //     checkSignUpVer()
  //   }
  // },[userData])

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData(userData)
        return userDoc.data(); // Return user details
      } else {
        console.log("No user data found!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  
  useEffect(() => {
    if (user) {
      const fetchUser = async () => {
      const data = await fetchUserData(user.uid);
      setUserData(data);
      };
      fetchUser();
    }
  }, []);
  


  useEffect(()=>{
    if(!auth.currentUser){
      console.log(user)
      navigate("/login")
    }
  },[])

  return (
    // <div>
      

    //   <h2>Welcome, {user?.email}!</h2>
    //   <button onClick={handleLogout}>Logout</button>

    // </div>

    <div className="home-page">
      
      <NavBar/>


      <div className="main-app-cont">
        <div className="main-app">
          <Outlet context={[userData]}></Outlet>
        </div>
      </div>

    </div>


    );

}

export default Home;
