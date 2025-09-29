import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

const createGroup = async (groupData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/groups`, groupData, {
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getGroups = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/groups/get`, {
            headers: {
                'Authorization': token
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

const getGroupDetails = async (groupId) => {
    try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/groups/${groupId}`, {
            headers: {
                'Authorization': token
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const groupService = {
    createGroup,
    getGroups,
    getGroupDetails
}; 