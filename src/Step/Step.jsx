/* eslint-disable react/no-unused-prop-types */
import React from 'react';
import PropTypes from 'prop-types';

/**
 * Wizard Step wrapper
 * @param children
 * @param id
 */
const Step = ({ children, id }) => (
  <div
    id={id}
  >
    {children}
  </div>
);


Step.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  nextBtnTitle: PropTypes.string,
  prevBtnTitle: PropTypes.string,
  onEnter: PropTypes.func,
  onLeave: PropTypes.func,
  enabled: PropTypes.bool,
};

Step.defaultProps = {
  children: null,
  name: null,
  nextBtnTitle: null,
  prevBtnTitle: null,
  onEnter: null,
  onLeave: null,
  enabled: true,
};

export default Step;
