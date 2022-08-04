import { SubCommandGroup } from '../../../../src';
import En from './en';
import Ja from './ja';

export default class Langs extends SubCommandGroup {
  constructor() {
    super({
      name: 'langs',
      description: 'Greetings',
      options: [new En(), new Ja()],
    });
  }
}
