import { use, useEffect, useState } from "react"
import { useOutletContext, useNavigate } from "react-router-dom"
import { getDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "../firebase"
import LoadingScreen from "./loading"


function LotConfig(){

    const navigate = useNavigate()

    const [userData, adminData] = useOutletContext()
    const [pricingData, setPricingData] = useState({})



    const [parkingLotData, setParkingLotData] = useState(null)
    const [parkingLotStatData, setParkingLotStatData] = useState(null)
    const [loading, setLoading] = useState(false)

    const getParkingData = async ()=>{
        const parkingDoc = await getDoc(doc(db, "parking-dyn-info", adminData.parkingLotId));
        if (parkingDoc.exists()) {
            // console.log(parkingDoc.data())
            setParkingLotData(parkingDoc.data())
            // return userDoc.data(); // Return user details
        } else {
            console.log("No user data found!");
            return null;
        }

        const parkingStatDoc = await getDoc(doc(db, "parking-lots", adminData.parkingLotId));
        if (parkingStatDoc.exists()) {
            // console.log(parkingDoc.data())
            setParkingLotStatData(parkingStatDoc.data())
            // return userDoc.data(); // Return user details
        } else {
            console.log("No user data found!");
            return null;
        }
    }

    const handlePricingChange = (e) => {
        const type = e.target.name; // the property you're changing
        const value = e.target.value; 
    
        setPricingData((prevData) => ({
            ...prevData,
            [type]: parseInt(value),
        }));
            // setTimeout(()=>{
            //     console.log(pricingData)
            // },1000) 

    };

    useEffect(()=>{
        getParkingData()
    },[adminData])

    useEffect(()=>{
        if(parkingLotData){
            setPricingData(parkingLotData.pricing)
            // setTimeout(()=>{
            //     console.log(pricingData)
            // },1000) 
        }
    },[parkingLotData])

    useEffect(()=>{
        // console.log("Pri",userData, adminData.parkingLotId)
        if(adminData && adminData.parkingLotId==null){
            navigate("/admin/new-lot")
            console.log("No Parking Lot ID found")
        }
        console.log(userData)
    },[])

    const storePricingChange = async ()=>{
        setLoading(true)
        try {
            const parkRef = doc(db, "parking-dyn-info", adminData.parkingLotId); 
            await updateDoc(parkRef, { pricing: pricingData }); 
            alert("Pricing updated successfully!");
            await RecordLog(adminData.aid, `Pricing Changed`, `Admin has changed the pricing of parking`);
        } catch (error) {
            console.error("Error updating", error);
            // alert("Failed to update pricing.");
        // setLoading(false)

        }
        setLoading(false)
        // location.reload()
    }


    return(

        !parkingLotData || loading || !parkingLotStatData ? <LoadingScreen/> :

        <div className="lot-config-cont">

            <h3>Your Lot</h3>

            <hr></hr>

            <h4>Name:{parkingLotStatData.Name}</h4>
            <h5>{parkingLotStatData.address}</h5>


            <hr></hr>

            <div>
                <h4>Change pricing:</h4>

                <div className="pricing-change-cont">
                {

                    Object.keys(parkingLotData.pricing).map(key => {
                        // console.log(`<div>${key} : ${parkingLotData.pricing[key]}</div>`);
                        return (
                            // <div className="price-change-i-cont">
                            <>
                            <div key={key} className="price-change-name">{key} : </div>
                            <input name={key} value={pricingData[key]} type="number" onChange={(e)=>{handlePricingChange(e)}}/>
                            </>
                        )
                    })

                }
                    <button className="submit-btn" onClick={storePricingChange}>Save Changes</button>
                </div>

            </div>

            
        </div>
    )


}

export default LotConfig