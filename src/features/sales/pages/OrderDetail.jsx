import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { orderService } from '../../../services/orderService';
import { ArrowLeft, Check, Download, CreditCard, Printer } from 'lucide-react';
import clsx from 'clsx';

const TIMELINE_STAGES = [
  { id: 1, label: 'Order Received' },
  { id: 2, label: 'In Production (Dyeing/Weaving)' },
  { id: 3, label: 'Quality Check' },
  { id: 4, label: 'Shipped' }
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      const data = await orderService.getOrderById(id);
      setOrder(data);
      setIsLoading(false);
    };
    fetchOrder();
  }, [id]);


  const handleSendInvoice = () => {
    toast.success(`Digital invoice has been sent to ${order.email}`);
  };

  const handleMarkAsPaid = async () => {
    await orderService.updatePaymentStatus(order.id, 'Paid');
    setOrder({ ...order, paymentStatus: 'Paid' });
    toast.success('Payment recorded successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper for invoice calculations
  const calculateInvoice = () => {
    if (!order) return { subtotal: 0, tax: 0, total: 0 };
    const numericAmount = parseFloat(order.amount.replace(/[^0-9.]/g, '')) || 0;
    const taxRate = 0.18; // 18% GST example
    const subtotal = numericAmount / (1 + taxRate);
    const tax = numericAmount - subtotal;
    return { subtotal, tax, total: numericAmount };
  };

  const { subtotal, tax, total } = calculateInvoice();

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading order...</div>;
  if (!order) return <div className="p-12 text-center text-red-500">Order not found.</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/sales/orders')} className="px-2 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800">
          <ArrowLeft size={18} className="mr-1" /> Back
        </Button>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Order {order.id}</h2>
        <Badge variant={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>Payment: {order.paymentStatus}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Timeline & Tracker */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Tracker</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l-2 border-slate-200 ml-3 space-y-8 mt-2 pb-2">
                 {TIMELINE_STAGES.map((stage) => {
                    const isCompleted = order.timelineStep > stage.id;
                    const isCurrent = order.timelineStep === stage.id;
                    // const isPending = order.timelineStep < stage.id; // Unused 

                    return (
                      <div key={stage.id} className="relative flex items-center mb-8 last:mb-0">
                        <div className={clsx(
                          "absolute -left-[29px] flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white dark:bg-slate-900",
                          isCompleted ? "border-green-500 bg-green-50 dark:bg-green-900/20" : isCurrent ? "border-primary-500 ring-4 ring-primary-50 dark:ring-primary-900/10" : "border-slate-300 dark:border-slate-700"
                        )}>
                           {isCompleted && <Check size={12} className="text-green-600 dark:text-green-400" />}
                           {isCurrent && <div className="h-2 w-2 rounded-full bg-primary-600 dark:bg-primary-500"></div>}
                        </div>
                        <div className="ml-6">
                          <p className={clsx("font-medium", isCompleted || isCurrent ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-600")}>{stage.label}</p>
                          {isCurrent && <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">Current Phase</p>}
                        </div>
                      </div>
                    );
                 })}
              </div>
            </CardContent>
          </Card>


        </div>

        {/* Right Column: Invoice / Details */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="shadow-md">
             <CardContent className="p-8">
                 <div className="flex justify-between items-start border-b dark:border-slate-800 pb-6">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">INVOICE</h1>
                      <p className="text-slate-500 dark:text-slate-400 mt-1 font-mono text-sm">{order.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">Rug Factory System</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 text-right">123 Industrial Way<br/>Weaver City, WC 54321</p>
                    </div>
                </div>
                
                <div className="flex justify-between mt-8">
                   <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Bill To:</p>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{order.customerName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{order.email}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-1">Date:</p>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{order.datePlaced}</p>
                   </div>
                </div>

                <div className="mt-12">
                   <table className="w-full text-sm">
                     <thead>
                        <tr className="border-b-2 border-slate-800 dark:border-slate-700">
                          <th className="text-left font-bold py-3 text-slate-800 dark:text-slate-100">Item Description</th>
                          <th className="text-right font-bold py-3 text-slate-800 dark:text-slate-100">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        <tr>
                          <td className="py-4 text-slate-600 dark:text-slate-400">
                            <p className="font-medium text-slate-900 dark:text-slate-100">{order.product}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">Custom Handmade Rug Fabrication</p>
                          </td>
                          <td className="py-4 text-right font-medium text-slate-800 dark:text-slate-100">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                     </tbody>
                     <tfoot>
                        <tr className="text-slate-500 dark:text-slate-400">
                          <td className="pt-6 text-right pr-4">Subtotal (Pre-tax):</td>
                          <td className="pt-6 text-right font-medium text-slate-900 dark:text-slate-100">₹{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="text-slate-500 dark:text-slate-400">
                          <td className="py-2 text-right pr-4">GST (18%):</td>
                          <td className="py-2 text-right font-medium text-slate-900 dark:text-slate-100">₹{tax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        </tr>
                        <tr className="border-t border-slate-200 dark:border-slate-800">
                          <td className="py-4 text-right font-bold text-slate-800 dark:text-slate-100 text-lg">Total Amount:</td>
                          <td className="py-4 text-right font-bold text-2xl text-primary-600 dark:text-primary-400">₹{total.toLocaleString()}</td>
                        </tr>
                       {order.paymentStatus === 'Paid' && (
                         <tr>
                            <td colSpan={2} className="text-right">
                               <Badge variant="success" className="text-sm px-4 py-1">PAID IN FULL</Badge>
                            </td>
                         </tr>
                       )}
                     </tfoot>
                   </table>
                </div>

                <div className="mt-10 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
                   <div>
                      <p className="font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Payment Information</p>
                      <p className="text-slate-700 dark:text-slate-300">Bank: Standard Merchant Bank</p>
                      <p className="text-slate-700 dark:text-slate-300">Account: 1234 5678 9012</p>
                      <p className="text-slate-700 dark:text-slate-300">IFSC: SMBK0000123</p>
                   </div>
                   <div>
                      <p className="font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">Notes & Terms</p>
                      <p className="text-slate-600 dark:text-slate-400 italic">Please include Order ID {order.id} as a reference when making transfers. Payment expected within 30 days of invoice date.</p>
                   </div>
                </div>

                <div className="mt-12 flex flex-wrap justify-end gap-3 print:hidden">
                   <Button variant="outline" onClick={handlePrint}><Printer size={16} className="mr-2" /> Print</Button>
                   <Button variant="outline"><Download size={16} className="mr-2" /> Download PDF</Button>
                   {order.paymentStatus === 'Pending' ? (
                     <Button onClick={handleMarkAsPaid} className="bg-green-600 hover:bg-green-700 text-white">
                        <CreditCard size={16} className="mr-2" /> Mark as Paid
                     </Button>
                   ) : (
                     <Button onClick={handleSendInvoice}>Resend Receipt</Button>
                   )}
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
