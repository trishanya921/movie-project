import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import GenrePicker from "./pages/GenrePicker";
import Search from "./pages/Search";
import Recommend from "./pages/Recommend";
import Trending from "./pages/Trending";
import GroupWatch from "./pages/GroupWatch";
import Progress from "./pages/Progress";
import TimePlanner from "./pages/TimePlanner";
import Rewatch from "./pages/Rewatch";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/genres" element={<GenrePicker />} />
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/recommend" element={<Recommend />} />
      <Route path="/trending" element={<Trending />} />
      <Route path="/group" element={<GroupWatch />} />
<Route path="/progress" element={<Progress />} />
<Route path="/rewatch" element={<Rewatch />} />


<Route path="/time" element={<TimePlanner />} />
    </Routes>
  );
}

export default App;