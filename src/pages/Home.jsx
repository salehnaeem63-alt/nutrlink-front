import Navbar from "../component/Navbar"
import { useNavigate } from "react-router-dom"


export const Home = () => {
  const islogin= localStorage.getItem("authToken")
  const navigate=useNavigate()
  const ctaClick=()=>{
    islogin?
  navigate("/profile"):
  navigate("/registerType")
}
  return (
    <div><Navbar ctaLabel={ islogin ? "Profile" : "Get Started"} onCtaClick={ctaClick}></Navbar></div>
  )
}
