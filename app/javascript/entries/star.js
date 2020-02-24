import React from 'react';
import Axios from 'axios';

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      count: props.starCount
    }
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(evt) {
    evt.preventDefault();
    Axios({
      method: 'patch',
      url: `/entries/${this.props.entryId}/star.json`
    }).then((res) => {
      this.setState({ count: res.data.count });
    });
  }

  render() {
    return (
      <div className="text-right">
        <big className="d-inline-block p-1 border rounded">
          {this.props.starrable &&
            <a href="#" className="mr-1 ml-1 text-decoration-none"
              onClick={this.handleClick} title="いいね">👍</a>}
          {this.state.count > 0 && <span className="text-warning mr-1 ml-1">⭐️ {this.state.count}</span>}
        </big>
      </div>
    );
  }
}