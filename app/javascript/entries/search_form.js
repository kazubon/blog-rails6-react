import React, { useState } from 'react';

export default function (props) {
  const query = props.query;
  const [title, setTitle] = useState(query.title || '');
  const [tag, setTag] = useState(query.tag || ''  );

  function handleTitle(e) {
    setTitle(e.target.value);
  }

  function handleTag(e) {
    setTag(e.target.value);
  }

  return (
    <div>
      <form action="/entries" method="get" className="form-inline mb-4">
        <input type="text" name="title" className="form-control mr-3 mb-2"
          placeholder="タイトル"
          value={title} onChange={handleTitle} />
        <input type="text" name="tag" className="form-control mr-3 mb-2"
          placeholder="タグ"
          value={tag} onChange={handleTag} />
        <input type="hidden" name="sort" value={query.sort || '' } />
        <input type="hidden" name="user_id" value={query.user_id || '' } />
        <button type="submit" className="btn btn-outline-primary mb-2">検索</button>
      </form>
    </div>
  )
}
