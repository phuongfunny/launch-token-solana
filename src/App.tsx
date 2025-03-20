import { Route, Routes } from "react-router-dom";
import "./App.css";
import DeployTokenPage from "./pages/deploy-token";
import WalletContextProvider from "./layouts/WalletProvider";
import { ToastContainer } from "react-toastify";
import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  window.Buffer = Buffer;
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <WalletContextProvider>
            <ToastContainer position="top-right" autoClose={3000} />
            <DeployTokenPage />
          </WalletContextProvider>
        }
      />
    </Routes>
  );
}

export default App;
