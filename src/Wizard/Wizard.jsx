import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createMemoryHistory } from 'history';
import WizardContext from './WizardContext';

class Wizard extends Component {
  state = {
    wizard: {},
    step: {
      id: null,
      enabled: null,
      onEnter: null,
      onLeave: null,
    },
    steps: [],
  };

  failedNavigationTried = false;

  failedNavigation = false;

  failedNavigationStep = null;

  componentWillMount() {
    this.initializeContext();
  }

  componentDidMount() {
    /**
     * Listen to changes in Location.
     * Update state with the activeStep after navigation, if pathname is a defined and valid step path.
     */
    this.unlisten = this.history.listen(({ pathname }) => {
      const step = this.pathToStep(pathname);
      step && this.setState({ step });
    });
  }

  componentDidUpdate() {
    // Failed Navigation tried at least once
    this.failedNavigationTried && this.resetNavigationFailures();
  }

  componentWillUnmount() {
    // Remove history eventListener
    this.unlisten && this.unlisten();
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
   * @return {Wizard.props.history |
   * {length: number, action: string, location: any, index: *, entries: any[],
   * createHref: createPath, push: push, replace: replace, go: go,
   * goBack: (function(): void), goForward: (function(): void),
   * canGo: (function(*): boolean), block: (function(): (*|void)),
   * listen: (function(*=): *)}}
   */
  get history() {
    const { history } = this.props;
    return history || createMemoryHistory();
  }

  /**
   * Step Ids getter
   * @return {any[]}
   */
  get ids() {
    const { steps } = this.state;
    return steps.map(s => s.id);
  }

  /**
   * `nextStepId` getter. Used mainly to identify next step/pathname to navigate to
   * @return {string}
   */
  get nextStepId() {
    const { step } = this.state;
    const nextStepId = this.ids[this.ids.indexOf(step.id) + 1];
    return nextStepId;
  }

  /**
   * `prevStepId` getter. Used mainly to identify previous step/pathname to navigate to
   * @return {string}
   */
  get prevStepId() {
    const { step } = this.state;
    const prevStepId = this.ids[this.ids.indexOf(step.id) - 1];
    return prevStepId;
  }

  /**
   * `nextStep` object getter.
   * @return {*}
   */
  get nextStep() {
    const { steps } = this.state;
    const nextStep = steps.find(s => s.id === this.nextStepId);
    return nextStep;
  }

  /**
   * `prevStep` object getter.
   * @return {*}
   */
  get prevStep() {
    const { steps } = this.state;
    const prevStep = steps.find(s => s.id === this.prevStepId);
    return prevStep;
  }

  /**
   * Get Step Object by stepId
   * @param {string} stepId
   * @return {*|<Object>Step|Wizard.state.step|{id, enabled, onEnter, onLeave}}
   * Check {@link {Step}
   */
  stepById = (stepId) => {
    const { steps } = this.state;
    if (stepId) {
      return steps.find(step => step.id === stepId);
    }
    return null;
  };

  /**
   * Validate that this step is known to Wizard
   * @param {string} stepId
   * @return {boolean}
   */
  isValidStep = stepId => !!(stepId && this.stepById(stepId));

  /**
   * Get step by pathname from URL
   * @param {string} pathname
   * @return {*|Wizard.state.step|{id, enabled, onEnter, onLeave}}
   */
  pathToStep = (pathname) => {
    const { step: activeStep, steps } = this.state;
    const id = pathname.replace(`/${this.wizardName}`, '');
    const [step] = steps.filter(s => s.id === id);
    return step || activeStep;
  };

  /**
   * initializeWizard with Step(s).
   * Used mainly by {@link {Steps}} to update wizard state with child {@link {Step}}.
   * part of the initialization, navigating to the activeStep fetched from URL,
   * otherwise navigate to the first available step.
   * @param {Object[]} steps
   */
  initializeWizard = (steps = []) => {
    const { initWithLatestEnabled } = this.props;

    this.setState({ steps }, () => {
      const step = this.pathToStep(this.history.location.pathname);
      if (step.id && this.canNavigate(step)) {
        this.setState({ step }, () => this.push(step.id));
      } else if (!initWithLatestEnabled) {
        this.push();
      } else {
        this.push(this.getLatestEnabled().id);
      }
    });
  };

  /**
   * Update Steps in Context.
   * @param {Array} steps
   */
  updateSteps = (steps) => {
    steps && this.setState({ steps }, this.processNavigationFailure);
  };

  /**
   * @summary Navigate to a certain step by history push
   * Validate if step is a valid step, push it to History.
   * Otherwise Memorize navigation failures to try on the next render, and push to History the latest avilable step
   * @param step
   */
  push = (step = this.nextStepId) => {
    if (!step || !this.isValidStep(step)) return;

    if (this.canNavigate(this.stepById(step))) {
      this.history.push(`/${this.wizardName}${step}`);
    } else {
      this.delegateNavigationFailure(step, this.push);
    }
  };

  /**
   * Navigate to a certain step by history reaplce
   * @param step
   */
  replace = (step = this.nextStepId) => {
    if (!step || !this.isValidStep(step)) return;

    if (this.canNavigate(this.stepById(step))) {
      this.history.replace(`/${this.wizardName}${step}`);
    } else {
      this.delegateNavigationFailure(step, this.push);
    }
  };

  /**
   * Navigate to Next step action
   */
  next = () => {
    const { steps, step } = this.state;
    const { onNext } = this.props;
    if (this.nextStep) {
      if (onNext) {
        onNext(steps, step);
      } else {
        this.push();
      }
    }
  };

  /**
   * Navigate to Previous step action
   */
  previous = () => {
    const { steps, step } = this.state;
    const { onPrev } = this.props;
    if (this.prevStep) {
      if (onPrev) {
        onPrev(steps, step);
      } else {
        this.push(this.prevStepId);
      }
    }
  };

  /**
   * Navigation guard
   * @param step
   * @return {boolean}
   */
  canNavigate = (step = this.nextStep) => !!(step && step.enabled);

  /**
   * Provide Latest enabled step
   * @return {*}
   */
  getLatestEnabled = () => {
    // TODO: getNewrest by knoweledge of target step
    const { steps } = this.state;
    const isAllEnabled = steps.every(s => s.enabled);
    if (isAllEnabled) {
      return steps[steps.length - 1];
    }
    const enabledSteps = steps.filter(s => s.enabled);
    if (enabledSteps && enabledSteps.length > 0) {
      return enabledSteps[enabledSteps.length - 1];
    }

    return null;
  };

  /**
   * Branched action after navigation has failed.
   * Failure handling is memorizing the last failed path to try later and for the time being return the latest possible step.
   * @param {string} stepId
   * @param {function} callbackAction - called directly after
   */
  delegateNavigationFailure = (stepId, callbackAction) => {
    if (!stepId || !this.isValidStep(stepId)) return;

    this.memoizeFailedNavigation(stepId);
    // TODO: should get nearest enabled step instead
    // Navigate to latest enabled step
    const targetEnabledStep = this.getLatestEnabled();
    if (targetEnabledStep && typeof callbackAction === 'function') {
      callbackAction(targetEnabledStep.id);
    }
  };

  /**
   * Memorize step navigation failure locally
   * @param {string} step
   */
  memoizeFailedNavigation = (step) => {
    this.failedNavigation = true;
    this.failedNavigationStep = step;
  };

  /**
   * Retry navigation in case of Race condition between state udpates in Steps/Wizard components.
   * Usually happens after `Step` state is programatically updated
   */
  processNavigationFailure = () => {
    const { failedNavigation, failedNavigationStep } = this;
    if (failedNavigation) {
      this.push(failedNavigationStep);
      this.failedNavigationTried = true;
    }
  };

  /**
   * Resume normal navigation strategy and no more navigation retries
   */
  resetNavigationFailures = () => {
    this.failedNavigation = false;
    this.failedNavigationStep = null;
    this.failedNavigationTried = false;
  };

  /**
   * Create Wizard Context and update state
   */
  initializeContext() {
    this.setState({
      wizard: {
        history: this.history,
        initializeWizard: this.initializeWizard,
        updateSteps: this.updateSteps,
        push: this.push,
        replace: this.replace,
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
