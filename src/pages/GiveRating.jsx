import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import Cards from "../Cards";
import LoadingScreen from "./loading";
import { db } from "../firebase";
import { doc, getDoc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import { collection } from "firebase/firestore";
import { FaStar } from "react-icons/fa";

function Rating() {
    const navigate = useNavigate();
    const { pid } = useParams();
    const { user } = useAuth();
    const [parkingLotData, setParkingLotData] = useState(null);
    const [parkingDynData, setParkingDynData] = useState(null);
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(null);
    const [_, userData] = useOutletContext();

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

    useEffect(() => {
        if (!pid) return;
        fetchParkingData(pid);
        const parkingDynRef = doc(db, "parking-dyn-info", pid);
        const unsubscribe = onSnapshot(parkingDynRef, (snapshot) => {
            if (snapshot.exists()) {
                setParkingDynData(snapshot.data());
            }
        });
        return () => unsubscribe();
    }, [pid]);

    const submitRating = async () => {
        if (!rating) return alert("Please select a rating");
        const slotRef = doc(db, "parking-dyn-info", pid);
        const newNUsers = (parkingDynData.rating?.nusers || 0) + 1;
        const newAvgRate = ((parkingDynData.rating?.avgrate || 0) * (newNUsers - 1) + rating) / newNUsers;

        await updateDoc(slotRef, {
            "rating.nusers": newNUsers,
            "rating.avgrate": newAvgRate,
        });
        alert("Rating submitted successfully!");
    };

    if (!parkingLotData || !parkingDynData) {
        return <LoadingScreen />;
    }

    return (
        <div className="ind-parking-lot-details-cont">
            <h3 className="parking-name">{parkingLotData.Name}</h3>
            <p className="parking-address">{parkingLotData.address}</p>

            <hr />
            <h5>Ratings ({parkingDynData.rating?.nusers || 0}) ⭐ {parkingDynData.rating?.avgrate?.toFixed(1) || "N/A"}</h5>
            <div className="rating-stars">
                {[...Array(5)].map((star, index) => {
                    const currentRating = index + 1;
                    return (
                        <label key={index}>
                            <input
                                type="radio"
                                name="rating"
                                value={currentRating}
                                onClick={() => setRating(currentRating)}
                                style={{ display: "none" }}
                            />
                            <FaStar
                                size={30}
                                color={currentRating <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                                onMouseEnter={() => setHover(currentRating)}
                                onMouseLeave={() => setHover(null)}
                            />
                        </label>
                    );
                })}
            </div>
            <button className="submit-rating" onClick={submitRating}>Submit Rating</button>
        </div>
    );
}

export default ParkingLotDetails;
