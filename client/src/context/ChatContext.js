import { createContext,useState,useContext } from "react";

const ChatContext = createContext();

export const ChatProvider =({children}) =>{
     const [messages, setMessages] = useState({
     public: {},
     private: {}
  });
    
  
        
    return <ChatContext.Provider value={{ messages, setMessages }}>{children}</ChatContext.Provider>
}

export const useChat= () =>useContext(ChatContext);
export default ChatContext;