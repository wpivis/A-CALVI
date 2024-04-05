import {useContext, useEffect, useRef, useState} from "react";
import {FlowContext} from "../App.jsx";
import {Box, Button, createStyles, Grid, Group, Stack, Textarea, TextInput, Text} from "@mantine/core";
import {useForm} from "@mantine/form";
import {RadioQuestion} from "../components/forms/RadioQuestion.jsx";
import { useNavigate } from "react-router-dom";
import {addDebrief, addUser, defaultExpName} from "../firebase/firebase-config.js";
import ls from "localstorage-slim";
import QuestionRecap from "../components/QuestionRecap.jsx";


const useStyles = createStyles((theme, _params, getRef) => ({
  questionBlk: {
      marginTop:10

  }
}));

export default function DebriefWithRecap2({step, nxtUrl}) {
    const {activeStep, setActiveStep} = useContext(FlowContext);
    const navigate = useNavigate();
    const ID = ls.get('ID',  { decrypt: true });
    const { classes } = useStyles();
    const [activestage, setActiveStage] = useState(1)
    const expName = ls.get("expname",{decrypt: true}) || defaultExpName


    const stages = {
        1:["q1"],
        2:["q2"],
        3:["q3"],
        4: ["q3","q4","q5", "q6","q7"]
    }

    const form = useForm({
        initialValues: {
            q1: '',
            q2: '',
            q3:'',
            q4: '',
            q5: '',
            q6:'',
            q7:''

        },

    });

    useEffect(() => {
        setActiveStep(step)

    }, []);
    

    const nextStage = () => {
        console.log(form.values["q2"])
        if(activestage === 2 && form.values["q2"] ==="Yes"){
            setActiveStage(4);
        }else
            setActiveStage(activestage + 1);

    }

    const isFinalStage = () => {
        return activestage >= 3
    }
    const canProceed = (stage) => {
        const questionNo = stages[stage];
        return questionNo.reduce((accu,cur)=>accu && form.values[cur].length>0, true)
    }

    return (
        <Grid grow>
            <Grid.Col span={5}>

                <Box sx={{ maxWidth: 600, position:"sticky", top: 20, height: 600, overflowY:"auto", textAlign: 'left'}} mx="auto">

                    <form onSubmit={form.onSubmit((values) =>{
                        addDebrief(ID,values,expName)
                        navigate(nxtUrl);
                    })}>
                        { activestage === 1 &&
                            <Stack className={classes.questionBlk}>
                                <Textarea
                                    name={"q1"}
                                    autosize
                                    minRows={3}
                                    label="1. Did any charts stand out to you? Why?"
                                    {...form.getInputProps('q1')}
                                />
                            </Stack>
                        }

                        { activestage === 2 &&
                        <Stack className={classes.questionBlk}>
                            <RadioQuestion
                                name={"q2"}
                                question={"2. Did you notice any misleading charts?"}
                                options={["Yes", "No"]}
                                inputProps={form.getInputProps('q2')}

                            />
                        </Stack>
                        }

                        { activestage === 3 &&

                            <Stack className={classes.questionBlk}>

                                <Textarea
                                    name={"q3"}
                                    minRows={3}
                                    autosize
                                    label={<Text>3. What approach did you take to find the correct answers to the questions?
                                    </Text>}
                                    {...form.getInputProps('q3')}
                                />
                            </Stack>
                        }
                        { activestage === 4 &&

                            <div>
                                <Text> There are two types of charts in the first part of the study:
                                    <div>
                                        <Text span  fw={700}> • misleading</Text> <Text span>charts</Text>

                                    </div>
                                    <div>
                                        <Text span  fw={700}>• normal (not misleading)</Text>
                                        <Text span>charts</Text>
                                    </div>

                                </Text>

                                <Stack className={classes.questionBlk}>

                                    <Textarea
                                        name={"q3"}
                                        minRows={3}
                                        autosize
                                        label={<Text>3. Thinking back to the sequence of questions you completed, when did you realize that there are <Text span fw={700}>misleading</Text> charts? Please try to be as specific as possible.</Text>}
                                        {...form.getInputProps('q3')}
                                    />
                                </Stack>
                            </div>

                        }


                        { activestage === 4 &&
                            <div>
                            <Stack className={classes.questionBlk}>

                            <Textarea
                                name={"q4"}
                                minRows={3}
                                autosize
                                label={<Text>4. What approach did you take to find the correct answers to the questions? Did it change after noticing the presence of <Text span fw={700}>misleading</Text> charts? If yes, how?
                                </Text>}

                                {...form.getInputProps('q4')}
                            />
                            </Stack>

                            <Stack className={classes.questionBlk}>

                            <Textarea
                                name={"q5"}
                                minRows={3}
                                autosize
                                label={<Text>5. After you noticed the <Text span fw={700}>misleading</Text> charts, did the presence of <Text span fw={700}>normal</Text> charts affect your strategy? If yes, how?</Text>}
                                {...form.getInputProps('q5')}
                            />
                            </Stack>

                                <Stack className={classes.questionBlk}>

                                    <Textarea
                                        name={"q6"}
                                        minRows={3}
                                        autosize
                                        label={<Text>6. Did the effort or attention that you put into answering questions change after noticing the presence of <Text span fw={700}>misleading</Text> charts? If yes, how?</Text>}
                                        {...form.getInputProps('q6')}
                                    />
                                </Stack>

                                <Stack className={classes.questionBlk}>

                                    <Textarea
                                        name={"q7"}
                                        minRows={3}
                                        autosize
                                        label={<Text>7. After you noticed the <Text span fw={700}>misleading</Text> charts, did the presence of <Text span fw={700}>normal</Text> charts affect your level of effort or attention? If yes, how?
                                        </Text>}
                                        {...form.getInputProps('q7')}
                                    />
                                </Stack>
                            </div>
                        }

                        <Group position="center" mt="md">
                            {!isFinalStage() && <Button disabled={!canProceed(activestage)} onClick={nextStage}>Next</Button>}
                            {isFinalStage() && <Button disabled={!canProceed(activestage)} type="submit">Next</Button>}
                        </Group>
                    </form>
                </Box>
            </Grid.Col>
            <Grid.Col span={5}>
                <Text sx={{textAlign:"left"}}>This part of the study consists of open-ended questions about your experience with the first part of the study. <Text span fs="italic"  fw={700} inherit>The sequence of multiple-choice questions and the answers you provided in the first part of the study are on the right side of this page; you can refer to them as you answer the open-ended questions.</Text>
                </Text>
                <QuestionRecap />
            </Grid.Col>
        </Grid>
    );
}
