/** In this file, we create a React component which incorporates components provided by material-ui */

const React = require('react');
const RaisedButton = require('material-ui/lib/raised-button');
const AppBar = require('material-ui/lib/app-bar');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const Colors = require('material-ui/lib/styles/colors');
const socket = require('socket.io-client')('http://skill-informatique.com:8000');

const SlideItem = React.createClass({
  getInitialState: function() {
    return {
      slide: this.props.slide,
      setSlideActive: this.props.setSlideActive
    }
  },
  activeSlide: function() {
    this.state.setSlideActive(this.state.slide);
  },
  render: function() {
    return (
        <RaisedButton label={this.state.slide.token} fullWidth={true} onTouchTap={this.activeSlide} />
    );
  }
});

const SlideList = React.createClass({
  render: function() {
    if (this.props.slideActive) {
      return false;
    }

    var that = this;
    var rows = this.props.slides.map(function(slide, i) {
      return <SlideItem key={slide.token} slide={slide} setSlideActive={that.props.setSlideActive} />
    });

    return (
      <div>
        <h1>Choose</h1>
        {rows}
      </div>
    );
  }
});

const ControlSlide = React.createClass({
  next: function() {
    socket.emit('bespoke-action', 'next');
  },
  prev: function() {
    socket.emit('bespoke-action', 'prev');
  },
  stop: function() {
    this.props.setSlideActive(null);
  },
  flopoke_finger1_start: function() {
    socket.emit('bespoke-action', 'flopoke-finger1-start');
  },
  render: function() {
    if (this.props.slideActive == null) {
      return false;
    }

    return (
      <div>
        <h1>Control {this.props.slideActive.token}</h1>
        <div>
          <RaisedButton
            ref="a"
            fullWidth={true}
            label="Précédent"
            onTouchTap={this.prev}
          />
          <br /><br />
          <RaisedButton
            ref="b"
            fullWidth={true}
            label="Suivant"
            onTouchTap={this.next}
          />
          <br /><br />
          <RaisedButton
            ref="b"
            fullWidth={true}
            label="Whaaaat ??"
            onTouchTap={this.flopoke_finger1_start}
          />
        </div>
        <div>
          <br /><br /><br /><br /><br /><br />
          <RaisedButton ref="c" fullWidth={true} label="Stop" onTouchTap={this.stop} />
        </div>
      </div>
    );

  }
});

const Main = React.createClass({

  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getInitialState () {
    return {
      slides: [],
      slideActive: null,
      muiTheme: ThemeManager.getMuiTheme(LightRawTheme),
    };
  },

  getChildContext() {
    return {
      muiTheme: this.state.muiTheme,
    };
  },
  slideExist(slide) {
    var exist = false
    this.state.slides.map(function(item) {
      if (item.token === slide.token) {
        exist = true;
      }
    });

    return exist;
  },
  addSlide(slide) {
    if (this.slideExist(slide) == false) {
      this.state.slides.push(slide);
      this.setState({slides: this.state.slides});
    }
  },
  setSlideActive(slide) {
    if (slide !== null) {
      socket.emit('setRemoteUser', slide.token);
    }

    this.state.slideActive = slide;
    this.setState({slideActive: this.state.slideActive});
  },
  componentWillMount() {

    let newMuiTheme = ThemeManager.modifyRawThemePalette(this.state.muiTheme, {
      accent1Color: Colors.deepOrange500
    });

    var that = this;

    socket.on('client-list-users', function(users) {
      users.map(function(user) {
        that.addSlide({token: user});
      });
    });

    this.setState({muiTheme: newMuiTheme});
    socket.emit('list-users');
  },

  render() {

    let containerStyle = {
      textAlign: 'center',
    };

    let standardActions = [
      { text: 'Okay' }
    ];

    return (
      <div style={containerStyle}>
        <AppBar title="Bespoke remote" />

        <SlideList
          slides={this.state.slides}
          slideActive={this.state.slideActive}
          setSlideActive={this.setSlideActive}
        />

        <ControlSlide
          slideActive={this.state.slideActive}
          setSlideActive={this.setSlideActive}
        />

      </div>
    );
  }

});

module.exports = Main;
