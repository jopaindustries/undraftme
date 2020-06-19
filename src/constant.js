export const API_URL = 'https://mindopoly.tech';

export const CATEGORIES = {
    Math: "Математика",
    Russian: "Русский язык",
    Literature: "Литература",
    Physics: "Физика",
    Chemistry: "Химия",
    Astronomy: "Астрономия",
    Geography: "География",
    Biology: "Биология",
    History: "История",
    Art: "Искусство",
    Sport: "Спорт",
    Other: "Другое"
};
export default function num2str(n, text_forms) {
    n = Math.abs(n) % 100;
    var n1 = n % 10;
    if (n > 10 && n < 20) {
      return text_forms[2];
    }
    if (n1 > 1 && n1 < 5) {
      return text_forms[1];
    }
    if (n1 === 1) {
      return text_forms[0];
    }
    return text_forms[2];
  }