import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { Input, Label } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { inventoryService } from '../../../services/inventoryService';
import { addNotification } from '../../../store/notificationSlice';
import { History, Plus } from 'lucide-react';

const MaterialUsageLogs = () => {
  const [logs, setLogs] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [qtyUsed, setQtyUsed] = useState('');
  const [taskRef, setTaskRef] = useState('');

  useEffect(() => {
    const fetchLogsAndMaterials = async () => {
      const logsData = await inventoryService.getUsageLogs();
      const matsData = await inventoryService.getInventory();
      setLogs(logsData);
      setMaterials(matsData);
      if (matsData.length > 0) {
        setSelectedMaterialId(matsData[0].id);
      }
      setIsLoading(false);
    };
    fetchLogsAndMaterials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId || !qtyUsed) {
      toast.error('Material and Quantity are required.');
      return;
    }

    const material = materials.find(m => m.id === selectedMaterialId);
    const parsedQty = parseInt(qtyUsed, 10);

    if (material.quantity < parsedQty) {
      toast.error(`Not enough ${material.name} in stock! (Only ${material.quantity} remaining)`);
      return;
    }

    const newLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      materialName: material.name,
      quantityUsed: parsedQty,
      unit: material.unit,
      usedBy: 'Inventory Manager',
      taskRef: taskRef || 'N/A'
    };

    // Update Logs
    setLogs([newLog, ...logs]);
    await inventoryService.addUsageLog(newLog);

    // Update Master Inventory locally and remotely
    const newTotal = material.quantity - parsedQty;
    const newStatus = newTotal <= 50 ? 'Low Stock' : material.status; // basic mock logic
    
    await inventoryService.updateInventoryItem(material.id, {
       quantity: newTotal,
       status: newStatus
    });

    setMaterials(materials.map(m => m.id === material.id ? { ...m, quantity: newTotal, status: newStatus } : m));

    toast.success('Material usage logged successfully.');
    dispatch(addNotification({
      title: 'Material Logged',
      message: `${parsedQty} ${material.unit} of ${material.name} used for ${newLog.taskRef}.`,
      targetRole: 'Inventory Manager'
    }));

    setIsModalOpen(false);
    setQtyUsed('');
    setTaskRef('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
            <History className="text-primary-600 dark:text-primary-400" size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Material Usage Logs</h2>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus size={16} className="mr-2" />
          Log Usage
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Withdrawals</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Log ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Quantity Used</TableHead>
                <TableHead>Used By</TableHead>
                <TableHead>Task Ref</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-6 text-slate-500">Loading logs...</TableCell></TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs text-slate-500 dark:text-slate-400">{log.id}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{log.date}</TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-200">{log.materialName}</TableCell>
                    <TableCell className="text-red-500 font-medium font-mono">- {log.quantityUsed} {log.unit}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{log.usedBy}</TableCell>
                    <TableCell>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded text-xs border dark:border-slate-700">{log.taskRef}</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Log Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Material Withdrawal">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Select Raw Material</Label>
            <select 
              value={selectedMaterialId}
              onChange={e => setSelectedMaterialId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 mt-1"
            >
              {materials.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} - Available: {item.quantity} {item.unit}
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Quantity Withdrawn</Label>
              <Input 
                type="number" 
                value={qtyUsed}
                onChange={e => setQtyUsed(e.target.value)}
                placeholder="e.g. 15"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Task / Order Reference</Label>
              <Input 
                value={taskRef}
                onChange={e => setTaskRef(e.target.value)}
                placeholder="e.g. TSK-4015"
                className="mt-1"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-primary-600 hover:bg-primary-700">Submit Log</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaterialUsageLogs;
