import {useContext, useEffect, useRef, useState} from "react";
import {FlowContext} from "../App.jsx";
import {Title, Text} from "@mantine/core";




export default function ThankyouProlific({step}) {
    const {activeStep, setActiveStep} = useContext(FlowContext);

    useEffect(() => {
        setActiveStep(step)

    }, []);

    return (
        <>
          <Title sx={{marginTop: "20%"}} order={1}> Thank you! Your completion code is : xxx.  </Title>
            <Text> You may close this window now.</Text>
        </>
    );
}
