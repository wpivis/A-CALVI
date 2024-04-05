import './App.css'
import {HeaderResponsive} from "./components/HeaderResponsive.jsx";
import {
    AppShell,
    ColorSchemeProvider,
    DEFAULT_THEME,
    Header,
    LoadingOverlay,
    MantineProvider,
    Navbar
} from '@mantine/core';
import {FooterResponsive} from "./components/FooterResponsive";
import Consent from "./views/Consent.jsx";
import {Route, Routes, useSearchParams} from "react-router-dom";
import StepperVertical from "./components/StepperVertical.jsx";
import React, {useEffect, useState} from "react";
import TrialAdaptive from "./views/TrialAdaptive.jsx";
import Debrief from "./views/Debrief";
import Thankyou from "./views/Thankyou.jsx";
import ConsentProlific from "./views/ConsentProlific.jsx";
import ThankyouProlific from "./views/ThankyouProlific.jsx";
import {doc, getDoc, onSnapshot} from "firebase/firestore";
import {fb} from "./firebase/firebase-config.js";
import ExpSetting from "./views/ExpSetting.jsx";
import ls from 'localstorage-slim';
import TrialFull from "./views/TrialFull.jsx";
import DebriefWithRecap from "./views/DebriefWithRecap.jsx";
import DebriefWithRecap2 from "./views/DebriefWithRecap2.jsx";
import {shuffleArray} from "./utils/commonFunc.js";
import TrialStatic from "./views/TrialStatic.jsx";

const mockHeaderdata = {
    "links": [
        {
            "link": "/about",
            "label": "Adaptive CALVI"
        },

    ]
}


const customLoader = (
    <>
        <svg
            width="300"
            height="300"
            viewBox="-30 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            stroke={DEFAULT_THEME.colors.blue[6]}
        >
            <g fill="none" fillRule="evenodd">
                <g transform="translate(1 1)" strokeWidth="2">
                    <circle strokeOpacity=".5" cx="18" cy="18" r="18" />
                    <path d="M36 18c0-9.94-8.06-18-18-18">
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 18 18"
                            to="360 18 18"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </path>
                    <text x={3} y={55} fontSize={15} fontWeight={"lighter"} stroke={"black"}  strokeWidth="1">Wait</text>
                    <text x={-20} y={70} fontSize={8}  fontWeight={"lighter"} stroke={"black"}  strokeWidth="1">Survey will start soon</text>

                </g>
            </g>
        </svg>
    </>

);


export const FlowContext = React.createContext(null);

function App() {
    const [activeStep, setActiveStep] = useState(0);
    const [totalStep, setTotalStep] = useState(4);
    const [searchParams, setSearchParams] = useSearchParams();
    const [expMode, setExpMode] = useState(ls.get('expmode',  { decrypt: true }) || "adaptive-class");
    const [expOn, setExpOn] = useState(true);
    const [expDB, setExpDB] = useState(searchParams.get("db") || ls.get('expname',  { decrypt: true }))



    //for theme
    const [colorScheme, setColorScheme] = useState('light');
    const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

    // console.log(expDB)
    // useEffect(()=>{
    //     const unsub = onSnapshot(doc(fb, "settings", expDB), (doc) => {
    //         console.log(doc.data())
    //         setExpOn(doc.data().on)
    //     });
    //
    //     return unsub;
    // },[])



    return (
        <FlowContext.Provider value={{activeStep, setActiveStep,totalStep, setTotalStep, setExpMode, expMode, setExpDB}}>
            <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>

                <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
                    <LoadingOverlay visible={!expOn} overlayBlur={4} loader={customLoader}/>
                    <AppShell

                      padding="md"
                      navbar={<StepperVertical />}
                      header={<HeaderResponsive links={mockHeaderdata.links}/>}
                      styles={(theme) => ({
                          main: {
                              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
                              minHeight: "90vh",
                              paddingTop: 30
                          },
                      })}
                  >
                          <Routes>
                              <Route path="" element={<ExpSetting step={0}/>} />

                              {/*This demo has 11 CALVI qustions and 4 normal questions. You can add other static
                              questions by using attentionChecks attributes(see commented example below)*/}
                              <Route path={"demo-adaptive"}>
                                  <Route path="consent" element={<ConsentProlific step={0} nxtUrl={"/demo-adaptive/calvi"} fileName={"demo-consent-adaptive.md"}/>} />
                                  <Route path="calvi" element={<TrialAdaptive step={1}
                                                                              expLen={15}
                                                                              nxtUrl={"/demo-adaptive/thankyou"}
                                                                              randomNormalQ={[[2,12,14,16],shuffleArray([204,205,212,209])]}/>} />
                                  <Route path="thankyou" element={<Thankyou step={2}/>} />
                              </Route>

                              <Route path={"demo-full"}>
                                  <Route path="consent" element={<ConsentProlific step={0} nxtUrl={"/demo-full/calvi"} fileName={"demo-consent-full.md"}/>} />
                                  <Route path="calvi" element={<TrialStatic step={1}
                                                                          expLen={30}
                                                                          nxtUrl={"/demo-full/thankyou"}
                                                                          randomTrickQ = {[[1,2,7,8,13,14,15,17,19,20,24,25,30,31,32],shuffleArray([43,48,35,37,25,20,3,26,10,14,47,49,30,42,40])]}
                                                                          randomNormalQ={[[3,4,5,6,9,10,12,16,18,21,22,23,26,28,29],shuffleArray([200,201,202,203,204,205,206,207,208,209,210,211,212,213,214])]}
                                                                          attentionChecks={[[],[]]}/> } />
                                  <Route path="thankyou" element={<Thankyou step={2}/>} />
                              </Route>



                              {/*Example: Add attention check questions*/}
                              {/*<Route path="calvi" element={<TrialAdaptive step={1}*/}
                              {/*                                            expLen={17}*/}
                              {/*                                            nxtUrl={"/validity-adaptive-calvi-1st/thankyou"}*/}
                              {/*                                            attentionChecks={[[3,9],[100,101]]}*/}
                              {/*                                            randomNormalQ={[[2,12,14,16],shuffleArray([204,205,212,209])]}/>} />*/}


                              {/*You can also use selected questions from question bank and present them in pre-defined order. Here is an example:*/}
                              {/*    <Route path="calvi" element={<TrialStatic step={1}*/}
                              {/*                                            expLen={32}*/}
                              {/*                                            nxtUrl={"/validity-full-calvi-1st/thankyou"}*/}
                              {/*                                            randomTrickQ = {[[1,2,7,8,13,14,15,17,19,20,24,25,30,31,32],shuffleArray([43,48,35,37,25,20,3,26,10,14,47,49,30,42,40])]}*/}
                              {/*                                            randomNormalQ={[[3,4,5,6,9,10,12,16,18,21,22,23,26,28,29],shuffleArray([200,201,202,203,204,205,206,207,208,209,210,211,212,213,214])]}*/}
                              {/*                                            attentionChecks={[[11,27],[101,100]]}/> } />*/}

                          </Routes>
                  </AppShell>

                </MantineProvider>
            </ColorSchemeProvider>

        </FlowContext.Provider>

  )
}

export default App
