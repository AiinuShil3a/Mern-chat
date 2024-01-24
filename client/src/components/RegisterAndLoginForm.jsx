import { useContext, useState } from "react";
import { UserContext } from "../context/userContext";
import axios from "axios";

const RegisterAndLoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const [isRegister, setIsRegister] = useState(true);
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  const handleToggleForm = () => {
    setIsRegister((prevIsRegister) => !prevIsRegister);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    if (isRegister && password !== confirmpassword) {
      alert("Password and Confirm Password do not match");
      return;
    }

    try {
      const response = await axios.post(
        `/${isRegister ? "register" : "login"}`,
        {
          username,
          password,
        }
      );
        console.log(response);
      if (response.status === 200) {
        // สำหรับการลงทะเบียนหรือเข้าสู่ระบบสำเร็จ
        setLoggedInUsername(response.data.username);
        setId(response.data.id);
        alert(`${isRegister ? "Registration" : "Login"} Successful`);
      } else {
        // สำหรับข้อผิดพลาดที่ไม่ได้รับสถานะ 200
        alert(`Error during ${isRegister ? "Registration" : "Login"}`);
      }
    } catch (error) {
      // สำหรับข้อผิดพลาดที่เกิดขึ้นในการเรียก API
      console.error(error);
      alert(`Error api during ${isRegister ? "Registration" : "Login"}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-[500px]">
        <h2 className="text-center text-lg font-semibold text-gray-800 mb-4">
          {isRegister ? "Register" : "Login"}
        </h2>
        <form className="flex flex-col" onSubmit={handleFormSubmit}>
          <label htmlFor="username" className="mb-2 text-gray-600">
            Username:
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="p-2 mb-4 border rounded"
          />

          <label htmlFor="password" className="mb-2 text-gray-600">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 mb-4 border rounded"
          />

          {isRegister && (
            <>
              <label htmlFor="confirmpassword" className="mb-2 text-gray-600">
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirmpassword"
                value={confirmpassword}
                onChange={(e) => setConfirmpassword(e.target.value)}
                className="p-2 mb-4 border rounded"
              />
            </>
          )}

          <button
            type="submit"
            className="bg-green-500 text-white p-2 rounded cursor-pointer transition duration-300 hover:bg-green-600"
          >
            {isRegister ? "Register" : "Login"}
          </button>

          <button
            type="button"
            onClick={handleToggleForm}
            className="bg-gray-600 text-white p-2 rounded cursor-pointer transition duration-300 hover:bg-gray-900 mt-4"
          >
            {isRegister ? "I have an account!" : "Create an account!"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAndLoginForm;
