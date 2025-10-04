import { GetServerSideProps } from 'next';
import { useState, useEffect, useCallback } from 'react';
import { useCorrespondenceSignalR } from '../hooks/useCorrespondenceSignalR';

interface InboxItem {
   correspondenceId: string;
   subject: string;
   mailNum: string;
   mailDate: string;
   priorityLevel: number;
   priorityLevelName: string;
   correspondenceTypeName: string;
   receivedDate: string;
   isDraft: boolean;
   // ... other properties from InboxItemVm
}

interface InboxPageProps {
   initialInboxData: {
      items: InboxItem[];
      totalCount: number;
   };
   accessToken: string;
}

export default function InboxPage({ initialInboxData, accessToken }: InboxPageProps) {
   const [inboxData, setInboxData] = useState(initialInboxData);
   const [loading, setLoading] = useState(false);
   const [notifications, setNotifications] = useState<string[]>([]);

   // Fetch fresh inbox data
   const refreshInboxData = useCallback(async () => {
      setLoading(true);
      try {
         const response = await fetch('/api/correspondence/inbox', {
            headers: {
               Authorization: `Bearer ${accessToken}`,
               'Content-Type': 'application/json'
            }
         });

         if (response.ok) {
            const data = await response.json();
            setInboxData(data);
            console.log('📬 Inbox data refreshed');
         }
      } catch (error) {
         console.error('❌ Error refreshing inbox:', error);
      } finally {
         setLoading(false);
      }
   }, [accessToken]);

   // SignalR event handlers
   const handleInboxUpdate = useCallback(() => {
      refreshInboxData();
      addNotification('Inbox updated');
   }, [refreshInboxData]);

   const handleCorrespondenceCreated = useCallback((notification: any) => {
      addNotification(`New correspondence: ${notification.message}`);
      // Optionally show browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
         new Notification('New Correspondence', {
            body: notification.message,
            icon: '/favicon.ico'
         });
      }
   }, []);

   const handleCorrespondenceUpdated = useCallback((notification: any) => {
      addNotification(`Correspondence updated: ${notification.correspondenceId}`);
   }, []);

   const handleCorrespondenceDeleted = useCallback((notification: any) => {
      addNotification(`Correspondence deleted: ${notification.correspondenceId}`);
   }, []);

   const handleCorrespondenceStatusChanged = useCallback((notification: any) => {
      addNotification(`Status changed to: ${notification.newStatus}`);
   }, []);

   // Initialize SignalR connection
   const { isConnected, joinCorrespondenceGroup, leaveCorrespondenceGroup } = useCorrespondenceSignalR({
      accessToken,
      onInboxUpdate: handleInboxUpdate,
      onCorrespondenceCreated: handleCorrespondenceCreated,
      onCorrespondenceUpdated: handleCorrespondenceUpdated,
      onCorrespondenceDeleted: handleCorrespondenceDeleted,
      onCorrespondenceStatusChanged: handleCorrespondenceStatusChanged
   });

   // Helper function to add notifications
   const addNotification = (message: string) => {
      setNotifications((prev) => [...prev.slice(-4), message]); // Keep last 5 notifications
      // Auto-remove after 5 seconds
      setTimeout(() => {
         setNotifications((prev) => prev.slice(1));
      }, 5000);
   };

   // Request notification permission on mount
   useEffect(() => {
      if ('Notification' in window && Notification.permission === 'default') {
         Notification.requestPermission();
      }
   }, []);

   return (
      <div className='container mx-auto p-6'>
         <div className='flex justify-between items-center mb-6'>
            <h1 className='text-3xl font-bold'>Correspondence Inbox</h1>
            <div className='flex items-center gap-4'>
               {/* Connection Status */}
               <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                     isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}
               >
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  {isConnected ? 'Connected' : 'Disconnected'}
               </div>

               {/* Refresh Button */}
               <button
                  onClick={refreshInboxData}
                  disabled={loading}
                  className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
               >
                  {loading ? 'Refreshing...' : 'Refresh'}
               </button>
            </div>
         </div>

         {/* Real-time Notifications */}
         {notifications.length > 0 && (
            <div className='mb-4 space-y-2'>
               {notifications.map((notification, index) => (
                  <div key={index} className='bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded animate-fade-in'>
                     🔔 {notification}
                  </div>
               ))}
            </div>
         )}

         {/* Inbox Stats */}
         <div className='bg-white rounded-lg shadow p-6 mb-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
               <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>{inboxData.totalCount}</div>
                  <div className='text-gray-600'>Total Items</div>
               </div>
               <div className='text-center'>
                  <div className='text-2xl font-bold text-green-600'>{inboxData.items.filter((item) => !item.isDraft).length}</div>
                  <div className='text-gray-600'>Active</div>
               </div>
               <div className='text-center'>
                  <div className='text-2xl font-bold text-orange-600'>{inboxData.items.filter((item) => item.isDraft).length}</div>
                  <div className='text-gray-600'>Drafts</div>
               </div>
            </div>
         </div>

         {/* Inbox Items */}
         <div className='bg-white rounded-lg shadow overflow-hidden'>
            <div className='overflow-x-auto'>
               <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                     <tr>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Subject</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Mail Number</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Type</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Priority</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Date</th>
                        <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>Status</th>
                     </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                     {inboxData.items.map((item) => (
                        <tr
                           key={item.correspondenceId}
                           className='hover:bg-gray-50 cursor-pointer'
                           onClick={() => {
                              // Navigate to correspondence detail
                              window.location.href = `/correspondence/${item.correspondenceId}`;
                           }}
                        >
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm font-medium text-gray-900'>{item.subject}</div>
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm text-gray-900'>{item.mailNum}</div>
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <div className='text-sm text-gray-900'>{item.correspondenceTypeName}</div>
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <span
                                 className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.priorityLevel === 2
                                       ? 'bg-red-100 text-red-800'
                                       : item.priorityLevel === 1
                                       ? 'bg-yellow-100 text-yellow-800'
                                       : 'bg-green-100 text-green-800'
                                 }`}
                              >
                                 {item.priorityLevelName}
                              </span>
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {new Date(item.receivedDate).toLocaleDateString()}
                           </td>
                           <td className='px-6 py-4 whitespace-nowrap'>
                              <span
                                 className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    item.isDraft ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
                                 }`}
                              >
                                 {item.isDraft ? 'Draft' : 'Active'}
                              </span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {inboxData.items.length === 0 && (
            <div className='text-center py-12'>
               <div className='text-gray-500 text-lg'>No correspondence items found</div>
            </div>
         )}
      </div>
   );
}

// Server-side rendering - fetch initial data
export const getServerSideProps: GetServerSideProps = async (context) => {
   const { req } = context;

   // Extract JWT token from cookies or headers
   const accessToken = req.cookies.accessToken || req.headers.authorization?.replace('Bearer ', '');

   if (!accessToken) {
      return {
         redirect: {
            destination: '/login',
            permanent: false
         }
      };
   }

   try {
      // Fetch initial inbox data on server
      const response = await fetch(`${process.env.API_URL}/BDFM/v1/api/Correspondence/GetUserInbox`, {
         headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
         }
      });

      if (!response.ok) {
         throw new Error('Failed to fetch inbox data');
      }

      const apiResponse = await response.json();

      // Extract the data from the Response<PagedResult<InboxItemVm>> structure
      const initialInboxData = apiResponse.succeeded ? apiResponse.data : { items: [], totalCount: 0 };

      return {
         props: {
            initialInboxData,
            accessToken
         }
      };
   } catch (error) {
      console.error('Error fetching initial inbox data:', error);

      return {
         props: {
            initialInboxData: { items: [], totalCount: 0 },
            accessToken
         }
      };
   }
};
