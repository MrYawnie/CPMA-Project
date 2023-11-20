import React, { useState, useRef, useContext, useEffect } from 'react';
import { Text, View, Button, TextInput, StyleSheet, Switch, FlatList } from 'react-native';
import { server } from '../../constant';
import Markdown from '@ronradtke/react-native-markdown-display';
import { Keyboard } from 'react-native';
import { useSettings } from '../Settings';
import { FIREBASE_AUTH, FIREBASE_DB } from '../../../FirebaseConfig';
import { collection, addDoc, setDoc, doc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { Dropdown } from 'react-native-element-dropdown';

interface MessageProps {
  role: string;
  content: string;
}

const username = () => {
  if (FIREBASE_AUTH.currentUser?.displayName) {
    return FIREBASE_AUTH.currentUser?.displayName;
  } else {
    return 'Anonymous';
  }
}

const saveConversation = async (conversation: any, conversationId: string) => {
  try {
    // Get current user's uid
    const uid = FIREBASE_AUTH.currentUser?.uid;

    // Check that conversation and conversationId are not undefined
    if (!conversation || !conversationId) {
      console.error('Conversation or conversation ID is undefined');
      return;
    }

    // Convert conversation to JSON
    const conversationJSON = JSON.stringify(conversation);

    // Save conversation to Firestore
    await setDoc(doc(FIREBASE_DB, 'users', uid || '', 'conversations', conversationId), {
      conversation: conversationJSON
    });
  } catch (error) {
    console.error('Error saving conversation: ', error);
  }
};

const fetchConversation = async (conversationId: string) => {
  try {
    // Get current user's uid
    const uid = FIREBASE_AUTH.currentUser?.uid;

    // Check that uid and conversationId are defined and not empty
    if (!uid || !conversationId) {
      console.error('UID or conversation ID is undefined or empty');
      return;
    }

    // Fetch conversation from Firestore using its unique ID
    const docRef = doc(FIREBASE_DB, 'users', uid, 'conversations', conversationId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      // Parse the conversation JSON and return it
      return docSnap.data().conversation;
    } else {
      console.log('No such conversation!');
    }
  } catch (error) {
    console.error('Error fetching conversation: ', error);
  }
};

const Message = ({ role, content }: MessageProps) => {
  const isBot = role === 'assistant';
  const cardStyle = isBot ? styles.botMessage : styles.userMessage;
  return (
    <View style={cardStyle}>
      <Markdown>{content}</Markdown>
    </View>
  );
};

const ChatGPT = () => {
  const [conversationId, setConversationId] = useState('');
  const [conversations, setConversations] = useState([]);
  const { apiKey, currentGPT3Model, currentGPT4Model } = useSettings();
  const [gpt4, setGPT4] = useState(false);
  const toggleGPT4 = () => setGPT4((previousState) => !previousState);

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello ${username()}!` },
    { role: 'assistant', content: 'How can I help you today?' },
  ]);
  const inputRef = useRef(null);

  const [currentModel, setCurrentModel] = useState(gpt4 ? currentGPT4Model : currentGPT3Model);
  const [personality, setPersonality] = useState('You are a helpful assistant.');
  const [temperature, setTemperature] = useState(0.5);
  const flatListRef = useRef(null);

  useEffect(() => {
    setConversationId(Date.now().toString()); // replace this with your ID generation function
  }, []);

  const handleSubmit = async () => {
    console.log('currentModel before API request:', currentModel);
    if (!input) return;
    let chatLogNew = [...messages, { role: 'user', content: input }];
    setMessages(chatLogNew);
    console.log('chatLogNew', chatLogNew);
    setInput('');

    try {
      const response = await fetch(`${server}/api/v1/gptChat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: chatLogNew,
          personality,
          currentModel,
          temperature,
          apiKey,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
      }

      const data = await response.json();
      const botResponse = data.message;
      console.log('data', data);
      console.log('botResponse', botResponse);

      let updatedChatLog = [...chatLogNew, { role: 'assistant', content: botResponse }];
      setMessages(updatedChatLog);
      console.log('updatedChatLog', updatedChatLog);
      await saveConversation(updatedChatLog, conversationId);
    } catch (error) {
      console.error('Error fetching from server: ', error);
      alert('Error: ' + error.message);
    }
  };

  const handleKeyUp = (e: any) => {
    if (e.nativeEvent.key === 'Enter') {
      handleSubmit();
      Keyboard.dismiss();
    }
  };

  const handleReset = () => {
    setConversationId(Date.now().toString());

    setMessages([
      { role: 'assistant', content: `Hello ${username()}!` },
      { role: 'assistant', content: 'How can I help you today?' },
    ]);
  }

  const fetchConversations = async () => {
    try {
      const uid = FIREBASE_AUTH.currentUser?.uid;
      const querySnapshot = await getDocs(collection(FIREBASE_DB, 'users', uid || '', 'conversations'));
      const conversationIds = querySnapshot.docs.map(doc => doc.id);
      setConversations(conversationIds);
    } catch (error) {
      console.error('Error fetching conversations: ', error);
    }
  };

  const fetchAndSetConversation = async (conversationId: string) => {
    try {
      const oldConversation = JSON.parse(await fetchConversation(conversationId));
      if (oldConversation) {
        setMessages(oldConversation);
        setConversationId(conversationId);
      }
    } catch (error) {
      console.error('Error parsing conversation JSON: ', error);
    }
  };

  const deleteConversation = async () => {
    try {
      // Get current user's uid
      const uid = FIREBASE_AUTH.currentUser?.uid;

      // Check that uid and activeConversationId are defined and not empty
      if (!uid || !conversationId) {
        console.error('UID or active conversation ID is undefined or empty');
        return;
      }

      // Delete conversation from Firestore using its unique ID
      await deleteDoc(doc(FIREBASE_DB, 'users', uid, 'conversations', conversationId));

      // Update conversations state
      setConversations(conversations.filter(id => id !== conversationId));

      // Clear active conversation ID
      setConversationId(null);
      handleReset();
    } catch (error) {
      console.error('Error deleting conversation: ', error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    username();
    console.log('gpt4:', gpt4);
    console.log('currentGPT3Model:', currentGPT3Model);
    console.log('currentGPT4Model:', currentGPT4Model);
    setCurrentModel(gpt4 ? currentGPT4Model : currentGPT3Model);
  }, [gpt4, currentGPT3Model, currentGPT4Model]);

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 5 }}>
        <Text>GPT-3.5</Text>
        <Switch
          onValueChange={toggleGPT4}
          value={gpt4}
          style={{ marginHorizontal: 10 }}
        />
        <Text>GPT-4</Text>
      </View>
      <Dropdown
        style={{ width: 200, height: 40 }}
        data={conversations.map(id => {
          const date = new Date(Number(id));
          const label = date.toLocaleString(); // or use toLocaleDateString for date only
          return { label, value: id };
        })}
        placeholder="Select conversation"
        maxHeight={300}
        labelField="label"
        valueField="value"
        value={conversationId}
        onChange={(selected) => {
          console.log("Conversation selected: ", selected.value);
          fetchAndSetConversation(selected.value);
        }}
      />
      <FlatList
        ref={flatListRef}
        onContentSizeChange={() => flatListRef.current.scrollToIndex({ index: messages.length - 1 })}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => <Message key={index} role={item.role} content={item.content} />}
      />
      <View>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          placeholder="Type a message..."
          onChangeText={(text) => setInput(text)}
          onKeyPress={handleKeyUp}
          onSubmitEditing={handleSubmit}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: '33%' }}>
            <Button title="Delete Chat" onPress={deleteConversation} color="red" />
          </View>
          <View style={{ width: '33%' }}>
            <Button title="New Chat" onPress={handleReset} />
          </View>
          <View style={{ width: '33%' }}>
            <Button title="Send" onPress={handleSubmit} color="green" />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: 10,
  },
  botMessage: {
    backgroundColor: 'lightgreen',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  userMessage: {
    backgroundColor: 'lightblue',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  botText: {
    fontSize: 16,
    color: 'black',
  },
  userText: {
    fontSize: 16,
    color: 'black',
  },
  input: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
    margin: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});

export default ChatGPT;