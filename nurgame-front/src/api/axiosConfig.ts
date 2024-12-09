import axios from 'axios';

// Create Axios instance
const axiosConfig = axios.create({
    baseURL: 'http://192.168.0.103:4001/api', // Replace with your API base URL
    timeout: 10000, // Optional timeout
});

export default axiosConfig;
