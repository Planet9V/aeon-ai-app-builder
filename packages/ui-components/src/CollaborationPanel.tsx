/**
 * Collaboration Panel Component - Enhanced Developer Experience
 * Real-time collaboration interface for AI interactions
 */

import React, { useState, useEffect, useRef } from "react"
import { useCollaboration, CollaborationMessage } from "@opencode/ai-hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Users, MessageCircle, Plus, Send, User, Bot, Settings, Crown, Clock, CheckCircle } from "lucide-react"

interface CollaborationPanelProps {
  userId: string
  userName: string
  className?: string
}

export function CollaborationPanel({ userId, userName, className = "" }: CollaborationPanelProps) {
  const {
    sessions,
    currentSession,
    messages,
    isConnected,
    createSession,
    joinSession,
    leaveSession,
    sendCollaborativeMessage,
    changeModel,
  } = useCollaboration(userId, userName)

  const [messageInput, setMessageInput] = useState("")
  const [newSessionName, setNewSessionName] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState("openai/gpt-4o-mini")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !isConnected) return

    await sendCollaborativeMessage(messageInput)
    setMessageInput("")
  }

  const handleCreateSession = () => {
    if (!newSessionName.trim()) return

    createSession(newSessionName)
    setNewSessionName("")
    setIsCreateDialogOpen(false)
  }

  const handleModelChange = async (model: string) => {
    setSelectedModel(model)
    if (currentSession) {
      await changeModel(model)
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "join":
        return <User className="w-4 h-4 text-green-500" />
      case "leave":
        return <User className="w-4 h-4 text-red-500" />
      case "model_change":
        return <Settings className="w-4 h-4 text-blue-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className={`w-full max-w-6xl mx-auto space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            AI Collaboration Hub
          </h2>
          <p className="text-muted-foreground">Collaborate on AI interactions in real-time</p>
        </div>

        <div className="flex gap-2">
          {currentSession && (
            <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
          )}

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Collaboration Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="session-name">Session Name</Label>
                  <Input
                    id="session-name"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    placeholder="Team AI Session"
                  />
                </div>
                <Button onClick={handleCreateSession} className="w-full" disabled={!newSessionName.trim()}>
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sessions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      currentSession?.id === session.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => joinSession(session.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium truncate">{session.name}</h4>
                      {session.isActive && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>{session.participants.length} participants</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {session.lastActivity.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                ))}

                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active sessions</p>
                    <p className="text-sm">Create your first collaboration session</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Interface */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{currentSession ? currentSession.name : "Select a Session"}</CardTitle>
              {currentSession && (
                <div className="flex items-center gap-2">
                  <Select value={selectedModel} onValueChange={handleModelChange}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                      <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini</SelectItem>
                      <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                      <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" size="sm" onClick={leaveSession}>
                    Leave
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-[500px]">
            {currentSession ? (
              <>
                {/* Participants */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">Participants:</span>
                  <div className="flex gap-1">
                    {currentSession.participants.map((participant, index) => (
                      <div key={participant} className="flex items-center gap-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {participant === userId ? "You" : participant.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {participant === userId && <Crown className="w-3 h-3 text-yellow-500" />}
                        {index < currentSession.participants.length - 1 && (
                          <span className="text-muted-foreground">,</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 mb-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No messages yet</p>
                        <p className="text-sm">Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <Avatar className="w-8 h-8 mt-1">
                            <AvatarFallback className="text-xs">
                              {message.userId === userId ? "You" : message.userName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {message.userId === userId ? "You" : message.userName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(message.timestamp)}
                              </span>
                              {getMessageIcon(message.type)}
                            </div>
                            <div className="text-sm whitespace-pre-wrap break-words">{message.content}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={isConnected ? "Type your message..." : "Join a session to chat"}
                    disabled={!isConnected}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!messageInput.trim() || !isConnected}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Active Session</h3>
                  <p>Select a session from the list or create a new one to start collaborating</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Stats */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle>Session Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{currentSession.participants.length}</div>
                <div className="text-sm text-muted-foreground">Active Participants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{messages.length}</div>
                <div className="text-sm text-muted-foreground">Messages Sent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.floor((Date.now() - currentSession.createdAt.getTime()) / 60000)}
                </div>
                <div className="text-sm text-muted-foreground">Minutes Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CollaborationPanel
