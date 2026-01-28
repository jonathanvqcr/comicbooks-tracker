import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import SeriesDetail from "./components/SeriesDetail/SeriesDetail";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
      </Routes>
    </Layout>
  );
}
