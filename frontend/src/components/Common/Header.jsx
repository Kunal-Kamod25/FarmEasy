import Topbar from "../Layout/Topbar";
import Navbar from "./Navbar";
import Hero from "./Hero";

const Header = () => {
  return (
    <header>
      <Topbar />
      <Navbar />
      <Hero />
    </header>
  );
};

export default Header;