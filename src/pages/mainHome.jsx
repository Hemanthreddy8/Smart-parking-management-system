import { useEffect, useState } from "react";
import QuickAccessBtns from "../quick-access-btns"
import { useOutletContext } from "react-router-dom"
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import AlertCards from "../AlertCards";



function MainHome(){

    const [userData] = useOutletContext()

    const [alerts, setAlerts] = useState([])

    const fetchRecentAlerts = () => {
        setAlerts([]); // Clear existing alerts
    
        try {
            const alertsQuery = query(
                collection(db, `users/${userData.uid}/alerts`),
                orderBy("timestamp", "desc"), // Order by latest timestamp
                limit(5) // Retrieve only top 5 alerts
            );
    
            // Real-time listener for alerts
            const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
                const alertData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                console.log("Recent Alerts:", alertData);
                setAlerts(alertData);
            });
    
            return unsubscribe; // Cleanup function
    
        } catch (error) {
            console.error("Error fetching alerts:", error);
        }
    };


    useEffect(() => {
        if(userData){
            fetchRecentAlerts()
        }
    }, [userData]);

    return(

        <div className="main-home-cont">
            
            <div className="welcome-msg"><h3>Welcome, {userData ? userData.fullName : "Loading..."}</h3></div>

            <hr></hr>
        
            <div className="quick-access-cont">
            
                <h4>Quick access links</h4>
                <div className="quick-access">

                    <QuickAccessBtns icon={"❓"} desc={"Find Parking"} link={"/home/parkings/find"}/>             
                    <QuickAccessBtns icon={"🔃"} desc={"History"} link={"/home/history"}/>             
                    <QuickAccessBtns icon={"💵"} desc={"Payments"} link={"/home/payments"}/>             
                    <QuickAccessBtns icon={"📄"} desc={"Reservations"} link={"/home/reservation"}/>             
                    <QuickAccessBtns icon={"⚠️"} desc={"Alerts"} link={"/home/alerts"}/>             
                    <QuickAccessBtns icon={"🙍🏽‍♂️"} desc={"Profile"} link={"/home/profile"}/>             

                    
                </div>
            </div>

            <hr></hr>

            <div className="recent-alerts-cont">
                <h4>Recent Alerts</h4>
                <div className="log-display">
                    {alerts.map((alert) => (
                        <AlertCards 
                            key={alert.id} 
                            alertTitle={alert.title} 
                            alertId={"#" + alert.id} 
                            alertTime={new Date(alert.timestamp.seconds * 1000).toLocaleString()} 
                            
                        />
                    ))}
                </div>
            </div>

        </div>

    )

}

export default MainHome