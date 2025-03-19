import { Route, Routes } from "react-router-dom";
import "./App.css";
import DeployTokenPage from "./pages/deploy-token";
import WalletContextProvider from "./Layouts/WalletProvider";
import { ToastContainer } from "react-toastify";

function App() {
  return (
    <WalletContextProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<DeployTokenPage />} />
      </Routes>
    </WalletContextProvider>
  );
}

export default App;
