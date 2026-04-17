import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input, Label } from '../../../components/ui/Input';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { inventoryService } from '../../../services/inventoryService';
import { addNotification } from '../../../store/notificationSlice';

const AddRestock = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Form State
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [supplier, setSupplier] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      const data = await inventoryService.getInventory();
      setInventory(data);
      if (data.length > 0) {
        setSelectedMaterialId(data[0].id);
      }
      setIsLoading(false);
    };
    fetchInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId || !quantity) {
      toast.error('Material and Quantity are required.');
      return;
    }

    const material = inventory.find(i => i.id === selectedMaterialId);
    
    // Convert to number
    const qtyToAdd = parseInt(quantity, 10);
    const newTotal = material.quantity + qtyToAdd;

    await inventoryService.updateInventoryItem(material.id, {
      quantity: newTotal,
      status: newTotal > 50 ? 'Healthy' : 'Low Stock', // mock logic
      lastRestock: new Date().toISOString().split('T')[0]
    });

    toast.success(`Successfully recorded restock of ${qtyToAdd} ${material.unit} to ${material.name}`);
    dispatch(addNotification({
       title: 'Stock Manually Replenished',
       message: `Inventory Manager added ${qtyToAdd} ${material.unit} of ${material.name}.`,
       targetRole: 'Inventory Manager'
    }));

    navigate('/inventory');
  };

  if (isLoading) return <div className="p-12 text-center text-slate-500">Loading master list...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Add Restock Order</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Restock Details</CardTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400">Register incoming inventory shipments.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Select Raw Material</Label>
              <select 
                value={selectedMaterialId}
                onChange={e => setSelectedMaterialId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
              >
                {inventory.map(item => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.id}) - Current: {item.quantity} {item.unit}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <Label>Quantity to Add</Label>
                 <Input 
                   type="number" 
                   value={quantity}
                   onChange={e => setQuantity(e.target.value)}
                   placeholder="e.g. 100"
                   className="mt-1"
                 />
               </div>
               <div>
                 <Label>Expected Delivery Date</Label>
                 <Input 
                   type="date" 
                   value={expectedDate}
                   onChange={e => setExpectedDate(e.target.value)}
                   className="mt-1"
                 />
               </div>
            </div>

            <div>
              <Label>Supplier Name</Label>
              <Input 
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="External Vendor Name (Optional)"
                className="mt-1"
              />
            </div>

            <div className="pt-4 flex space-x-3">
              <Button type="button" variant="outline" className="w-full" onClick={() => navigate('/inventory')}>Cancel</Button>
              <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700">Confirm Restock</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddRestock;
