import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      {/* Shared layout (navbar, footer, etc.) will go here */}
      <Outlet />
    </>
  );
}

export default App;
