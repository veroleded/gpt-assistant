import { Session, VoiceName } from '@prisma/client';
import { settingsText } from '../texts';

export const createSettingText = ({ model, voice, assistantRole, voiceName }: Session) => {
    const message =
        settingsText +
        '\n\n' +
        `Текущая модель: ${model}\n` +
        (voice ? 'Голосовые ответы: включены\n' : 'Голосовые ответы: выключены\n') +
        (voice ? `Голос: ${VoiceName[voiceName]}\n` : '') +
        `Текущая роль:\n ${assistantRole ?? 'не задан'}`;
    return message;
};
