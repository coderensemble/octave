// date.js
import moment from 'moment/moment.js';
import 'moment/locale/fr.js';
moment.locale('fr');

export const dateMixin = {
  methods: {
    formatDate(value, format='DD/MM/YYYY HH:mm') {
      if(value) {
        return moment(String(value)).format(format);
      }
    },
    convertDateFormat(date, src='DD/MM/YYYY', dst='YYYY-MM-DD') {
      if (!date) {
        return '';
      }
      return moment(date, src).format(dst);
    },
    fromNow(date) {
      if (!date) {
        return '';
      }
      return moment(date).fromNow();
    },
  }
};

