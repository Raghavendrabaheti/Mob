import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, DollarSign } from 'lucide-react';

export const SplitBorrow = () => {
  const [splitTitle, setSplitTitle] = useState('');
  const [splitAmount, setSplitAmount] = useState('');
  const [participants, setParticipants] = useState('');

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      <div className="pt-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Split & Borrow
        </h1>
        <p className="text-muted-foreground">Manage shared expenses</p>
      </div>

      <Tabs defaultValue="split" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="split">Split Bills</TabsTrigger>
          <TabsTrigger value="borrow">Borrow Money</TabsTrigger>
        </TabsList>
        
        <TabsContent value="split">
          <Card>
            <CardHeader><CardTitle>Split a Bill</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Bill Title</Label>
                <Input placeholder="e.g., Dinner at restaurant" value={splitTitle} onChange={(e) => setSplitTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <Input type="number" placeholder="0.00" value={splitAmount} onChange={(e) => setSplitAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Participants</Label>
                <Input placeholder="Enter names separated by commas" value={participants} onChange={(e) => setParticipants(e.target.value)} />
              </div>
              {splitAmount && participants && (
                <div className="p-4 bg-accent rounded-lg">
                  <p className="font-medium">Split Result:</p>
                  <p>₹{(parseFloat(splitAmount) / (participants.split(',').length + 1)).toFixed(2)} per person</p>
                </div>
              )}
              <Button className="w-full">Calculate Split</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="borrow">
          <Card>
            <CardHeader><CardTitle>Borrow Tracker</CardTitle></CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Borrow tracking feature</p>
                <p className="text-sm">Coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};