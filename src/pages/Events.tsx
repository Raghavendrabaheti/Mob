import { useState } from 'react';
import { useApp } from '@/context/TransactionContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar, Plus, CalendarDays, MapPin, Trash2 } from 'lucide-react';
import { format, isToday, isTomorrow, addDays, isSameDay } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { getCategoryEmoji } from '@/lib/categoryEmojis';
import { toast } from '@/hooks/use-toast';

export const Events = () => {
  const { state, dispatch } = useApp();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [showAddDialog, setShowAddDialog] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [eventDate, setEventDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [notes, setNotes] = useState('');

  const resetForm = () => {
    setTitle('');
    setEventDate(format(new Date(), 'yyyy-MM-dd'));
    setSelectedCategories([]);
    setBudget('');
    setNotes('');
  };

  const handleAddEvent = () => {
    if (!title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter an event title",
        variant: "destructive"
      });
      return;
    }

    const newEvent = {
      id: Date.now().toString(),
      title: title.trim(),
      date: eventDate,
      categories: selectedCategories,
      budget: budget ? parseFloat(budget) : undefined,
      notes: notes.trim() || undefined
    };

    dispatch({ type: 'ADD_EVENT', payload: newEvent });
    
    toast({
      title: "Event added",
      description: `${title} scheduled for ${format(new Date(eventDate), 'MMM dd, yyyy')}`
    });

    resetForm();
    setShowAddDialog(false);
  };

  const handleDeleteEvent = (id: string) => {
    dispatch({ type: 'DELETE_EVENT', payload: id });
    toast({
      title: "Event deleted",
      description: "Event removed from calendar"
    });
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getEventsForDate = (date: Date) => {
    return state.events.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    return state.events
      .filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= nextWeek;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getDateLabel = (date: string) => {
    const eventDate = new Date(date);
    if (isToday(eventDate)) return 'Today';
    if (isTomorrow(eventDate)) return 'Tomorrow';
    return format(eventDate, 'MMM dd');
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];
  const upcomingEvents = getUpcomingEvents();

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="pt-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Events & Calendar
          </h1>
          <p className="text-muted-foreground">Plan your expenses ahead</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., College Fest"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Expected Expense Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {state.categories.expense.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategories.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleCategory(category)}
                    >
                      <span className="mr-1">{getCategoryEmoji(category)}</span>
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (Optional)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Expected total expense"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
              
              <Button onClick={handleAddEvent} className="w-full">
                Add Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border w-full"
            modifiers={{
              hasEvent: (date) => getEventsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasEvent: {
                backgroundColor: 'hsl(var(--primary))',
                color: 'hsl(var(--primary-foreground))',
                fontWeight: 'bold'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Selected Date Events */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {format(selectedDate, 'MMMM dd, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map(event => (
                  <div key={event.id} className="p-3 bg-accent rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{event.title}</h3>
                        {event.budget && (
                          <p className="text-sm text-muted-foreground">
                            Budget: ₹{event.budget.toLocaleString()}
                          </p>
                        )}
                        {event.categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {event.categories.map(category => (
                              <Badge key={category} variant="outline" className="text-xs">
                                <span className="mr-1">{getCategoryEmoji(category)}</span>
                                {category}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {event.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.notes}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No events on this date</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div key={event.id} className="p-3 bg-accent rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {getDateLabel(event.date)}
                        </Badge>
                      </div>
                      {event.budget && (
                        <p className="text-sm text-muted-foreground">
                          Budget: ₹{event.budget.toLocaleString()}
                        </p>
                      )}
                      {event.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.categories.map(category => (
                            <Badge key={category} variant="outline" className="text-xs">
                              <span className="mr-1">{getCategoryEmoji(category)}</span>
                              {category}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No upcoming events</p>
              <p className="text-sm">Add an event to track future expenses</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};