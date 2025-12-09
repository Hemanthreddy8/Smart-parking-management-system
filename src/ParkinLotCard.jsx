import { use, useState } from "react";
import { Link } from "react-router-dom"
import { getDoc, doc } from "firebase/firestore";
import { db } from "./firebase";


function ParkingLotCard(props){


    // const getParkingData = async ()=>{
    //     const parkingDoc = await getDoc(doc(db, "parking-dyn-info", props.data.id));
    //     console.log(props.data.id)
    //     if (parkingDoc.exists()) {
    //         console.log(parkingDoc.data())
    //         return parkingDoc.data()
    //         // return userDoc.data(); // Return user details
    //     } else {
    //         console.log("No user data found!");

    //     }
    // }

    // useState(()=>{

    //     const getInfo= async ()=>{
    //         const data = await getParkingData()
    //         return data
    //     }

    //     getInfo().then((data)=>{
            
    //         setParkingLotData(data)
    //     })  
    //     // console.log(parkingLotData.rating.avgrate)
    // },[])

    useState(()=>{
        console.log(props.data)
    })

    return (

        <Link className="parking-lot-card" key={props.index} to={`/home/parkings/${props.data.id}`}>
            {/* <h5 className="parking-lot-name">{props.Name}</h5> */}
            {/* <p>Location: {parkingLot.admin}</p> */}
            {/* <p>Capacity: {props.capacity}</p> */}

            <div className="top-cont">
                <div>
                    <h4 className="parking-lot-name">{props.data.Name}</h4>
                    <p>{props.data.address}</p>
                </div>
                
                <div className="right">
                    <h4 className="ratings">⭐{props.data.dynamic.rating.avgrate.toFixed(1)}</h4>
                    <div className="status"><div className="stat-indicator"></div><p>{props.data.dynamic.status}</p></div>
                </div>
            </div>


        </Link>
    )
}

export default ParkingLotCard