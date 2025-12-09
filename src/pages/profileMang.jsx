import { useState } from "react"
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore"; 
import { useAuth } from "../AuthContext";
import { useOutletContext } from "react-router-dom";
import LoadingScreen from "./loading";

import { updateEmail, reauthenticateWithCredential, EmailAuthProvider, sendEmailVerification, updatePassword, getAuth, sendPasswordResetEmail } from "firebase/auth";

function ProfileMang(){

    const [userData] = useOutletContext()



    const { user, logout } = useAuth();


    // console.log(user)

    const [username, setusername] = useState("")
    const [newPhone, setNewPhone] = useState("")
    const [newemail, setnewemail] = useState("")
    const [crntpswd, setcrntpswd] = useState("")
    const [newpswd, setnewpswd] = useState("")
    const [newrepswd, setnewrepswd] = useState("")
    const [loading, setLoading] = useState(false)

    const handleUpdate = async () => {

        setLoading(true)
        console.log("usernaem change started")
        if (!username.trim()) {
            alert("Username cannot be empty!");
            return;
        }
    
        try {
            const userRef = doc(db, "users", user.uid); // Reference to user document
            await updateDoc(userRef, { fullName: username }); // Update Firestore
            setusername("")
            alert("Username updated successfully!");
        } catch (error) {
            console.error("Error updating username:", error);
            alert("Failed to update username.");
        // setLoading(false)

        }
        setLoading(false)
        location.reload();
    };

    const handleContactUpdate = async () => {

        setLoading(true)
        // console.log("usernaem change started")
        if (!newPhone.trim()) {
            alert("Phone cannot be empty!");
            return;
        }
    
        try {
            const userRef = doc(db, "users", user.uid); // Reference to user document
            await updateDoc(userRef, { phone: newPhone }); // Update Firestore
            setNewPhone("")
            alert("Phone updated successfully!");
        } catch (error) {
            console.error("Error updating username:", error);
            alert("Failed to update username.");
        // setLoading(false)

        }
        setLoading(false)
        location.reload();
    };

    const handleUpdatePasswordemail = () =>{
        const auth = getAuth();
        sendPasswordResetEmail(auth, user.email)
        .then(() => {
            alert("Reset mail sent to you")
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert("Cannot send Emial")
        });
    }



    const handleUpdatePassword = async () =>{


        const auth = getAuth();

        const userProf = auth.currentUser

        if(newpswd != newrepswd){
            alert("Entered Passwords dont match")
            return
        }
        
  

        const credential = EmailAuthProvider.credential(user.email, crntpswd);

        reauthenticateWithCredential(user, credential).then(() => {

            updatePassword(userProf, newpswd).then(() => {
                alert("Password Updated")
                console.log("Password successfully updated.");
            }).catch((error) => {
                alert("Unable to change password")
                console.log("Error updating password:", error);
            });
        }).catch((error) => {
            // An error ocurred
            console.log("Erroe " + error)
        });
    
        // updatePassword(newpswd)
        //     .then(() => {
        //         console.log("Password successfully updated.");
        //     })
        //     .catch((error) => {
        //         console.log("Error updating password:", error);
        //     });

        

        // Reauthenticate the user
        // await reauthenticateWithCredential(credential)
        // .then(() => {
        //     // Reauthentication successful, now update the password
        //     updatePassword(newpswd)
        //     .then(() => {
        //         console.log("Password successfully updated.");
        //     })
        //     .catch((error) => {
        //         console.log("Error updating password:", error);
        //     });
        // })
        // .catch((error) => {
        //     console.log("Reauthentication failed:", error);
        // });
    }


    const handleUpdateEmail = async () => {

        if (!newemail.includes("@")) {
          alert("Please enter a valid email address!");
          return;
        }
    
        setLoading(true);


        const credential = EmailAuthProvider.credential(user.email, crntpswd);
        
        reauthenticateWithCredential(user, credential).then(() => {
            user.email = newemail
            console.log(user)
            sendEmailVerification(user);
            alert("A verification email has been sent. Please verify before updating.");
        }).then(()=>{

            updateEmail(user, newemail);
            alert("Email updated successfully! Please verify your new email.");

        }).then(()=>{
            
            const userRef = doc(db, "users", user.uid); // Reference to user document
            updateDoc(userRef, { email : newemail }); // Update Firestore
            
        }).then(()=>{
            setnewemail("");
            setCurrentPassword("");
            location.reload();
        })

        setLoading(false);


        }




    // const handleEnter = async (e, attr)=>{
    //     if(e.key == "Enter"){
            
    //         if(attr == "name" && username){
    //             await handleUpdate()
    //             console.log("Complete")
    //         }else if(attr == "email" && newemail){
    //             console.log("Email Change")
    //             await handleUpdateEmail()
    //         }else if(attr == "pswd" && newpswd && newrepswd && newpswd == newrepswd ){
    //             console.log("Password Change")
    //         }
            
    //         location.reload()
    //     }
    // }

    if(loading){
        return(
            <LoadingScreen />
        )
    }

    return(

        <div className="profileMangCont">

            <div>

                <h4 className="sub-head">Your Profile</h4>

                <div className="profile-details">
                    <p className="profile-img grid-row-span-4">🤖</p>
                    <h5>Username : {!userData ? "Loading.." : userData.fullName}</h5>
                    <h5>Email : {!userData ? "Loading.." :userData.email}</h5>
                    <h5>Phone : {!userData ? "Loading.." : userData.phone}</h5>
                    <h5>UID : {!userData ? "Loading.." : userData.uid}</h5>

                </div>

            </div>


            <hr></hr>



            <div>
                <h4 className="sub-head">Edit your Profile</h4>

                <div className="edit-cont">
                    <div className="username-cont">
                        <label htmlFor="username-change">Change Username:</label>
                        <input type="text" name="username-change" className="details-dark" placeholder="New Username" onChange={(e)=>setusername(e.target.value)}></input>
                        <button className="change-btn" onClick={handleUpdate}>Change</button>
                    </div>

                    <div className="username-cont">
                        <label htmlFor="username-change">Change Phone:</label>
                        <input type="number" name="username-change" className="details-dark" placeholder="New Phone Number" onChange={(e)=>setNewPhone(e.target.value)}></input>
                        <button className="change-btn" onClick={handleContactUpdate}>Change</button>
                    </div>

                    <div className="pswd-cont">
                        <label htmlFor="username-change">Change Password:</label>
                        <input type="password" name="username-change" className="details-dark" placeholder="Current Password" onChange={(e)=>setcrntpswd(e.target.value)}></input>
                        <input type="password" name="username-change" className="details-dark" placeholder="New Password" onChange={(e)=>setnewpswd(e.target.value)}></input>
                        <input type="password" name="username-change" className="details-dark" placeholder="Reenter Password" onChange={(e)=>setnewrepswd(e.target.value)}></input>
                        <div>
                            <button className="change-btn" onClick={handleUpdatePassword}>Change</button>
                            <button className="change-btn" onClick={handleUpdatePasswordemail} style={{width:"max-content", marginLeft:"10px"}}>Change thru Email</button>
                        </div>
                    
                    </div>

                    <div className="username-cont">
                        <label htmlFor="username-change">Change Email Address:</label>
                        <input type="text" name="username-change" className="details-dark" placeholder="New Email" onChange={(e)=>setnewemail(e.target.value)}></input>
                        <input type="password" name="username-change" className="details-dark" placeholder="Current Password" onChange={(e)=>setcrntpswd(e.target.value)}></input>
                        <button className="change-btn" onClick={handleUpdateEmail}>Change</button>
                    </div>

                    
                </div>
            </div>
        </div>

    )

}

export default ProfileMang