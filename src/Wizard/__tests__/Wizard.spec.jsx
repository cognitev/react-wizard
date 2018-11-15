import React from 'react';
import { mount } from 'enzyme';
import { createMemoryHistory } from 'history';

import Wizard from '../Wizard';
import Steps from '../../Steps/Steps';
import Step from '../../Step/Step';

const WizardName = 'testWizard';
const getUpdatedState = wrapperObj => wrapperObj && wrapperObj.state;

describe('<Wizard /> Component Structure/Main functions', () => {
  let wizardWrapper;
  let wrapper;
  let history;

  beforeEach(() => {
    history = createMemoryHistory('/');
    wrapper = mount(
      <Wizard
        wizardComp
        wizardName={WizardName}
        history={history}
      >
        <Steps>
          <Step id="step1">
            <div />
          </Step>
          <Step id="step2">
            <div />
          </Step>
        </Steps>
      </Wizard>,
    );

    // add reference
    wizardWrapper = wrapper.find('[wizardComp]').instance();
  });

  it('1. should initialize <Wizard /> instance', () => {
    expect(wizardWrapper).toBeInstanceOf(Wizard);
  });

  it('2. should be initialized with the wrapped Steps and navigate to latest enabled step [initWithLatestEnabled] flag', () => {
    expect(getUpdatedState(wrapper.find('[wizardComp]').instance()).steps).toBeInstanceOf(Array);
    expect(getUpdatedState(wrapper.find('[wizardComp]').instance()).steps).toHaveLength(2);

    expect(getUpdatedState(wrapper.find('[wizardComp]').instance()).step).toHaveProperty('id', 'step1');
  });

  it('3. should be able to navigate to Step by History Push using valid stepId', () => {
    // like history.push
    const { push } = wizardWrapper;

    push('step2');

    expect(getUpdatedState(wizardWrapper).step).toHaveProperty('id', 'step2');
    expect(history.location.pathname).toEqual(`/${WizardName}/step2`);
    expect(history.entries).toHaveLength(3);
  });

  it('4. should do nothing if an invalid step Id were pushed', () => {
    const { push } = wizardWrapper;

    push('InvalidStepId');

    expect(getUpdatedState(wizardWrapper).step).toHaveProperty('id', 'step1');
  });

  it('5. should be able to navigate to Step by History Replace using valid stepId', () => {
    // like history.replace
    const { replace } = wizardWrapper;

    replace('step2');

    expect(getUpdatedState(wizardWrapper).step).toHaveProperty('id', 'step2');
    expect(history.location.pathname).toEqual(`/${WizardName}/step2`);
    expect(history.entries).toHaveLength(2);
  });

  afterEach(() => {
    wrapper.unmount();
  });
});
