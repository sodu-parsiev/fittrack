import { useTranslation } from '../contexts/LanguageContext';

const languageOptions = [
    { value: 'ru', label: 'RU' },
    { value: 'en', label: 'EN' },
];

export function LanguageSwitcher({ className = '' }) {
    const { language, setLanguage, t } = useTranslation();
    const classes = ['language-switcher', className].filter(Boolean).join(' ');

    return (
        <div aria-label={t('language.switcher')} className={classes} role="group">
            {languageOptions.map((option) => (
                <button
                    key={option.value}
                    aria-pressed={language === option.value}
                    className={language === option.value
                        ? 'language-switcher__button language-switcher__button--active'
                        : 'language-switcher__button'}
                    onClick={() => setLanguage(option.value)}
                    type="button"
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
