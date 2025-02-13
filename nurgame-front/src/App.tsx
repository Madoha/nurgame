import './css/styles.css'
import './css/newstyles.css'
import './css/font.css'
import './css/reset.css'
import Rout from './components/Rout.tsx'
import {useEffect} from "react";
import axiosConfig from "./api/axiosConfig.ts";


function App() {
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error('No authentication token found');

        axiosConfig.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    })

    return (
        <Rout/>
    )
}

export default App
