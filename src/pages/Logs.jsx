import { useState } from "react";
import WorkLogCards from "../WorkLogCards";
import { useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";   
import { db } from "../firebase";
import { useOutletContext } from "react-router-dom";

function Logs() {
    const [userData, adminData] = useOutletContext();

    const [searchQuery, setSearchQuery] = useState("");
    const [logarr, setLogArr] = useState([]);        

    useEffect(() => {
        console.log(userData.uid)
        async function fetchLogs() {
            try {
                // Create a query to order logs by time in descending order
                const logbookRef = collection(db, `logs/${userData.uid}/logbook`);
                const logQuery = query(logbookRef, orderBy('logtime', 'desc'));
                
                const logSnapshot = await getDocs(logQuery);
                const logData = logSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setLogArr(logData);
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        }
        if (userData) fetchLogs();
    }, [userData.uid]);
    
    const filteredLogs = logarr.filter(log => 
        log.logname.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="log-container">
            <h2>System Logs and Alerts</h2>

            <hr/>

            <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-logs-input"
            />
            <div className="log-display">
                {filteredLogs.map((log, index) => (
                    <WorkLogCards 
                        className={`log-item ${log.logname.toLowerCase().includes("critical") ? "critical-log" : ""}`} 
                        key={log.id} 
                        logname={log.logname} 
                        logid={"#"+log.id} 
                        logtime={new Date(log.logtime.seconds * 1000).toLocaleString()} 
                        logdesc={log.logdesc}
                    />
                ))}
            </div>
        </div>
    );
}

export default Logs;