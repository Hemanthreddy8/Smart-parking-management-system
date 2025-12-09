import React, { use } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom"
import {useNavigate, useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import LoadingScreen from "./loading";
import "../Invoice.css"


const Invoice = () => {

    const [userData] = useOutletContext()
    const { rid } = useParams();

    const [reservation, setReservationData] = useState({});
    const navigate = useNavigate()


    const fetchReservationData = async (rid) => {
        try {
            const reserDoc = await getDoc(doc(db, `users/${userData.uid}/reservations`, rid));
            if (reserDoc.exists()) {
                console.log("Reservation Data:", reserDoc.data());
                setReservationData(reserDoc.data());
            } else {
                alert("No such reservation lot found!");
                navigate("/home/reservation");
            }
        } catch (error) {
            console.error("Error fetching reservation data:", error);
        }
    };


    useEffect(() => {
        if (userData) {
            fetchReservationData(rid)
        }
    }, [userData])

    const {
        parkingName,
        parkingAddress,
        lisencePlate,
        vehicleType,
        from,
        to,
        amountPaid,
        Timestamp,
    } = reservation;

    const downloadInvoice = () => {
        const doc = new jsPDF();
    
        // Title
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("Parking Invoice", 14, 20);
    
        // Date, Name, and Contact Details
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Date: ${new Date(Timestamp).toLocaleString()}`, 14, 30);
        doc.text(`Name: ${userData.fullName}`, 14, 40);
        doc.text(`Email: ${userData.email}`, 14, 50);
        doc.text(`Phone: ${userData.phone}`, 14, 60);
    
        // Draw a horizontal line
        doc.setLineWidth(0.5);
        doc.line(14, 65, 200, 65); // x1, y1, x2, y2
    
        // Reservation Details
        doc.setFontSize(12);
        doc.text(`Parking Lot: ${parkingName}`, 14, 75);
        doc.text(`Address: ${parkingAddress}`, 14, 85);
        doc.text(`Vehicle Type: ${vehicleType}`, 14, 95);
        doc.text(`License Plate: ${lisencePlate}`, 14, 105);
        doc.text(`From: ${from}`, 14, 115);
        doc.text(`To: ${to}`, 14, 125);
    
        // Total Amount Section
        doc.setFont("helvetica", "bold");
        doc.text(`Total Amount: ₹${amountPaid}`, 14, 135);
    
        // Draw another line to separate the total amount section
        doc.setLineWidth(0.5);
        doc.line(14, 140, 200, 140); // x1, y1, x2, y2
    
        // Footer Section (Optional)
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.text("Thank you for using our service!", 14, 150);
    
        // Save the PDF
        doc.save(`invoice_${lisencePlate}_${Date.now()}.pdf`);
    };

    return (

        userData && reservation ?
        
        <div className="invoice-container">
            <h3>Invoice</h3>
            <p><strong>Date:</strong> {new Date(Timestamp).toLocaleString()}</p>
            <p><strong>Name:</strong> {userData.fullName}</p>
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Phone:</strong> {userData.phone}</p>
            <p><strong>Parking Lot:</strong> {parkingName}</p>
            <p><strong>Address:</strong> {parkingAddress}</p>
            <p><strong>Vehicle Type:</strong> {vehicleType}</p>
            <p><strong>License Plate:</strong> {lisencePlate}</p>
            <p><strong>From:</strong> {from}</p>
            <p><strong>To:</strong> {to}</p>
            <p><strong>Total Amount:</strong> ₹{amountPaid}</p>

            <button onClick={downloadInvoice} className="download-btn">Download PDF</button>
        </div> :
        <LoadingScreen />
    );
};

export default Invoice;
