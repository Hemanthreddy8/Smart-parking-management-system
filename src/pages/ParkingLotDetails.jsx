import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import Cards from "../Cards";
import LoadingScreen from "./loading";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { collection } from "firebase/firestore";
// import LoadingScreen from "./loading";
import { FaStar } from "react-icons/fa";
import { AddUserAlert } from "../RecordLog";

function ParkingLotDetails() {
    const navigate = useNavigate();
    const { pid } = useParams();
    const { user, logout } = useAuth();
    const [parkingLotData, setParkingLotData] = useState(null);
    const [parkingDynData, setParkingDynData] = useState(null);
    const [startTime, setStartTime] = useState("")
    const [endTime, setEndTime] = useState("")
    const [vehType, setVehType] = useState("Car")
    const [lisence, setLisence] = useState("")
    const [showPopup, setShowPopup] = useState(false);
    const [_, userData] = useOutletContext()
    const [loading, setLoading] = useState()
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    const [lisencePart1, setLisencePart1] = useState("");
    const [lisencePart2, setLisencePart2] = useState("");
    const [lisencePart3, setLisencePart3] = useState("");
    const [lisencePart4, setLisencePart4] = useState("");

    const indianStateCodes = [
        "AP", "AR", "AS", "BR", "CG", "GA", "GJ", "HR", "HP", "JH", "KA", "KL", "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "PB", "RJ", "SK", "TN", "TS", "TR", "UP", "UK", "WB", "AN", "CH", "DH", "DD", "JK", "LA", "LD", "DL", "PY"
    ];

    const handleStartTimeChange = (e) => setStartTime(e.target.value);
    const handleEndTimeChange = (e) => setEndTime(e.target.value);
    const handleVehTypeChange = (e) =>{
         setVehType(e.target.value);
        //  setTimeout(()=>{
        //     console.log(vehType)
        //  },2000)
    }

    useEffect(() => {
        setLisence(`${lisencePart1}${lisencePart2}${lisencePart3}${lisencePart4}`);
    }, [lisencePart1, lisencePart2, lisencePart3, lisencePart4]);

    useEffect(() => {
        if (startTime && endTime && parkingDynData?.pricing) {
            const start = new Date(`1970-01-01T${startTime}:00`).getTime();
            const end = new Date(`1970-01-01T${endTime}:00`).getTime();
            const hours = Math.max((end - start) / (1000 * 60 * 60), 0); // Ensure non-negative
            const pricePerHour = parkingDynData.pricing[vehType] || 0;
            setTotalCost(hours * pricePerHour);
        }
    }, [startTime, endTime, vehType, parkingDynData]);

    // Fetch Static Parking Data (One-time fetch)
    const fetchParkingData = async (pid) => {
        try {
            const parkingDoc = await getDoc(doc(db, "parking-lots", pid));
            if (parkingDoc.exists()) {
                setParkingLotData(parkingDoc.data());
            } else {
                alert("No such parking lot found!");
                navigate("/home/parkings/find");
            }
        } catch (error) {
            console.error("Error fetching parking lot data:", error);
        }
    };


    // Real-Time Updates for Dynamic Parking Data
    useEffect(() => {
        if (!pid) return;

        // Fetch Static Data once
        fetchParkingData(pid);

        // Listen for real-time updates in Firestore
        const parkingDynRef = doc(db, "parking-dyn-info", pid);
        const unsubscribe = onSnapshot(parkingDynRef, (snapshot) => {
            if (snapshot.exists()) {
                setParkingDynData(snapshot.data());
            } else {
                console.log("No real-time data available for this parking lot.");
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [pid]);

    useEffect(()=>{
        if(userData){
            console.log(userData)
        }
    },[userData])

    if (!parkingLotData || !parkingDynData) {
        return <LoadingScreen />;
    }


    const submitRating = async () => {
        if (!rating) return alert("Please enter a rating out of 5");
        if (rating < 1 || rating > 5) return alert("Rating must be between 1 and 5");
        
        const slotRef = doc(db, "parking-dyn-info", pid);
        const newNUsers = (parkingDynData.rating?.nusers || 0) + 1;
        const newAvgRate = ((parkingDynData.rating?.avgrate || 0) * (newNUsers - 1) + rating) / newNUsers;
    
        await updateDoc(slotRef, {
            "rating.nusers": newNUsers,
            "rating.avgrate": newAvgRate,
        });
        alert("Rating submitted successfully!");
    };






    const bookParkinglot = async () => {
        try {

            console.log(parkingDynData)
          if (parkingDynData.remaining == 0) {
            alert("Parking lot is currently full, Sorry! :(");
            return;
          }

          if(startTime == "" || endTime == "" || lisence == ""){
            alert("Please fill all the fields")
            return
          }

          
          if (totalCost > userData.balance) {
            alert("Insufficient balance. Please recharge.");
            return;
          }
      
          const userRef = doc(db, `users/${user.uid}`);
          await updateDoc(userRef, { balance: userData.balance - totalCost });


          // Step 2: Create a new reservation document
          const reservationRef = doc(collection(db, `reservations/${parkingDynData.pid}/list`));
          const reservationId = reservationRef.id;
      
          const reservationData = {
            userId: user.uid,
            parkingName : parkingLotData.Name,
            parkingAddress : parkingLotData.address,
            parkingLotId: parkingDynData.pid,
            from: startTime,
            to : endTime,
            status: "not-used",
            lisencePlate : lisence,
            vehicleType : vehType,
            amountPaid : totalCost,
            Timestamp: Timestamp.now(),
            date: new Date().toLocaleDateString(),
          };

          const reservationDataAdmin = {
            userId: user.uid,
            userName: userData.fullName,
            userEmail: userData.email,
            userPhone: userData.phone,
            from: startTime,
            to : endTime,
            status: "not-used",
            lisencePlate : lisence,
            vehicleType : vehType,
            amountPaid : totalCost,
            Timestamp: Timestamp.now(),
            date: new Date().toLocaleDateString(),

          };
      
          await setDoc(reservationRef, reservationDataAdmin);
      
          // Step 3: Update `parking-dyn-info` to mark the slot as occupied
          const slotRef = doc(db, "parking-dyn-info", pid)
          await updateDoc(slotRef, {regusers: parkingDynData.regusers + 1, reservations : parkingDynData.reservations + 1});
      
          // Step 4: Store reservation under `users/{userId}/reservations`
          const userReservationRef = doc(db, `users/${user.uid}/reservations/${reservationId}`);
          await setDoc(userReservationRef, reservationData);

          AddUserAlert(user.uid, "Parking Slot Reserved", `Your parking slot has been reserved from ${startTime} to ${endTime}.`)
          AddUserAlert(user.uid, "Payment Successful", `Your payment of ₹${totalCost} has been successfully processed.`)
      
          alert("Parking slot reserved successfully!");

          setShowPopup(false)
      
        } catch (error) {
          console.error("Error booking slot:", error);
        }
    };

    const handleRatingChange = (e) => {
        setRating(e.target.value)
        console.log(e.target.value)
    }

    const totalSpots = parkingLotData.capacity;
    const availableSpots = parkingDynData.remaining;
    const occupiedSpots = totalSpots - availableSpots;

    const generateParkingSlots = () => {
      return Array.from({ length: totalSpots }, (_, index) => {
          const isAvailable = index < availableSpots;
          return (
              <div
                  key={index}
                  className={`parking-slot ${isAvailable ? "available" : "occupied"}`}
              >
                  {isAvailable ? <div className="parking-spot avilable-spot">🟢</div> : <div className="parking-spot occu-spot">🔴</div>}
              </div>
          );
      });
    };


    const openPopup = ()=>{
        const home = document.querySelector(".popup-overlay")
        if(showPopup){
            // home.style.backgroundColor = "#fff"
            home.style.backdropFilter="none"
        }else{
            setTimeout(()=>{
                const home = document.querySelector(".popup-overlay")
                // home.style.backgroundColor = "#fff"

                home.style.backdropFilter="blur(10px)"
            },100)

        }


        setShowPopup(!showPopup)
    }

    return (

        loading ? <LoadingScreen /> : 

        <div className="ind-parking-lot-details-cont">
            <h3 className="parking-name">{parkingLotData.Name}</h3>
            <p className="parking-address">{parkingLotData.address}</p>

            <hr />

            <div className="rating-veh-types-cont">
                <h5>Ratings ({parkingDynData.rating?.nusers || 0}) ⭐ {parkingDynData.rating?.avgrate.toFixed(2) || "N/A"}</h5>

                <div className="veh-types">
                    {parkingLotData.vehicleTypes?.length > 0 ? (
                        parkingLotData.vehicleTypes.map((vehType, index) => (
                            <div key={index} className="veh-type">{vehType}</div>
                        ))
                    ) : (
                        <p>No vehicle types available</p>
                    )}
                </div>
            </div>

            <hr />

            <div className="crnt-stats">
                <Cards cardName={"Total Lots"} cardVal={parkingLotData.capacity} />
                <Cards cardName={"Available"} cardVal={parkingDynData.remaining || "N/A"} />
                <Cards cardName={"Users"} cardVal={parkingDynData.regusers || "N/A"} />
            </div>

            <div className="lot-pricing">
                <h4 className="sub-head">Lot Pricing</h4>
                <div className="pricing-cont">
                    {parkingDynData.pricing ? (
                        Object.entries(parkingDynData.pricing).map(([vehicleType, price], index) => (
                            <div key={index} className="pricing-card">
                                <h5>{vehicleType}</h5>
                                <p>₹{price ? price : "N/A"}/hr</p>
                            </div>
                        ))
                    ) : (
                        <p>Pricing details unavailable</p>
                    )}
                </div>
            </div>

            {/* <div style={{height:"50vh"}}></div> */}

            <hr></hr>

            <div className="lot-configuration">
                <h4 className="sub-head">Lot Configuration</h4>
                <div className="parking-grid" style={{gridTemplateColumns:`repeat(${Math.min(10, totalSpots)}, 1fr)`}}>
                    {generateParkingSlots()}
                </div>
                <div className="legend">
                    <span className="legend-item"><span className="legend-color available">🟢</span> Available</span>
                    <span className="legend-item"><span className="legend-color occupied">🔴</span> Occupied</span>
                </div>
            </div>


            <div className="rating-feedback">
                <h4>Rate this Parking Lot (Out of 5) :</h4>
                <input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                />
                <button className="submit-rating" onClick={submitRating} disabled={!rating}>Rate</button>
            </div>




            <div className="book-cont">
                <div>
                <button className="book-btn" style={{width:"100%"}} onClick={openPopup}>Book Now</button>
                </div>
            </div>



          

            


            {showPopup && (
                <div className="popup-overlay">
                <div className="popup-container">
                    <h2>Enter Parking Information</h2>
                    <div>
                    <div>
                        <label>Start Time:</label>
                        <input
                        type="time"
                        value={startTime}
                        onChange={handleStartTimeChange}
                        required
                        />
                    </div>

                    <div>
                        <label>End Time:</label>
                        <input
                        type="time"
                        value={endTime}
                        onChange={handleEndTimeChange}
                        required
                        />
                    </div>

                    <div>
                        <label>Vehicle Type:</label>
                        {/* <input
                        type="text"
                        value={vehType}
                        onChange={handleVehTypeChange}
                        placeholder="Enter vehicle type"
                        required
                        /> */}

                        <select className={"veh-type-sel"} onChange={handleVehTypeChange}>
                        {
                            parkingLotData.vehicleTypes.map((vehType, index) => (
                                <option key={index} value={vehType}>{vehType}</option>
                            ))
                        }
                        </select>
                    </div>

                    <div>
                        <label>License Plate:</label>
                        <div className="license-inputs">
                            {/* Indian State Code Selection */}
                            <select 
                                className="state-code-select"
                                value={lisencePart1} 
                                onChange={(e) => setLisencePart1(e.target.value)} 
                                required
                            >
                                <option value="">State</option>
                                {indianStateCodes.map((code) => (
                                    <option key={code} value={code}>{code}</option>
                                ))}
                            </select>

                            {/* Two-digit Number (YY) */}
                            <input 
                                type="text" 
                                value={lisencePart2} 
                                onChange={(e) => {
                                    if (/^\d{0,2}$/.test(e.target.value)) setLisencePart2(e.target.value);
                                }} 
                                placeholder="YY" 
                                maxLength="2"
                                required 
                            />

                            {/* Two-letter Alphabet Code (XX) */}
                            <input 
                                type="text" 
                                value={lisencePart3} 
                                onChange={(e) => {
                                    if (/^[A-Za-z]{0,2}$/.test(e.target.value)) setLisencePart3(e.target.value.toUpperCase());
                                }} 
                                placeholder="XX" 
                                maxLength="2"
                                required 
                            />

                            {/* Four-digit Number (YYYY) */}
                            <input 
                                type="text" 
                                value={lisencePart4} 
                                onChange={(e) => {
                                    if (/^\d{0,4}$/.test(e.target.value)) setLisencePart4(e.target.value);
                                }} 
                                placeholder="YYYY" 
                                maxLength="4"
                                required 
                            />
                        </div>
                    </div>

                    <div className="total-cost">
                        <h4>Total Cost:</h4>
                        <p>₹{totalCost}</p>
                    </div>



                    <div className="button-container">
                        <button type="submit" onClick={bookParkinglot} disabled={totalCost > userData.balance}>
                                {totalCost > userData.balance ? "Insufficient Balance" : `Confirm & Pay`}
                        </button>
                        <button type="button" onClick={openPopup}>
                        Cancel
                        </button>
                    </div>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
}

export default ParkingLotDetails;
