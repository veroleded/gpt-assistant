export const interTagCode = (text: string) => {
    const lines = text.split('\n');
    let isEven = false;
    return lines
        .map((line) => {
            if (line.includes('```')) {
                if (!isEven) {
                    isEven = true;
                    return line.replace('```', '<code>');
                }
                isEven = false;
                return line.replace('```', '</code>');
            }
            return line;
        })
        .join('\n');
};
