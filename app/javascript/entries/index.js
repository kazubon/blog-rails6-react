import React from 'react';
import Form from './search_form';
import List from './list';

export default function (props) {
  return (
    <div>
      <Form query={props.query}></Form>
      <List query={props.query}></List>
    </div>
  );
}