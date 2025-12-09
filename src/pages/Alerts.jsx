import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";   
import { db } from "../firebase";
import { useOutletContext } from "react-router-dom";
import AlertCards from "../AlertCards";


function Alerts() {
    const [userData] = useOutletContext();
    const [searchQuery, setSearchQuery] = useState("");
    const [alertArr, setAlertArr] = useState([]);        

    useEffect(() => {
        async function fetchAlerts() {
            try {
                // Create a query to order alerts by timestamp in descending order
                const alertsRef = collection(db, `users/${userData.uid}/alerts`);
                const alertQuery = query(alertsRef, orderBy('timestamp', 'desc'));
                
                const alertSnapshot = await getDocs(alertQuery);
                const alertData = alertSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAlertArr(alertData);
                console.log(alertData)
            } catch (error) {
                console.error("Error fetching alerts:", error);
            }
        }
        if (userData) fetchAlerts();
    }, [userData]);
    
    const filteredAlerts = alertArr.filter(alert => 
        alert.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="log-container">
            <h2>User Alerts</h2>
            <hr/>
            <input 
                type="text" 
                placeholder="Search alerts..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-logs-input"
            />
            <div className="log-display">
                {filteredAlerts.map((alert, index) => (
                    <AlertCards 
                        // className={`alert-item ${alert.title.toLowerCase().includes("urgent") ? "urgent-alert" : ""}`} 
                        key={alert.id} 
                        alertTitle={alert.title} 
                        alertId={"#" + alert.id} 
                        alertTime={new Date(alert.timestamp.seconds * 1000).toLocaleString()} 
                        alertMessage={alert.message}
                    />
                ))}
            </div>
        </div>
    );
}

export default Alerts;