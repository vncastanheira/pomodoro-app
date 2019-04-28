import React, { Component } from 'react';
import firebase from "firebase"
import moment from 'moment'

import Clock from './Clock'
import User from './User';
import config from './config'

import './styles/App.css';
import github from './img/GitHub-Mark-120px-plus.png'
import tomato from './img/tomato-icon.png'

firebase.initializeApp(config);

const mode = {
  'Work': { name: "Work", minutes: 25 },              // 25 min
  'Break': { name: "Break", minutes: 5 },             // 5 min
  'LongBreak': { name: "Longer Break", minutes: 15 }  // 15 min
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSignedIn: false,
      started: false,
      timerEnd: null,
      timerDisplay: "25:00",
      workCounter: 1,
      mode: mode.Work,
      stats: {
        lastUpdated: moment().format(),
        workCount: 0,
        breakCount: 0,
        longBreakCount: 0
      }
    };

    //this.saveState = this.saveState.bind(this);
    //this.signOut = this.signOut.bind(this);
    //this.handleClick = this.handleClick.bind(this);

    this.uiConfig = {
      // Popup signin flow rather than redirect flow.
      signInFlow: 'popup',
      // We will display Google and Facebook as auth providers.
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID
      ],
      callbacks: {
        // Avoid redirects after sign-in.
        signInSuccessWithAuthResult: (e) => {
          console.log("Sucess in signing-in")
        }
      }
    };
  }

  componentDidMount() {
    this.timerID = setInterval(() => { this.tick() }, 1000);
    this.saveStateInterval = setInterval(() => { this.saveState() }, 60000)

    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
      (user) => {
        this.setState({ isSignedIn: !!user })
        if (!!user) {
          firebase.database().ref('users/' + user.uid).on('value', (snapshot) => {
            this.setState({
              stats: snapshot.val().stats
            })
          })
        }
      }
    );

    Notification.requestPermission();
  }

  componentWillUnmount() {
    this.unregisterAuthObserver();
    clearInterval(this.timerID);
    clearInterval(this.saveStateInterval);
  }

  handleClick = (e) => {
    if (e.target.name === 'btnStart') {
      let timer = this.state.mode.minutes;
      this.setState({
        started: true,
        timerEnd: moment().add(timer, 'minutes')
      })
    }
    if (e.target.name === 'btnStop') {
      this.setState({
        started: false,
        timerDisplay: "25:00"
      })
    }

  }

  saveState = () => {
    if (this.state.isSignedIn) {
      // save user data
      let currentUser = firebase.auth().currentUser;
      firebase.database().ref('users/' + currentUser.uid).set({
        email: currentUser.email,
        stats: this.state.stats
      }, (error) => {
        if (!error) {
          this.setState((state, props) => ({
            stats: {
              lastUpdated: moment().format(),
              workCount: state.stats.workCount,
              breakCount: state.stats.breakCount,
              longBreakCount: state.stats.longBreakCount
            }
          }))
        }
        else {
          console.log('Could not save current user data.');
        }
      });


    }
  }

  tick() {
    if (this.state.started) {
      // start timer
      let t = this.state.timerEnd
      let inSec = t.diff(moment(), 'seconds')
      //let sec = (inSec % 60)
      //let result = Math.floor(inSec / 60) + ':' + (sec > 9 ? sec : '0'+sec);


      if (inSec <= 0) {
        // timer is finished, change modes
        switch (this.state.mode) {
          case mode.Work:
            this.setState((state, props) => ({
              started: false,
              mode: state.workCounter === 4 ? mode.LongBreak : mode.Break,
              timerDisplay: "00:00",
              stats: {
                lastUpdated: moment().format(),
                workCount: state.stats.workCount + 1,
                breakCount: state.stats.breakCount,
                longBreakCount: state.stats.longBreakCount
              }
            }))
            break;
          case mode.Break:
            this.setState((state, props) => ({
              started: false,
              mode: mode.Work,
              timerDisplay: "00:00",
              workCounter: state.workCounter + 1,
              stats: {
                lastUpdated: moment().format(),
                workCount: state.stats.workCount,
                breakCount: state.stats.breakCount + 1,
                longBreakCount: state.stats.longBreakCount
              }
            }))
            break;
          case mode.LongBreak:
            this.setState((state, props) => ({
              started: false,
              mode: mode.Work,
              timerDisplay: "00:00",
              workCounter: 1,
              stats: {
                lastUpdated: moment().format(),
                workCount: state.stats.workCount,
                breakCount: state.stats.breakCount,
                longBreakCount: state.stats.longBreakCount + 1
              }
            }))
            break;
          default:
            break;
        }
        this.spawnNotification("Pomodoro", "Timer is over!");
      }
      else {
        this.setState({
          timerDisplay: this.timeDisplay(inSec)
        })
      }
    }
    else {
      this.setState({
        timerDisplay: this.timeDisplay(this.state.mode.minutes * 60)
      })
    }
  }

  timeDisplay(seconds) {
    let sec = (seconds % 60)
    let result = Math.floor(seconds / 60) + ':' + (sec > 9 ? sec : '0' + sec);
    return result;
  }


  spawnNotification(title, body) {
    var options = {
      body: body,
      icon: tomato
    }
    
    new Notification(title, options);
  }

  signOut = () => {
    firebase.auth().signOut();
  }

  render() {
    return (
      <div className="App">
        <User
          isSignedIn={this.state.isSignedIn}
          signOut={this.signOut}
          firebaseAuth={firebase.auth}
          uiConfig={this.uiConfig}
        />
        <Clock
          handleClick={this.handleClick}
          timerDisplay={this.state.timerDisplay}
          modeName={this.state.mode.name}
          started={this.state.started}
        />
        <div id="github">
          <a href="https://github.com/vncastanheira/pomodoro-app">
            <img src={github} alt="github" />
          </a>
        </div>
      </div>
    );
  }
}

export default App;
