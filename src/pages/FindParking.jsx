import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";    
import { getDocs, doc, collection } from "firebase/firestore";

import LoadingScreen from "./loading";
import ParkingLotCard from "../ParkinLotCard";
import { Link, useOutletContext } from "react-router-dom";

function FindParking(){

    const [parkingLots, userData] = useOutletContext()
    const [searchQuery, setSearchQuery] = useState("");
    const [vehicleType, setVehicleType] = useState("");


    const { user, logout } = useAuth();
    // const [parkingLots, setParkingLots] = useState([]);
    const [loading, setLoading] = useState(false);

    // const getParkings = async () => {	
    //     setLoading(true);
        
    //     const querySnapshot = await getDocs(collection(db, "parking-lots"));
    
    //     // Transform documents into an array including id
    //     const parkingData = querySnapshot.docs.map(doc => ({
    //         id: doc.id,  // Store document ID
    //         ...doc.data() // Store document data
    //     }));
    
    //     setParkingLots(parkingData); // Update state with new array
        
    //     console.log("Parkings ", parkingData);
    //     setLoading(false);
    // };

    // useEffect(() =>{
    //     getParkings()
    // },[])

    // useEffect(() => {
    //     // console.log("Pale :",parkingLots) 
    // },[parkingLots])



    const filteredParkings = Object.keys(parkingLots).filter(
        parkingLot => parkingLots[parkingLot].Name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const parkingArray = Object.values(parkingLots);

    const filteredParkings2 = parkingArray.filter(parkingLot => {
        const nameMatches = parkingLot.Name.toLowerCase().includes(searchQuery.toLowerCase());
        const vehicleMatches = vehicleType === "" || parkingLot.vehicleTypes.includes(vehicleType);
        return nameMatches && vehicleMatches;
    });
    // const filteredParkingsVeh = parkingLots.filter(parkingLot => parkingLot.vehicleTypes.includes(vehicleType));

    return(
        <div className="find-parking-cont">
            
            <h4 className="sub-head">Find Parking spaces:</h4>


            <input 
                type="text" 
                placeholder="🔍Search Parking Lot..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-logs-input"
            />

            <Link className="loc-viewer-icon" to={"https://navigate-to-nearest-parkinglot.streamlit.app/"}><i class="fa-solid fa-location-crosshairs"></i> View in Maps</Link>



            <div className="parking-filters">
                {/* <h4 className="sub-head">Filters:</h4> */}
                <select className="parking-lot-select" onChange={(e) => console.log(e.target.value)}>
                    <option value="loca">Select Location</option>
                    
                    <option value="location2">Amrita AB2 Parking</option>
                    <option value="location3">Amrita AB3 Parking</option>
                    <option value="location4">Amrita ASB Parking</option>
                </select>

                <select className="parking-lot-select">
                    <option value="price-sel">Select Price</option>
                    <option value="low">Low</option>
                    <option value="High">High</option>
                </select>

                <select className="parking-lot-select" onChange={(e) => setVehicleType(e.target.value)}>
                    <option value="">Vehicle Type</option>
                    
                    <option value="Car">Car</option>
                    <option value="2-wheeler">Bike</option>
                    <option value="Truck">Truck</option>
                    <option value="Bus">Bus</option>
                    <option value="MiniTruck">Mini-Truck</option>

                </select>

                

                {/* <button className="search-btn">Apply</button> */}
            </div>

            <hr />

            <div className="parking-lot-cards-cont">
                <div>
                    {loading ? (
                        "Loading..."
                    ) : (
                        // console.log()
                        filteredParkings2.map((parking, index) => (
                            <ParkingLotCard key={index} data={parking} />
                        ))
                    )}
                </div>
            </div>
            
        

        </div>

    )

}


export default FindParking;
