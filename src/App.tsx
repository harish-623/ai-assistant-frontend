import { useEffect, useRef, useState } from "react";

import "./App.css";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import { oneDark }
from "react-syntax-highlighter/dist/esm/styles/prism";

interface Message {
  text: string;
  sender: "user" | "ai";
}

function App() {

  const [messages, setMessages] = useState<Message[]>([]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  // ==========================================
  // AUTO SCROLL
  // ==========================================

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });

  }, [messages, loading]);

  // ==========================================
  // SEND MESSAGE
  // ==========================================

  const sendMessage = async () => {

    if (!input.trim() || loading) return;

    const userMessage: Message = {
      text: input,
      sender: "user"
    };

    setMessages(prev => [
      ...prev,
      userMessage
    ]);

    const currentInput = input;

    setInput("");

    setLoading(true);

    try {

      const response = await fetch(
        "https://ai-platform-backend-gblj.onrender.com/ai/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: currentInput
          }),
        }
      );

      const data = await response.json();

      const aiMessage: Message = {
        text: data.response,
        sender: "ai"
      };

      setMessages(prev => [
        ...prev,
        aiMessage
      ]);

    } catch (error) {

      const errorMessage: Message = {
        text:
          "Unable to connect with AI server.",
        sender: "ai"
      };

      setMessages(prev => [
        ...prev,
        errorMessage
      ]);

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="app">

      {/* SIDEBAR */}

      <div className="sidebar">

        <div>

          <h1>AI Assistant</h1>

          <p>
            Intelligent AI Chat Platform
          </p>

        </div>

      </div>

      {/* MAIN CHAT */}

      <div className="chat-container">

        {/* HEADER */}

        <div className="chat-header">

          <div>

            <h2>AI Assistant</h2>

            <span>
              Online
            </span>

          </div>

        </div>

        {/* MESSAGES */}

        <div className="messages">

          {messages.length === 0 && (

            <div className="welcome">

              <h1>
                Welcome to AI Assistant
              </h1>

              <p>
                Ask anything and get
                intelligent answers instantly.
              </p>

            </div>

          )}

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`message-row ${msg.sender}`}
            >

              <div
                className={`message ${msg.sender}`}
              >

                <ReactMarkdown

                  remarkPlugins={[
                    remarkGfm
                  ]}

                  components={{

                    // ==========================================
                    // CODE BLOCK
                    // ==========================================

                    code({
                      inline,
                      className,
                      children,
                      ...props
                    }: any) {

                      const match =
                        /language-(\w+)/.exec(
                          className || ""
                        );

                      const codeText =
                        String(children)
                          .replace(/\n$/, "");

                      return !inline && match ? (

                        <div className="code-block">

                          <div className="code-header">

                            <span>
                              {match[1]}
                            </span>

                            <button
                              onClick={() =>
                                navigator
                                  .clipboard
                                  .writeText(
                                    codeText
                                  )
                              }
                            >
                              Copy
                            </button>

                          </div>

                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {codeText}
                          </SyntaxHighlighter>

                        </div>

                      ) : (

                        <code
                          className="inline-code"
                        >
                          {children}
                        </code>

                      );
                    },

                    // ==========================================
                    // BULLET POINTS
                    // ==========================================

                    ul({ children }) {

                      return (
                        <ul className="custom-list">
                          {children}
                        </ul>
                      );
                    },

                    li({ children }) {

                      return (
                        <li className="custom-list-item">
                          {children}
                        </li>
                      );
                    },

                    // ==========================================
                    // PARAGRAPH
                    // ==========================================

                    p({ children }) {

                      return (
                        <p className="markdown-paragraph">
                          {children}
                        </p>
                      );
                    }

                  }}

                >

                  {msg.text}

                </ReactMarkdown>

              </div>

            </div>

          ))}

          {/* LOADING */}

          {loading && (

            <div className="message-row ai">

              <div className="message ai typing">

                Thinking...

              </div>

            </div>

          )}

          <div ref={messagesEndRef}></div>

        </div>

        {/* INPUT AREA */}

        <div className="input-area">

          <input
            type="text"
            placeholder="Ask anything..."
            value={input}
            disabled={loading}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) => {

              if (e.key === "Enter") {

                sendMessage();

              }

            }}
          />

          <button
            onClick={sendMessage}
            disabled={loading}
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}

export default App;