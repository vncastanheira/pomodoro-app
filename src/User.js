import React, { Component } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';

class User extends Component {
    render() {
        if (!this.props.isSignedIn) {
            return (
                <section id="login-section">
                    <p>Hello Anonymous!</p>
                    <StyledFirebaseAuth uiConfig={this.props.uiConfig} firebaseAuth={this.props.firebaseAuth()} />
                </section>
            );
        }
        return (
            <section id="login-section">
                <p>Hello {this.props.firebaseAuth().currentUser.displayName}!</p>
                <button id="logout" onClick={this.props.signOut}>Sign-out</button>
            </section>
        );
    }
}

export default User;