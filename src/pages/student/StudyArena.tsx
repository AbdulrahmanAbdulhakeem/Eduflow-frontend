import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import MainLayout from '../../components/layout/MainLayout';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Send } from 'lucide-react';
import { useCourseStore } from '../../store/courseStore';
import { toast } from 'sonner';

export default function StudyArena() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const { currentCourse, getCourseById } = useCourseStore();
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string }[]>([
    { role: 'ai', content: "Hello! I'm your AI study assistant. Ask me anything about this material." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (courseId) {
      getCourseById(courseId);
    }
  }, [courseId]);

  const currentMaterial = currentCourse?.materials?.[currentMaterialIndex];

  const handleSendMessage = async () => {
    if (!input.trim() || !currentMaterial) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      // Call your backend AI endpoint
      const res = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          materialTitle: currentMaterial.title,
          courseTitle: currentCourse?.title
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.response || "I couldn't process that." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I'm having trouble responding right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentCourse) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">Loading Study Arena...</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-screen flex flex-col">
        {/* Top Bar */}
        <div className="border-b p-4 flex items-center justify-between bg-white dark:bg-gray-950">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/student')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="font-semibold">{currentCourse.title}</h1>
              <p className="text-sm text-gray-500">{currentMaterial?.title}</p>
            </div>
          </div>

          {/* Material Navigation */}
          {currentCourse.materials && currentCourse.materials.length > 1 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentMaterialIndex === 0}
                onClick={() => setCurrentMaterialIndex(prev => prev - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentMaterialIndex === currentCourse.materials.length - 1}
                onClick={() => setCurrentMaterialIndex(prev => prev + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* PDF Viewer */}
          <div className="flex-1 border-r bg-gray-50 dark:bg-gray-900 p-4">
            {currentMaterial ? (
              <div className="h-full border rounded-2xl bg-white overflow-hidden">
                <iframe
                  src={currentMaterial.fileUrl}
                  className="w-full h-full"
                  title={currentMaterial.title}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No material available
              </div>
            )}
          </div>

          {/* AI Chat Sidebar */}
          <div className="w-96 flex flex-col bg-white dark:bg-gray-950 border-l">
            <div className="p-4 border-b">
              <h3 className="font-semibold flex items-center gap-2">
                AI Study Assistant
              </h3>
              <p className="text-xs text-gray-500">Ask questions about this material</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && <p className="text-sm text-gray-500">Thinking...</p>}
            </div>

            {/* Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask anything about this topic..."
                  className="flex-1 border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button onClick={handleSendMessage} disabled={!input.trim() || isLoading}>
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