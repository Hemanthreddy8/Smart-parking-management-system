import QuickAccessBtns from "../quick-access-btns"
import { useOutletContext } from "react-router-dom"
import Cards from "../Cards"
import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import WorkLogCards from "../WorkLogCards"
import LoadingScreen from "./loading"
import { getDoc, doc} from "firebase/firestore"
import { db } from "../firebase"
import { onSnapshot } from "firebase/firestore"
import { collection } from "firebase/firestore"
import { query, orderBy } from "firebase/firestore"


function Dashboard(){

    const navigate = useNavigate();
    const [userData, adminData] = useOutletContext()
    const [parkingLotData, setParkingLotData] = useState(null)
    const [logData, setlogData] = useState([])
    const [loading, setLoading] = useState(false)
    const [demand, setDemand] = useState("Low")

    // const getParkingData = async ()=>{
    //     const parkingDoc = await getDoc(doc(db, "parking-dyn-info", adminData.parkingLotId));
    //     if (parkingDoc.exists()) {
    //         console.log(parkingDoc.data())
    //         setParkingLotData(parkingDoc.data())
    //         // return userDoc.data(); // Return user details
    //     } else {
    //         console.log("No user data found!");
    //         return null;
    //     }
    // }
    useEffect(()=>{
        setLoading(true)
        // document.querySelector(".dashboard").style.filter="blur(10px)"
        const validateAdmin = async ()=>{
        // console.log("Validating admin")
        // console.log(adminData)
        if(userData && !userData.isAdmin){
            alert("You dont have admin access :|");
            navigate("/home")
        }
        }
        validateAdmin()
        setLoading(false)
    },[])


    useEffect(() => {
        if (!adminData) return;


        const getDetails = async ()=>{

            // if(adminData && adminData.parkingLotId==null){
            //     navigate("/admin/new-lot")
            //     console.log("No Parking Lot ID found")
            // }
            console.log(adminData)


            // if(adminData){
            //     await getParkingData()
            // }
        }
        getDetails()

    }, [adminData]);

    useEffect(()=>{
        if(!adminData) return
    
        const logsRef = collection(db, `logs/${adminData.aid}/logbook`);
        const orderedLogsQuery = query(logsRef, orderBy('logtime', 'desc'));
    
        const unsubscribe = onSnapshot(orderedLogsQuery, (querySnapshot) => {
            const logsarr = [];
            querySnapshot.forEach((doc) => {
                logsarr.push({...doc.data(), id:doc.id});
            });
            setlogData(logsarr)
            setTimeout(()=>{
                console.log(logData)
            },2000)
        });
    
        // Cleanup listener on unmount
        return () => unsubscribe();
    },[adminData])

    useEffect(() => {
        if (!adminData) return;
        
        console.log("Ad",adminData)
        // Fetch Static Data once
        // fetchParkingData(pid);

        // Listen for real-time updates in Firestore

        try{
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
        }catch{
            console.log("Data Not Found")
        }
    }, [adminData]);
    
    

    const checkDemand = ()=>{
        if(parkingLotData.remaining<parkingLotData.capacity/3){
            setDemand("High")
            return "High"
        }else if(parkingLotData.remaining<parkingLotData.capacity/2){
            setDemand("Medium")
            return "Medium"
        }else{
            setDemand("Low")
            return "Low"
        }
    }
    

    useEffect(()=>{
        if(parkingLotData){

            checkDemand()
        } 
    }, parkingLotData)





    return(

        !adminData ? <LoadingScreen /> :

        <div className="dashboard">

            <div className="welcome-msg"><h3>Welcome, {userData ? userData.fullName : "Loading..."}</h3></div>

            <hr></hr>
            {
            adminData.parkingLotId==null || !parkingLotData? <i>Create a parking lot to view Dashboard</i> :
            <>            
                <h4>Admin Dashboard</h4>
                <div className="quick-parking-lot-info-cont">

                    
                    <Cards cardName = {"Lots Available"} cardVal={parkingLotData.remaining} />
                    <Cards cardName = {"Lots Occupied"} cardVal={parkingLotData.capacity- parkingLotData.remaining} />
                    <Cards cardName = {"Reservations"} cardVal={parkingLotData.reservations} />
                    <Cards cardName = {"Current Demand"} cardVal={demand} />
                    <Cards cardName = {"Revenue"} cardVal={"$00"} />
                    <Cards cardName = {"Rating"} cardVal={parkingLotData.rating.avgrate ? parkingLotData.rating.avgrate.toFixed(1) : "N/A"} />


                </div>
            </>
            }



            <hr></hr>

            <div className="quick-access-cont">
            
            <h4>Quick access links</h4>
                <div className="quick-access">

                    <QuickAccessBtns icon={"🅿️"} desc={"Your Lot"} link={"/admin/lot"}/>             
                    <QuickAccessBtns icon={"📄"} desc={"Portal"} link={"/admin/portal"}/>             
                    <QuickAccessBtns icon={"💵"} desc={"Payments"} />             
                    <QuickAccessBtns icon={"📄"} desc={"Logs"} link={"/admin/logs"}/>             
                    <QuickAccessBtns icon={"📲"} desc={"Scanner"} link={"/admin/scanner"}/>             
                    <QuickAccessBtns icon={"🙍🏽‍♂️"} desc={"Users"} />             

                    
                </div>

            </div>

            <hr></hr>

            <h4>Recent Activities</h4>

            <div className="recent-log-acts-cont">
                
            {logData.slice(0, 5).map((log, index) => (
                console.log(logData),
                <WorkLogCards 
                    className={`log-item ${log.logname.toLowerCase().includes("critical") ? "critical-log" : ""}`} 
                    key={index} 
                    logname={log.logname} 
                    logid={"#" + log.id} 
                    logtime={new Date(log.logtime.seconds * 1000).toLocaleString()} 
                />
            ))}

            </div>
        </div>

    )

}

export default Dashboard