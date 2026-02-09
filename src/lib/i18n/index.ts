import { addMessages, init } from 'svelte-i18n';
import en from './locales/en.json';
import ru from './locales/ru.json';
import ja from './locales/ja.json';

addMessages('en', en);
addMessages('ru', ru);
addMessages('ja', ja);

init({
  fallbackLocale: 'en',
  initialLocale: 'en',
});
