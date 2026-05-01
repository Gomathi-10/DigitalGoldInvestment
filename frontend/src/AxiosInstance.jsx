import axios from "axios";


const baseURL = 'http://localhost:8000/'

const AxiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
        accept: "application/json"
    }
})

// Add a request interceptor to attach token
AxiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        // Don't send token for login or register endpoints
        const isAuthRequest = config.url === "login/" || config.url === "register/";

        if (token && !isAuthRequest) {
            config.headers.Authorization = `Token ${token}`;
            console.log(`DEBUG Axios: Sending request to ${config.url} with Token`);
        } else {
            console.log(`DEBUG Axios: Sending request to ${config.url} WITHOUT Token (Auth Request: ${isAuthRequest})`);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for debugging errors
AxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`DEBUG Axios Error: ${error.config?.url} returned ${error.response?.status}`, error.response?.data);
        return Promise.reject(error);
    }
);


export default AxiosInstance
