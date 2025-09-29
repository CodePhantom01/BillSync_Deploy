import React, { useState, useEffect } from 'react';
import { groupService } from '../services/groupService';
import { Link } from 'react-router-dom';
import api from '../services/API';

const GroupsList = () => {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [groupBalances, setGroupBalances] = useState({});
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchGroups();
    }, []);

    useEffect(() => {
        const fetchBalances = async () => {
            try {
                const userRes = await api.get('/auth/current-user');
                setCurrentUser(userRes.data.user);
                const balancesObj = {};
                await Promise.all(groups.map(async (group) => {
                    try {
                        const res = await api.get(`/groups/${group._id}/balances`);
                        balancesObj[group._id] = res.data.summary;
                    } catch (e) {
                        balancesObj[group._id] = null;
                    }
                }));
                setGroupBalances(balancesObj);
            } catch (e) {}
        };
        if (groups.length > 0) fetchBalances();
    }, [groups]);

    const fetchGroups = async () => {
        try {
            const response = await groupService.getGroups();
            setGroups(response.groups || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch groups');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Groups</h2>
                <Link
                    to="/groups/create"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Create New Group
                </Link>
            </div>

            {groups.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    You haven't created any groups yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <Link
                            key={group._id}
                            to={`/groups/${group._id}`}
                            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                        >
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                {group.name}
                            </h3>
                            <p className="text-gray-600 text-sm">
                                Created by: {group.createdBy?.name || 'Unknown'}
                            </p>
                            <p className="text-gray-600 text-sm mt-2">
                                Members: {group.users?.length || 0}
                            </p>
                            {groupBalances[group._id] && (
                                <div className="mt-2">
                                    <span className="block text-sm text-red-600">
                                        {groupBalances[group._id].totalOwe > 0 ? `You owe $${groupBalances[group._id].totalOwe.toFixed(2)}` : 'You owe nothing'}
                                    </span>
                                    <span className="block text-sm text-green-600">
                                        {groupBalances[group._id].totalAreOwed > 0 ? `You are owed $${groupBalances[group._id].totalAreOwed.toFixed(2)}` : 'No one owes you'}
                                    </span>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GroupsList; 