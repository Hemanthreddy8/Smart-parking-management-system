import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "./AuthContext";
import { RecordLog } from "./RecordLog";



function NavBar(){

  const navigate = useNavigate();

  const {user, logout} = useAuth()

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const toggleNavMenu = ()=>{
    const navMenu = document.querySelector(".navigation")
    const app = document.querySelector(".main-app-cont")

    if(navMenu.style.height == "0px"){
      navMenu.style.height = "100px"
      navMenu.style.bottom = "-110px"
      navMenu.style.border = "1px solid var(--border-color-cool)"
      app.style.marginTop = "100px"
    }else{
      navMenu.style.height = "0px"
      navMenu.style.border = "none"
      navMenu.style.bottom = "0px"

      app.style.marginTop = "0px"
    }
  }


  return(


    <div className="nav-bar-cont">
      <div className="app-name">
        Smart Parking App
      </div>
      <div className="left-dash">
        {/* <p>Welcome, {user?.email}</p> */}
        

        {/* <Link to={"/home/profile"} style={{textDecoration:"None"}}>
          <div className="profile-icon">
            =
          </div>
        </Link> */}

        <div className="profile-icon" onClick={toggleNavMenu}>
            =
        </div>

        {/* <button onClick={handleLogout}>Logout</button> */}
      </div>

      <div className="navigation" style={{height:"0px"}}>
        <Link to={"/home/main"}className="nav-links"><p>Home</p></Link>
        <Link to={"/home/profile"} className="nav-links"><p>Profile</p></Link>
        <p className="nav-links" onClick={handleLogout}>Logout?</p>
      </div>
    </div>

  )
}


export default NavBar