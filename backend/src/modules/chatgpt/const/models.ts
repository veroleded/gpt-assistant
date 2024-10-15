export const textModels = {
    gpt4o: 'gpt-4o',
    gpt4turbo: 'gpt-4-turbo',
    gpt4: 'gpt4',
    gpt35turbo: 'gpt-3.5-turbo',
} as const;

export const imageModels = {
    dallE2: 'dall-e-2',
    dallE3: 'dall-e-3',
} as const;

export const imageSizes = {
    square: '1024x1024',
    horizontal: '1792x1024',
    vertical: '1024x1792',
} as const;

export const voiceModels = {
    whisper1: 'whisper-1',
    tts1: 'tts-1',
    tts1hd: 'tts-1-hd',
} as const;

export const otherModels = {
    textEmbedding3Small: 'text-embedding-3-small',
    textEmbedding3Large: 'text-embedding-3-large',

    textEmbeddingAda002: 'text-embedding-ada-002',
} as const;
