import { RouterProvider } from 'react-router-dom';
import router from './routers/router';
import { Toaster } from '@/components/ui/toaster';
import ChatWidget from '@/components/chat/ChatWidget';


const App = () => {

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
      <ChatWidget />
    </>
  );
};

export default App;