import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createMemoryHistory } from 'history';
import WizardContext from './WizardContext';

class Wizard extends Component {
  state = {
    wizard: {},
  };

  componentWillMount() {
    this.initializeContext();
  }

  /**
   * Get configured WizardName to use as URL
   * @return {string}
   */
  get wizardName() {
    const { wizardName } = this.props;
    return `${wizardName}/`;
  }

  /**
   * Router History instance getter
   * @return {Wizard.props.history}
   */
  get history() {
    const { history } = this.props;
    return history || createMemoryHistory();
  }

  /**
   * Create Wizard Context and update state
   */
  initializeContext() {
    this.setState({
      wizard: {
        history: this.history,
      },
    });
  }

  render() {
    const { children } = this.props;

    return (
      <WizardContext.Provider value={this.state}>
        {children}
      </WizardContext.Provider>
    );
  }
}

Wizard.propTypes = {
  wizardName: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  /**
   * history object from router
   */
  history: PropTypes.shape({
    entries: PropTypes.array,
    go: PropTypes.func,
    goBack: PropTypes.func,
    listen: PropTypes.func,
    push: PropTypes.func,
    replace: PropTypes.func,
    location: PropTypes.shape({
      pathname: PropTypes.string,
    }).isRequired,
  }).isRequired,
};

Wizard.defaultProps = {
};

export default Wizard;
