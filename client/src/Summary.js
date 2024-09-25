import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Summary.css'; // Import the CSS file

function Summary() {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/appointments');
                setAppointments(response.data);
            } catch (error) {
                console.error('Error fetching appointments:', error);
            }
        };
        fetchAppointments();
    }, []);

    return (
        <div className="summary-container">
            <h2>Upcoming Appointments</h2>
            <table className="appointments-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(appointment => (
                        <tr key={appointment._id}>
                            <td>{appointment.title}</td>
                            <td>{new Date(appointment.start).toLocaleString()}</td>
                            <td>{new Date(appointment.end).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Summary;
