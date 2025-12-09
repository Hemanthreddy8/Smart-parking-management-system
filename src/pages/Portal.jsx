import { collection, getDocs, increment } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { where } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { query } from "firebase/firestore";
import LoadingScreen from "./loading";
import { useOutletContext } from "react-router-dom";
import { onSnapshot } from "firebase/firestore";
import { AddUserAlert, RecordLog } from "../RecordLog";
import { getDoc } from "firebase/firestore";
// import { increment } from "firebase/firestore";

function Portal(){

    const [userData, adminData] = useOutletContext()

    const [loading, setLoading] = useState(false)
    const [reservationNotUsed, setReservationsNotUsed] = useState([])
    const [reservationActive, setReservationsActive] = useState([])
        
    const [parkingLotData, setParkingLotData] = useState(null)    

    const listenToReservations = () => {
        setLoading(true);
        try {
            const notUsedQuery = query(
                collection(db, `reservations/${adminData.parkingLotId}/list`),
                where("status", "==", "not-used")
            );
            
            const activeQuery = query(
                collection(db, `reservations/${adminData.parkingLotId}/list`),
                where("status", "==", "active")
            );
            
            const unsubscribeNotUsed = onSnapshot(notUsedQuery, (snapshot) => {
                const resDataNU = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(resDataNU);
                setReservationsNotUsed(resDataNU);
            }, (error) => {
                console.error("Error listening to not-used reservations:", error);
            });
            
            const unsubscribeActive = onSnapshot(activeQuery, (snapshot) => {
                const resDataACT = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log(resDataACT);
                setReservationsActive(resDataACT);
            }, (error) => {
                console.error("Error listening to active reservations:", error);
            });
            
            setLoading(false);
            
            // Return unsubscribe functions to clean up listeners
            return () => {
                unsubscribeNotUsed();
                unsubscribeActive();
            };
        } catch (error) {
            console.error("Error setting up real-time listeners:", error);
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!adminData) return;

        // Fetch Static Data once

        // Listen for real-time updates in Firestore
        const parkingDynRef = doc(db, "parking-dyn-info", adminData.parkingLotId);
        const unsubscribe = onSnapshot(parkingDynRef, (snapshot) => {
            if (snapshot.exists()) {
                setParkingLotData(snapshot.data());
            } else {
                console.log("No real-time data available for this parking lot.");
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [adminData]);


    const activateReservation = async(id, userId)=>{
        const resRef = doc(db, `users/${userId}/reservations/`, id); // Reference to user document
        await updateDoc(resRef, { status: "active" });
        // alert("Reservation cancelled successfully")

        const parkresRef = doc(db, `reservations/${adminData.parkingLotId}/list/`, id); // Reference to user document
        await updateDoc(parkresRef, { status: "active" });
        // alert("Reservation cancelled successfully")

        const slotRef = doc(db, "parking-dyn-info", adminData.parkingLotId)
        await updateDoc(slotRef, { remaining: parkingLotData.remaining-1, reservations: parkingLotData.reservations-1});

        await RecordLog(adminData.aid, `Parking ticket activation`, `Admin has activated ticket for ${userId}`);
        await AddUserAlert(userId, "Reservation Activated", `Your reservation for ${reservationNotUsed[0].parkingName} has been activated`)
    }


    const closeReservation = async(id, userId)=>{
        const resRef = doc(db, `users/${userId}/reservations/`, id); // Reference to user document
        await updateDoc(resRef, { status: "closed" });
        // alert("Reservation cancelled successfully")

        const parkresRef = doc(db, `reservations/${adminData.parkingLotId}/list/`, id); // Reference to user document
        await updateDoc(parkresRef, { status: "closed" });
        // alert("Reservation cancelled successfully")



        const slotRef = doc(db, "parking-dyn-info", adminData.parkingLotId)
        // console.log(slotRef.data())
        await updateDoc(slotRef, { remaining: parkingLotData.remaining+1});

        await RecordLog(adminData.aid, `Parking ticket closed`, `Admin has closed ticket for ${userId}`);
        await AddUserAlert(userId, "Reservation Closed", `Your reservation for ${reservationNotUsed[0].parkingName} has been closed`)
    }


    useEffect(()=>{
        if(adminData){
            listenToReservations()
        }
    },[userData])

    return(

        loading ? <LoadingScreen /> :


        // reservationNotUsed.length > 0 ?   
            <div> 
                <h3 className="sub-head">Parking Portal:</h3>

                    <h4>Pending Tickets:</h4>
                    {reservationNotUsed.map((res) => (
                        
                        <div className="parking-lot-container" key={res.id}>
                            <div>
                                <h3 className="parking-lot-title">{res.userName}<span className="parking-lot-id">#{res.id}</span></h3>
                                <p className="parking-address">{res.userEmail}</p>
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

                            <div className="button-container">
                            <button style={{backgroundColor:"green"}} className="cancel-btn" onClick={(e)=>activateReservation(res.id, res.userId)}>Activate</button>
                            </div>
                    
                        </div>
                    ))}


                    <h4>Active Tickets:</h4>
                    {   
                        reservationActive.length > 0 ?
                    
                        reservationActive.map((res) => (
                                        
                            <div className="parking-lot-container" key={res.id}>
                                <div>
                                    <h3 className="parking-lot-title">{res.userName}<span className="parking-lot-id">#{res.id}</span></h3>
                                    <p className="parking-address">{res.userEmail}</p>
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

                                <div className="button-container">
                                <button style={{backgroundColor:"red"}} className="cancel-btn" onClick={(e)=>closeReservation(res.id, res.userId)}>Close</button>
                                </div>
                        
                            </div>
                        )):<p>Currently no active tickets :(</p>

                    }

            </div>    

            // <div className="page-null-cont">
            //     <div>
            //     <div className="page-hint-icon">📄</div>
            //     <h3>Reserve your 1st lot to create history!</h3>
            //     </div>
            // </div>
    )


}


export default Portal