
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import tomato from './img/tomato-icon.png'

class Clock extends Component {
    render() {
        return (
            <div className="App-box">
                <img id="tomato" src={tomato} alt="logo" />
                <h1>{this.props.timerDisplay}</h1>
                <h3>{this.props.modeName}</h3>
                {
                    this.props.started
                        ? (<button className="button-stop" name="btnStop" onClick={this.props.handleClick} >STOP</button>)
                        : (<button className="button-start" name="btnStart" onClick={this.props.handleClick}>START</button>)
                }
            </div>
        )
    }
}

Clock.propTypes = {
    timerDisplay: PropTypes.string,
    modeName: PropTypes.string,
    started: PropTypes.bool
};

export default Clock;