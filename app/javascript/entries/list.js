import React from 'react';
import Axios from 'axios';
import qs from 'qs';

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

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      entries: [],
      entriesCount: 0,
      offset: 0
    };
  }

  componentDidMount() {
    this.getEntries(0);
  }

  getEntries(offset) {
    let params = { ...this.props.query, offset: offset };
    let path = '/entries.json?' + qs.stringify(params);
    Axios.get(path).then((res) => {
      this.setState({
        entries: this.state.entries.concat(res.data.entries),
        entriesCount: res.data.entries_count,
        offset: offset
      });
    });
  }

  moreClicked() {
    this.getEntries(this.state.offset + 20);
  }

  render() {
    return (
      <div>
        <div className="text-right mb-3">
          {this.state.entriesCount}件 | <SortLinks query={this.props.query} />
        </div>
        <div className="entries mb-4">
          <EntryList entries={this.state.entries} />
        </div>
        {this.state.entries.length < this.state.entriesCount &&
          <MoreButton onClick={() => this.moreClicked()} />}
      </div>
    );
  }
}