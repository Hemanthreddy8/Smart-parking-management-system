// import { db } from "../firebase";
// import { useAuth } from "../AuthContext";
// import { useEffect, useState } from "react";    
// import { getDocs, doc, collection } from "firebase/firestore";

// import LoadingScreen from "./loading";
// import ParkingLotCard from "../ParkinLotCard";
// import { Outlet } from "react-router-dom";



// function Parkings(){

//     const { user, logout } = useAuth();
//     const [parkingLots, setParkingLots] = useState([]);
//     const [loading, setLoading] = useState(false);


    

//    const getParkings = async () => {	
//         setLoading(true);
        
//         const querySnapshot = await getDocs(collection(db, "parking-lots"));
    
//         // Transform documents into an array including id
//         const parkingData = querySnapshot.docs.map(doc => ({
//             id: doc.id,  // Store document ID
//             ...doc.data() // Store document data
//         }));
    
//         setParkingLots(parkingData); // Update state with new array
        
//         console.log("Parkings ", parkingData);
//         setLoading(false);
//     };

//     useEffect(() =>{
//         getParkings()
//     },[])

//     return(
//         <Outlet context={[parkingLots]}/>

//     )

// }


// export default Parkings;


import { db } from "../firebase";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";

import { Outlet, useOutletContext } from "react-router-dom";

function Parkings() {
  const { user } = useAuth();
  const [userData] = useOutletContext()
  const [parkingLots, setParkingLots] = useState({});
  const [loading, setLoading] = useState(false);

  const getParkings = async () => {
    setLoading(true);

    // Fetch static parking lot data
    const staticSnapshot = await getDocs(collection(db, "parking-lots"));
    const staticData = staticSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = { id: doc.id, ...doc.data() };
      return acc;
    }, {});

    // Fetch dynamic parking info
    const dynamicSnapshot = await getDocs(collection(db, "parking-dyn-info"));
    const dynamicData = dynamicSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = { ...doc.data() };
      return acc;
    }, {});

    // Merge both static and dynamic data
    const mergedData = Object.keys(staticData).reduce((acc, key) => {
      acc[key] = {
        ...staticData[key],
        dynamic: dynamicData[key] || {}, // Include dynamic values if they exist
      };
      return acc;
    }, {});

    setParkingLots(mergedData);
    console.log("Merged Parking Data:", mergedData);
    setLoading(false);
  };

  useEffect(() => {
    getParkings();
  }, []);

  return <Outlet context={[parkingLots, userData]} />;
}

export default Parkings;
