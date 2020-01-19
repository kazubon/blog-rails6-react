import React, { useEffect, useReducer } from 'react';
import Axios from 'axios';
import Flash from '../flash';

const initialState = {
  title: '',
  body: '',
  tags: [],
  published_at: '',
  draft: false,
  alert: ''
};

function reducer(state, action) {
  switch(action.name) {
    case 'entry':
      let entry = {};
      for(let x in action.entry) {
        entry[x] = (action.entry[x] === null ? '' : action.entry[x]);
      }
      return { ...state, ...entry };
    case 'tag':
      let tags = copyTags(state.tags);
      tags[action.index] = { name: action.value };
      return { ...state, tags };
    case 'draft':
      return { ...state, draft: action.checked };
    default:
      return { ...state, [action.name]: action.value };
  }
}

function copyTags(srcTags) {
  let tags = [];
  let len = srcTags.length;
  for(let i = 0; i < 5; i++) {
    tags.push({ name: i < len ? srcTags[i].name : '' });
  }
  return tags;
}

function getEntry(props, updateState) {
  let path = props.entryId ? `/entries/${props.entryId}/edit` : '/entries/new';

  Axios.get(path + '.json').then((res) => {
    let entry = { ...res.data.entry, tags: copyTags(res.data.entry.tags) };
    updateState({name: 'entry', entry});
  });
}

function validate(state, updateState) {
  if(!(state.body && state.body.match(/[^\s]+/))) {
    updateState({ name: 'alert', value: '本文を入力してください。' });
    window.scrollTo(0, 0);
    return false;
  }
  return true;
}

function entryData(state) {
  return {
    entry: {
      title: state.title,
      body: state.body,
      tags: state.tags,
      published_at: state.published_at,
      draft: state.draft
    }
  };
}

function handleSubmit(e, entryId, state, updateState) {
  e.preventDefault();
  if(!validate(state, updateState)) { return }

  let path = entryId ? `/entries/${entryId}` : '/entries';
  Axios({
    method: entryId ? 'patch' : 'post',
    url: path + '.json',
    headers: {
      'X-CSRF-Token' : $('meta[name="csrf-token"]').attr('content')
    },
    data: entryData(state)
  }).then((res) => {
    Flash.set({ notice: res.data.notice });
    Turbolinks.visit(res.data.location);
  }).catch((error) => {
    if(error.response.status == 422) {
      updateState({ name: 'alert', value: error.response.data.alert });
    }
    else {
      updateState({ name: 'alert', value: `${error.response.status} ${error.response.statusText}` });
    }
    window.scrollTo(0, 0);
  });
}

function handleDelete(entryId, updateState) {
  if(!confirm('本当に削除しますか?')) {
    return;
  }
  let path = entryId ? `/entries/${entryId}` : '/entries';
  Axios({
    method: 'delete',
    url: path + '.json',
    headers: {
      'X-CSRF-Token' : $('meta[name="csrf-token"]').attr('content')
    }
  }).then((res) => {
    Flash.set({ notice: res.data.notice });
    Turbolinks.visit(res.data.location);
  }).catch((error) => {
    updateState({ name: 'alert', value: `${error.response.status} ${error.response.statusText}` });
    window.scrollTo(0, 0);
  });
}

function TagList(props) {
  return props.tags.map((tag, idx) => {
    return <input key={idx}
      value={tag.name}
      onChange={e => props.updateState({name: 'tag', index: idx, value: e.target.value })}
      className="form-control width-auto d-inline-block mr-2"
      style={{width: '17%'}} maxLength="255" />
  });
}

function SubmitButton(props) {
  let text = props.entryId ? '更新' : '作成';
  return (
    <div className="col">
      <button type="submit" className="btn btn-outline-primary">{text}</button>
    </div>
  );
}

function DeleteButton(props) {
  return (
    <div className="col text-right">
      <button type="button" className="btn btn-outline-danger"
        onClick={props.onClick}>削除</button>
    </div>
  );
}

export default function (props) {
  const [state, updateState] = useReducer(reducer, initialState);

  useEffect(() => {
    getEntry(props, updateState);
  }, []);

  function handleChange(e) {
    updateState({name: e.target.name, value: e.target.value,
      checked: e.target.checked });
  }

  return (
    <form onSubmit={e => handleSubmit(e, props.entryId, state, updateState)}>
      {state.alert && <div className="alert alert-danger">{state.alert}</div>}
      <div className="form-group">
        <label htmlFor="entry-title">タイトル</label>
        <input type="text" id="entry-title" name="title" className="form-control"
          required="" maxLength="255" pattern=".*[^\s]+.*"
          value={state.title} onChange={handleChange}
           />
      </div>
      <div className="form-group">
        <label htmlFor="entry-body">本文</label>
        <textarea id="entry-body" name="body" cols="80" rows="15"
          className="form-control" required="" maxLength="40000"
          value={state.body} onChange={handleChange}
          />
      </div>
      <div className="form-group">
        <label htmlFor="entry-tag0">タグ</label>
        <div>
          <TagList tags={state.tags} updateState={updateState} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="entry-published_at">日時</label>
        <input type="text" id="entry-published_at" name="published_at"
          className="form-control"
          pattern="\d{4}(-|\/)\d{2}(-|\/)\d{2} +\d{2}:\d{2}"
          value={state.published_at} onChange={handleChange} />
      </div>
      <div className="form-group mb-4">
        <input type="checkbox" id="entry-draft" name="draft" value="1"
          checked={state.draft} onChange={handleChange} />
        <label htmlFor="entry-draft">下書き</label>
      </div>
      <div className="row">
        <SubmitButton entryId={props.entryId} />
        {props.entryId &&
          <DeleteButton
            onClick={() => handleDelete(props.entryId, updateState)} />}
      </div>
    </form>
  );
}