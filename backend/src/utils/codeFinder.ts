export function codeFinder(text: string): Array<{ text?: string; code?: string }> {
    const arr = text.split('```').filter((item) => item.length > 0);
    const startWithCode = text.startsWith('```');
    if (startWithCode) {
        return arr.map((item, index) => {
            if (index % 2 === 1) {
                return { text: item };
            }
            return { code: item };
        });
    }
    return arr.map((item, index) => {
        if (index % 2 === 1) {
            return { code: item };
        }
        return { text: item };
    });
}
