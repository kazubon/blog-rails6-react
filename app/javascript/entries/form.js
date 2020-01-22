import React, { useEffect, useReducer } from 'react';
import Axios from 'axios';
import Flash from '../flash';

const initialState = {
  entry: {
    title: '',
    body: '',
    tags: [],
    published_at: '',
    draft: false
  },
  alert: ''
};

function reducer(state, action) {
  switch(action.name) {
    case 'entry':
      return { entry: action.entry, alert: state.alert };
    case 'tag':
      let tags = state.entry.tags.map(t => { return { name: t.name } });
      tags[action.index] = { name: action.value };
      return { entry: { ...state.entry, tags }, alert: state.alert };
    case 'draft':
      return { entry: { ...state.entry, draft: action.checked }, alert: state.alert };
    case 'alert':
      return { entry: state.entry, alert: action.value };
    default:
      return { entry: { ...state.entry, [action.name]: action.value }, alert: state.alert };
  }
}

function initTags(srcTags) {
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
    let entry = res.data.entry;
    updateState({
      name: 'entry',
      entry: {
        title: entry.title || '',
        body: entry.body || '',
        tags: initTags(entry.tags),
        published_at: entry.published_at,
        draft: entry.draft
      }
    });
  });
}

function validate(state, updateState) {
  if(!(state.entry.body && state.entry.body.match(/[^\s]+/))) {
    updateState({ name: 'alert', value: '本文を入力してください。' });
    window.scrollTo(0, 0);
    return false;
  }
  return true;
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
    data: { entry: state.entry }
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

  let entry = state.entry;
  return (
    <form onSubmit={e => handleSubmit(e, props.entryId, state, updateState)}>
      {state.alert && <div className="alert alert-danger">{state.alert}</div>}
      <div className="form-group">
        <label htmlFor="entry-title">タイトル</label>
        <input type="text" id="entry-title" name="title" className="form-control"
          required="" maxLength="255" pattern=".*[^\s]+.*"
          value={entry.title} onChange={handleChange}
           />
      </div>
      <div className="form-group">
        <label htmlFor="entry-body">本文</label>
        <textarea id="entry-body" name="body" cols="80" rows="15"
          className="form-control" required="" maxLength="40000"
          value={entry.body} onChange={handleChange}
          />
      </div>
      <div className="form-group">
        <label htmlFor="entry-tag0">タグ</label>
        <div>
          <TagList tags={entry.tags} updateState={updateState} />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="entry-published_at">日時</label>
        <input type="text" id="entry-published_at" name="published_at"
          className="form-control"
          pattern="\d{4}(-|\/)\d{2}(-|\/)\d{2} +\d{2}:\d{2}"
          value={entry.published_at} onChange={handleChange} />
      </div>
      <div className="form-group mb-4">
        <input type="checkbox" id="entry-draft" name="draft" value="1"
          checked={entry.draft} onChange={handleChange} />
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