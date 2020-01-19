import React, { useEffect, useReducer } from 'react';
import Axios from 'axios';
import qs from 'qs';

const initialState = {
  entries: [],
  entriesCount: 0,
  offset: 0
};

function reducer(state, action) {
  if(action.name == 'entries') {
    return { entries: state.entries.concat(action.value.entries),
      entriesCount: action.value.entriesCount, offset: action.value.offset };
  }
  else {
    return { ...state, [action.name]: action.value };
  }
}

function getEntries(query, offset, updateState) {
  let params = { ...query, offset: offset };
  let path = '/entries.json?' + qs.stringify(params);
  Axios.get(path).then((res) => {
    updateState({ name: 'entries',
      value: {
        entries: res.data.entries, entriesCount: res.data.entries_count,
        offset: offset
      }
    });
  });
}

function moreClicked(query, state, updateState) {
  getEntries(query, state.offset + 20, updateState);
}

function SortLinks(props) {
  let key = props.query.sort == 'stars' ? 'date' : 'stars';
  let params = { ...props.query, sort: key };
  let path = '/entries?' + qs.stringify(params);

  if(props.query.sort == 'stars') {
    return <span><a href={path}>日付順</a> | いいね順</span>;
  }
  else {
    return <span>日付順 | <a href={path}>いいね順</a></span>;
  }
}

function EntryList(props) {
  return props.entries.map((entry) => {
    return (
      <div key={entry.id} className="entry">
        <div>
          <a href={entry.path}>
            {entry.draft && '（下書き）'}
            {entry.title}
          </a>
        </div>
        <div className="text-right text-secondary">
          <a href={entry.user_path}>{entry.user_name}</a> <span> | </span>
          {entry.tags.map(tag =>
            <a href={tag.tag_path} key={tag.id} className="mr-2">{tag.name}</a>
          )}<span>| </span>
          {entry.published_at} <span> | </span>
          {entry.stars_count > 0 && <span className="text-warning">★{entry.stars_count}</span>}
        </div>
      </div>
    );
  });
}

function MoreButton(props) {
  return (
    <div>
      <button type="button" onClick={props.onClick}
        className="btn btn-outline-secondary w-100">もっと見る</button>
    </div>
  );
}

export default function (props) {
  const query = props.query;
  const [state, updateState] = useReducer(reducer, initialState);

  useEffect(() => {
    getEntries(query, 0, updateState);
  }, []);

  return (
    <div>
      <div className="text-right mb-3">
        {state.entriesCount}件 | <SortLinks query={query} />
      </div>
      <div className="entries mb-4">
        <EntryList entries={state.entries} />
      </div>
      {state.entries.length < state.entriesCount &&
        <MoreButton onClick={() => moreClicked(query, state, updateState)}/>}
    </div>
  );
}
