import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import MainLayout from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import api from '../../api/axios';
import { toast } from 'sonner';
import socket from '@/lib/socket';
import { useAuthStore } from '@/store/authStore';

export default function StudyArena() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { currentCourse, getCourseById } = useCourseStore();

  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([
    { role: 'ai', content: "Hi! I'm your AI study assistant. Ask me anything about the current material." }
  ]);
  const [input, setInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (courseId) getCourseById(courseId);
  }, [courseId, getCourseById]);

  const materials = currentCourse?.materials || [];
  const currentMaterial = materials[currentMaterialIndex];

  useEffect(() => {
    if (courseId && user) {
      socket.emit('presence:initialize', {
        studentId: user.id,
        name: user.name,
        email: user.email,
        courseId,
      });
    }
  }, [courseId, user]);

  useEffect(() => {
    if (currentMaterial && courseId) {
      socket.emit('presence:update_material', {
        courseId,
        materialId: currentMaterial.id,
        materialTitle: currentMaterial.title,
      });
    }
  }, [currentMaterial, courseId]);

  useEffect(() => {
    return () => {
      if (courseId) {
        socket.emit('presence:update_action', {
          courseId,
          action: "Left Study Arena"
        });
      }
    };
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      socket.emit('presence:update_action', {
        courseId,
        action: "Studying with AI Assistant"
      });
    }
  }, [courseId]);

  const handleSendMessage = async () => {
    if (!input.trim() || !currentMaterial) return;

    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput("");
    setIsAiLoading(true);

    try {
      const response = await api.post('/api/v1/ai/chat', {
        prompt: userMsg,                    // ← Changed to 'prompt'
        materialTitle: currentMaterial.title,
        courseTitle: currentCourse?.title
      });

      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: response.data.answer || response.data.response || "Sorry, I couldn't generate a response." 
      }]);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "I'm having trouble connecting right now.";
      setMessages(prev => [...prev, { role: 'ai', content: errorMsg }]);
      toast.error("AI assistant is not responding");
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!currentCourse) {
    return (
      <MainLayout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-green-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex h-screen flex-col overflow-hidden">
        {/* Top Navigation */}
        <div className="border-b bg-white dark:bg-gray-950 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/student')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
            <div>
              <h1 className="font-semibold text-lg">{currentCourse.title}</h1>
              <p className="text-sm text-gray-500">{currentMaterial?.title || "No material selected"}</p>
            </div>
          </div>

          {materials.length > 1 && (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" disabled={currentMaterialIndex === 0} onClick={() => setCurrentMaterialIndex(i => i - 1)}>
                Previous
              </Button>
              <span className="text-sm text-gray-500 px-3">
                {currentMaterialIndex + 1} / {materials.length}
              </span>
              <Button variant="outline" size="sm" disabled={currentMaterialIndex === materials.length - 1} onClick={() => setCurrentMaterialIndex(i => i + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 flex items-center justify-center">
            {currentMaterial ? (
              <div className="w-full h-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden border">
                <iframe
                  src={currentMaterial.fileUrl}
                  className="w-full h-full"
                  title={currentMaterial.title}
                />
              </div>
            ) : (
              <div className="text-center text-gray-500">No materials available for this course.</div>
            )}
          </div>

          {/* AI Chat Sidebar */}
          <div className="w-96 flex flex-col border-l bg-white dark:bg-gray-950">
            <div className="p-5 border-b">
              <h3 className="font-semibold">AI Study Assistant</h3>
              <p className="text-xs text-gray-500">Helping you understand this material</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask about this material..."
                  className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isAiLoading}
                />
                <Button onClick={handleSendMessage} disabled={!input.trim() || isAiLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}