import { useState } from 'react';
import { Button, TextField } from '@material-ui/core';

export default function SearchBar({fetchKeywordInfo}) {
    const [inputText, setInputText] = useState([])

    return <>
        <TextField variant="outlined" placeholder="Enter a keyword" label="Tech Search" value={inputText} onChange={e => setInputText(e.target.value)}/>
        <Button onClick={() => fetchKeywordInfo(inputText)}>Search</Button>
    </>
}