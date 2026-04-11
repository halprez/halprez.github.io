class I18n {
    constructor() {
        this.locale = localStorage.getItem('locale') || 'en';
        this.data = {};
        this.listeners = [];
    }

    async load(locale) {
        this.locale = locale;
        const res = await fetch(`data/${locale}.json`);
        this.data = await res.json();
        localStorage.setItem('locale', locale);
        this.listeners.forEach(fn => fn(this.data));
    }

    t(key) {
        return key.split('.').reduce((obj, k) => obj?.[k], this.data);
    }

    onChange(fn) {
        this.listeners.push(fn);
    }
}

const i18n = new I18n();
