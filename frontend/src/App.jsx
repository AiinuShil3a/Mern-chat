import { UserContextProvider } from './context/userContext'
import Routes from './Routes'
import Navbar from './components/navbar'

function App() {
  return (
    <UserContextProvider>
      <Navbar />
      <Routes />
    </UserContextProvider>
  )
}

export default App
