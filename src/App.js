import React from "react";
import { API, graphqlOperation, Auth, Hub } from "aws-amplify";

import "./App.css";
import { Authenticator, AmplifyTheme } from "aws-amplify-react";
import { Router, Route } from "react-router-dom";
import { createBrowserHistory } from "history";
import HomePage from "./pages/HomePage";
import ProfilePage from "./pages/ProfilePage";
import MarketPage from "./pages/MarketPage";
import NavBar from "./components/Navbar";
import { registerUser } from "./graphql/mutations";
import { getUser } from "./graphql/queries";

export const history = createBrowserHistory();

export const UserContext = React.createContext();

class App extends React.Component {
  state = {
    user: null,
    userAttributes: null
  };

  componentDidMount() {
    this.getUserData();
    Hub.listen("auth", this.onHubCapsule);
  }

  onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case "signIn":
        console.log("Signed in");
        this.getUserData();
        this.registerNewUser(capsule.payload.data);
        break;
      case "signUp":
        console.log("Signed up");
        break;
      case "signOut":
        console.log("Signed out");
        this.setState({ user: null });
        break;
      default:
        break;
    }
  };

  registerNewUser = async signInData => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true
        };
        const newUser = await API.graphql(
          graphqlOperation(registerUser, {
            input: registerUserInput
          })
        );
        console.log(newUser);
      } catch (err) {
        console.error("error registering new user", err);
      }
    }
  };

  handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  getUserData = async () => {
    const { user } = this.state;
    const authUser = await Auth.currentAuthenticatedUser();
    authUser
      ? this.setState({ user: authUser }, () => this.getUserAttributes(user))
      : this.setState({ user: null });
  };

  getUserAttributes = async authUserData => {
    const attributesArr = await Auth.userAttributes(authUserData);
    const userAttributes = Auth.attributesToObject(attributesArr);
    this.setState({ userAttributes });
  };

  render() {
    const theme = {
      ...AmplifyTheme,
      button: {
        ...AmplifyTheme.button,
        backgroundColor: "var(--red)",
        color: "#fff"
      },
      navButton: {
        ...AmplifyTheme.navButton,
        backgroundColor: "var(--red)",
        color: "#fff"
      },
      navBar: {
        ...AmplifyTheme.navBar,
        backgroundColor: "var(--squidInk)",
        border: "none",
        padding: "0 5vw",
        color: "#fff",
        fontStyle: "italic"
      },
      nav: {
        ...AmplifyTheme.nav,
        margin: 0
      },
      container: {
        ...AmplifyTheme.container,
        padding: 0
      },
      sectionBody: {
        ...AmplifyTheme.sectionBody,
        padding: "5px"
      },
      sectionHeader: {
        ...AmplifyTheme.sectionHeader,
        backgroundColor: "var(--squidInk)"
      }
    };
    const { user, userAttributes } = this.state;
    return !user ? (
      <Authenticator theme={theme} />
    ) : (
      <UserContext.Provider value={{ user, userAttributes }}>
        <Router history={history}>
          <>
            <NavBar user={user} signOut={this.handleSignOut} />
            <div className="app-container">
              <Route exact path="/" component={HomePage} />
              <Route
                path="/market/:marketId"
                component={({ match }) => (
                  <MarketPage
                    user={user}
                    userAttributes={userAttributes}
                    marketId={match.params.marketId}
                  />
                )}
              />
              <Route
                path="/profile"
                component={() => (
                  <ProfilePage user={user} userAttributes={userAttributes} />
                )}
              />
            </div>
          </>
        </Router>
      </UserContext.Provider>
    );
  }
}
// export default withAuthenticator(App, true, [], null, theme);
export default App;
