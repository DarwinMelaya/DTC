
import logo from "../assets/Logo.png";
const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="px-22 w-full flex justify-between items-center">
        <a href="https://region4b.dost.gov.ph/"><img src={logo} alt="DOST Logo" width={50} height={50}/></a>
        <h1 className="text-xl font-bold">DOST-PSTO</h1>
      </div>
    </nav>
  );
};

export default Navbar;
