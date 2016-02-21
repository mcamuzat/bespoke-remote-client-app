/** In this file, we create a React component which incorporates components provided by material-ui */

const React = require('react');
const RaisedButton = require('material-ui/lib/raised-button');
const AppBar = require('material-ui/lib/app-bar');
const ThemeManager = require('material-ui/lib/styles/theme-manager');
const LightRawTheme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const Colors = require('material-ui/lib/styles/colors');
const socket = require('socket.io-client')('http://localhost:8000');
const TextField = require('material-ui/lib/text-field');
const Dialog = require('material-ui/lib/dialog');

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

var UsersList = React.createClass({
	render() {
		return (
			<div className='users'>
				<h3> Online Users </h3>
				<ul>
					{
						this.props.users.map((user, i) => {
							return (
								<li key={i}>
									{user}
								</li>
							);
						})
					}
				</ul>				
			</div>
		);
	}
});

var Message = React.createClass({
	render() {
		return (
			<div className="message">
				<strong>{this.props.user} :</strong> 
				<span>{this.props.text}</span>		
			</div>
		);
	}
});

var MessageList = React.createClass({
	render() {
		return (
			<div className='messages'>
				<h2> Conversation: </h2>
				{
					this.props.messages.map((message, i) => {
						return (
							<Message
								key={i}
								user={message.user}
								text={message.text} 
							/>
						);
					})
				} 
			</div>
		);
	}
});


var MessageForm = React.createClass({

	getInitialState() {
		return {text: ''};
	},

	handleSubmit(e) {
		e.preventDefault();
		var message = {
			user : this.props.user,
			text : this.state.text
		}
		this.props.onMessageSubmit(message);	
		this.setState({ text: '' });
	},

	changeHandler(e) {
		this.setState({ text : e.target.value });
	},

	render() {
		return(
			<div className='message_form'>
				<h3>Write New Message</h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.changeHandler}
						value={this.state.text}
					/>
				</form>
			</div>
		);
	}
});

var ChangeNameForm = React.createClass({
	getInitialState() {
		return {newName: ''};
	},

	onKey(e) {
		this.setState({ newName : e.target.value });
	},

	handleSubmit(e) {
		e.preventDefault();
		var newName = this.state.newName;
		this.props.onChangeName(newName);	
		this.setState({ newName: '' });
	},

	render() {
		return(
			<div className='change_name_form'>
				<h3> Change Name </h3>
				<form onSubmit={this.handleSubmit}>
					<input
						onChange={this.onKey}
						value={this.state.newName} 
					/>
				</form>	
			</div>
		);
	}
});

var ChatApp = React.createClass({

	getInitialState() {
		return {users: [], messages:[], text: ''};
	},

	componentDidMount() {
		socket.on('init', this._initialize);
		socket.on('send:message', this._messageRecieve);
		socket.on('user:join', this._userJoined);
		socket.on('user:left', this._userLeft);
		socket.on('change:name', this._userChangedName);
	},

	_initialize(data) {
		var {users, name} = data;
		this.setState({users, user: name});
	},

	_messageRecieve(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
	},

	_userJoined(data) {
		var {users, messages} = this.state;
		var {name} = data;
		users.push(name);
		messages.push({
			user: 'APPLICATION BOT',
			text : name +' Joined'
		});
		this.setState({users, messages});
	},

	_userLeft(data) {
		var {users, messages} = this.state;
		var {name} = data;
		var index = users.indexOf(name);
		users.splice(index, 1);
		messages.push({
			user: 'APPLICATION BOT',
			text : name +' Left'
		});
		this.setState({users, messages});
	},

	_userChangedName(data) {
		var {oldName, newName} = data;
		var {users, messages} = this.state;
		var index = users.indexOf(oldName);
		users.splice(index, 1, newName);
		messages.push({
			user: 'APPLICATION BOT',
			text : 'Change Name : ' + oldName + ' ==> '+ newName
		});
		this.setState({users, messages});
	},

	handleMessageSubmit(message) {
		var {messages} = this.state;
		messages.push(message);
		this.setState({messages});
		socket.emit('send:message', message);
	},

	handleChangeName(newName) {
		var oldName = this.state.user;
		socket.emit('change:name', { name : newName}, (result) => {
			if(!result) {
				return alert('There was an error changing your name');
			}
			var {users} = this.state;
			var index = users.indexOf(oldName);
			users.splice(index, 1, newName);
			this.setState({users, user: newName});
		});
	},

	render() {
		return (
			<div>
				<UsersList
					users={this.state.users}
				/>
				<MessageList
					messages={this.state.messages}
				/>
				<MessageForm
					onMessageSubmit={this.handleMessageSubmit}
					user={this.state.user}
				/>
				<ChangeNameForm
					onChangeName={this.handleChangeName}
				/>
			</div>
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
  getInitialState: function() {
    return {
      note: null
    };
  },
  componentWillMount: function() {
    var that = this;
    socket.on('client-flopoke-note', function(objNote) {
      that.setState({note: objNote.note});
    });
  },
  open: true,
  next: function() {
    socket.emit('bespoke-action', 'next');
  },
  prev: function() {
    socket.emit('bespoke-action', 'prev');
  },
  stop: function() {
    this.props.setSlideActive(null);
  },
  name: function() {
      console.log(this);
    socket.emit('bespoke-action', 'prev');
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
            <ChatApp/>
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
        <div style={{margin: 20, height: 180, overflowY: 'auto'}}>{this.state.note}</div>
        <div>
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
    removeAllSlides() {
        this.state.slides = [];
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
            that.removeAllSlides();
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
