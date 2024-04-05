import {Paper, Radio} from '@mantine/core';

export function RadioQuestion({name,question, options, inputProps}) {

    return (
        <Paper sx={{marginBottom: "10px"}} shadow="md" radius="lg" p="md" withBorder>

            <Radio.Group
                // value={value}
                // onChange={setValue}
                name={name}
                label={question}
                description=""
                spacing="md"
                offset="md"
                withAsterisk
                {...inputProps}
            >
                {options.map(op=>
                    <Radio value={op} label={op} />
                )}

            </Radio.Group>
        </Paper>
    );
}