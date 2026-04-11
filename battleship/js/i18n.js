class I18n {
    constructor() {
        this.locale = localStorage.getItem('battleship-locale') || 'es';
        this.data = {};
    }

    async load(locale) {
        this.locale = locale;
        const res = await fetch(`data/${locale}.json`);
        this.data = await res.json();
        localStorage.setItem('battleship-locale', locale);
        document.documentElement.lang = locale;
    }

    t(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], this.data) || key;
    }
}

const i18n = new I18n();
export default i18n;
