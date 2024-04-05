import {useContext, useEffect, useRef, useState} from "react";
import {FlowContext} from "../App.jsx";
import {Title} from "@mantine/core";




export default function Thankyou({step}) {
    const {activeStep, setActiveStep} = useContext(FlowContext);

    useEffect(() => {
        setActiveStep(step)

    }, []);

    return (
        <>
          <Title sx={{marginTop: "20%"}} order={1}> Thank you! You may close this window now. </Title>
        </>
    );
}
