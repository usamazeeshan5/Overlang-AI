import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage, QuizQuestion } from '@/types/quiz';
import { QuizSlider } from './QuizSlider';
import { QuizMultiChoice } from './QuizMultiChoice';
import { QuizSingleChoice } from './QuizSingleChoice';
import { QuizTextInput } from './QuizTextInput';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isTyping?: boolean;
  currentQuestion?: QuizQuestion | null;
  onAnswer?: (value: any) => void;
  isComplete?: boolean;
}

export function ChatInterface({ messages, onSendMessage, isTyping, currentQuestion, onAnswer, isComplete }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start space-x-2 max-w-[80%] ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {message.type === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message bubble */}
              <div className="space-y-2">
                <Card
                  className={`p-3 ${
                    message.type === 'user'
                      ? 'bg-chat-bubble-user text-primary-foreground border-0'
                      : 'bg-chat-bubble-bot border border-border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </Card>

                {/* Render question component if this message has question data */}
                {message.questionData && currentQuestion && onAnswer && (
                  <div className="ml-10">
                    {currentQuestion.type === 'slider' && (
                      <QuizSlider
                        question={currentQuestion.question}
                        description={currentQuestion.description}
                        min={currentQuestion.validation?.min || 18}
                        max={currentQuestion.validation?.max || 100}
                        onAnswer={onAnswer}
                        onAskQuestion={(q) => onSendMessage(q)}
                        compact={true}
                      />
                    )}

                    {currentQuestion.type === 'multiChoice' && currentQuestion.options && (
                      <QuizMultiChoice
                        question={currentQuestion.question}
                        description={currentQuestion.description}
                        options={currentQuestion.options}
                        onAnswer={onAnswer}
                        onAskQuestion={(q) => onSendMessage(q)}
                        compact={true}
                      />
                    )}

                    {currentQuestion.type === 'singleChoice' && currentQuestion.options && (
                      <QuizSingleChoice
                        question={currentQuestion.question}
                        description={currentQuestion.description}
                        options={currentQuestion.options}
                        onAnswer={onAnswer}
                        onAskQuestion={(q) => onSendMessage(q)}
                        compact={true}
                      />
                    )}

                    {(currentQuestion.type === 'textInput' || currentQuestion.type === 'numberInput') && (
                      <QuizTextInput
                        question={currentQuestion.question}
                        description={currentQuestion.description}
                        type={currentQuestion.type}
                        validation={currentQuestion.validation}
                        onAnswer={onAnswer}
                        onAskQuestion={(q) => onSendMessage(q)}
                        compact={true}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <Card className="bg-chat-bubble-bot border border-border p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question or type your response..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!inputValue.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          {isComplete 
            ? "Assessment complete! Feel free to ask questions about your results."
            : "Feel free to ask questions about any of the quiz topics for clarification"
          }
        </p>
      </div>
    </div>
  );
}