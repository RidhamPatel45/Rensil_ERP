import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Input, Label } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Plus, Search, FileText, CheckSquare } from 'lucide-react';
import { orderService } from '../../../services/orderService';
import { addNotification } from '../../../store/notificationSlice';
import RequestApprovalModal from '../../../components/ui/RequestApprovalModal';

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All'); // All, Paid, Pending
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Modal State
  const [customer, setCustomer] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await orderService.getOrders();
      setOrders(data);
      setIsLoading(false);
    };
    fetchOrders();
  }, []);

  const handleSaveOrder = () => {
    if (!customer || !email || !amount) {
      toast.error('Please fill required fields (Customer, Email, Amount)');
      return;
    }

    const newOrder = {
      id: `ORD-9${Math.floor(100 + Math.random() * 900)}`,
      customerName: customer,
      email: email,
      product: product || 'Custom Rug',
      amount: `₹${parseFloat(amount).toLocaleString()}`,
      datePlaced: new Date().toISOString().split('T')[0],
      status: 'Received',
      paymentStatus: 'Pending',
      timelineStep: 1
    };

    const saveToMemory = async () => {
      await orderService.addOrder(newOrder);
      setOrders([newOrder, ...orders]);
    };
    saveToMemory();
    setIsModalOpen(false);
    
    // Reset Form
    setCustomer(''); setEmail(''); setProduct(''); setAmount('');

    toast.success(`Order created for ${customer}`);
    dispatch(addNotification({
      title: 'New Order Created',
      message: `${customer} placed a new order for ${newOrder.amount}.`,
      targetRole: 'Sales Manager'
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Received': return <Badge variant="default">Received</Badge>;
      case 'In Production': return <Badge variant="primary">In Production</Badge>;
      case 'Quality Check': return <Badge variant="warning">QA Check</Badge>;
      case 'Shipped': return <Badge variant="success">Shipped</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || o.paymentStatus === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Order Management</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setIsApprovalModalOpen(true)} className="flex items-center">
            <CheckSquare size={16} className="mr-2" /> Request Approval
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus size={16} className="mr-2" /> Create Order
          </Button>
        </div>
      </div>

      <RequestApprovalModal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} />

      <div className="flex space-x-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg w-max">
        {['All', 'Paid', 'Pending'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            {tab === 'Pending' ? 'Pending Payment' : tab}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>All Orders</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by order ID or customer..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date Placed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-6 text-slate-500">Loading orders...</TableCell></TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-6 text-slate-500">No orders found.</TableCell></TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50" onClick={() => navigate(`/sales/orders/${order.id}`)}>
                    <TableCell className="font-mono text-xs font-medium text-primary-600">{order.id}</TableCell>
                    <TableCell>
                      <div className="font-medium text-slate-800 dark:text-slate-200">{order.customerName}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{order.email}</div>
                    </TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{order.product}</TableCell>
                    <TableCell className="font-medium dark:text-slate-100">{order.amount}</TableCell>
                    <TableCell>
                      <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm">{order.datePlaced}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/sales/orders/${order.id}`); }}>
                        <FileText size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Order">
        <div className="space-y-4">
          <div>
            <Label>Customer Name</Label>
            <Input value={customer} onChange={e=>setCustomer(e.target.value)} placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="contact@acme.com" />
          </div>
          <div>
            <Label>Product / Specifications</Label>
            <Input value={product} onChange={e=>setProduct(e.target.value)} placeholder="e.g. Custom Wool 200x300" />
          </div>
          <div>
            <Label>Price Amount (₹)</Label>
            <Input value={amount} onChange={e=>setAmount(e.target.value)} type="number" placeholder="1200" />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveOrder}>Save Order</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OrderManagement;
