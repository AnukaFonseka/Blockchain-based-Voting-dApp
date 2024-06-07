import "../styles/globals.css";

import {VotingProvider} from "../context/Voter";
import NavBar from "../components/NavBar/NavBar";



//INTERNAL IMPORT

const MyApp = ({ Component, pageProps }) => (
    <VotingProvider>
        <div>
            <NavBar/>
            <div>
                <Component {...pageProps} />;
            </div>
        </div>
    </VotingProvider>
)

export default MyApp;
