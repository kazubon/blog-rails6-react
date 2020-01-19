require("@rails/ujs").start();
require("turbolinks").start();

import React from 'react'
import ReactDOM from 'react-dom'

import EntryIndex from '../entries/index';
import EntryForm from '../entries/form';
import EntryStar from '../entries/star';
import Flash from '../flash'

Promise;

document.addEventListener('turbolinks:load', () => {
  Flash.show();

  let apps = [
    { elem: '#entry-index', object: EntryIndex },
    { elem: '#entry-form', object: EntryForm },
    { elem: '#entry-star', object: EntryStar }
  ];

  let props = window.jsProps || {};
  apps.forEach((app) => {
    if($(app.elem).length) {
      ReactDOM.render(React.createElement(app.object, props), $(app.elem)[0]);
    }
  });
});
