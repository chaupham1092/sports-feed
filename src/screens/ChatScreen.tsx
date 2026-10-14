/**
 * src/screens/ChatScreen.tsx
 * ------------------------------------------------------------------
 * A lightweight chat thread for one post. Demonstrates the "chat
 * functionality" the JD calls out, plus loading/empty states driven
 * by React Query.
 * ------------------------------------------------------------------
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChatMessage } from '../domain/types';
import { useChat, useSendMessage } from '../hooks/useChat';

interface Props {
  postId: string;
  author: string;
  onClose: () => void;
}

export function ChatScreen({ postId, author, onClose }: Props) {
  const { data: messages, isLoading } = useChat(postId);
  const sendMessage = useSendMessage(postId);
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      return;
    }
    const msg: ChatMessage = {
      id: `local-${Date.now()}`,
      postId,
      author,
      text: trimmed,
      createdAt: Date.now(),
    };
    sendMessage.mutate(msg);
    setText('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
      testID="chat-screen"
    >
      <View style={styles.header}>
        <Text style={styles.title}>Chat</Text>
        <Pressable onPress={onClose} testID="chat-close" hitSlop={8}>
          <Text style={styles.close}>Done</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ActivityIndicator testID="chat-loading" style={styles.loading} />
      ) : (
        <FlatList
          data={messages ?? []}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty} testID="chat-empty">
              No messages yet. Start the conversation.
            </Text>
          }
          renderItem={({ item }) => <Bubble message={item} mine={item.author === author} />}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          testID="chat-input"
          value={text}
          onChangeText={setText}
          placeholder="Message…"
          placeholderTextColor="#6b7280"
          style={styles.input}
        />
        <Pressable onPress={handleSend} testID="chat-send" style={styles.send}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ message, mine }: { message: ChatMessage; mine: boolean }) {
  return (
    <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
      {!mine ? <Text style={styles.bubbleAuthor}>{message.author}</Text> : null}
      <Text style={styles.bubbleText}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0b1220' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  title: { color: '#f9fafb', fontSize: 18, fontWeight: '800' },
  close: { color: '#60a5fa', fontSize: 15, fontWeight: '700' },
  loading: { marginTop: 24 },
  list: { padding: 12, gap: 8 },
  empty: { color: '#6b7280', textAlign: 'center', marginTop: 40 },
  bubble: { maxWidth: '80%', borderRadius: 14, padding: 10 },
  mine: { backgroundColor: '#2563eb', alignSelf: 'flex-end' },
  theirs: { backgroundColor: '#1f2937', alignSelf: 'flex-start' },
  bubbleAuthor: { color: '#93c5fd', fontSize: 12, fontWeight: '700', marginBottom: 2 },
  bubbleText: { color: '#f9fafb', fontSize: 15 },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
  },
  input: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#f9fafb',
  },
  send: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  sendText: { color: '#fff', fontWeight: '700' },
});
