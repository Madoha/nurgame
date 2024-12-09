import './styles.css'
import './css/font.css'
import './css/reset.css'
import {BrowserRouter} from "react-router-dom";
import Rout from './components/Rout.tsx'

function App() {
    return (
        <BrowserRouter>
            <Rout/>
        </BrowserRouter>
    )
}

export default App
