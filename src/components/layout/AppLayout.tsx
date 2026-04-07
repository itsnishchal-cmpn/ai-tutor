import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CurriculumSidebar from './CurriculumSidebar';
import ProgressPanel from './ProgressPanel';
import ChatInterface from '../chat/ChatInterface';
import { useChat } from '../../hooks/useChat';
import { useUser } from '../../contexts/UserContext';
import { useProgress } from '../../contexts/ProgressContext';
import {
  Menu,
  X,
  BarChart3,
  GraduationCap,
  LogOut,
} from 'lucide-react';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const { currentTopicId, selectTopic, messages, isStreaming, streamingContent, sendUserMessage } = useChat();
  const { clearUser } = useUser();
  const { markTopicCompleted } = useProgress();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearUser();
    navigate('/');
  };

  const handleTopicComplete = useCallback(() => {
    if (currentTopicId) {
      markTopicCompleted(currentTopicId);
    }
  }, [currentTopicId, markTopicCompleted]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar (mobile) */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 shrink-0">
        <button onClick={() => setSidebarOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <Menu size={20} className="text-gray-600" />
        </button>
        <div className="flex items-center gap-1.5">
          <GraduationCap size={20} className="text-brand-600" />
          <span className="font-semibold text-gray-800">
            Padh<span className="text-brand-600">AI</span>
          </span>
        </div>
        <button onClick={() => setProgressOpen(true)} className="p-1.5 hover:bg-gray-100 rounded-lg">
          <BarChart3 size={20} className="text-gray-600" />
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — desktop always, mobile overlay */}
        <aside className="hidden lg:flex w-[280px] border-r border-gray-100 shrink-0">
          <div className="flex flex-col w-full">
            {/* Desktop header with logo */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-1.5">
                <GraduationCap size={20} className="text-brand-600" />
                <span className="font-semibold text-gray-800">
                  Padh<span className="text-brand-600">AI</span>
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
            <CurriculumSidebar
              currentTopicId={currentTopicId}
              onSelectTopic={selectTopic}
            />
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-[300px] bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-semibold text-gray-800">Curriculum</span>
                <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <CurriculumSidebar
                currentTopicId={currentTopicId}
                onSelectTopic={selectTopic}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Chat area */}
        <main className="flex-1 min-w-0">
          <ChatInterface
            messages={messages}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
            onSend={sendUserMessage}
            currentTopicId={currentTopicId}
            onSelectTopic={selectTopic}
            onTopicComplete={handleTopicComplete}
          />
        </main>

        {/* Progress panel — desktop always, mobile bottom sheet */}
        <aside className="hidden lg:block w-[280px] border-l border-gray-100 shrink-0">
          <ProgressPanel />
        </aside>

        {/* Mobile progress overlay */}
        {progressOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/30" onClick={() => setProgressOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-[300px] bg-white shadow-xl">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <span className="font-semibold text-gray-800">Progress</span>
                <button onClick={() => setProgressOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
              <ProgressPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
