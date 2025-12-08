import { Routes, Route } from "react-router-dom";
import Votemain from "./pages/Votemain";
import VoteCreate from "./pages/VoteCreate";
import VoteSelectDate from "./pages/VoteSelectDate";
import VoteList from "./pages/VoteList";
import VoteDetail from "./pages/VoteDetail";
import VoteHistory from "./pages/VoteHistory";
import VoteResult from "./pages/VoteResult";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Votemain />} />
      <Route path="/vote/create" element={<VoteCreate />} />
      <Route path="/vote/list" element={<VoteList />} />               
      <Route path="/vote/detail/:id" element={<VoteDetail />} />       
      <Route path="/vote/history" element={<VoteHistory />} />
      <Route path="/vote/result/:id" element={<VoteResult />} />

    </Routes>
  );
}

export default App;
