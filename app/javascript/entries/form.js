import React from 'react';
import Axios from 'axios';
import Flash from '../flash';

function TagList(props) {
  return props.tags.map((tag, idx) => (
    <input key={idx}
      value={tag.name}
      onChange={e => props.onChange(idx, e.target.value)}
      className="form-control width-auto d-inline-block mr-2"
      style={{width: '17%'}} maxLength="255" />
  ));
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

export default class Form extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      entry: {
        title: '',
        body: '',
        tags: [],
        published_at: '',
        draft: false
      },
      alert: ''
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleCheck = this.handleCheck.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
  }

  componentDidMount() {
    this.getEntry();
  }

  handleInput(e) {
    this.setState({ entry: { ...this.state.entry, [e.target.name]: e.target.value} });
  }

  handleCheck(e) {
    this.setState({ entry: { ...this.state.entry, [e.target.name]: e.target.checked} });
  }

  setTag(index, value) {
    let tags = this.state.entry.tags.map(t => ({ name: t.name }));
    tags[index] = { name: value };
    this.setState({ entry: { ...this.state.entry, tags: tags }});
  }

  initTags(srcTags) {
    let tags = [];
    let len = srcTags.length;
    for(let i = 0; i < 5; i++) {
      tags.push({ name: i < len ? srcTags[i].name : '' });
    }
    return tags;
  }

  getEntry() {
    let path = this.props.entryId ? `/entries/${this.props.entryId}/edit` : '/entries/new';
    Axios.get(path + '.json').then((res) => {
      let entry = res.data.entry;
      this.setState({ entry:
        {
          title: entry.title || '',
          body: entry.body || '',
          tags: this.initTags(entry.tags),
          published_at: entry.published_at,
          draft: entry.draft
        }
      });
    });
  }

  validate(entry) {
    if(!(entry.body && entry.body.match(/[^\s]+/))) {
      this.setState({ alert: '本文を入力してください。'});
      window.scrollTo(0, 0);
      return false;
    }
    return true;
  }

  handleSubmit(e) {
    e.preventDefault();
    if(!this.validate(this.state.entry)) { return }

    let path = this.props.entryId ? `/entries/${this.props.entryId}` : '/entries';
    Axios({
      method: this.props.entryId ? 'patch' : 'post',
      url: path + '.json',
      headers: {
        'X-CSRF-Token' : $('meta[name="csrf-token"]').attr('content')
      },
      data: { entry: this.state.entry }
    }).then((res) => {
      Flash.set({ notice: res.data.notice });
      Turbolinks.visit(res.data.location);
    }).catch((error) => {
      if(error.response.status == 422) {
        this.setState({ alert: error.response.data.alert });
      }
      else {
        this.setState({ alert: `${error.response.status} ${error.response.statusText}` });
      }
      window.scrollTo(0, 0);
    });
  }

  handleDelete() {
    if(!confirm('本当に削除しますか?')) {
      return;
    }
    let path = this.props.entryId ? `/entries/${this.props.entryId}` : '/entries';
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
      this.setState({ alert: `${error.response.status} ${error.response.statusText}` });
      window.scrollTo(0, 0);
    });
  }

  render() {
    let entry = this.state.entry;
    return (
      <form onSubmit={this.handleSubmit}>
        {this.state.alert && <div className="alert alert-danger">{this.state.alert}</div>}
        <div className="form-group">
          <label htmlFor="entry-title">タイトル</label>
          <input type="text" id="entry-title" name="title" className="form-control"
            required="" maxLength="255" pattern=".*[^\s]+.*"
            value={entry.title} onChange={this.handleInput}
            />
        </div>
        <div className="form-group">
          <label htmlFor="entry-body">本文</label>
          <textarea id="entry-body" name="body" cols="80" rows="15"
            className="form-control" required="" maxLength="40000"
            value={entry.body} onChange={this.handleInput}
            />
        </div>
        <div className="form-group">
          <label htmlFor="entry-tag0">タグ</label>
          <div>
            <TagList tags={entry.tags}
              onChange={(idx, value) => this.setTag(idx, value)} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="entry-published_at">日時</label>
          <input type="text" id="entry-published_at" name="published_at"
            className="form-control"
            pattern="\d{4}(-|\/)\d{2}(-|\/)\d{2} +\d{2}:\d{2}"
            value={entry.published_at} onChange={this.handleInput} />
        </div>
        <div className="form-group mb-4">
          <input type="checkbox" id="entry-draft" name="draft" value="1"
            checked={entry.draft} onChange={this.handleCheck} />
          <label htmlFor="entry-draft">下書き</label>
        </div>
        <div className="row">
          <SubmitButton entryId={this.props.entryId} />
          {this.props.entryId &&
            <DeleteButton onClick={this.handleDelete} />}
        </div>
      </form>
    );
  }
}