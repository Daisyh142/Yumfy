import { useState, useRef, useEffect } from "react";
import { supabaseUrl, publicAnonKey } from "../supabase";

export function AIChatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      content: "Hi! I'm your AI cooking assistant. I can help you find recipes based on your mood, spice preferences, time constraints, or suggest ingredient substitutions. What are you in the mood for today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickSuggestions = [
    "I want something spicy and quick",
    "What can I make with chicken and rice?", 
    "I'm in the mood for comfort food",
    "Suggest a healthy 15-minute meal",
    "Can I substitute eggs in this recipe?",
    "What's a good mild curry recipe?"
  ];

  const sendMessage = async (content) => {
    if (!content.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/make-server-5c532092/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          message: content,
          conversationHistory: messages.slice(-5),
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message to AI:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="position-fixed btn btn-primary rounded-circle d-flex align-items-center justify-content-center shadow-lg"
        style={{
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          zIndex: 1050
        }}
      >
        {isOpen ? (
          <i className="bi bi-x" style={{ fontSize: '24px' }}></i>
        ) : (
          <i className="bi bi-chat-dots" style={{ fontSize: '24px' }}></i>
        )}
      </button>
      {isOpen && (
        <div 
          className="position-fixed"
          style={{
            bottom: '90px',
            right: '20px',
            width: '350px',
            zIndex: 1050
          }}
        ><div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white p-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-robot me-2" style={{ fontSize: '20px' }}></i>
                <div>
                  <h6 className="card-title mb-0 fw-medium">AI Cooking Assistant</h6>
                  <small className="opacity-75">Powered by Gemini</small>
                </div>
              </div>
            </div>
            <div className="card-body p-3 bg-light" style={{height: '20rem', overflowY: 'auto'}}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`d-flex mb-3 ${message.isUser ? 'justify-content-end' : 'justify-content-start'}`}
                >
                  <div className={`d-flex align-items-start ${message.isUser ? 'flex-row-reverse' : ''}`} style={{maxWidth: '85%'}}>
                    <div className={`rounded-circle d-flex align-items-center justify-content-center ${message.isUser ? 'bg-secondary ms-2' : 'bg-primary me-2'}`} style={{width: '2rem', height: '2rem', minWidth: '2rem'}}>
                      {message.isUser ? (
                        <i className="bi bi-person-fill text-white" style={{ fontSize: '16px' }}></i>
                      ) : (
                        <i className="bi bi-robot text-white" style={{ fontSize: '16px' }}></i>
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-3 ${
                        message.isUser
                          ? 'bg-secondary text-white'
                          : 'bg-white border'
                      }`}
                    >
                      <p className="mb-0 small" style={{whiteSpace: 'pre-wrap'}}>{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="d-flex justify-content-start mb-3">
                  <div className="d-flex align-items-start">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" style={{width: '2rem', height: '2rem'}}>
                      <i className="bi bi-robot text-white" style={{ fontSize: '16px' }}></i>
                    </div>
                    <div className="bg-white border p-3 rounded-3">
                      <div className="spinner-border spinner-border-sm text-muted" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
            {messages.length === 1 && (
              <div className="card-body border-top p-3 bg-white">
                <p className="small text-muted mb-2">Quick suggestions:</p>
                <div className="d-flex flex-wrap gap-1">
                  {quickSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      className="btn btn-outline-primary btn-sm small py-1 px-2"
                      onClick={() => handleQuickSuggestion(suggestion)}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="card-footer p-3 bg-white">
              <form onSubmit={handleSubmit} className="d-flex gap-2">
                <input
                  type="text"
                  className="form-control"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about recipes, ingredients, or cooking tips..."
                  disabled={isLoading}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <i className="bi bi-send" style={{ fontSize: '16px' }}></i>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
