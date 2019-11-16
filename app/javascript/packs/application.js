require("@rails/ujs").start();
require("turbolinks").start();
// require("@rails/activestorage").start();

import Vue from 'vue';
import TurbolinksAdapter from 'vue-turbolinks'
import EntrySearchForm from '../entry_search_form.vue';
import EntryList from '../entry_list.vue';
import EntryForm from '../entry_form.vue';
import EntryStar from '../entry_star.vue';

Vue.use(TurbolinksAdapter);

document.addEventListener('turbolinks:load', () => {
  let apps = [
    { elem: '#entry-search-form', object: EntrySearchForm },
    { elem: '#entry-list', object: EntryList },
    { elem: '#entry-form', object: EntryForm },
    { elem: '#entry-star', object: EntryStar }
  ];

  apps.forEach((app) => {
    if($(app.elem).length) {
      new Vue({
        el: app.elem,
        render: h => h(app.object, { props: $(app.elem).data() }),
      });
    }
  });
});
