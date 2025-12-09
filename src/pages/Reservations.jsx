import { collection, getDocs, increment } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Outlet, useOutletContext } from "react-router-dom"
import { db } from "../firebase";
import { where } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { query } from "firebase/firestore";
import { AddUserAlert } from "../RecordLog";
// import { Outlet } from "react-router-dom";

function Reservations(){

    const [userData] = useOutletContext()

    const [reservation, setReservations] = useState([])
        
    const fetchActiveReservations = async () => {
        try {
            // const logbookRef = collection(db, `logs/${userData.uid}/logbook`);
            // const logSnapshot = await getDocs(logbookRef);
            // const logData = logSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // setLogArr(logData);

        // console.log(`users/${userData.uid}/reservations`)
        const resDoc = await getDocs(
            query(
              collection(db, `users/${userData.uid}/reservations`),
              where("status", "in", ["not-used", "active"])
            )
          );
        const resData = resDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // console.log("Res", resData)
        // resDoc.forEach(res => {
        //     console.log(res.data())
        //     tempArr.push(res.data())
        // });

        setReservations(resData)



        } catch (error) {
        console.error("Error fetching user data:", error);
        }
    };


    useEffect(()=>{
        if(userData){
            fetchActiveReservations()
        }
    },[userData])

    return(

        <Outlet context={[userData]} />
        
    )


}


export default Reservations