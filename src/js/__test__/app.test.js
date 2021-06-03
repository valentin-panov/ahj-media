import Widget from '../engine/widget';
import app from '../app';

jest.mock('../engine/widget');

beforeEach(() => {
  Widget.mockClear();
});

test('new Widget wont be created automatically', () => {
  expect(Widget).not.toHaveBeenCalled();
});

test('app() should create new Widget', () => {
  app();
  expect(Widget).toHaveBeenCalledTimes(1);
});

test('app() should call method init', () => {
  expect(Widget).not.toHaveBeenCalled();
  app();
  expect(Widget).toHaveBeenCalledTimes(1);

  const widgetInstance = Widget.mock.instances[0];
  const mockInit = widgetInstance.init;

  expect(mockInit).toHaveBeenCalledTimes(1);
});
