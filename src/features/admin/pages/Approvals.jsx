import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { addNotification } from '../../../store/notificationSlice';
import { setRequests, updateRequestStatus } from '../../../store/approvalSlice';
import { approvalService } from '../../../services/approvalService';
import { PlusCircle, Search } from 'lucide-react';
import RequestApprovalModal from '../../../components/ui/RequestApprovalModal';
import { Input } from '../../../components/ui/Input';

const Approvals = () => {
  const { requests } = useSelector((state) => state.approvals);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    approvalService.getRequests()
      .then(data => {
        dispatch(setRequests(data));
      })
      .catch(err => {
        toast.error('Failed to load approvals');
        console.error(err);
      });
  }, [dispatch]);

  const isAdmin = user?.role === 'Admin';

  const handleAction = (id, action) => {
    const newStatus = action === 'Approve' ? 'Approved' : 'Rejected';
    
    approvalService.updateRequestStatus(id, newStatus)
      .then(() => {
        dispatch(updateRequestStatus({ id, status: newStatus }));

        if (newStatus === 'Approved') {
          toast.success(`Request ${id} approved successfully.`);
          dispatch(addNotification({
            title: 'Request Approved',
            message: `Admin approved request ${id}.`,
            targetRole: 'Admin'
          }));
        } else {
          toast.error(`Request ${id} rejected.`);
          dispatch(addNotification({
            title: 'Request Rejected',
            message: `Admin rejected request ${id}.`,
            targetRole: 'Admin'
          }));
        }
      })
      .catch(err => {
        toast.error('Failed to update request status');
        console.error(err);
      });
  };

  // Logic: Admin sees all, other roles see only their own requests
  const filteredRequests = requests.filter(req => {
    const statusMatch = activeTab === 'All' || req.status === activeTab;
    const searchMatch = req.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      req.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (req.description && req.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (isAdmin) return statusMatch && searchMatch;
    
    // For non-admins, they should only see requests they initiated
    return statusMatch && searchMatch && req.requestedBy === user?.name;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {isAdmin ? 'Approvals Management' : 'My Approval Requests'}
        </h2>
        {!isAdmin && (
          <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white flex items-center space-x-2"
          >
            <PlusCircle size={18} />
            <span>New Request</span>
          </Button>
        )}
      </div>

      <RequestApprovalModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-max">
          {['All', 'Pending', 'Approved', 'Rejected'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <Input 
            placeholder="Search requests..." 
            className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl text-slate-800 dark:text-slate-200"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {activeTab === 'Pending' ? 'Requests Needing Review' : `${activeTab} Requests`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Req ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions / Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-slate-500">
                    No {activeTab.toLowerCase()} requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium text-slate-600 dark:text-slate-400">{req.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-slate-200">{req.subject}</p>
                        {req.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{req.description}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{req.requestedBy}</TableCell>
                    <TableCell>{req.date}</TableCell>
                    <TableCell className="text-right space-x-2">
                       {req.status === 'Pending' ? (
                         isAdmin ? (
                           <>
                             <Button variant="outline" size="sm" onClick={() => handleAction(req.id, 'Reject')} className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                             <Button size="sm" onClick={() => handleAction(req.id, 'Approve')} className="bg-green-600 hover:bg-green-700">Approve</Button>
                           </>
                         ) : (
                           <Badge variant="warning">Pending</Badge>
                         )
                       ) : (
                         <Badge variant={req.status === 'Approved' ? 'success' : 'danger'}>
                           {req.status}
                         </Badge>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Approvals;
