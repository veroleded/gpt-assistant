export const startText = [
    'Привет! Этот бот открывает вам доступ к лучшим нейросетям для создания текста и изображений.',
    'Здесь доступны новые модели: OpenAI o1, GPT-4o, DALL•E 3, o и другие.',
    '',
    'Чатбот умеет:',
    '1. Писать и переводить тексты',
    '2. Создавать изображения',
    '4. Писать и редактировать код',
    '5. Решать задачи по математике',
    '',
    '📝 ТЕКСТ: просто напишите вопрос в чат или отправте голосовое сообщение',
    '🌅 ИЗОБРАЖЕНИЯ: используйте команду /image',
].join('\n');

export const settingsText = [
    'В этом разделе вы можете:',
    '1. Задать роль, которую нейросеть будет учитывать при подготовке ответов.',
    '2. Выбрать модель нейросети.',
    '3. Настроить голосовые ответы и выбрать голос.',
    '4. Включить или отключить поддержку контекста. При включенном контексте бот учитывает свой предыдущий ответ.',
    '5. Настроить параметры генерации изображений.',
].join('\n');

export const helpText = [
    ' 📝 Генерация текстов',
    'Для генерации текста напишите запрос в чат или отправте голосовое сообщение.',
    '',
    '/settings – настройки бота и выбор модели ',
    '',
    '💬 Поддержка контекста',
    'По умолчанию бот запоминает контекст. При подготовке ответа он учитывает не только ваш текущий запрос, но и свой предыдущий ответ. Это позволяет вести диалог и задавать уточняющие вопросы. Чтобы обновить контекст, используйте команду /deletecontext',
    '',
    '🌅 Генерация изображений',
    'В боте подключена нейросеть DALL•E 3',
    '',
    '/image генерация изображения ',
    '',
    '⚙️ Другие команды',
    '/start – описание бота',
    '/account – ваш профиль и баланс',
    '',
].join('\n');

export const voiceSettingText = [
    'В этом разделе вы можете включить режим голосового ответа и выбрать один из представленных голосов.',
    '',
    'Женские: nova | shimmer',
    'Мужские: alloy | echo | fable | onyx',
].join('\n');
