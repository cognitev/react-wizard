import React from 'react';
import { shallow } from 'enzyme';
import Steps from '../Steps';

// This is unit testing <Steps /> component, so no need for <Step /> functionality
const Step = () => null;

describe('<Steps /> Component', () => {
  it('should render correct child if controlled', () => {
    const rendered = shallow(
      <Steps>
        <Step id="step1" />
        <Step id="step2" />
        <Step id="step3" />
      </Steps>,
    );

    expect(rendered).toMatchSnapshot();
  });
});
