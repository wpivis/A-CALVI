export const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array
}


export const reConstructRandomArray = (randomQ,data,curIdx) => {
    const answered = Object.values(data).map(d=>d.qid);
    const remainIdx = randomQ[0].filter(i=>i>=curIdx);
    console.log(answered,"answered")
    const remainQ = randomQ[1].filter(q=>!answered.includes(q))
    return [[...remainIdx],shuffleArray([...remainQ])]
}