import React, { Component } from 'react';
import PropTypes from 'prop-types';
import equal from 'fast-deep-equal';
import WizardContext from '../Wizard/WizardContext';

/**
 * Wizard Steps wrapper
 */
class Steps extends Component {
  componentDidMount() {
    const { children: childs, context } = this.props;
    const { steps: wizardSteps, wizard } = context;

    const newSteps = React.Children.map(
      childs,
      ({ props: { children, render, ...config } }) => config,
    );

    if (wizardSteps && wizardSteps.length < 1 && childs.length > 0) {
      // while initializing component
      this.upliftSteps(wizard);
    } else {
      // TODO: check side Effects
      wizard.updateSteps(newSteps);
    }
  }

  shouldComponentUpdate() {
    const { context, children: childs } = this.props;
    const steps = React.Children.map(
      childs,
      ({ props: { children, render, ...config } }) => config,
    );
    /**
     * Do not do update in case steps were not equal
     */
    if (equal(steps, context.steps)) {
      return true;
    }
    return false;
  }

  componentDidUpdate() {
    const { context, children: childs } = this.props;
    const steps = React.Children.map(
      childs,
      ({ props: { children, render, ...config } }) => config,
    );
    if (!equal(steps, context.steps)) {
      // TODO: MAYBE issue of updating Wizard state while rendering Steps!!
      context.wizard.updateSteps(steps);
    }
  }

  /**
   * Update Wizard with Child Steps
   * @param wizard {object}
   */
  upliftSteps = (wizard) => {
    const { children: childs } = this.props;
    const steps = React.Children.map(
      childs,
      ({ props: { children, render, ...config } }) => config,
    );
    // TODO: issue of updating Wizard state while rendering Steps!!
    wizard.initializeWizard(steps);
  };

  getActiveStep = (context, children) => {
    // Render only activeStep from chil steps
    const { id: activeId } = context.step;
    const [activeChild = null] = React.Children.toArray(children).filter(
      ({ props: { id } }) => id === activeId,
    );
    return activeChild;
  }

  render() {
    const { children, context } = this.props;
    return this.getActiveStep(context, children);
  }
}

Steps.propTypes = {
  children: PropTypes.node,
  context: PropTypes.shape({
    wizard: PropTypes.shape({}),
    step: PropTypes.shape({}),
    steps: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

Steps.defaultProps = {
  children: null,
};

/**
 * Export Steps with forwardedRef on the Steps Wrapper itself, and additional props from parent(s)
 */
export default React.forwardRef((props, ref) => (
  <WizardContext.Consumer>
    {({ steps, step, wizard }) => (
      <Steps
        {...props}
        context={{ steps, step, wizard }}
        ref={ref}
      >
        {props.children}
      </Steps>
    )}
  </WizardContext.Consumer>
));
