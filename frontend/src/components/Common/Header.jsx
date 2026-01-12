import Topbar from "../Layout/Topbar";
import Navbar from "../Layout/Navbar";
import Hero from "./Hero";
import Thirdbar from "../Layout/Thirdbar";

const Header = () => {
  return (
    <header>
      <Topbar />
      <Navbar />
      <Thirdbar />
      <Hero />
    </header>
  );
};

export default Header;