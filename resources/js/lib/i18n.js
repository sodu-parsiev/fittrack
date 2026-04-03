export const DEFAULT_LANGUAGE = 'ru';
export const LANGUAGE_STORAGE_KEY = 'fittrack_language';
export const SUPPORTED_LANGUAGES = ['ru', 'en'];

const LANGUAGE_LOCALES = {
    en: 'en-US',
    ru: 'ru-RU',
};

const translations = {
    common: {
        loading: {
            en: 'Loading...',
            ru: 'Загрузка...',
        },
        logIn: {
            en: 'Log in',
            ru: 'Войти',
        },
        createAccount: {
            en: 'Create account',
            ru: 'Создать аккаунт',
        },
        logOut: {
            en: 'Log out',
            ru: 'Выйти',
        },
        signingOut: {
            en: 'Signing out...',
            ru: 'Выход...',
        },
        email: {
            en: 'Email',
            ru: 'Почта',
        },
        password: {
            en: 'Password',
            ru: 'Пароль',
        },
        confirmPassword: {
            en: 'Confirm password',
            ru: 'Подтвердите пароль',
        },
        name: {
            en: 'Name',
            ru: 'Имя',
        },
        kg: {
            en: 'kg',
            ru: 'кг',
        },
        justNow: {
            en: 'Just now',
            ru: 'Только что',
        },
    },
    language: {
        switcher: {
            en: 'Language',
            ru: 'Язык',
        },
    },
    nav: {
        primaryNavigation: {
            en: 'Primary navigation',
            ru: 'Основная навигация',
        },
        workout: {
            en: 'Workout',
            ru: 'Тренировка',
        },
        history: {
            en: 'History',
            ru: 'История',
        },
    },
    auth: {
        loginTitle: {
            en: 'Log in',
            ru: 'Войти',
        },
        registerTitle: {
            en: 'Create account',
            ru: 'Создать аккаунт',
        },
        signingIn: {
            en: 'Signing in...',
            ru: 'Вход...',
        },
        creatingAccount: {
            en: 'Creating account...',
            ru: 'Создание аккаунта...',
        },
        createOne: {
            en: 'Create account',
            ru: 'Создать аккаунт',
        },
        unableToCreateAccount: {
            en: 'Unable to create your account.',
            ru: 'Не удалось создать аккаунт.',
        },
        unableToSignIn: {
            en: 'Unable to sign you in.',
            ru: 'Не удалось выполнить вход.',
        },
    },
    history: {
        unableToLoad: {
            en: 'Unable to load your session history.',
            ru: 'Не удалось загрузить историю тренировок.',
        },
        startWorkout: {
            en: 'Start workout',
            ru: 'Начать тренировку',
        },
        completedWorkout: {
            en: 'Completed workout',
            ru: 'Завершенная тренировка',
        },
        exercisesBadge: {
            en: '{count} exercises',
            ru: '{count} упражнений',
        },
        setsBadge: {
            en: '{count} sets',
            ru: '{count} подходов',
        },
        volumeBadge: {
            en: '{value} {unit} volume',
            ru: '{value} {unit} объем',
        },
        exerciseSummary: {
            en: '{category} · Target {targetReps} reps, last load {weight}',
            ru: '{category} · Цель: {targetReps} повт., последний вес {weight}',
        },
        setEntry: {
            en: 'Set {number}: {reps} reps x {weight}',
            ru: 'Подход {number}: {reps} повт. x {weight}',
        },
    },
    workout: {
        unableToLoadCurrent: {
            en: 'Unable to load your current workout.',
            ru: 'Не удалось загрузить текущую тренировку.',
        },
        unableToStart: {
            en: 'Unable to start a workout.',
            ru: 'Не удалось начать тренировку.',
        },
        unableToAddExercise: {
            en: 'Unable to add that exercise.',
            ru: 'Не удалось добавить упражнение.',
        },
        unableToUpdateWeight: {
            en: 'Unable to update the weight.',
            ru: 'Не удалось обновить вес.',
        },
        unableToUpdateWeightType: {
            en: 'Unable to update the weight type.',
            ru: 'Не удалось обновить тип веса.',
        },
        unableToSaveSet: {
            en: 'Unable to save that set.',
            ru: 'Не удалось сохранить подход.',
        },
        deleteExerciseConfirm: {
            en: 'Delete {name} from this workout?',
            ru: 'Удалить {name} из этой тренировки?',
        },
        unableToRemoveExercise: {
            en: 'Unable to remove that exercise.',
            ru: 'Не удалось удалить упражнение.',
        },
        unableToFinish: {
            en: 'Unable to finish this workout.',
            ru: 'Не удалось завершить тренировку.',
        },
        finishWorkout: {
            en: 'Finish workout',
            ru: 'Завершить тренировку',
        },
        restTimer: {
            en: 'Rest timer',
            ru: 'Таймер отдыха',
        },
        restTimerControls: {
            en: 'Rest timer controls',
            ru: 'Управление таймером отдыха',
        },
        start: {
            en: 'Start',
            ru: 'Старт',
        },
        pause: {
            en: 'Pause',
            ru: 'Пауза',
        },
        reset: {
            en: 'Reset',
            ru: 'Сброс',
        },
        starting: {
            en: 'Starting...',
            ru: 'Запуск...',
        },
        startWorkout: {
            en: 'Start workout',
            ru: 'Начать тренировку',
        },
        currentExercises: {
            en: 'Current exercises',
            ru: 'Текущие упражнения',
        },
        started: {
            en: 'Started',
            ru: 'Начало',
        },
        exercises: {
            en: 'Exercises',
            ru: 'Упражнения',
        },
        sets: {
            en: 'Sets',
            ru: 'Подходы',
        },
        volume: {
            en: 'Volume',
            ru: 'Объем',
        },
        summary: {
            en: 'Workout summary',
            ru: 'Сводка тренировки',
        },
        addExercise: {
            en: 'Add exercise',
            ru: 'Добавить упражнение',
        },
        exerciseName: {
            en: 'Exercise name',
            ru: 'Название упражнения',
        },
        exercisePlaceholder: {
            en: 'Smith bench',
            ru: 'Жим в Смите',
        },
        muscleGroup: {
            en: 'Muscle group',
            ru: 'Группа мышц',
        },
        chooseMuscleGroup: {
            en: 'Choose a muscle group',
            ru: 'Выберите группу мышц',
        },
        weightType: {
            en: 'Weight type',
            ru: 'Тип веса',
        },
        externalWeight: {
            en: 'External weight',
            ru: 'Доп. вес',
        },
        selfWeight: {
            en: 'Self weight',
            ru: 'Свой вес',
        },
        weight: {
            en: 'Weight',
            ru: 'Вес',
        },
        weightKg: {
            en: 'Weight ({unit})',
            ru: 'Вес ({unit})',
        },
        targetReps: {
            en: 'Target reps',
            ru: 'Целевые повторы',
        },
        repsDone: {
            en: 'Reps done',
            ru: 'Повторы',
        },
        load: {
            en: 'Load',
            ru: 'Нагрузка',
        },
        saving: {
            en: 'Saving...',
            ru: 'Сохранение...',
        },
        addExerciseButton: {
            en: 'Add exercise',
            ru: 'Добавить упражнение',
        },
        adjustWeight: {
            en: '{value} {unit}',
            ru: '{value} {unit}',
        },
        scrollControls: {
            en: 'Scroll controls',
            ru: 'Прокрутка',
        },
        top: {
            en: 'Top',
            ru: 'Вверх',
        },
        bottom: {
            en: 'Bottom',
            ru: 'Вниз',
        },
        workoutUtilities: {
            en: 'Workout utilities',
            ru: 'Инструменты тренировки',
        },
        startTimer: {
            en: 'Start timer',
            ru: 'Запустить таймер',
        },
        resetTimer: {
            en: 'Reset timer',
            ru: 'Сбросить таймер',
        },
        scrollToTop: {
            en: 'Scroll to top',
            ru: 'Прокрутить вверх',
        },
        scrollToBottom: {
            en: 'Scroll to bottom',
            ru: 'Прокрутить вниз',
        },
        completeSet: {
            en: 'Complete set',
            ru: 'Завершить подход',
        },
        deleteExercise: {
            en: 'Delete exercise',
            ru: 'Удалить упражнение',
        },
        exerciseSummary: {
            en: '{name} summary',
            ru: 'Сводка: {name}',
        },
        exerciseWeightType: {
            en: '{name} weight type',
            ru: 'Тип веса: {name}',
        },
        exerciseActions: {
            en: '{name} actions',
            ru: 'Действия: {name}',
        },
    },
    exercise: {
        muscleGroup: {
            en: 'Muscle group',
            ru: 'Группа мышц',
        },
        targetReps: {
            en: 'Target reps',
            ru: 'Целевые повторы',
        },
        nextSet: {
            en: 'Next set',
            ru: 'Следующий подход',
        },
        setProgress: {
            en: 'Set progress',
            ru: 'Прогресс подходов',
        },
        currentLoad: {
            en: 'Current load',
            ru: 'Текущий вес',
        },
        setEntry: {
            en: 'Set {number}: {reps} reps x {weight}',
            ru: 'Подход {number}: {reps} повт. x {weight}',
        },
    },
    muscleGroups: {
        biceps: {
            en: 'Biceps',
            ru: 'Бицепс',
        },
        triceps: {
            en: 'Triceps',
            ru: 'Трицепс',
        },
        back: {
            en: 'Back',
            ru: 'Спина',
        },
        legs: {
            en: 'Legs',
            ru: 'Ноги',
        },
        chest: {
            en: 'Chest',
            ru: 'Грудь',
        },
        shoulders: {
            en: 'Shoulders',
            ru: 'Плечи',
        },
        cardio: {
            en: 'Cardio',
            ru: 'Кардио',
        },
        uncategorized: {
            en: 'Uncategorized',
            ru: 'Без категории',
        },
    },
};

export function resolveLanguage(language) {
    return SUPPORTED_LANGUAGES.includes(language) ? language : DEFAULT_LANGUAGE;
}

export function getLocale(language) {
    return LANGUAGE_LOCALES[resolveLanguage(language)];
}

function getTranslationEntry(key) {
    return key.split('.').reduce((value, segment) => value?.[segment], translations);
}

export function translate(language, key, params = {}) {
    const resolvedLanguage = resolveLanguage(language);
    const entry = getTranslationEntry(key);
    const template = entry?.[resolvedLanguage] ?? entry?.[DEFAULT_LANGUAGE] ?? key;

    return Object.entries(params).reduce(
        (message, [paramKey, paramValue]) => message.replaceAll(`{${paramKey}}`, String(paramValue)),
        template,
    );
}
