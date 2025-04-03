import { useState } from 'react';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { usePolicies } from '../hooks/usePolicies';
import PolicyStats from '../components/policies/PolicyStats';
import { PolicyCard } from '../components/policies/PolicyCard';
import PolicyFilters from '../components/policies/PolicyFilters';
import { EmptyState } from '../components/ui/EmptyState';
import { PolicyChart } from '../components/policies/PolicyChart';
import { useAuth } from '../context/useAuth';
import { UserAvatar } from '../components/UserAvatar';

export const PoliciesPage = () => {
    const { user, logout } = useAuth(); // Get user info and logout function
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const { data: policies, isLoading, error } = usePolicies() as {
        data: any[];
        isLoading: boolean;
        error: any
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const filteredPolicies = policies?.filter(policy => {
        const matchesSearch = policy['Name']?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy['Description']?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter.length === 0 ||
            (policy['OPSS-Pol:Approval Status'] &&
                statusFilter.some(filter => policy['OPSS-Pol:Approval Status']?.includes(filter)));

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 max-w-fit w-full">
            <header className="bg-white dark:bg-gray-800 shadow-sm w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Policy Governance Dashboard
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Comprehensive view of all organizational policies
                            </p>
                        </div>

                        <div className="flex items-center space-x-4">
                            {user && (
                                <div className="flex items-center space-x-2">
                                    <UserAvatar name={user} />
                                    <div className="text-right hidden md:block">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {user}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Administrator
                                        </p>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium rounded-lg shadow hover:from-red-600 hover:to-red-700 transition flex items-center space-x-2"
                            >
                                <span>Logout</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <PolicyStats policies={policies} />

                <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <PolicyFilters
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        statusFilter={statusFilter}
                        onStatusChange={setStatusFilter}
                    />

                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : error ? (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Failed to load policies
                            </h3>
                            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                {error.message}
                            </p>
                        </div>
                    ) : filteredPolicies?.length === 0 ? (
                        <EmptyState
                            title="No policies found"
                            description="Try adjusting your search or filters"
                        />
                    ) : (
                        <>
                            <div className="w-full mb-8 min-h-[300px] bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4">
                                <PolicyChart policies={filteredPolicies} />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 w-full">
                                {filteredPolicies?.map((policy: any) => (
                                    <PolicyCard
                                        key={policy['Resource ID']}
                                        policy={policy}
                                        className="hover:shadow-lg transition-shadow duration-200"
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </main>
        </div>
    );
};