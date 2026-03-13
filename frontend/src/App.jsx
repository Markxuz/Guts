
import { AuthProvider } from "./features/auth/context/AuthContext";
import AppRouter from "./app/router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
