import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Bell, Check, Trash2, Info, Clock } from 'lucide-react';
import { markAllRead, markAsRead } from '../../store/notificationSlice';
import { Button } from './Button';
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';

export const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  // Filter based on the current user's role
  const filteredNotifications = notifications.filter(n => n.targetRole === user?.role);
  const unreadCount = filteredNotifications.filter(n => !n.read).length;

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  const handleNotificationClick = (id) => {
    dispatch(markAsRead(id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
             <div className="flex items-center space-x-2">
               <h3 className="font-semibold text-slate-800 dark:text-slate-100">Notifications</h3>
               {unreadCount > 0 && (
                 <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-bold px-2 py-0.5 rounded-full">
                   {unreadCount} New
                 </span>
               )}
             </div>
             {unreadCount > 0 && (
               <button 
                 onClick={handleMarkAllRead}
                 className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center"
               >
                 <Check size={14} className="mr-1" /> Mark all read
               </button>
             )}
          </div>

          {/* List */}
          <div className="max-h-[70vh] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <Bell size={32} className="text-slate-300 mb-2" />
                <p className="text-slate-500 text-sm">No notifications for {user?.role}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredNotifications.map(notif => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif.id)}
                    className={clsx(
                      "p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3",
                      !notif.read ? "bg-primary-50/50 dark:bg-primary-900/10" : ""
                    )}
                  >
                     <div className="flex-shrink-0 mt-1">
                        <div className={clsx(
                          "h-8 w-8 rounded-full flex items-center justify-center",
                          !notif.read ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        )}>
                          <Info size={16} />
                        </div>
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-start">
                           <h4 className={clsx("text-sm", !notif.read ? "font-bold text-slate-800" : "font-medium text-slate-600")}>
                             {notif.title}
                           </h4>
                           <span className="text-[10px] text-slate-400 flex flex-shrink-0 items-center whitespace-nowrap ml-2">
                             <Clock size={10} className="mr-1" />
                             {formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}
                           </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      )}
    </div>
  );
};
