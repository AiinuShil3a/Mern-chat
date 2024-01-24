import { useState, useEffect, useRef, useContext } from "react";
import { UserContext } from "../context/userContext";
import axios from "axios";
import Logo from "./Logo";
import Contact from './contact'
import {uniqBy} from 'lodash'

const Chat = () => {
    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({});
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [message, setMessage] = useState([]);
    const [newMessageText, setNewMessageText] = useState({});
    const { username, id, setUsername , setId } = useContext(UserContext);

    
    useEffect(() => {
        connectToWs();
    }, [selectedUserId]);
    const connectToWs = () => {
        const ws = new WebSocket("ws://localhost:4000");
        setWs(ws);
        ws.addEventListener('message', handleMessage);
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected. Trying to reconnect.');
                connectToWs();
            }, 1000);
        })
    };

    const handleMessage = (e) => {
        const messageData = JSON.parse(e.data);
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        } else if ('text' in messageData) {
            if (messageData.sender === setSelectedUserId) {
                setMessage((prev) => [...prev, { ...messageData }]);
            }
        }
    };

    const showOnlinePeople = (peopleArray) => {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        })
        setOnlinePeople(people);
    }

    useEffect(() => {
        axios.get("/people").then(res => {
            const offlinePeopleArr = res.data.filter(p => p._id != id)
                .filter(p => !Object.keys(onlinePeople).includes(p._id))
            const offlinePeople = {};
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p;
            });
            setOfflinePeople(offlinePeople)
        });
    }, [onlinePeople])

    const onlinePeopleExclOurUser = { ...onlinePeople };
    delete onlinePeopleExclOurUser[id];

    const handleLogout = () => {
        axios.post("/logout")
            .then(() => {
                setWs(null);
                setId(null);
                setUsername(null);
            })
            .catch((error) => {
                console.error("Logout failed", error);
            });
    };

    const sendMessage = (e,file=null) => {
        if(e) e.preventDefault();
        ws.send(
            JSON.stringify({
                recipient: selectedUserId,
                text: newMessageText,
                file,
            })
        );
        if(file){
            axios.get("/messages/" + selectedUserId).then((res) => {
                setMessage(res.data)
            });
        } else {
            setNewMessageText("");
            setMessage((prev) => [
                ...prev,{
                    text: newMessageText,
                    sender:id,
                    recipient: selectedUserId,
                    _id:Date.now(),
                }
            ])
        }
    }

    useEffect(() => {
        if(selectedUserId){
            axios.get("/messages/" + selectedUserId).then((res) => {
                setMessage(res.data)
            });
        }
    } , [selectedUserId])

    const messageWithoutDups = uniqBy(message, "_id")
    const sendFile = (e) => {
        const reader = new FileReader();
        reader.readAsDataURL(e.target.files[0]);
        reader.onload =  () => {
            sendMessage(null, {name: e.target.files[0].name, data: reader.result})
        }
    }
     return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 flex flex-col">
                <div className="flex-grow">
                    <Logo />
                    {Object.keys(onlinePeopleExclOurUser).map((userId) => (
                        <Contact
                            key={userId}
                            username={onlinePeopleExclOurUser[userId]}
                            id={userId}
                            online={true}
                            selected={userId === selectedUserId}
                            onClick={() => {
                                setSelectedUserId(userId)
                                console.log({userId})
                            }}
                        />
                    ))}
                    {Object.keys(offlinePeople).map((userId) => (
                        <Contact
                            key={userId}
                            username={offlinePeople[userId].username}
                            id={userId}
                            online={false}
                            selected={userId === selectedUserId}
                            onClick={() => {setSelectedUserId(userId)}}
                        />
                    ))}
                </div>
                <div className="p-2 text-center flex items-center justify-center">
                    <span className="mr-2 text-sm text-black flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                        </svg>
                        {username}
                    </span>
                    <button onClick={handleLogout} className="text-sm bg-blue-100 py-1 px-2 text-gray-500 border rounded-sm">
                        Logout
                    </button>
                </div>
            </div>
            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
                <div className="flex-grow">
                {!selectedUserId && (
                    <div className="flex h-full flex-grow items-center justify-center" >
                        <div className="text-gray-300">
                            &larr; Select a person from sidebar
                        </div>
                    </div>
                )}
                {!!selectedUserId && (
                    <div className="relative h-full">
                        <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                        {messageWithoutDups.map((message) => (
  <div key={message._id} className={(message.sender === id ? "text-right" : "text-left")}>
    <div className={"text-left inline-block p-2 my-2 rounded-md text-sm " + (message.sender === id ? "bg-blue-500 text-white" : "text-gray-500 bg-white")}>
      {message.text && (
        <div>{/* Display text message */}
          {message.text}
        </div>
      )}
      {message.file && (
        <div>
          {/* Display file */}
            <img 
              src={axios.defaults.baseURL + "/uploads/" + message.file} 
              alt="File" 
              className="max-w-64 h-auto max-h-64"  // ปรับขนาดตามความต้องการ
            />
          <a href={axios.defaults.baseURL + "/uploads/" + message.file} className="flex item-center gap-1 border-b">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13" />
            </svg>
            {message.file}
          </a>
        </div>
      )}
    </div>
  </div>
))}

                        </div>
                    </div>
                )}
                </div>
                <form className="flex gap-2" onSubmit={sendMessage}>
                    <input
                        type="text"
                        onChange={(e) => setNewMessageText(e.target.value)}
                        placeholder="Type your message"
                        className="bg-white flex-grow border rounded-sm p-2"
                    />
                    <label className="bg-blue-200 p-2 text-gray-600 cursor-pointer rounded-sm border border-blue-200">
                        <input type="file" className="hidden" onChange={sendFile}/>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                        </svg>
                    </label>
                    <button
                        type="submit"
                        className="bg-blue-500 p-2 text-white rounded-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    )

};

export default Chat;