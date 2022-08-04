import { DataTypes, InteractionTypes } from './bases';
import InteractionFrame from './frame';
import { DelayedDataStore } from './store';

const store = new DelayedDataStore<DataTypes[keyof InteractionTypes]>();

export const frame = new InteractionFrame({
  store,
});

export const Button = frame.ComponentBase('BUTTON');
export const SelectMenu = frame.ComponentBase('SELECT_MENU');
export const Modal = frame.ComponentBase('MODAL');
