import { createContext } from 'react';

const WizardContext = createContext({
  wizard: {},
  step: {
    id: null,
    enabled: null,
    onEnter: null,
    onLeave: null,
  },
  steps: [],
});

export default WizardContext;
