import { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "../AuthContext";
import "../Payments.css"
import { AddUserAlert } from "../RecordLog"; 

const Payments = () => {
    const { user } = useAuth();  // Get logged-in user details
    const [balance, setBalance] = useState(0);
    const [amount, setAmount] = useState("");  // Amount to add
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;

        // Set up real-time listener for balance updates
        const userRef = doc(db, "users", user.uid);
        const unsubscribe = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
                setBalance(snapshot.data().balance || 0);
            }
        });

        // Cleanup listener on unmount
        return () => unsubscribe();
    }, [user]);

    // Handle amount input change
    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    // Function to add amount to wallet
    const addFunds = async () => {
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            alert("Please enter a valid amount.");
            return;
        }

        setLoading(true);

        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { balance: balance + Number(amount) });

            AddUserAlert(user.uid, "Funds Added", `₹${amount} has been added to your wallet.`);
            alert(`₹${amount} added successfully!`);
            setAmount(""); // Reset input field
        } catch (error) {
            console.error("Error adding funds:", error);
            alert("Failed to add funds. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="payments-container">
            <h2>Wallet Balance</h2>
            <p className="balance">₹{balance}</p>

            <h3>Add Funds</h3>
            <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={handleAmountChange}
            />
            <button onClick={addFunds} disabled={loading}>
                {loading ? "Processing..." : "Add Funds"}
            </button>
        </div>
    );
};

export default Payments;
