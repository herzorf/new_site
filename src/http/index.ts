import axios from 'axios'
import { baseURL } from './config';

const http = axios.create({
    baseURL,
    timeout: 5000,
});

export default http