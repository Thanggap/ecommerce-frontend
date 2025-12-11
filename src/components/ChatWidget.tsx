import React, { useState, useRef, useEffect } from "react";
import {
  Fab,
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Slide,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ChatService, { ChatMessage, ProductSuggestion } from "../services/Chat";

interface MessageWithProducts {
  role: "user" | "assistant";
  content: string;
  products?: ProductSuggestion[];
}

export default function ChatWidget() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<MessageWithProducts[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    }
  }, []);

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom when new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: MessageWithProducts = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // Convert to ChatMessage format for API
      const apiMessages: ChatMessage[] = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await ChatService.sendMessage(apiMessages);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response.message,
          products: response.products,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("chat.error", "Sorry, something went wrong. Please try again."),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleProductClick = (slug: string) => {
    navigate(`/products/${slug}`);
    setOpen(false);
  };

  return (
    <>
      {/* Chat Window */}
      <Slide direction="up" in={open} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: { xs: "calc(100% - 40px)", sm: 380 },
            height: 500,
            maxHeight: "70vh",
            display: "flex",
            flexDirection: "column",
            zIndex: 1300,
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: "primary.main",
              color: "white",
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6">Shopping Assistant</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Powered by AI
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={() => {
                  setMessages([]);
                  localStorage.removeItem("chatMessages");
                }}
                sx={{ color: "white" }}
                title="Clear chat history"
              >
                <span style={{ fontSize: "20px" }}>🗑️</span>
              </IconButton>
              <IconButton size="small" onClick={() => setOpen(false)} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "#f5f5f5",
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Typography color="text.secondary" variant="body1" sx={{ mb: 2 }}>
                  Hi! I'm your shopping assistant 👋
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Ask me about products, recommendations, or help with your order!
                </Typography>
              </Box>
            )}

            {messages.map((msg, idx) => (
              <Box key={idx}>
                {/* Message Bubble */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <Paper
                    elevation={1}
                    sx={{
                      maxWidth: "80%",
                      p: 1.5,
                      bgcolor: msg.role === "user" ? "primary.main" : "white",
                      color: msg.role === "user" ? "white" : "text.primary",
                      borderRadius: 2,
                      borderBottomRightRadius: msg.role === "user" ? 0 : 2,
                      borderBottomLeftRadius: msg.role === "assistant" ? 0 : 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {msg.content}
                    </Typography>
                  </Paper>
                </Box>

                {/* Product Suggestions */}
                {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
                  <Box sx={{ mt: 1.5, ml: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                      Product Suggestions:
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {msg.products.map((product, pIdx) => (
                        <Card
                          key={pIdx}
                          elevation={2}
                          sx={{
                            cursor: "pointer",
                            transition: "all 0.2s",
                            "&:hover": {
                              transform: "translateY(-2px)",
                              boxShadow: 4,
                            },
                          }}
                          onClick={() => handleProductClick(product.slug)}
                        >
                          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", mb: 0.5 }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
                                {product.name}
                              </Typography>
                              {product.on_sale && (
                                <Chip
                                  label="SALE"
                                  size="small"
                                  color="error"
                                  sx={{ height: 18, fontSize: "0.65rem" }}
                                />
                              )}
                            </Box>
                            
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                              {product.category}
                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                              <Typography variant="body2" fontWeight={600} color="primary">
                                ${product.price.toFixed(2)}
                              </Typography>
                              {product.original_price && (
                                <Typography
                                  variant="caption"
                                  sx={{ textDecoration: "line-through", color: "text.secondary" }}
                                >
                                  ${product.original_price.toFixed(2)}
                                </Typography>
                              )}
                            </Box>

                            {product.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                                {product.description.substring(0, 60)}...
                              </Typography>
                            )}

                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Typography variant="caption" color={product.stock > 0 ? "success.main" : "error.main"}>
                                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                              </Typography>
                              <Button
                                size="small"
                                variant="outlined"
                                endIcon={<LocalOfferIcon />}
                                sx={{ fontSize: "0.7rem", py: 0.3 }}
                              >
                                View
                              </Button>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ))}

            {loading && (
              <Box sx={{ alignSelf: "flex-start" }}>
                <Paper elevation={1} sx={{ p: 1.5, bgcolor: "white", borderRadius: 2 }}>
                  <CircularProgress size={20} />
                </Paper>
              </Box>
            )}

            <div ref={messagesEndRef} />
          </Box>

          {/* Input */}
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", bgcolor: "white" }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                autoComplete="off"
              />
              <IconButton color="primary" onClick={handleSend} disabled={!input.trim() || loading}>
                <SendIcon />
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, textAlign: "center" }}>
              Try: "Show me protein powder" or "Recommend vitamins for immunity"
            </Typography>
          </Box>
        </Paper>
      </Slide>

      {/* Floating Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setOpen(!open)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1200,
        }}
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </Fab>
    </>
  );
}
