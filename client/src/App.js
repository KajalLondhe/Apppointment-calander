import './App.css';
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import Summary from './Summary';

// Initialize moment localizer
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

function App() {
    const [appointments, setAppointments] = useState([]);

    // Fetch appointments on component mount
    useEffect(() => {
        fetchAppointments();
    }, []);

    // Fetch appointments from the backend API
    const fetchAppointments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/appointments');
            const formattedAppointments = response.data.map(appointment => ({
                id: appointment._id,
                title: appointment.title,
                start: appointment.start ? new Date(appointment.start) : new Date(),
                end: appointment.end ? new Date(appointment.end) : new Date(),
            }));
            setAppointments(formattedAppointments);
        } catch (error) {
            console.error('Error fetching appointments:', error.response || error.message || error);
        }
    };

    // Create new appointment
    const handleSelectSlot = async ({ start, end }) => {
        const title = prompt('New Appointment Title');
        if (title) {
            try {
                const newAppointment = { title, start, end };
                const response = await axios.post('http://localhost:5000/api/appointments', newAppointment);
                setAppointments([...appointments, {
                    id: response.data._id,
                    title: response.data.title,
                    start: new Date(response.data.start),
                    end: new Date(response.data.end),
                }]);
            } catch (error) {
                console.error('Error creating appointment:', error);
            }
        }
    };

    // Update appointment on drag-and-drop
    const handleEventDrop = async ({ event, start, end }) => {
        try {
            const updatedAppointment = { ...event, start, end };
            await axios.put(`http://localhost:5000/api/appointments/${event.id}`, updatedAppointment); // Update in the database
            setAppointments(
                appointments.map(appointment =>
                    appointment.id === event.id
                        ? { ...appointment, start, end } // Update state to reflect changes
                        : appointment
                )
            );
        } catch (error) {
            console.error('Error updating appointment:', error);
        }
    };

    // Update appointment on resize
    const handleEventResize = async ({ event, start, end }) => {
        try {
            const updatedAppointment = { ...event, start, end };
            await axios.put(`http://localhost:5000/api/appointments/${event.id}`, updatedAppointment); // Update in the database
            setAppointments(
                appointments.map(appointment =>
                    appointment.id === event.id
                        ? { ...appointment, start, end } // Update state to reflect changes
                        : appointment
                )
            );
        } catch (error) {
            console.error('Error resizing appointment:', error);
        }
    };

    // Delete appointment
    const handleDeleteEvent = async (event) => {
        if (window.confirm(`Are you sure you want to delete the appointment "${event.title}"?`)) {
            try {
                await axios.delete(`http://localhost:5000/api/appointments/${event.id}`);
                setAppointments(appointments.filter(appointment => appointment.id !== event.id));
            } catch (error) {
                console.error('Error deleting appointment:', error);
            }
        }
    };

    // Render the calendar and routes
    return (
        <Router>
            <div className="App">
                <h1>Weekly Appointment Calendar</h1>
                <nav>
                    <ul>
                        <li><Link to="/">Calendar</Link></li>
                        <li><Link to="/summary">Appointment Summary</Link></li>
                    </ul>
                </nav>

                <Routes>
                    <Route 
                        path="/" 
                        element={
                            <DndProvider backend={HTML5Backend}>
                                <DragAndDropCalendar
                                    localizer={localizer}
                                    events={appointments}
                                    startAccessor="start"
                                    endAccessor="end"
                                    style={{ height: 500 }}
                                    selectable
                                    onSelectSlot={handleSelectSlot}
                                    onEventDrop={handleEventDrop} // Handle drag and drop
                                    onEventResize={handleEventResize} // Handle resizing
                                    onSelectEvent={handleDeleteEvent} // Handle event deletion
                                    resizable
                                    defaultView="week"
                                    views={['week']}
                                    step={30}
                                    draggableAccessor={() => true} // Make all events draggable
                                    resizableAccessor={() => true} // Make all events resizable
                                />
                            </DndProvider>
                        } 
                    />
                    <Route path="/summary" element={<Summary />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
