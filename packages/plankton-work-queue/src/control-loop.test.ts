import ControlLoop from './control-loop';

describe('core/ControlLoop', () => {
  it('exports a ControlLoop class', () => {
    expect(ControlLoop).toEqual(expect.any(Function));
  });
  describe('constructor', () => {
    it.todo('constructor takes a worker function and hash of options');
  });
  describe('start', () => {
    it.todo('starts the control loop');
  });
  describe('stop', () => {
    it.todo('stops the control loop and returns a worker promise');
  });
});
