import RegisterAndLoginFrom from "./components/RegisterAndLoginForm";
import Chat from "./components/chat";
import { UserContext } from "./context/userContext";
import { useContext } from "react";

const Routes = () => {
    const {username} = useContext(UserContext)
    if(username){
        return<Chat />;
    }
  return (
    <RegisterAndLoginFrom />
  )
}

export default Routes