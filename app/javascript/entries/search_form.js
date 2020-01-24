import React from 'react';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.query.title || '',
      tag: props.query.tag || '',
    }
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  render() {
    return (
      <div>
        <form action="/entries" method="get" className="form-inline mb-4">
          <input type="text" name="title" className="form-control mr-3 mb-2"
            placeholder="タイトル"
            value={this.state.title} onChange={this.handleChange} />
          <input type="text" name="tag" className="form-control mr-3 mb-2"
            placeholder="タグ"
            value={this.state.tag} onChange={this.handleChange} />
          <input type="hidden" name="sort" value={this.props.query.sort || '' } />
          <input type="hidden" name="user_id" value={this.props.query.user_id || '' } />
          <button type="submit" className="btn btn-outline-primary mb-2">検索</button>
        </form>
      </div>
    );
  }
}
