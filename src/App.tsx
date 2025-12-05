import { RouterProvider } from 'react-router-dom';
import router from './routers/router';
import { Toaster } from '@/components/ui/toaster';


const App = () => {

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

export default App;