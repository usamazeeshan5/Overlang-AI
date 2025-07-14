import { useState, useEffect } from 'react';
import { QuizSlider } from './QuizSlider';
import { QuizMultiChoice } from './QuizMultiChoice';
import { QuizSingleChoice } from './QuizSingleChoice';
import { QuizTextInput } from './QuizTextInput';
import { ChatInterface } from './ChatInterface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ChatMessage, QuizState } from '@/types/quiz';
import { quizQuestions } from '@/data/quizQuestions';
import { MessageSquare, FileText } from 'lucide-react';

export function QuizEngine() {
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionId: 'welcome',
    answers: {},
    chatMessages: [],
    isComplete: false,
    canAskQuestions: false
  });
  
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with welcome message and first question
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      content: 'Welcome to Overang AI Health Platform! I\'m here to help you get personalized health recommendations. Let\'s start with a few questions to understand your health profile better.',
      timestamp: new Date()
    };

    setTimeout(() => {
      const firstQuestion = quizQuestions['age'];
      const questionMessage: ChatMessage = {
        id: '2',
        type: 'bot',
        content: firstQuestion.question,
        timestamp: new Date(),
        questionData: firstQuestion
      };
      
      setQuizState(prev => ({
        ...prev,
        currentQuestionId: 'age',
        chatMessages: [welcomeMessage, questionMessage],
        canAskQuestions: true
      }));
    }, 1500);
  }, []);

  const currentQuestion = quizState.currentQuestionId 
    ? quizQuestions[quizState.currentQuestionId] 
    : null;

  const handleAnswer = (value: any) => {
    if (!currentQuestion) return;

    const newAnswers = {
      ...quizState.answers,
      [currentQuestion.id]: value
    };

    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: formatAnswerForChat(currentQuestion, value),
      timestamp: new Date()
    };

    // Determine next question
    let nextQuestionId: string | null = null;
    if (typeof currentQuestion.next === 'function') {
      nextQuestionId = currentQuestion.next(value);
    } else if (typeof currentQuestion.next === 'string') {
      nextQuestionId = currentQuestion.next;
    }

    const isComplete = nextQuestionId === 'complete' || !nextQuestionId;

    setQuizState(prev => ({
      ...prev,
      answers: newAnswers,
      currentQuestionId: isComplete ? null : nextQuestionId,
      isComplete,
      chatMessages: [...prev.chatMessages, userMessage],
      canAskQuestions: true
    }));

    // Add bot response
    if (!isComplete && nextQuestionId) {
      setTimeout(() => {
        const nextQuestion = quizQuestions[nextQuestionId];
        if (nextQuestion) {
          const botMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: `Great! Now let's move on to: ${nextQuestion.question}`,
            timestamp: new Date()
          };
          
          setQuizState(prev => ({
            ...prev,
            chatMessages: [...prev.chatMessages, botMessage]
          }));
        }
      }, 1000);
    } else if (isComplete) {
      setTimeout(() => {
        const completionMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'Thank you for completing the assessment! Based on your responses, I\'m preparing personalized recommendations for you. This information will help us provide the most relevant health and wellness guidance.',
          timestamp: new Date()
        };
        
        setQuizState(prev => ({
          ...prev,
          chatMessages: [...prev.chatMessages, completionMessage]
        }));
      }, 1000);
    }
  };

  const handleChatMessage = (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setQuizState(prev => ({
      ...prev,
      chatMessages: [...prev.chatMessages, userMessage]
    }));

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = generateBotResponse(message, currentQuestion);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date()
      };
      
      setQuizState(prev => ({
        ...prev,
        chatMessages: [...prev.chatMessages, botMessage]
      }));
    }, 1500);
  };

  // Remove unused function

  const formatAnswerForChat = (question: any, value: any): string => {
    switch (question.type) {
      case 'multiChoice':
        return Array.isArray(value) 
          ? `Selected: ${value.join(', ')}`
          : `Selected: ${value}`;
      case 'slider':
        return `Age: ${value}`;
      case 'numberInput':
        return `${question.id === 'weight' ? 'Weight:' : 'Value:'} ${value}`;
      case 'textInput':
        return value;
      default:
        return `Selected: ${value}`;
    }
  };

  const generateBotResponse = (userMessage: string, question: any): string => {
    // Simple response generation based on context
    if (userMessage.toLowerCase().includes('help') || userMessage.toLowerCase().includes('explain')) {
      if (question?.id === 'age') {
        return "Age helps us provide recommendations that are appropriate for your life stage. Different age groups have different nutritional needs and health considerations.";
      }
      if (question?.id === 'conditions') {
        return "Medical conditions help us understand any specific health considerations you might have. This information is used only to provide more relevant recommendations and is kept completely confidential.";
      }
      if (question?.id === 'weight') {
        return "Weight information helps us calculate appropriate nutritional recommendations and suggest realistic health goals. All information is kept private and secure.";
      }
      return "I'm here to help clarify any questions about the health assessment. Feel free to ask about any specific terms or why we need certain information.";
    }
    
    return "Thanks for your question! I'm here to help you understand any part of the assessment. Is there anything specific you'd like me to explain?";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">O</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Overang</h1>
                <p className="text-sm text-muted-foreground">AI Health Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {quizState.isComplete && (
                <Button className="bg-primary hover:bg-primary/90">
                  <FileText className="w-4 h-4 mr-2" />
                  Get Recommendations
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="container mx-auto h-[calc(100vh-80px)] flex flex-col">
        <ChatInterface
          messages={quizState.chatMessages}
          onSendMessage={handleChatMessage}
          isTyping={isTyping}
          currentQuestion={currentQuestion}
          onAnswer={handleAnswer}
          isComplete={quizState.isComplete}
        />
      </div>
    </div>
  );
}