import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaComments, FaTimes, FaRobot, FaSpinner, FaMicrophone, FaMicrophoneSlash, FaLightbulb } from "react-icons/fa";
import "./ChatBot.css";

/**
 * 🎤 **ChatBot Component** - צ'אט חכם עם עיצוב מודרני ואינטראקטיבי.
 * - כפתור צ'אט צף 🟣
 * - תיבת שיחה עם אנימציות 🎥
 * - שליחת הודעות וקבלת תגובות מהבוט 🤖
 * - מצבי טעינה ואנימציות 🎭
 * - הצעות מהירות 💡
 * - הקלטה קולית 🎤
 */
const ChatBot = () => {
  const [message, setMessage] = useState(""); // הודעת המשתמש
  const [chatHistory, setChatHistory] = useState([]); // היסטוריית שיחה
  const [isOpen, setIsOpen] = useState(false); // האם הצ'אט פתוח
  const [isLoading, setIsLoading] = useState(false); // מצב טעינה
  const [isTyping, setIsTyping] = useState(false); // מצב הקלדה של הבוט
  const [isRecording, setIsRecording] = useState(false); // מצב הקלטה
  const [showQuickSuggestions, setShowQuickSuggestions] = useState(true); // הצעות מהירות
  const chatBoxRef = useRef(null); // הפנייה לתיבת הצ'אט (לגלילה אוטומטית)
  const inputRef = useRef(null); // הפנייה לשדה הקלט

  // הודעת ברוכים הבאים
  const welcomeMessage = {
    sender: "ChatGPT",
    text: "שלום! אני העוזר החכם של מוסך חוראני. איך אני יכול לעזור לך היום? 🤖✨"
  };

  // הצעות מהירות
  const quickSuggestions = [
    "איך לקבוע תור?",
    "מה שעות הפתיחה?",
    "איזה שירותים אתם מציעים?",
    "כמה עולה טיפול שמן?",
    "האם יש אחריות?",
    "איפה אתם נמצאים?",
    "איך ליצור קשר?",
    "טיפים לתחזוקה"
  ];

  useEffect(() => {
    // הוספת הודעת ברוכים הבאים כשהצ'אט נפתח
    if (isOpen && chatHistory.length === 0) {
      setChatHistory([welcomeMessage]);
    }
  }, [isOpen]);

  /**
   * 📤 **sendMessage()** - שליחת הודעה לשרת וקבלת תשובה מהבוט.
   */
  const sendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || message.trim();
    if (!messageToSend || isLoading) return;

    const userMessage = { sender: "אתה", text: messageToSend };
    
    if (!customMessage) {
      setMessage(""); // איפוס שדה ההקלדה רק אם זו הודעה רגילה
    }
    
    setIsLoading(true);
    setIsTyping(true);
    setShowQuickSuggestions(false); // הסתרת הצעות אחרי הודעה ראשונה

    // הוספת הודעת המשתמש להיסטוריה
    setChatHistory(prev => [...prev, userMessage]);

    try {
      // שליחת בקשה ל-Backend וקבלת תשובה מהבוט
      const { data } = await axios.post("http://localhost:5001/chat", { 
        message: messageToSend 
      });

      // הדמיית הקלדה של הבוט
      setTimeout(() => {
        setIsTyping(false);
        const botResponse = { 
          sender: "ChatGPT", 
          text: data.response,
          timestamp: new Date().toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        };
        setChatHistory(prev => [...prev, botResponse]);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // זמן אקראי בין 1-2 שניות

    } catch (error) {
      console.error("❌ שגיאה בשליחת ההודעה:", error);
      setIsTyping(false);
      setIsLoading(false);
      
      // הודעת שגיאה
      const errorMessage = { 
        sender: "ChatGPT", 
        text: "מצטער, יש בעיה בחיבור. אנא נסה שוב מאוחר יותר. 🔧",
        isError: true
      };
      setChatHistory(prev => [...prev, errorMessage]);
    }
  };

  /**
   * 📜 **useEffect** - גלילה אוטומטית להודעה האחרונה.
   */
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory, isTyping]);

  /**
   * 🎯 **handleKeyPress** - שליחה עם Enter
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /**
   * 🔄 **handleToggle** - פתיחה/סגירה של הצ'אט
   */
  const handleToggle = () => {
    setIsOpen(!isOpen);
    // פוקוס על שדה הקלט כשהצ'אט נפתח
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  };

  /**
   * 🎤 **handleVoiceRecording** - הקלטה קולית (סימולציה)
   */
  const handleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // סימולציה של הקלטה
      setTimeout(() => {
        setIsRecording(false);
        // כאן היה מתבצע זיהוי קולי אמיתי
        const voiceMessage = "אני רוצה לקבוע תור לטיפול שמן";
        sendMessage(voiceMessage);
      }, 3000);
    }
  };

  /**
   * 💡 **handleQuickSuggestion** - בחירת הצעה מהירה
   */
  const handleQuickSuggestion = (suggestion) => {
    sendMessage(suggestion);
  };

  return (
    <div className="chatbot-wrapper">
      {/* 🔘 כפתור לפתיחת הצ'אט */}
      <button 
        className={`chat-toggle ${isOpen ? 'inactive' : ''}`} 
        onClick={handleToggle}
        aria-label="פתח צ'אט"
      >
        {isOpen ? <FaTimes /> : <FaComments />}
      </button>

      {/* 💬 חלון הצ'אט */}
      {isOpen && (
        <div className="chat-container">
          <div className="chat-header">
            <div className="header-content">
              <FaRobot className="bot-icon" />
              <h3>צ'אט שירות לקוחות</h3>
            </div>
            <button 
              className="close-btn" 
              onClick={handleToggle}
              aria-label="סגור צ'אט"
            >
              <FaTimes />
            </button>
          </div>

          {/* 📜 תיבת הצ'אט */}
          <div className="chat-box" ref={chatBoxRef}>
            {chatHistory.map((msg, idx) => (
              <div 
                key={idx} 
                className={`${msg.sender === "אתה" ? "user-msg" : "bot-msg"} ${msg.isError ? 'error-msg' : ''}`}
              >
                <div className="message-content">
                  <span>{msg.text}</span>
                  {msg.timestamp && (
                    <span className="message-time">{msg.timestamp}</span>
                  )}
                </div>
              </div>
            ))}
            
            {/* מצב הקלדה של הבוט */}
            {isTyping && (
              <div className="bot-msg typing-indicator">
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="typing-text">הבוט מקליד...</span>
              </div>
            )}

            {/* הצעות מהירות */}
            {showQuickSuggestions && (
              <div className="quick-suggestions">
                <div className="suggestions-header">
                  <FaLightbulb />
                  <span>הצעות מהירות:</span>
                </div>
                <div className="suggestions-grid">
                  {quickSuggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="suggestion-btn"
                      onClick={() => handleQuickSuggestion(suggestion)}
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 🔤 אזור ההקלדה ושליחת ההודעה */}
          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              placeholder="כתוב הודעה..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              maxLength={500}
            />

            {/* כפתור להצגת הצעות מהירות */}
            <button 
              className="quick-suggestions-btn"
              onClick={() => setShowQuickSuggestions(true)}
              disabled={isLoading}
              aria-label="הצג הצעות מהירות"
            >
              <FaLightbulb />
            </button>

            <button 
              onClick={() => sendMessage()}
              disabled={isLoading || !message.trim()}
              className={isLoading ? 'loading' : ''}
              aria-label="שלח הודעה"
            >
              {isLoading ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ChatBot;
