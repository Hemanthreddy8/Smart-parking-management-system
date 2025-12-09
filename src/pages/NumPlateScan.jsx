import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { db } from "../firebase";
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { RecordLog, AddUserAlert } from "../RecordLog";



const NumberPlateScanner = () => {
    const [userData, adminData] = useOutletContext()
    const [image, setImage] = useState(null);
    const [detectedPlate, setDetectedPlate] = useState("");
    const [reservation, setReservations] = useState([])


    const handleFileChange = (event) => {
        setImage(event.target.files[0]);
    };


 
    const fetchActiveReservations = () => {
        setReservations([]); // Clear existing reservations

        try {
            const reservationsQuery = query(
                collection(db, `reservations/${adminData.parkingLotId}/list`),
                where("lisencePlate", "==", detectedPlate),
                where("status", "in", ["not-used", "active"])
            );

            // Set up real-time listener
            const unsubscribe = onSnapshot(reservationsQuery, (snapshot) => {
                const resData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Real-time Reservations:", resData);
                setReservations(resData);
            });

            // Return the unsubscribe function to clean up the listener when needed
            return unsubscribe;

        } catch (error) {
            console.error("Error fetching reservations:", error);
        }
    };


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
        if(detectedPlate != ""){
            fetchActiveReservations()
        }

    },[detectedPlate])

    const handleUpload = async () => {
        if (!image) {
        alert("Please select an image.");
        return;
        }

        const formData = new FormData();
        formData.append("file", image);

        try {
        const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        setDetectedPlate(response.data.plate_number);
        } catch (error) {
        console.error("Error detecting plate:", error);
        setDetectedPlate("Error detecting plate");
        }
    };

    return (
        <div className="scanner-container">
            <h2 className="text-xl font-bold">Number Plate Scanner</h2>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div className="book-cont">

            <button onClick={handleUpload} style={{width:"100%"}} className="book-btn">
                Upload and Detect
            </button>
        </div>
        {detectedPlate && <p className="mt-4 text-lg font-semibold">Detected Plate: {detectedPlate}</p>}

        {reservation.length != 0 ? 
        reservation.map((res) => (
                        
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


                {
                    res.status=="active"?
                    <div className="button-container">
                    <button style={{backgroundColor:"red"}} className="cancel-btn" onClick={(e)=>closeReservation(res.id, res.userId)}>Close</button>
                    </div>:
                    <div className="button-container">
                    <button style={{backgroundColor:"green"}} className="cancel-btn" onClick={(e)=>activateReservation(res.id, res.userId)}>Activate</button>
                    </div>
                    
                }
                

                

                
        
            </div>
        )) :
        <div>Reservation Not found</div> 
        }
        </div>

        

        
    );
};

export default NumberPlateScanner;
