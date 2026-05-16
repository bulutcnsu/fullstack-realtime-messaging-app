import '../css/App.css';
import { ChatProvider } from '../context/ChatContext';
import Container from '../components/Container';

function App() {
  return (
    <div className="App">

 <ChatProvider>
 <Container/>
 </ChatProvider>

    </div>
  );
}

export default App;
