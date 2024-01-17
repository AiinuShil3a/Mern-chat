import { UserContextProvider } from './context/userContext'
import Routes from './Routes'

function App() {
  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
