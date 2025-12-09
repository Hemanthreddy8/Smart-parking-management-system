import { use, useEffect } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { collection, addDoc, doc} from "firebase/firestore"; 
import { db } from "../firebase";
import { useState } from "react";
import { updateDoc } from "firebase/firestore";
import { RecordLog } from "../RecordLog";
import { setDoc } from "firebase/firestore";
import LoadingScreen from "./loading";

function NewLotConfig(){

    const navigate = useNavigate()

    const [userData, adminData] = useOutletContext()
    const [Name, setName] = useState("")
    const [address, setaddress] = useState("")
    const [cap, setcap] = useState(0)
    const [open, setopen] = useState(0)
    const [close, setclose] = useState(2400)
    const [parkingLotID, setParkingLotID] = useState("")
    const [allowedVehicles, setAllowedVehicles] = useState({"Car":false,"Bike":false,"Bus":false,"Truck":false,"MiniTruck":false})
    const [loading, setLoading] = useState(false)



    const handleChckChange = (blk)=>{
        const temp = document.querySelector("."+blk)
        if(temp.style.backgroundColor == "green"){
            temp.style.backgroundColor = "var(--main-bg-color-dark)"
        }else{
            temp.style.backgroundColor = "green"
        }
        // console.log(allowedVehicles)
        if(blk=="Car"){
            setAllowedVehicles({...allowedVehicles,Car:!allowedVehicles.Car})
        }else if(blk=="Bike"){
            setAllowedVehicles({...allowedVehicles,Bike:!allowedVehicles.Bike})
        }else if(blk=="Bus"){
            setAllowedVehicles({...allowedVehicles,Bus:!allowedVehicles.Bus})
        }else if(blk=="Truck"){
            setAllowedVehicles({...allowedVehicles,Truck:!allowedVehicles.Truck})
        }else if(blk=="MiniTruck"){
            setAllowedVehicles({...allowedVehicles,MiniTruck:!allowedVehicles.MiniTruck})
        }
    }

    const createParkingLot = async () => {
        setLoading(true)
        try {
            // Filter allowed vehicles
            const allowedVehiclesArr = Object.keys(allowedVehicles).filter(key => allowedVehicles[key]);
    
            // Create a parking lot document in Firestore
            const docRef = await addDoc(collection(db, "parking-lots"), {
                Name: Name,
                address: address,
                adminName: userData.fullName,
                adminContact: userData.email,
                capacity: parseInt(cap),
                operating_hours: {
                    open: open,
                    close: close
                },
                vehicleTypes: allowedVehiclesArr,
            });
    
            console.log("Parking lot created with ID:", docRef.id);
            setParkingLotID(docRef.id); // Update state with the new Parking Lot ID
    
            // Update admin document with the parking lot ID
            const userRef = doc(db, "admins", userData.uid);
            await updateDoc(userRef, { parkingLotId: docRef.id });
            console.log("Admin updated with Parking Lot ID");

            const allowedVehiclesObj = {}

            allowedVehiclesArr.forEach(element => {
                allowedVehiclesObj[element] = 0
            });
    
            // Create dynamic info document for the parking lot
            await setDoc(doc(db, "parking-dyn-info", docRef.id), {
                pid: docRef.id,
                pricing: allowedVehiclesObj,
                rating: {
                    nusers: 0,
                    avgrate: 0
                },
                regusers: 0,
                remaining: parseInt(cap),
                status: "AVAILABLE",
                reservations :0,
                capacity: parseInt(cap),
            });
    
            console.log("Parking dynamic info created");
    
            // Log the event
            await RecordLog(adminData.aid, "Parking Lot Creation", "Admin has created a new Parking lot.");
            console.log("Log recorded");
            setLoading(false)

            navigate("/admin")
    
        } catch (error) {
            console.error("Error creating parking lot:", error);
        }
    };

    useEffect(()=>{
        if(adminData.parkingLotId){
            navigate("admin/lot")
        
        }
        if(userData){
            console.log(userData)
        }
    },[])


    return(
        loading ? <LoadingScreen /> :
        <div className="new-lot-config-cont">
            
            <h4>Create a new Parking Lot</h4>


            <hr></hr>


            <div className="new-parking-lot-form">

                <div className="form-group">
                    <h5>Enter your Parking Lots Name:</h5>
                    <input className="form-inp" type="text" placeholder="Name" onChange={(e) => setName(e.target.value)} required/>
                </div>

                <div className="form-group">
                    <h5>Enter your Parking Lots Address:</h5>
                    <input className="form-inp" type="text" placeholder="Address" onChange={(e) => setaddress(e.target.value)} required/>
                </div>

                <div className="form-group">
                    <h5>Enter your Parking Lots Capacity:</h5>
                    <input className="form-inp" type="number" placeholder="Capacity" onChange={(e) => setcap(e.target.value)} required/>
                </div>

                <div className="form-group">
                    <h5>Parking Lot open Timings:</h5>
                    <div className="time-inp-cont">
                        <input className="form-inp" type="number"  placeholder="Open from 6:00am as 600" onChange={(e) => setopen(e.target.value)} required/>
                        <input className="form-inp" type="number"  placeholder="Closes at 10:00pm as 2000" onChange={(e) => setclose(e.target.value)} required/>
                    </div>
                </div>

                <div className="form-group">
                    
                    <h5>Allowed Vehicles:</h5>
                    {/* <div className="allowed-vehicles-cont">
                        <label htmlFor="vehicle-type-car">
                        <input name="vehicle-type" id="vehicle-type-car" type="checkbox" value={"Car"} onChange={(e)=>handleChckChange(e)}/> 
                        Cars</label>
                        <label htmlFor="vehicle-type-bike">
                        <input name="vehicle-type" id="vehicle-type-bike" type="checkbox" value={"Motorcycle"} onChange={(e)=>handleChckChange(e)} />
                        Motorcycle</label>
                        <label htmlFor="vehicle-type-car">
                        <input name="vehicle-type" id="vehicle-type-bus" type="checkbox" value={"Bus"} onChange={(e)=>handleChckChange(e)}/> 
                        Bus</label>
                        <label htmlFor="vehicle-type-car">
                        <input name="vehicle-type" id="vehicle-type-truck" type="checkbox" value={"Truck"} onChange={(e)=>handleChckChange(e)}/> 
                        Trucks</label>
                        <label htmlFor="vehicle-type-car">
                        <input name="vehicle-type" id="vehicle-type-mini-truck" type="checkbox" value={"Mini-Trucks"} onChange={(e)=>handleChckChange(e)}/> 
                        Mini-Trucks</label>
                    </div> */}

                    <div className="allowed-vehicles-cont">
                        <div className="allowed-vehicle Car" onClick={()=>handleChckChange("Car")}>
                            Car
                        </div>
                        <div className="allowed-vehicle Bike" onClick={()=>handleChckChange("Bike")}>
                            Bike
                        </div>
                        <div className="allowed-vehicle Truck" onClick={()=>handleChckChange("Truck")} >
                            Truck
                        </div>
                        <div className="allowed-vehicle Bus" onClick={()=>handleChckChange("Bus")}>
                            Bus
                        </div>
                        <div className="allowed-vehicle MiniTruck" onClick={()=>handleChckChange("MiniTruck")} >
                            Mini-Truck
                        </div>
                    </div>

                </div>

                <button onClick={createParkingLot} className={"submit-btn"}>Create</button>

            </div>

        </div>
    )


}

export default NewLotConfig