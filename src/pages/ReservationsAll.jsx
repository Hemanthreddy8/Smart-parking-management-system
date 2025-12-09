import { collection, getDocs, increment } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom"
import { db } from "../firebase";
import { where } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { query } from "firebase/firestore";
import { AddUserAlert } from "../RecordLog";


function ReservationsAll(){


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
    
    
    
    const cancelReservation = async (id, parkId)=>{
        const resRef = doc(db, `users/${userData.uid}/reservations/`, id); // Reference to user document
        await updateDoc(resRef, { status: "canceled" });
        // alert("Reservation cancelled successfully")

        const parkresRef = doc(db, `reservations/${parkId}/list/`, id); // Reference to user document
        await updateDoc(parkresRef, { status: "cancelled" });
        // alert("Reservation cancelled successfully")

        const parkRef = doc(db, `parking-dyn-info`, parkId); // Reference to user document
        await updateDoc(parkRef, { reservation: increment(-1) });
        alert("Reservation cancelled successfully")

        AddUserAlert(userData.uid, "Reservation Cancelled", `Your reservation for ${reservation[0].parkingName} has been cancelled`)	
        location.reload()
    }


    return(
        reservation.length > 0 ? 
        <div> 
            <h3 className="sub-head">Reservations:</h3>
                {reservation.map((res) => (
                    <Link className="parking-lot-container no-deco" key={res.id} to={`/home/reservation/${res.id}`}>
                        <div>
                            <h3 className="parking-lot-title">{res.parkingName}<span className="parking-lot-id">#{res.id}</span></h3>
                            <p className="parking-address">{res.parkingAddress}</p>
                        </div>
                        <p className="parking-times">From: <span>{res.from}</span> - To: <span>{res.to}</span></p>
                        <p className="vehicle-info">
                        License Plate: <span className="vehicle-data">{res.lisencePlate || "N/A"}</span>
                        </p>
                        <p className="vehicle-info">
                        Vehicle Type: <span className="vehicle-data">{res.vehicleType || "N/A"}</span>
                        </p>
                        <p className="parking-status">
                        Status: <span className={`status ${res.status.toLowerCase()}`}>{res.status}</span>
                        </p>
                
                        {/* Cancel Button */}
                        {
                            res.status=="active"?<></> :
                        <div className="button-container">
                        <button className="cancel-btn" onClick={(e)=>cancelReservation(res.id, res.parkingLotId)}>Cancel</button>
                        </div>
                        }
                    </Link>
                ))}
        </div> : 

        <div className="page-null-cont">
            <div>
            <div className="page-hint-icon">📄</div>
            <h3>Currently you have no active reservations...</h3>
            </div>
        </div>
        
    )


}


export default ReservationsAll


