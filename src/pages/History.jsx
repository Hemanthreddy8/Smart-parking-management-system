import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom"
import { db } from "../firebase";
import { where } from "firebase/firestore";
import { doc, updateDoc } from "firebase/firestore";
import { query } from "firebase/firestore";
import LoadingScreen from "./loading";

function History(){

    const [userData] = useOutletContext()

    const [loading, setLoading] = useState(false)
    const [reservation, setReservations] = useState([])
        
    const fetchReservations = async () => {

        setLoading(true)
        try {
            // const logbookRef = collection(db, `logs/${userData.uid}/logbook`);
            // const logSnapshot = await getDocs(logbookRef);
            // const logData = logSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            // setLogArr(logData);

        // console.log(`users/${userData.uid}/reservations`)
        const resDoc = await getDocs(
            query(
              collection(db, `users/${userData.uid}/reservations`),
            //   where("status", "in", ["not-used", "active"])
            )
          );
        const resData = resDoc.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // console.log("Res", resData)
        // resDoc.forEach(res => {
        //     console.log(res.data())
        //     tempArr.push(res.data())
        // });

        setReservations(resData)


        setLoading(false)


        } catch (error) {
        console.error("Error fetching user data:", error);
        }
    };


    useEffect(()=>{
        if(userData){
            fetchReservations()
        }
    },[userData])

    return(

        loading ? <LoadingScreen /> :

        reservation.length > 0 ? 
            <div> 
                <h3 className="sub-head">History:</h3>
                    {reservation.map((res) => (
                        
                        <div className="parking-lot-container" key={res.id}>
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
                    
                        </div>
                    ))}
            </div> : 

            <div className="page-null-cont">
                <div>
                <div className="page-hint-icon">📄</div>
                <h3>Reserve your 1st lot to create history!</h3>
                </div>
            </div>
    )


}


export default History