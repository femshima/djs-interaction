import InteractionFrame from './frame';

export const frame = new InteractionFrame();

export const Button = frame.ComponentBase('BUTTON');
export const SelectMenu = frame.ComponentBase('SELECT_MENU');
export const Modal = frame.ComponentBase('MODAL');
