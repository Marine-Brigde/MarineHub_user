"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Anchor, X, Send, Loader2, Package } from "lucide-react"
import { sendChatMessageApi } from "@/api/chat/chatApi"
import { getBoatyardDetailApi } from "@/api/boatyardApi/boatyardApi"
import type { ChatResponse, ChatProduct, ChatRequest, ChatSupplier } from "@/types/chat/chat"

// Render markdown bold text: **text** -> <strong>text</strong>
const renderMarkdownBold = (text: string) => {
    const parts = text.split('**')
    return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part))
}

interface Message {
    id: string
    type: "user" | "assistant"
    content: string
    products?: ChatProduct[]
    suppliers?: ChatSupplier[]
    timestamp: string
}

const CHAT_HISTORY_DURATION = 3 * 60 * 60 * 1000 // 3 giờ tính bằng milliseconds

// Lưu messages vào localStorage (riêng cho từng user)
const saveMessagesToStorage = (messages: Message[], username: string) => {
    try {
        const key = `maritimehub_chat_history_${username}`
        localStorage.setItem(key, JSON.stringify(messages))
    } catch (error) {
        console.error("Error saving chat history:", error)
    }
}

// Load messages từ localStorage và filter những messages trong vòng 3 giờ
const loadMessagesFromStorage = (username: string | null): Message[] => {
    if (!username) return []

    try {
        const key = `maritimehub_chat_history_${username}`
        const stored = localStorage.getItem(key)
        if (!stored) return []

        const messages: Message[] = JSON.parse(stored)
        const now = new Date().getTime()

        // Filter messages trong vòng 3 giờ
        const validMessages = messages.filter((message) => {
            const messageTime = new Date(message.timestamp).getTime()
            return now - messageTime < CHAT_HISTORY_DURATION
        })

        // Nếu có messages bị xóa, lưu lại danh sách đã filter
        if (validMessages.length !== messages.length) {
            saveMessagesToStorage(validMessages, username)
        }

        return validMessages
    } catch (error) {
        console.error("Error loading chat history:", error)
        return []
    }
}

// Cleanup messages cũ hơn 3 giờ
const cleanupOldMessages = (username: string | null) => {
    if (!username) return

    try {
        const key = `maritimehub_chat_history_${username}`
        const stored = localStorage.getItem(key)
        if (!stored) return

        const messages: Message[] = JSON.parse(stored)
        const now = new Date().getTime()

        const validMessages = messages.filter((message) => {
            const messageTime = new Date(message.timestamp).getTime()
            return now - messageTime < CHAT_HISTORY_DURATION
        })

        if (validMessages.length !== messages.length) {
            saveMessagesToStorage(validMessages, username)
        }
    } catch (error) {
        console.error("Error cleaning up chat history:", error)
    }
}

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [userRole, setUserRole] = useState<string | null>(() => {
        // Initialize từ localStorage ngay lập tức
        if (typeof window !== "undefined") {
            return localStorage.getItem("userRole")
        }
        return null
    })
    const [username, setUsername] = useState<string | null>(() => {
        // Initialize username từ localStorage ngay lập tức
        if (typeof window !== "undefined") {
            return localStorage.getItem("username")
        }
        return null
    })
    const [boatyardLocation, setBoatyardLocation] = useState<{ longitude: number; latitude: number } | null>(null)
    const [, setIsLocationLoading] = useState(false)
    const scrollAreaRef = useRef<HTMLDivElement>(null)

    // Fetch boatyard location; reuse for initial load and before sending chat
    const loadBoatyardLocation = useCallback(async () => {
        console.log("Starting to fetch boatyard location...")
        setIsLocationLoading(true)
        try {
            const response = await getBoatyardDetailApi()
            console.log("Boatyard API response:", response)

            // Chấp nhận theo data/status vì backend không trả isSuccess
            if (response && response.data) {
                console.log("Raw longitude:", response.data.longitude, "latitude:", response.data.latitude)
                const location = {
                    longitude: parseFloat(response.data.longitude),
                    latitude: parseFloat(response.data.latitude),
                }
                console.log("Parsed location:", location)
                console.log("Is valid location?", !isNaN(location.longitude) && !isNaN(location.latitude))
                if (!isNaN(location.longitude) && !isNaN(location.latitude)) {
                    setBoatyardLocation(location)
                    return location
                }
            } else {
                console.warn("Boatyard API response is not successful or has no data")
            }
        } catch (error) {
            console.error("Error fetching boatyard location:", error)
        } finally {
            setIsLocationLoading(false)
        }
        return null
    }, [])

    // Check user role và username từ localStorage và listen for changes
    useEffect(() => {
        const checkUser = () => {
            const role = localStorage.getItem("userRole")
            const user = localStorage.getItem("username")
            setUserRole(role)
            setUsername(user)
        }

        // Check ngay lập tức
        checkUser()

        // Listen for storage changes (khi user login/logout từ tab khác)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === "userRole" || e.key === "username") {
                checkUser()
            }
        }

        // Listen for custom event khi login/logout trong cùng tab
        const handleRoleChange = () => {
            checkUser()
        }

        window.addEventListener("storage", handleStorageChange)
        window.addEventListener("roleChanged", handleRoleChange)

        return () => {
            window.removeEventListener("storage", handleStorageChange)
            window.removeEventListener("roleChanged", handleRoleChange)
        }
    }, [])

    // Load messages từ localStorage khi component mount và user là Boatyard
    useEffect(() => {
        if (userRole !== "Boatyard" || !username) {
            // Reset messages nếu không phải Boatyard hoặc chưa có username
            setMessages([])
            setBoatyardLocation(null)
            return
        }

        const loadedMessages = loadMessagesFromStorage(username)
        setMessages(loadedMessages)

        // Lấy thông tin boatyard để có longitude và latitude
        loadBoatyardLocation()

        // Cleanup messages cũ mỗi 30 phút
        const cleanupInterval = setInterval(() => {
            cleanupOldMessages(username)
            const updatedMessages = loadMessagesFromStorage(username)
            setMessages(updatedMessages)
        }, 30 * 60 * 1000) // 30 phút

        return () => clearInterval(cleanupInterval)
    }, [userRole, username, loadBoatyardLocation])

    // Lưu messages vào localStorage mỗi khi có thay đổi
    useEffect(() => {
        if (messages.length > 0 && username) {
            saveMessagesToStorage(messages, username)
        }
    }, [messages, username])

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current && isOpen) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-slot="scroll-area-viewport"]')
            if (scrollContainer) {
                setTimeout(() => {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight
                }, 100)
            }
        }
    }, [messages, isOpen, isLoading])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        console.log("Current boatyardLocation:", boatyardLocation)
        // Cảnh báo nếu chưa có location
        if (!boatyardLocation) {
            console.warn("⚠️ Boatyard location not loaded yet!")
        }


        const userMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: inputValue.trim(),
            timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, userMessage])
        setInputValue("")
        setIsLoading(true)

        try {
            // Đảm bảo có location: nếu chưa có thì fetch trước khi gửi
            let location = boatyardLocation
            if (!location) {
                location = await loadBoatyardLocation()
            }

            // Nếu vẫn chưa có tọa độ hợp lệ, trả lỗi và không gọi API
            if (
                !location ||
                typeof location.longitude !== "number" ||
                typeof location.latitude !== "number" ||
                isNaN(location.longitude) ||
                isNaN(location.latitude)
            ) {
                console.warn("⚠️ Không thể lấy tọa độ boatyard, hủy gửi chat")
                const errorMessage: Message = {
                    id: (Date.now() + 2).toString(),
                    type: "assistant",
                    content: "Không thể lấy tọa độ của xưởng. Vui lòng thử lại sau.",
                    timestamp: new Date().toISOString(),
                }
                setMessages((prev) => [...prev, errorMessage])
                setIsLoading(false)
                return
            }

            // Build request với tọa độ bắt buộc
            const chatRequest: ChatRequest = {
                prompt: userMessage.content,
                longitude: location.longitude,
                latitude: location.latitude,
            }

            console.log("Sending chat request:", chatRequest)
            const response: ChatResponse = await sendChatMessageApi(chatRequest)

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "assistant",
                content: response.promptResponse,
                products: response.products || undefined,
                suppliers: response.suppliers || undefined,
                timestamp: response.timestamp,
            }

            setMessages((prev) => [...prev, assistantMessage])
        } catch (error: any) {
            console.error("Error sending message:", error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                type: "assistant",
                content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
                timestamp: new Date().toISOString(),
            }
            setMessages((prev) => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleProductClick = (productId: string) => {
        window.location.href = `/products/${productId}`
        setIsOpen(false)
    }

    // Chỉ hiển thị chat widget nếu user có role là Boatyard
    if (userRole !== "Boatyard") {
        return null
    }

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl transition-all z-50 bg-primary hover:bg-primary/90 hover:scale-110 active:scale-95"
                size="icon"
                aria-label={isOpen ? "Đóng chat" : "Mở chat"}
            >
                {isOpen ? (
                    <X className="h-6 w-6" />
                ) : (
                    <Anchor className="h-7 w-7 animate-pulse" />
                )}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-24 right-6 w-[420px] max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-8rem)] flex flex-col shadow-2xl z-50 border-2 animate-in slide-in-from-bottom-4 fade-in duration-300 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b bg-primary/5 shrink-0">
                        <div className="flex items-center gap-2">
                            <Anchor className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold text-lg">MaritimeHub Chat</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ScrollArea className="h-full" ref={scrollAreaRef}>
                            <div className="p-4 space-y-4">
                                {/* Welcome Message - Hiển thị khi không có tin nhắn nào */}
                                {messages.length === 0 ? (
                                    <>
                                        <div className="flex justify-start">
                                            <div className="max-w-[85%] rounded-lg px-4 py-2.5 bg-muted">
                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                    Bạn cần hỗ trợ gì?
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center min-h-[300px] text-center text-muted-foreground">
                                            <Anchor className="h-12 w-12 mb-4 text-primary/50" />
                                            <p className="text-sm">
                                                Chào mừng đến với MaritimeHub Chat!
                                            </p>
                                            <p className="text-xs mt-2">
                                                Hãy hỏi tôi về sản phẩm, xưởng sửa chữa hoặc nhà cung cấp.
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[85%] rounded-lg px-4 py-2.5 ${message.type === "user"
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted"
                                                    }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap break-words">
                                                    {renderMarkdownBold(message.content)}
                                                </p>

                                                {/* Suppliers List - Hiển thị nhà cung cấp gần nhất */}
                                                {message.suppliers && message.suppliers.length > 0 && (
                                                    <div className="mt-3 space-y-2 pt-3 border-t border-border/50">
                                                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                                            <Package className="h-3 w-3" />
                                                            Nhà cung cấp gần nhất:
                                                        </p>
                                                        <div className="space-y-2">
                                                            {(message.suppliers as ChatSupplier[]).map((supplier) => (
                                                                <div
                                                                    key={supplier.Id}
                                                                    className="bg-background/50 rounded-md p-2 border border-border/50 hover:bg-background transition-colors"
                                                                >
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium">
                                                                                {supplier.Name}
                                                                            </p>
                                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                                Cách: <strong>{supplier.distance_km.toFixed(2)}</strong> km
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Products List */}
                                                {message.products && message.products.length > 0 && (
                                                    <div className="mt-3 space-y-2 pt-3 border-t border-border/50">
                                                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                                                            <Package className="h-3 w-3" />
                                                            Sản phẩm liên quan:
                                                        </p>
                                                        <div className="space-y-2">
                                                            {message.products.map((product) => (
                                                                <div
                                                                    key={product.Id}
                                                                    onClick={() => handleProductClick(product.Id)}
                                                                    className="bg-background/50 rounded-md p-2 cursor-pointer hover:bg-background transition-colors border border-border/50"
                                                                >
                                                                    <div className="flex items-start justify-between gap-2">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-xs font-medium truncate">
                                                                                {product.Name}
                                                                            </p>
                                                                            {product.Description && (
                                                                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                                    {product.Description}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                        {product.IsHasVariant && (
                                                                            <Badge variant="secondary" className="text-xs shrink-0">
                                                                                Nhiều size
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-xs opacity-70 mt-2">
                                                    {new Date(message.timestamp).toLocaleTimeString("vi-VN", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-muted rounded-lg px-4 py-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-background shrink-0">
                        <div className="flex gap-2">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Nhập câu hỏi của bạn..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                size="icon"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Nhấn Enter để gửi
                        </p>
                    </div>
                </Card>
            )}
        </>
    )
}

