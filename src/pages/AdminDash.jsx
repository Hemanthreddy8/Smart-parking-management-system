import { data, Navigate, Outlet, useNavigate} from "react-router-dom"
import NavBar from "../Navbar"
import { getDoc, doc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import LoadingScreen from "./loading";

function AdminDash(){

    const navigate = useNavigate();

    const { user, logout } = useAuth();

    const [userData, setUserData] = useState(null)
    const [adminData, setAdminData] = useState(null)

    const [blur, setBlur] = useState(true)

    const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data())
        // return userDoc.data(); // Return user details
      } else {
        console.log("No user data found!");
        return null;
      }

      const adminDoc = await getDoc(doc(db, "admins", uid));
      if (adminDoc.exists()) {
        // console.log(adminDoc.data())
        setAdminData(adminDoc.data())
        // return adminDoc.data(); // Return user details
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

      setBlur(true)

      const fetchUser = async () => {
      const data = await fetchUserData(user.uid);
      // setUserData(data);
      // console.log("User data: ", userData);
      }
      fetchUser().then(()=>{
        if(userData && adminData){
          setUserData(...userData, adminData)
        }
      })


      const validateAdmin = async ()=>{
        // console.log("Validating admin")
        // console.log(userData)
        if(userData && !userData.isAdmin){
            alert("You dont have admin access :|");
            navigate("/home")
        }
      }
  
      validateAdmin()

      setBlur(false)

    }else{
        navigate("/adminlogin")
    }

    
  }, []);


  useEffect(()=>{
    // document.querySelector(".dashboard").style.filter="blur(10px)"

  })
  

    return(

        blur ? <LoadingScreen /> :
        

        <div className="admin-page">
            
            <NavBar/>


            <div className="main-app-cont">
                <div className="main-app">
                    {/* {console.log("userData: ", userData)} */}
                    <Outlet context={[userData, adminData]}></Outlet>


                </div>
            </div>

        </div>




    )

}

export default AdminDash