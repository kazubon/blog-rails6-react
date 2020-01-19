import React, { useState } from 'react';
import Axios from 'axios';

function submit(evt, entryId, setCount) {
  evt.preventDefault();
  Axios({
    method: 'patch',
    url: `/entries/${entryId}/star.json`,
    headers: {
      'X-CSRF-Token' : $('meta[name="csrf-token"]').attr('content')
    }
  }).then((res) => {
    setCount(res.data.count);
  });
}

export default function(props) {
  const [count, setCount] = useState(props.starCount);

  return (
    <div className="text-right">
      <big className="d-inline-block p-1 border rounded">
        {props.starrable &&
          <a href="#" className="mr-1 ml-1 text-decoration-none"
            onClick={e => submit(e, props.entryId, setCount)} title="いいね">👍</a>}
        {count > 0 && <span className="text-warning mr-1 ml-1">⭐️ {count}</span>}
      </big>
    </div>
  );
}