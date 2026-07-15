import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { Input, Label } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { AlertTriangle, Filter, Search, Plus, CheckSquare } from 'lucide-react';
import { inventoryService } from '../../../services/inventoryService';
import { addNotification } from '../../../store/notificationSlice';
import RequestApprovalModal from '../../../components/ui/RequestApprovalModal';

const RawMaterialList = () => {
  const [inventory, setInventory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const dispatch = useDispatch();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Dye');
  const [newQuantity, setNewQuantity] = useState('');
  const [newUnit, setNewUnit] = useState('Liters');

  useEffect(() => {
    const fetchInventory = async () => {
      const data = await inventoryService.getInventory();
      const lowStock = await inventoryService.getLowStockItems();
      setInventory(data);
      setAlerts(lowStock);
      setIsLoading(false);
    };
    fetchInventory();
  }, []);

  const handleRestock = async (alertId, itemName) => {
    const item = inventory.find(i => i.id === alertId);
    
    // Remove alert temporarily
    setAlerts(alerts.filter(a => a.id !== alertId));
    
    // Auto-update inventory mock quantity locally just to make UI look nice
    setInventory(inventory.map(i => 
      i.id === alertId ? { ...i, quantity: i.quantity + 50, status: 'Healthy', lastRestock: 'Today' } : i
    ));

    toast.success(`Restock order placed for ${itemName}`);
    dispatch(addNotification({
      title: 'Restock Ordered',
      message: `System requested emergency restock for ${itemName}.`,
      targetRole: 'Inventory Manager'
    }));

    if (item) {
      await inventoryService.updateInventoryItem(alertId, { 
        quantity: item.quantity + 50, 
        status: 'Healthy', 
        lastRestock: 'Today' 
      });
    }
  };

  const handleAddMaterial = async () => {
    if (!newName || !newQuantity) {
      toast.error('Material name and quantity are required.');
      return;
    }

    const newItem = {
      id: `MAT-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newName,
      category: newCategory,
      quantity: parseInt(newQuantity, 10),
      unit: newUnit,
      status: 'Healthy',
      lastRestock: 'Today'
    };

    setInventory([newItem, ...inventory]);
    toast.success(`${newName} added to inventory!`);
    dispatch(addNotification({
       title: 'New Material Added',
       message: `Inventory Manager added ${newItem.quantity} ${newItem.unit} of ${newItem.name}.`,
       targetRole: 'Inventory Manager'
    }));

    await inventoryService.addInventoryItem(newItem);

    // Reset and close
    setNewName('');
    setNewCategory('Dye');
    setNewQuantity('');
    setNewUnit('Liters');
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Healthy': return <Badge variant="success">Healthy</Badge>;
      case 'Low Stock': return <Badge variant="warning">Low Stock</Badge>;
      case 'Critical': return <Badge variant="danger">Critical</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Raw Material Inventory</h2>

      {/* Low Stock Alerts */}
      {alerts.length > 0 && (
        <Card className="border-warning border-l-4">
          <CardHeader className="bg-orange-50 dark:bg-orange-900/10 pb-3 p-4">
            <CardTitle className="text-orange-800 dark:text-orange-400 flex items-center text-base">
              <AlertTriangle size={18} className="mr-2" /> 
              Attention: {alerts.length} Items Require Restocking
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white dark:bg-slate-900 space-y-2">
             {alerts.map(alert => (
               <div key={alert.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded border border-slate-100 dark:border-slate-800">
                 <div>
                   <span className="font-medium text-slate-800 dark:text-slate-100 mr-2">{alert.name}</span>
                   <span className="text-sm text-slate-500 dark:text-slate-400">({alert.quantity} {alert.unit} remaining)</span>
                 </div>
                 <Button onClick={() => handleRestock(alert.id, alert.name)} size="sm" variant="outline">Order Restock</Button>
               </div>
             ))}
          </CardContent>
        </Card>
      )}

      {/* Main Stock Table */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <CardTitle>Current Stock</CardTitle>
          <div className="flex space-x-2">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search materials..." 
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => setIsApprovalModalOpen(true)} className="flex items-center">
              <CheckSquare size={16} className="mr-2" /> Request Approval
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus size={16} className="mr-2" /> Add Material
            </Button>
          </div>
        </CardHeader>

        <RequestApprovalModal isOpen={isApprovalModalOpen} onClose={() => setIsApprovalModalOpen(false)} />
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Restock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500">Loading inventory...</TableCell></TableRow>
              ) : filteredInventory.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500">No materials found.</TableCell></TableRow>
              ) : (
                filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{item.id}</TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-200">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="font-medium">{item.quantity} {item.unit}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell className="text-slate-500 dark:text-slate-400 text-sm">{item.lastRestock}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Material Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Material">
        <div className="space-y-4">
          <div>
            <Label>Material Name</Label>
            <Input 
              value={newName} 
              onChange={e => setNewName(e.target.value)} 
              placeholder="e.g. Navy Blue Wool" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category</Label>
              <select 
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Dye">Dye</option>
                <option value="Yarn">Yarn</option>
                <option value="Chemical">Chemical</option>
                <option value="Packaging">Packaging</option>
              </select>
            </div>
            <div>
              <Label>Unit</Label>
              <select 
                value={newUnit}
                onChange={e => setNewUnit(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Liters">Liters</option>
                <option value="Kg">Kg</option>
                <option value="Rolls">Rolls</option>
                <option value="Units">Units</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Initial Quantity</Label>
            <Input 
              type="number"
              value={newQuantity} 
              onChange={e => setNewQuantity(e.target.value)} 
              placeholder="e.g. 50" 
            />
          </div>
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMaterial}>Save Inventory</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RawMaterialList;
