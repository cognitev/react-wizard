import React from 'react';
import { shallow } from 'enzyme';
import Step from '../Step';

describe('<Step /> Component', () => {
  it('should render children', () => {
    const rendered = shallow(
      <Step id="testStep">
        <div />
      </Step>,
    );

    expect(rendered).toMatchSnapshot();
  });
});
