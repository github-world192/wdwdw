import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, CheckCircle2, Circle, Loader2, Layout } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  completed: number;
  created_at: string;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setAdding(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      });
      const newTask = await res.json();
      setTasks([newTask, ...tasks]);
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setAdding(false);
    }
  };

  const toggleTask = async (id: number, completed: number) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed }),
      });
      const updatedTask = await res.json();
      setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-indigo-100">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 flex items-center gap-3">
              <Layout className="w-8 h-8 text-indigo-600" />
              Tasks
            </h1>
            <p className="text-zinc-500 mt-2">Manage your daily flow with precision.</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400">
              {tasks.filter(t => t.completed).length} / {tasks.length} Done
            </span>
          </div>
        </header>

        <form onSubmit={addTask} className="relative mb-12 group">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full bg-white border border-zinc-200 rounded-2xl px-6 py-4 pr-16 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={adding || !newTaskTitle.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {adding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          </button>
        </form>

        <div className="space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Synchronizing with server...</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group flex items-center gap-4 bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 transition-all"
                >
                  <button
                    onClick={() => toggleTask(task.id, task.completed)}
                    className="flex-shrink-0 transition-colors"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    ) : (
                      <Circle className="w-6 h-6 text-zinc-300 group-hover:text-zinc-400" />
                    )}
                  </button>
                  <span
                    className={`flex-grow text-lg transition-all ${
                      task.completed ? 'text-zinc-400 line-through' : 'text-zinc-700'
                    }`}
                  >
                    {task.title}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {!loading && tasks.length === 0 && (
            <div className="text-center py-20 bg-white border border-dashed border-zinc-200 rounded-3xl">
              <p className="text-zinc-400 font-medium">No tasks yet. Start by adding one above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
